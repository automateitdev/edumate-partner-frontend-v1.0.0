# Project instructions

## Languages (i18n): English, Bangla, Arabic

This portal runs in English (`en`, default), Bangla (`bn`) and Arabic (`ar`, right-to-left).
Every change that adds or changes user-visible text must follow these rules. For the details,
use the `i18n` skill (`.claude/skills/i18n/SKILL.md`).

1. No user-visible text hardcoded in templates or scripts. Use `$t('area.key')` in templates, `t()` from
   `useI18n()` in `<script setup>`, and `tg()` from `~/utils/i18n` in stores, utils and constant maps.
2. Bind PrimeVue text props: `:label="$t('common.save')"`, never `label="Save"` (also header, placeholder,
   summary, detail, emptyMessage, aria-label, title).
3. Option arrays and menu models built in setup are `computed(() => [...])`, so they re-translate on switch.
4. Interpolate with named params, `t('fees.due', { amount })`; never concatenate translated pieces.
5. Add every new key to `i18n/locales/en`, `bn` and `ar` in the same change, in the area's own JSON file
   (one top-level key per file). Reuse `common.*` for shared words.
6. Display numbers and dates with `intlLocale()` / `dateLocale()` from `~/utils/i18n`; values sent to the API
   keep a fixed format. Digits are always Western (123), in every language.
7. New CSS must work right-to-left: prefer `gap` and logical properties (`margin-inline-start`,
   `padding-inline-end`, `inset-inline-start`) over left/right.
8. Never translate API data, people or institute names, codes, IDs, route paths or CSS classes.
9. Run `npm run i18n:check` before finishing; it must report 0 problems.
10. Bangla and Arabic must read as if a native speaker wrote them, not like a translation. Write for
    meaning, not word for word; keep it short and in the words real users use. See "Writing like a native" in the i18n skill.

Stack is fixed for now: Nuxt 3.13, `@nuxtjs/i18n` 9.0.0 (pinned exact), PrimeVue 3. Do not upgrade.
