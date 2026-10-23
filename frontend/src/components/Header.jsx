import React from 'react';
import { 
  Rocket, 
  Database, 
  Menu, 
  X, 
  Search, 
  Info, 
  Sparkles,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export default function Header({ 
  health, 
  onOpenDbModal, 
  mobileMenuOpen, 
  setMobileMenuOpen, 
  searchQuery, 
  setSearchQuery,
  totalResults
}) {
  return (
    <header className="sticky top-0 z-30 bg-[#070b14]/90 backdrop-blur-md border-b border-white/10 px-4 lg:px-8 py-3.5 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        
        {/* Left: Mobile Menu Toggle & App Brand */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-400"
            aria-label="Toggle Navigation Drawer"
            id="mobile-drawer-toggle"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 via-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 ring-1 ring-white/20">
              <Rocket className="w-5 h-5 text-white transform -rotate-45" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/50">
                  NASA Space Apps
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-slate-400">
                  <Sparkles className="w-3 h-3 text-cyan-400" /> Component 1
                </span>
              </div>
              <h1 className="text-base sm:text-lg lg:text-xl font-bold tracking-tight text-white flex items-center gap-2">
                Space Hardware Explorer
              </h1>
            </div>
          </div>
        </div>

        {/* Center / Desktop Search Bar Preview or Quick Stats */}
        <div className="hidden md:flex items-center gap-2 text-xs text-slate-400">
          <span className="px-2.5 py-1 rounded-full bg-slate-800/60 border border-slate-700/60 text-slate-300 font-mono">
            Verified Archives
          </span>
          <span className="text-slate-500">•</span>
          <span className="text-cyan-300 font-medium">
            Ages 10–15 Friendly
          </span>
        </div>

        {/* Right: Database Health Status Badge & Info */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={onOpenDbModal}
            className={`flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-full border transition-all cursor-pointer ${
              health.status === 'offline'
                ? 'bg-rose-950/40 border-rose-800/60 text-rose-300 hover:bg-rose-900/40'
                : health.postgres_active
                ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-300 hover:bg-emerald-900/40'
                : 'bg-cyan-950/40 border-cyan-800/60 text-cyan-300 hover:bg-cyan-900/40'
            }`}
            title="Click to view Database Connection Architecture & Setup"
            id="database-status-badge"
          >
            <span className="relative flex h-2 w-2">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                health.status === 'offline' ? 'bg-rose-400' : health.postgres_active ? 'bg-emerald-400' : 'bg-cyan-400'
              }`} />
              <span className={`relative inline-flex rounded-full h-2 w-2 ${
                health.status === 'offline' ? 'bg-rose-500' : health.postgres_active ? 'bg-emerald-500' : 'bg-cyan-500'
              }`} />
            </span>

            <Database className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">
              {health.status === 'offline' 
                ? 'Backend Offline' 
                : health.postgres_active 
                ? 'PostgreSQL Active' 
                : 'Dev DB (SQLite)'}
            </span>
            <Info className="w-3 h-3 text-slate-400" />
          </button>
        </div>

      </div>
    </header>
  );
}
