# i18n: dev deployment notes

This covers all six repos, each on its `i18n` branch, rebased onto `develop`. Partner has no `develop` branch, so it stays on `main`. The full plan is in `docs/i18n-plan.md`.

## Backend (`edumate-backend-v1.0.0`)
1. Run the migration after deploying:
   ```
   php artisan migrate
   ```
   It adds a nullable `locale` column to `institute_profiles`, `users` and `observers`. Existing data is not affected.
2. No new environment variables or packages.
3. Tests:
   ```
   php vendor/bin/phpunit tests/Feature/LocaleTest.php
   ```
   (8 tests)

What changed:
- **Language per request:** the `SetLocale` middleware reads `?lang=` or `Accept-Language` (en/bn/ar, falling back to en).
- **Message translation:** API messages are translated from `lang/bn.json` and `lang/ar.json`. Laravel's own messages come from `lang/{en,bn,ar}/*.php`.
- **New endpoints:** `PUT /api/merchant/locale`, `PUT /api/operation-portal/locale` and `PUT /api/observer/locale`. They save the user's language on their account, and it comes back as `user.locale` from login and auth-user. Nothing is saved while support staff impersonate an institute user.

## Frontends (institute, operation, partner, payment, student)
1. Install dependencies:
   ```
   npm ci
   ```
   This adds `@nuxtjs/i18n` 9.0.0. Nuxt is unchanged.
2. The institute portal needs more memory to build:
   ```
   NODE_OPTIONS=--max-old-space-size=8192 npm run build
   ```
   Raise the memory in CI if its build fails.
3. Before building, run:
   ```
   npm run i18n:check
   ```
   It fails when a translation is missing in any language.

## Check after deploying
1. **Language switcher:** it appears in each portal's topbar and on the sign-in page. In Arabic the whole page turns right-to-left.
2. **Saved language:** in the institute or operation portal, sign in and switch language. Signing in to the same account from another browser should open in that language.
3. **API messages:** with Bangla selected, API error and success messages arrive in Bangla.

## Known limits
- **PDFs and printouts:** PDF reports and printed documents are unchanged on purpose. A report-language option is planned after UAT (plan, step 6).
- **Operation PDF exports:** in Bangla or Arabic the PDF headers render broken, because the PDF library has no fonts for those scripts. Excel exports are fine.
- **Institute portal modules:** exam, fees, students and the other modules are still in English; they come in later passes.
- **Students and partners:** their language is kept in the browser only, not on an account.
