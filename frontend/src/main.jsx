import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import '../Shared/styles/index.css'
import App from './App.jsx'
import { AuthProvider } from '../NovaUser/context/AuthProvider.jsx'
import ProgressSync from '../NovaUser/context/ProgressSync.jsx'
import { SettingsProvider } from '../NovaUser/settings/context/SettingsProvider.jsx'

// NovaQuest is dark-only; keep the root class set even if the document was
// loaded from a stale cache or another script touched it.
document.documentElement.classList.add('dark')

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <ProgressSync />
        <SettingsProvider>
          <App />
        </SettingsProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
