import { useState } from 'react';
import { AlertCircle, Check, Eye, EyeOff, X } from 'lucide-react';

function describedBy(id, error, hint) {
  return [error ? `${id}-error` : null, hint ? `${id}-hint` : null].filter(Boolean).join(' ') || undefined;
}

const inputBase =
  'w-full rounded-xl border bg-[#fbfaff] py-3 pl-11 pr-4 text-sm text-slate-800 shadow-sm outline-none transition placeholder:text-slate-400 focus:bg-white focus:ring-4 disabled:cursor-not-allowed disabled:opacity-60';

function inputClasses(error) {
  return `${inputBase} ${
    error
      ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-100'
      : 'border-slate-200 hover:border-violet-200 focus:border-violet-400 focus:ring-violet-100'
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
      <label htmlFor={id} className="mb-1.5 block text-xs font-semibold text-slate-700">
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
        <p id={`${id}-error`} className="mt-1.5 flex items-start gap-1.5 text-xs font-medium text-rose-600">
          <AlertCircle className="mt-px h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="mt-1.5 text-[11px] text-slate-500">
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
      <label htmlFor={id} className="mb-1.5 block text-xs font-semibold text-slate-700">
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
          className="absolute right-1.5 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition hover:bg-violet-50 hover:text-violet-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
        >
          {visible ? (
            <EyeOff className="h-4 w-4" aria-hidden="true" />
          ) : (
            <Eye className="h-4 w-4" aria-hidden="true" />
          )}
        </button>
      </div>
      {error ? (
        <p id={`${id}-error`} className="mt-1.5 flex items-start gap-1.5 text-xs font-medium text-rose-600">
          <AlertCircle className="mt-px h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="mt-1.5 text-[11px] text-slate-500">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export function FormAlert({ tone = 'error', children }) {
  const styles = {
    error: 'border-rose-200 bg-rose-50 text-rose-700',
    success: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    info: 'border-violet-200 bg-violet-50 text-violet-700',
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
              met ? 'text-emerald-600' : 'text-slate-500'
            }`}
          >
            <span
              className={`flex h-3.5 w-3.5 items-center justify-center rounded-full ${
                met ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'
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
