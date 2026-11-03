/**
 * Client-side validation that mirrors the NovaUser API rules.
 * Server-side validation remains the source of truth.
 */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function hasControlCharacters(value) {
  return [...value].some((character) => {
    const code = character.charCodeAt(0);
    return code < 32 || code === 127;
  });
}

export const PASSWORD_RULES = {
  minLength: 8,
  maxBytes: 72,
};

function byteLength(value) {
  if (typeof TextEncoder !== 'undefined') {
    return new TextEncoder().encode(value).length;
  }
  return value.length;
}

export function validateFullName(value) {
  const name = (value || '').trim().replace(/\s+/g, ' ');
  if (!name) return { value: name, error: 'Full name is required.' };
  if (name.length < 2) return { value: name, error: 'Full name must be at least 2 characters.' };
  if (name.length > 120) return { value: name, error: 'Full name must be 120 characters or fewer.' };
  if (hasControlCharacters(name)) return { value: name, error: 'Full name contains unsupported characters.' };
  return { value: name, error: null };
}

export function validateEmail(value) {
  const email = (value || '').trim().toLowerCase();
  if (!email) return { value: email, error: 'Email address is required.' };
  if (email.length > 320) return { value: email, error: 'Email address is too long.' };
  if (!EMAIL_RE.test(email)) return { value: email, error: 'Enter a valid email address.' };
  return { value: email, error: null };
}

export function validatePassword(value, { required = true } = {}) {
  const password = value || '';
  if (!password) {
    return { error: required ? 'Password is required.' : null };
  }
  if (byteLength(password) > PASSWORD_RULES.maxBytes) {
    return { error: 'Password must be 72 bytes or fewer.' };
  }
  const problems = [];
  if (password.length < PASSWORD_RULES.minLength) problems.push('at least 8 characters');
  if (!/[A-Z]/.test(password)) problems.push('an uppercase letter');
  if (!/[a-z]/.test(password)) problems.push('a lowercase letter');
  if (!/\d/.test(password)) problems.push('a number');
  if (problems.length) {
    return { error: `Password must include ${problems.join(', ')}.` };
  }
  return { error: null };
}

export function validateLogin(values) {
  const email = validateEmail(values.email);
  const password = values.password
    ? { error: null }
    : { error: 'Password is required.' };
  const errors = {};
  if (email.error) errors.email = email.error;
  if (password.error) errors.password = password.error;
  return { values: { email: email.value, password: values.password || '' }, errors };
}

export function validateRegistration(values) {
  const fullName = validateFullName(values.fullName);
  const email = validateEmail(values.email);
  const password = validatePassword(values.password);
  const confirm = values.confirmPassword;
  const errors = {};

  if (fullName.error) errors.fullName = fullName.error;
  if (email.error) errors.email = email.error;
  if (password.error) errors.password = password.error;

  if (confirm !== undefined) {
    if (!confirm) errors.confirmPassword = 'Please confirm your password.';
    else if (confirm !== values.password) errors.confirmPassword = 'Passwords do not match.';
  }

  return {
    values: {
      fullName: fullName.value,
      email: email.value,
      password: values.password || '',
    },
    errors,
  };
}

/** Map API field errors (snake_case) onto form fields (camelCase). */
export function mapServerFieldErrors(fields = {}) {
  const mapping = {
    full_name: 'fullName',
    fullName: 'fullName',
    email: 'email',
    password: 'password',
  };
  const errors = {};
  Object.entries(fields).forEach(([key, message]) => {
    const field = mapping[key] || key;
    if (message) errors[field] = message;
  });
  return errors;
}
