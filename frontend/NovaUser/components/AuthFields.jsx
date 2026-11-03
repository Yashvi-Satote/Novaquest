import { useState } from 'react';
import { AlertCircle, Check, Eye, EyeOff, X } from 'lucide-react';

function describedBy(id, error, hint) {
  return [error ? `${id}-error` : null, hint ? `${id}-hint` : null].filter(Boolean).join(' ') || undefined;
}

const inputBase =
  'w-full rounded-xl border bg-slate-900/80 py-3 pl-11 pr-4 text-sm text-slate-100 shadow-sm outline-none transition placeholder:text-slate-400 focus:bg-slate-900 focus:ring-4 disabled:cursor-not-allowed disabled:opacity-60';

function inputClasses(error) {
  return `${inputBase} ${
    error
      ? 'border-rose-500/50 focus:border-rose-400 focus:ring-rose-500/20'
      : 'border-white/10 hover:border-violet-500/50 focus:border-violet-400 focus:ring-violet-500/20'
  }`;
}

export function TextField({
  id,
  label,
  icon: Icon,
  type = 'text',
  error,
  hint,
  ...inputProps
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-xs font-semibold text-slate-300">
        {label}
      </label>
      <div className="relative">
        {Icon ? (
          <Icon
            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-violet-400"
            aria-hidden="true"
          />
        ) : null}
        <input
          id={id}
          type={type}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={describedBy(id, error, hint)}
          className={inputClasses(error)}
          {...inputProps}
        />
      </div>
      {error ? (
        <p id={`${id}-error`} className="mt-1.5 flex items-start gap-1.5 text-xs font-medium text-rose-400">
          <AlertCircle className="mt-px h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="mt-1.5 text-[11px] text-slate-400">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export function PasswordField({
  id,
  label,
  icon: Icon,
  error,
  hint,
  value,
  onChange,
  ...inputProps
}) {
  const [visible, setVisible] = useState(false);

  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-xs font-semibold text-slate-300">
        {label}
      </label>
      <div className="relative">
        {Icon ? (
          <Icon
            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-violet-400"
            aria-hidden="true"
          />
        ) : null}
        <input
          id={id}
          type={visible ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={describedBy(id, error, hint)}
          className={`${inputClasses(error)} pr-12`}
          {...inputProps}
        />
        <button
          type="button"
          onClick={() => setVisible((current) => !current)}
          aria-label={visible ? 'Hide password' : 'Show password'}
          aria-pressed={visible}
          className="absolute right-1.5 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition hover:bg-violet-500/10 hover:text-violet-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
        >
          {visible ? (
            <EyeOff className="h-4 w-4" aria-hidden="true" />
          ) : (
            <Eye className="h-4 w-4" aria-hidden="true" />
          )}
        </button>
      </div>
      {error ? (
        <p id={`${id}-error`} className="mt-1.5 flex items-start gap-1.5 text-xs font-medium text-rose-400">
          <AlertCircle className="mt-px h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="mt-1.5 text-[11px] text-slate-400">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export function FormAlert({ tone = 'error', children }) {
  const styles = {
    error: 'border-rose-500/30 bg-rose-500/10 text-rose-300',
    success: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
    info: 'border-violet-500/30 bg-violet-500/10 text-violet-300',
  };
  return (
    <div
      role={tone === 'error' ? 'alert' : 'status'}
      className={`flex items-start gap-2.5 rounded-xl border px-3.5 py-3 text-xs font-medium ${styles[tone] || styles.info}`}
    >
      {tone === 'error' ? (
        <AlertCircle className="mt-px h-4 w-4 shrink-0" aria-hidden="true" />
      ) : (
        <Check className="mt-px h-4 w-4 shrink-0" aria-hidden="true" />
      )}
      <span>{children}</span>
    </div>
  );
}

const REQUIREMENTS = [
  { key: 'length', label: 'At least 8 characters', test: (password) => password.length >= 8 },
  { key: 'upper', label: 'One uppercase letter', test: (password) => /[A-Z]/.test(password) },
  { key: 'lower', label: 'One lowercase letter', test: (password) => /[a-z]/.test(password) },
  { key: 'number', label: 'One number', test: (password) => /\d/.test(password) },
];

export function PasswordRequirements({ password = '' }) {
  return (
    <ul className="mt-2.5 grid grid-cols-1 gap-1.5 sm:grid-cols-2" aria-label="Password requirements">
      {REQUIREMENTS.map((requirement) => {
        const met = requirement.test(password);
        return (
          <li
            key={requirement.key}
            className={`flex items-center gap-1.5 text-[11px] font-medium ${
              met ? 'text-emerald-400' : 'text-slate-400'
            }`}
          >
            <span
              className={`flex h-3.5 w-3.5 items-center justify-center rounded-full ${
                met ? 'bg-emerald-500/15 text-emerald-300' : 'bg-slate-800 text-slate-500'
              }`}
              aria-hidden="true"
            >
              {met ? <Check className="h-2.5 w-2.5" /> : <X className="h-2.5 w-2.5" />}
            </span>
            {requirement.label}
            <span className="sr-only">{met ? ' (met)' : ' (not met)'}</span>
          </li>
        );
      })}
    </ul>
  );
}
