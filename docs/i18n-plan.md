# Edumate i18n plan: English / Bangla / Arabic

Status: draft for review. Nothing below is merged or pushed further.

## 1. What we know (pre-analysis)

| Repo | Stack | Size | Hardcoded Bangla files | Notes |
|---|---|---|---|---|
| institute | Nuxt 3.13, PrimeVue 3, FormKit, Sakai | ~340 Vue files, ~200k lines | ~194 | Biggest by far; exam-management alone ~46k lines |
| operation | same, Sakai | ~130 files, ~20k lines | ~56 | Internal back office |
| payment | same, Sakai | ~66 files | ~13 | Guardians pay fees here; printed receipts |
| student | same, Sakai | ~55 files | ~3 | |
| partner | Nuxt 3.13, PrimeVue 3, own layout | ~14 files | ~9 | Done first as the reference |
| backend | Laravel 10 | 540 `formatErrors` calls, ~949 fixed messages | n/a | No `lang/` dir, no `__()` today |

Key constraints:
- **Nuxt 3.13 pins `@nuxtjs/i18n` to 9.0.0.** Newer versions need Nuxt ≥3.14. Upgrading Nuxt is a separate decision.
- **Arabic is right-to-left.** PrimeVue 3 and PrimeFlex use physical left/right, so RTL needs override CSS plus discipline in new code.
- **Development is ongoing.** Every week new screens arrive with hardcoded text, so the i18n work merges into a moving target. This is the main risk.
- **Printed official documents** (receipts, marksheets, admit cards, certificates) need a product decision: translate them, or keep them in Bangla/English.

## 2. Branching

- One long-lived `i18n` branch per repo, cut from the current development branch.
- What already exists on `ccr-3b19e624-moewpa` (partner, student, payment and backend done; operation and institute in progress) moves onto `i18n` as the starting point. The old branch gets deleted after that.
- **Merge the development branch into `i18n` at least weekly**, so conflicts stay small. Strings get converted on `i18n`, not on the development branch, until step 4 lands.
- **Land in two stages, not one big merge:**
  1. **Foundation PR** (small, low risk): module, switcher, `utils/i18n`, bridge plugin, RTL CSS, check script, backend `SetLocale` and message lookup. After this, English behaves exactly as today.
  2. **Module PRs**, one per area (e.g. `institute: fee-management`), each small enough to review.
- Once the foundation is merged, new code is written i18n-ready from day one (section 3), which stops the debt from growing.

## 3. How new development handles it (the rules)

### Frontend rules (put in each repo's `CLAUDE.md` / `AGENTS.md` and the contributing doc)
1. **No user-visible text in templates or scripts.** Use `$t('area.key')` in templates, `t()` from `useI18n()` in `<script setup>`, and `tg()` from `~/utils/i18n` in stores, utils and constant maps.
2. **Bind PrimeVue props.** For example, `:label="$t('common.save')"`, never `label="Save"`. The same goes for `header`, `placeholder`, `summary`, `detail`, `emptyMessage` and `aria-label`.
3. **Option arrays and menus built in setup are `computed()`**, so they re-translate when the language changes.
4. **Use named parameters, never concatenation.** For example, `t('fees.due', { amount })`.
5. **Add every new key to `en`, `bn` and `ar` in the same commit.** If the translation isn't ready, copy the English text and add `"_todo"` in a review list. Never leave a key missing.
6. **Put keys in the area's own file:** `i18n/locales/<lang>/<area>.json`, with one top-level key per file. Reuse `common.*` for shared words (Save, Cancel, Search, Status…).
7. **Format numbers and dates for display with `intlLocale()` / `dateLocale()`.** Never hardcode `'en-US'` for display. Values sent to the API keep a fixed format.
8. **RTL-safe CSS in new code:** prefer `margin-inline-start`, `padding-inline-end` and `inset-inline-start` over left/right. Avoid new `ml-*`/`mr-*`/`text-left` where direction matters, and use `gap` instead.
9. **Don't translate:** API data, names, codes or IDs.

### Backend rules
1. Return user-facing messages in **English** as today. They are looked up in `lang/bn.json` and `lang/ar.json` by their English text.
2. **For messages with variables,** use Laravel placeholders: `__('Student :id not found', ['id' => $id])`. Don't build them with `"Student $id not found"`.
3. **Add new message strings to `bn.json` and `ar.json`** in the same PR (the CI check lists missing ones).

### Enforcement (so the rules don't depend on memory)
- **CI step `npm run i18n:check`.** It fails on keys missing in any language, and on keys used in code but absent from `en`.
- **ESLint `vue/no-bare-strings-in-template`.** Start it as a warning on all files, and make it an error for modules already converted.
- **Backend test:** a PHPUnit check that every key in `bn.json` exists in `ar.json`. Optionally, a script that lists literal `formatErrors` messages missing from the JSON files.
- **PR template checkbox:** "New text added in en/bn/ar; checked in Arabic (RTL)."

### Skill / AI-agent instructions
- A project skill `i18n-string` in each repo (`.claude/skills/i18n/SKILL.md`). It tells Claude, or any agent, the rules above, the file layout, and that it must run `npm run i18n:check` before finishing.
- The same rules go in a short `CLAUDE.md` section, so every AI-assisted change follows them by default.

## 4. Translation workflow
- **Developers write English.** Bangla and Arabic drafts can be machine- or AI-generated in the same PR.
- **Before release, a native reviewer checks each new area:** one person for Bangla, one for Arabic. A glossary (`docs/i18n-glossary.md`) keeps terms consistent, for example শিক্ষার্থী, প্রতিষ্ঠান, ফি and شاشة الرسوم.
- **Missing translations fall back to English silently,** so the app never shows raw keys.

## 5. Rollout order (suggested)
1. Foundation in all 5 frontends and the backend (mostly done; needs moving to `i18n`).
2. Partner, student and payment: fully converted (done; needs review).
3. Operation: in progress.
4. Institute, one module per PR, by user traffic: dashboard/menu → fee-management → student → exam-management → the rest.
5. Printed documents last, after the product decision.
6. **Report language option (after UAT, if feedback asks for it).** Add a "Report language: English / বাংলা" choice to reports, one report at a time.
   - **Current state:** about 145 frontend files generate PDFs (jsPDF/pdfmake), mostly in institute. Their built-in fonts can't draw Bangla or Arabic. Backend Excel exports (maatwebsite/excel) have English headers.
   - **Needed once:** embed a Bangla font and an Arabic font (e.g. Noto Sans Bengali, Noto Naskh Arabic) in a shared PDF helper, with a `reportLocale` parameter. Backend exports take the same parameter (`?lang=`).
   - **Then per report:** route the report's fixed labels through translation keys under a `report.*` area. Data stays as it is.
   - **Order:** money receipts → fee collection reports → admit cards / marksheets → the rest, by usage.
   - **Default stays English.** Official documents keep their current format unless the institute picks Bangla.

Institute module sizes. These are rough string counts from a grep, so expect noise. They include printed-document markup and backup copies of pages.

| Module | Strings |
|---|---|
| exam-management | ~4,100 (many marksheet and tabulation printouts) |
| fee-management | ~2,700 |
| student | ~2,300 |
| auto-enroll | ~2,100 |
| hr-management | ~1,170 |
| template-generation | ~1,080 |
| general-account | ~1,070 |
| sms | ~840 |
| master-settings | ~820 |
| open-payment | ~450 |
| others | each under 250 |

The institute frame is done: base setup, layout, all 230 menu labels, sign-in, dashboard, profile and notifications.
- Menu labels stay in English in `data/appMenuStructure.js`, because role permissions match them against English text from the API. They are translated only when the menu is displayed.
- Some institute files are backup copies of pages (`*BK.vue`, `*Old.vue`). They should be deleted on the development branch rather than translated.

## 6. Decisions (made)
1. **Printed official documents** (receipts, marksheets, admit cards, certificates, ID cards): stay as they are now, whatever language is selected. Only the screen controls around them are translated.
2. **Digits:** Western digits (123) in every language (`bn-BD-u-nu-latn`, `ar-u-nu-latn`). Bangla and Arabic month names are kept.
3. **Default language:** the browser's language, falling back to English. The user's choice is kept in the `edumate_locale` cookie.
4. **Translation review:** AI-written for now, held to a native-sounding standard (see the skill). A native Bangla reviewer should read through before release; Arabic is reviewed before any Arabic-market launch.
5. **No stack upgrades:** Nuxt 3.13, `@nuxtjs/i18n` 9.0.0 pinned, PrimeVue 3 and Laravel 10 stay as they are.
6. **Branches:** `i18n` is rebased onto `develop`, since day-to-day work lands there. Partner has no `develop`, so it stays on `main`. Merge `develop` into `i18n` weekly.
