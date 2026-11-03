import { Link, useLocation } from 'react-router-dom';

const base =
  'flex-1 rounded-xl px-3 py-2.5 text-center text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2';

export default function AuthToggle({ active }) {
  const signInActive = active === 'signin';
  const location = useLocation();

  return (
    <nav
      aria-label="Authentication mode"
      className="grid grid-cols-2 gap-1 rounded-2xl border border-violet-500/25 bg-violet-500/10 p-1"
    >
      <Link
        to="/novauser/signin"
        state={location.state}
        aria-current={signInActive ? 'page' : undefined}
        className={`${base} ${
          signInActive
            ? 'bg-violet-500/20 text-violet-200 shadow-sm shadow-violet-950/20'
            : 'text-violet-300/70 hover:bg-violet-500/10 hover:text-violet-200'
        }`}
      >
        Sign In
      </Link>
      <Link
        to="/novauser/register"
        state={location.state}
        aria-current={!signInActive ? 'page' : undefined}
        className={`${base} ${
          !signInActive
            ? 'bg-violet-500/20 text-violet-200 shadow-sm shadow-violet-950/20'
            : 'text-violet-300/70 hover:bg-violet-500/10 hover:text-violet-200'
        }`}
      >
        Register
      </Link>
    </nav>
  );
}
