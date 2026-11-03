# NovaUser frontend

Responsive Sign In and Register screens for NovaUser, wired to the Flask JWT
authentication API.

## Routes

| Route | Screen |
| --- | --- |
| `/novauser` | Redirects to Sign In |
| `/novauser/signin` (`/login`) | Sign In |
| `/novauser/register` (`/signup`) | Register |
| `/novauser/account` | Protected account summary |
| `/novauser/terms` | Placeholder Terms |
| `/novauser/privacy` | Placeholder Privacy Policy |

## Structure

| File | Purpose |
| --- | --- |
| `pages/SignInPage.jsx` | Sign In form, validation, loading/error states |
| `pages/RegisterPage.jsx` | Registration, live password requirements |
| `pages/AccountPage.jsx` | Signed-in session summary and sign out |
| `pages/LegalPage.jsx` | Terms/privacy placeholders |
| `components/AuthShell.jsx` | Grid background, card, branding, back link |
| `components/AuthToggle.jsx` | Sign In / Register toggle |
| `components/AuthFields.jsx` | Inputs, password reveal, alerts, requirements |
| `components/GoogleButton.jsx` | UI-only Google placeholder button |
| `context/AuthProvider.jsx` | Session restore, login, register, logout |
| `context/authContext.js` | Context object and `useAuth` hook |
| `services/authApi.js` | `credentials: 'include'` fetch wrapper |
| `utils/validation.js` | Client validation mirroring the API |
| `styles/auth.css` | Scoped NovaUser background/card styling |
| `tests/e2e_auth.mjs` | Browser smoke test (Puppeteer Core) |

## Security model

- The JWT is never stored in `localStorage` or `sessionStorage`.
- The backend sets an HTTP-only, SameSite cookie; API calls include
  `credentials: 'include'`.
- The client ignores the token in the JSON response and relies on the cookie.
- Passwords are validated client-side for fast feedback and re-validated on the
  server before bcrypt hashing.

## Run

Start the backend from the project root:

```bash
python backend/app.py
```

Start the frontend:

```bash
cd frontend
npm run dev
```

Vite proxies `/api` to `http://localhost:5000`. Open
`http://localhost:5173/novauser/signin`.

## Browser test

With both servers running and Chrome/Edge installed:

```bash
cd frontend
node NovaUser/tests/e2e_auth.mjs
```

Set `CHROME_PATH`, `NOVAUSER_BASE_URL` or `NOVAUSER_SCREENSHOT_DIR` to override
the defaults. The script checks validation, password visibility, registration,
HTTP-only cookie behavior, sign out, invalid credentials, sign in, toggle
navigation and duplicate-email rejection.

## Google / Firebase

The Google buttons intentionally show a "coming soon" notice. Firebase is not
installed. `services/authApi.js` is the single integration point for the current
JWT flow, keeping a future Firebase provider isolated from the pages.
