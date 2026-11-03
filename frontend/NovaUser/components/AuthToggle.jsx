import { Link, useLocation } from 'react-router-dom';

const base =
  'flex-1 rounded-xl px-3 py-2.5 text-center text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2';

export default function AuthToggle({ active }) {
  const signInActive = active === 'signin';
  const location = useLocation();

  return (
    <nav
      aria-label="Authentication mode"
      className="grid grid-cols-2 gap-1 rounded-2xl border border-violet-100 bg-violet-50/80 p-1"
    >
      <Link
        to="/novauser/signin"
        state={location.state}
        aria-current={signInActive ? 'page' : undefined}
        className={`${base} ${
          signInActive
            ? 'bg-white text-violet-700 shadow-sm shadow-violet-900/10'
            : 'text-violet-500/80 hover:bg-white/50 hover:text-violet-700'
        }`}
      >
        Sign In
      </Link>
      <Link
        to="/"
        state={location.state}
        aria-current={!signInActive ? 'page' : undefined}
        className={`${base} ${
          !signInActive
            ? 'bg-white text-violet-700 shadow-sm shadow-violet-900/10'
            : 'text-violet-500/80 hover:bg-white/50 hover:text-violet-700'
        }`}
      >
        Register
      </Link>
    </nav>
  );
}
