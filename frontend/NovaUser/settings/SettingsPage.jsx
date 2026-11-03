import { useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Gamepad2, Layers, Map, Settings, UserRound } from 'lucide-react';
import AppNavbar from '../../Shared/components/layout/AppNavbar';
import AccountSettingsSection from './sections/AccountSettingsSection';
import GameSettingsSection from './sections/GameSettingsSection';

const SECTIONS = [
  { id: 'game', label: 'Game Settings', description: 'Audio, graphics & controls', icon: Gamepad2 },
  { id: 'account', label: 'Account', description: 'Profile, session & sign out', icon: UserRound },
];

const FUTURE_SECTIONS = [
  { id: 'novamap', label: 'NovaMap Preferences', description: 'Map layers & display', icon: Map },
  { id: 'novabase', label: 'NovaBase Preferences', description: 'Catalogue filters & sorting', icon: Layers },
];

const VALID_SECTION_IDS = new Set(SECTIONS.map((section) => section.id));

function activeSectionFromHash(hash) {
  const id = String(hash || '').replace(/^#/, '');
  return VALID_SECTION_IDS.has(id) ? id : 'game';
}

export default function SettingsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const activeSection = activeSectionFromHash(location.hash);

  useEffect(() => {
    if (!VALID_SECTION_IDS.has(String(location.hash || '').replace(/^#/, ''))) {
      navigate('/settings#game', { replace: true });
    }
  }, [location.hash, navigate]);

  return (
    <div className="min-h-screen bg-[#050914] font-sans text-slate-100">
      <AppNavbar />

      <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
        <header className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-cyan-300">
              <Settings className="h-3 w-3" />
              NovaQuest Control Deck
            </div>
            <h1 className="mt-3 font-mono text-2xl font-black uppercase tracking-tight text-white sm:text-3xl">
              Settings
            </h1>
            <p className="mt-1 max-w-2xl text-xs text-slate-400 sm:text-sm">
              Tune your NovaQuest experience and manage the NovaUser account it is linked to.
            </p>
          </div>
        </header>

        <div className="mt-6 grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
          <aside>
            <nav
              aria-label="Settings sections"
              className="space-y-2 rounded-2xl border border-cyan-500/20 bg-[#090e1c]/90 p-2.5 shadow-xl shadow-cyan-950/20 lg:sticky lg:top-20"
            >
              {SECTIONS.map((section) => {
                const Icon = section.icon;
                const selected = activeSection === section.id;
                return (
                  <Link
                    key={section.id}
                    to={`/settings#${section.id}`}
                    aria-current={selected ? 'page' : undefined}
                    className={`flex items-start gap-3 rounded-xl border px-3 py-3 transition-colors ${
                      selected
                        ? 'border-cyan-400/50 bg-cyan-500/10 text-cyan-200'
                        : 'border-transparent text-slate-300 hover:border-white/10 hover:bg-white/[0.04] hover:text-white'
                    }`}
                  >
                    <span
                      className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border ${
                        selected
                          ? 'border-cyan-400/40 bg-cyan-500/20 text-cyan-300'
                          : 'border-white/10 bg-white/[0.03] text-slate-400'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold">{section.label}</span>
                      <span className="block text-[11px] text-slate-400">{section.description}</span>
                    </span>
                  </Link>
                );
              })}

              <div className="pt-2">
                <p className="px-3 pb-1 font-mono text-[10px] uppercase tracking-widest text-slate-500">
                  Coming soon
                </p>
                {FUTURE_SECTIONS.map((section) => {
                  const Icon = section.icon;
                  return (
                    <div
                      key={section.id}
                      aria-disabled="true"
                      className="flex items-start gap-3 rounded-xl px-3 py-3 text-slate-500 opacity-70"
                    >
                      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/5 bg-white/[0.02]">
                        <Icon className="h-4 w-4" />
                      </span>
                      <span className="min-w-0">
                        <span className="block text-sm font-semibold">{section.label}</span>
                        <span className="block text-[11px] text-slate-500">{section.description}</span>
                      </span>
                    </div>
                  );
                })}
              </div>
            </nav>
          </aside>

          <div className="min-w-0">
            {activeSection === 'account' ? <AccountSettingsSection /> : <GameSettingsSection />}
          </div>
        </div>
      </main>
    </div>
  );
}
