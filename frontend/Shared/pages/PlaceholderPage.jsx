import React from 'react';
import Header from '../components/Header';

export default function PlaceholderPage({ title, theme, onToggleTheme }) {
  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'dark' : ''} space-bg flex flex-col bg-slate-50 font-sans text-slate-800 transition-colors duration-200 dark:bg-[#070b14] dark:text-slate-100`}>
      <Header theme={theme} onToggleTheme={onToggleTheme} />
      <main className="flex flex-1 items-center justify-center px-6 py-16">
        <section className="glass-panel w-full max-w-lg rounded-2xl border border-slate-200 bg-white/70 px-8 py-12 text-center dark:border-white/10 dark:bg-slate-900/40 sm:px-12">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">{title}</h1>
          <p className="mt-4 text-sm text-slate-500 dark:text-slate-400 sm:text-base">Yet to be developed</p>
          <div className="mx-auto mt-7 h-px w-16 bg-cyan-500/60" aria-hidden="true" />
        </section>
      </main>
    </div>
  );
}
