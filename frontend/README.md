# AirCon Care — frontend

React 19 + Vite + Bootstrap 5. React Router handles page navigation.

## Running it

```bash
cd frontend
npm install
npm run dev          # http://localhost:5173
```

No backend and no database are needed to run it right now — see below.

## Login and authentication

Signing in works today against dummy accounts. All three roles are available:

| Username     | Password      | Role       | Lands on               |
| ------------ | ------------- | ---------- | ---------------------- |
| `customer`   | `password123` | Customer   | `/customer`            |
| `admin`      | `password123` | Admin      | `/admin`               |
| `technician` | `password123` | Technician | `/technician/dashboard` |

The login screen lists these and fills the form when one is clicked. That
picker disappears on its own once the real API is switched on.

`/register` creates a Customer account. Accounts made this way last until the
page is refreshed, because there is no database behind them yet.

### Switching to the real backend

The dummy accounts and the real API return exactly the same shapes, so nothing
outside `src/api/` has to change. Copy `.env.example` to `frontend/.env` and set:

```
VITE_USE_MOCK_AUTH=false
VITE_API_BASE_URL=http://localhost:5000
```

That sends `login()` and `register()` to `POST /api/auth/login` and
`POST /api/auth/register` on the Express backend. Once it works,
`src/api/mockAuthApi.js` and `src/components/auth/DemoCredentials.jsx` can be
deleted and nothing else breaks.

## Using the signed-in user in your own pages

```jsx
import { useAuth } from '../context/AuthContext'

const { user, logout, isAuthenticated } = useAuth()
// user = { user_ID, username, accountType }
```

Do not read `localStorage` directly — `useAuth()` is the one place that changes
when the real JWT arrives.

## Adding a page for your portal

Routes live in `src/App.jsx`. Put yours inside the guard for its role:

```jsx
<Route element={<ProtectedRoute allow={[ACCOUNT_TYPES.ADMIN]} />}>
  <Route path="/admin/inventory" element={<InventoryPage />} />
</Route>
```

`ProtectedRoute` sends anyone not signed in to `/login`, remembers where they
were going, and returns them there afterwards. Wrong role goes to
`/unauthorized`.

The three `PortalPlaceholder` routes in `App.jsx` are scaffolding — replace
them with your real pages. The technician path already matches the one used on
the `billie-frontend` branch.

**The guards are a convenience for the UI, not security.** Anyone can edit
their own `localStorage`. The backend has to verify the JWT on every protected
request for the roles to mean anything.

## Layout

```
src/
  api/          client.js, authApi.js, mockAuthApi.js
  components/   auth/ (AuthCard, FormField, DemoCredentials), SignedInBar
  constants/    accountTypes.js — the 3 roles and where each one lands
  context/      AuthContext.jsx — useAuth(), session persistence
  pages/auth/   LoginPage, RegisterPage, UnauthorizedPage
  routes/       ProtectedRoute, PublicOnlyRoute
  styles/       auth.css
```
