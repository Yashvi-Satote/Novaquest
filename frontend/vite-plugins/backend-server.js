import { spawn } from 'node:child_process'
import { existsSync } from 'node:fs'
import net from 'node:net'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(__dirname, '..', '..')
const backendScript = path.join(repoRoot, 'backend', 'app.py')
const backendHost = '127.0.0.1'
const backendPort = Number(process.env.PORT || 5000)

function resolvePython() {
  if (process.env.NOVABASE_PYTHON) return process.env.NOVABASE_PYTHON

  const venvCandidates =
    process.platform === 'win32'
      ? [path.join(repoRoot, '.venv', 'Scripts', 'python.exe')]
      : [path.join(repoRoot, '.venv', 'bin', 'python3'), path.join(repoRoot, '.venv', 'bin', 'python')]

  for (const candidate of venvCandidates) {
    if (existsSync(candidate)) return candidate
  }

  return process.platform === 'win32' ? 'python' : 'python3'
}

function isPortOpen(port, host) {
  return new Promise((resolve) => {
    const socket = net.connect({ port, host })
    const finish = (open) => {
      socket.destroy()
      resolve(open)
    }

    socket.setTimeout(750)
    socket.once('connect', () => finish(true))
    socket.once('timeout', () => finish(false))
    socket.once('error', () => finish(false))
  })
}

function pipeWithPrefix(stream, prefix, target) {
  let buffer = ''
  stream.on('data', (chunk) => {
    buffer += chunk.toString()
    const lines = buffer.split(/\r?\n/)
    buffer = lines.pop() ?? ''
    for (const line of lines) {
      if (line.trim()) target.write(`${prefix} ${line}\n`)
    }
  })
}

/**
 * Starts the Flask backend (`python backend/app.py`) together with the Vite dev
 * server, so `npm run dev` serves the API on port 5000 without a second terminal.
 * Set NOVABASE_AUTOSTART=0 to disable, or NOVABASE_PYTHON to pick an interpreter.
 */
export function backendServerPlugin() {
  let child = null
  let starting = null

  const stopBackend = () => {
    if (!child || child.killed) return
    const dying = child
    child = null
    try {
      dying.kill()
    } catch {
      // The process already exited; nothing left to stop.
    }
  }

  const startBackend = async () => {
    if (process.env.NOVABASE_AUTOSTART === '0') {
      console.log('[backend] Autostart disabled (NOVABASE_AUTOSTART=0).')
      return
    }

    if (await isPortOpen(backendPort, backendHost)) {
      console.log(`[backend] Flask is already running on http://localhost:${backendPort}.`)
      return
    }

    const python = resolvePython()
    console.log(`[backend] Starting Flask backend: ${python} ${path.relative(repoRoot, backendScript)}`)

    child = spawn(python, [backendScript], {
      cwd: repoRoot,
      env: { ...process.env, PORT: String(backendPort) },
      stdio: ['ignore', 'pipe', 'pipe'],
      windowsHide: true,
    })

    pipeWithPrefix(child.stdout, '[backend]', process.stdout)
    pipeWithPrefix(child.stderr, '[backend]', process.stderr)

    child.once('spawn', () => {
      console.log(`[backend] Flask should be available at http://localhost:${backendPort}`)
    })

    child.once('error', (error) => {
      console.error(`[backend] Could not start Flask (${error.message}). Run "python backend/app.py" manually.`)
      child = null
    })

    child.once('exit', (code, signal) => {
      child = null
      if (signal) {
        console.log(`[backend] Flask stopped (${signal}).`)
      } else if (code !== 0) {
        console.error(`[backend] Flask exited with code ${code}. Run "python backend/app.py" manually to see the full error.`)
      } else {
        console.log('[backend] Flask stopped.')
      }
    })
  }

  const ensureBackend = async () => {
    if (!starting) {
      starting = startBackend().finally(() => {
        starting = null
      })
    }
    await starting
  }

  return {
    name: 'novaquest-backend-server',
    apply: 'serve',
    async configureServer(server) {
      await ensureBackend()
      server.httpServer?.once('close', stopBackend)
      process.once('exit', stopBackend)
    },
    async configurePreviewServer(server) {
      await ensureBackend()
      server.httpServer?.once('close', stopBackend)
      process.once('exit', stopBackend)
    },
  }
}
