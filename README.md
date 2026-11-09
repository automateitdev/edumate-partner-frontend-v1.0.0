# Edumate Partner Portal

The portal where commission partners sign in to see, read only:

- their institutes, how each pays and the commission % on it
- their commission ledger, payouts and the commission statement
- the direct bills and dues of their institutes
- online fee collection revenue of their institutes

Partners sign in with their mobile number and the password the back office sets on the partner's profile in the operation portal. They can change it under **Account**.

## Stack

Nuxt 3 (client-rendered, `ssr: false`), PrimeVue 3 with the aura-light-green theme, PrimeFlex, Pinia and axios, the same as the other Edumate portals.

## Setup

```bash
npm install
```

Create `.env` with the backend's origin:

```
BASE_URL=https://api.example.com
```

```bash
npm run dev
```

The backend serves the portal API under `/api/partner` (`routes/partner.php` in `edumate-backend-v1.0.0`) and keeps the session in httpOnly cookies (`partner_access_token`, `partner_refresh_token`). The portal's origin must be allowed by the backend's CORS settings with credentials, and `COOKIE_DOMAIN` / `COOKIE_SAMESITE` must suit the two domains.

```bash
npm run build
```
