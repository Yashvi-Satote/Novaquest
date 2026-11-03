import { Link } from 'react-router-dom';
import { ArrowLeft, FileText, ShieldCheck } from 'lucide-react';
import AuthShell, { NovaUserMark } from '../components/AuthShell';

const CONTENT = {
  terms: {
    title: 'Terms of Service',
    intro: 'Placeholder terms for the NovaUser authentication preview.',
    icon: FileText,
    sections: [
      {
        heading: 'Using NovaUser',
        body: 'NovaUser provides account access for the Cosmic Timekeepers applications. Keep your credentials private and use the service lawfully.',
      },
      {
        heading: 'Accounts',
        body: 'You are responsible for the activity on your account. Provide accurate information and let us know if you believe your account has been compromised.',
      },
      {
        heading: 'Availability',
        body: 'These terms are a development placeholder and will be replaced before a production launch.',
      },
    ],
  },
  privacy: {
    title: 'Privacy Policy',
    intro: 'Placeholder privacy information for the NovaUser authentication preview.',
    icon: ShieldCheck,
    sections: [
      {
        heading: 'What we store',
        body: 'NovaUser stores your full name, email address, a securely hashed password, and account timestamps in PostgreSQL.',
      },
      {
        heading: 'How we protect it',
        body: 'Passwords are hashed with bcrypt and are never returned by the API. Sessions use signed JSON Web Tokens delivered through HTTP-only cookies.',
      },
      {
        heading: 'Your choices',
        body: 'This is a development placeholder. A complete privacy policy will be published with contact and deletion details before launch.',
      },
    ],
  },
};

export default function LegalPage({ kind = 'terms' }) {
  const content = CONTENT[kind] || CONTENT.terms;
  const Icon = content.icon;

  return (
    <AuthShell>
      <div className="mb-5 flex items-center gap-3">
        <NovaUserMark className="h-10 w-10" />
        <div>
          <p className="text-sm font-bold text-white">NovaUser</p>
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-violet-500">Legal</p>
        </div>
      </div>

      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-500/20 text-violet-300">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">{content.title}</h1>
          <p className="mt-1 text-sm text-slate-400">{content.intro}</p>
        </div>
      </div>

      <div className="mt-5 space-y-4">
        {content.sections.map((section) => (
          <section key={section.heading} className="rounded-2xl border border-white/10 bg-slate-900/60 p-4">
            <h2 className="text-sm font-bold text-white">{section.heading}</h2>
            <p className="mt-1.5 text-xs leading-relaxed text-slate-300">{section.body}</p>
          </section>
        ))}
      </div>

      <Link
        to="/novauser/signin"
        className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-violet-400 underline-offset-2 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Back to sign in
      </Link>
    </AuthShell>
  );
}
