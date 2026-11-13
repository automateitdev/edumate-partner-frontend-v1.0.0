---
name: i18n
description: Use whenever adding, changing or reviewing user-visible text, labels, toasts, menus, option lists, number/date display or layout CSS in this Nuxt portal. Covers the English/Bangla/Arabic (RTL) translation setup, where keys go, and how to verify.
---

# i18n in this portal (English / Bangla / Arabic)

## How it is wired
- `@nuxtjs/i18n` 9.0.0, `strategy: 'no_prefix'`; the user's choice lives in the `edumate_locale` cookie.
  The switcher is `components/LanguageSwitcher.vue`.
- Messages: `i18n/locales/<code>/*.json`, merged by `i18n/locales/<code>.js`. One file per area
  (`common.json`, `fees.json`, …), one top-level key per file, the same files and keys in `en`, `bn` and `ar`.
- `plugins/i18n-bridge.js` sets `<html lang dir>` (Arabic → `rtl`), sends `Accept-Language` on API calls
  (the backend answers in kind), and feeds `utils/i18n.js`.
- `utils/i18n.js`: `tg(key, params)` translates outside components; `currentLocale` is reactive;
  `intlLocale()` / `dateLocale()` give the Intl locale for display formatting.
- `assets/rtl.scss` holds the right-to-left overrides for PrimeFlex, PrimeVue and the layout.


## Writing like a native (most important)
Users must not be able to tell the text was translated. Write each language from the meaning, not from the English words.

**Bangla (Bangladesh):** the plain, polite wording that school and office staff in Bangladesh actually use in apps.
- Use আপনি; buttons and actions as short imperatives: "সংরক্ষণ করুন", "মুছে ফেলুন", "খুঁজুন", "ফি পরিশোধ করুন".
- Keep the English loanwords Bangladeshis really use: লগইন, পাসওয়ার্ড, ড্যাশবোর্ড, রিপোর্ট, মোবাইল নম্বর, ইনভয়েস, SMS, PDF, OTP.
- Avoid stiff, bookish or Sanskritised words nobody says, e.g. "প্রমাণীকরণ", "পরিগণনা", "অনুসন্ধান-ফলাফল-শূন্য".
- Empty or error states read naturally: "কোনো তথ্য পাওয়া যায়নি", "কিছু একটা সমস্যা হয়েছে, আবার চেষ্টা করুন".
- Domain words: শিক্ষার্থী, প্রতিষ্ঠান, শ্রেণি, শাখা, শিফট, শিক্ষাবর্ষ, ফি, বকেয়া, মওকুফ, পরীক্ষা, ফলাফল, হাজিরা.
- Bangla uses "।" as the full stop.

**Arabic:** natural Modern Standard Arabic as in well-localised apps, not literal calques of English.
- Buttons as verbal nouns: "حفظ", "حذف", "بحث", "تسجيل الدخول", "إلغاء".
- Empty or error states: "لا توجد بيانات", "حدث خطأ، يرجى المحاولة مرة أخرى".
- Domain words: الطالب، المؤسسة التعليمية، الصف، الشعبة، العام الدراسي، الرسوم، المستحقات، إعفاء، الاختبار، النتيجة، الحضور.
- Use Arabic punctuation (، ؟ ؛), and keep word order natural rather than mirroring the English.

**Check before finishing:** read each new string aloud as a native user would. If it sounds like a translation, rewrite it.

## Adding text
1. Pick the area file (or create `<area>.json` in all three languages) and add the key:
   `en`: natural English · `bn`: polite Bangladeshi Bangla (আপনি; শিক্ষার্থী, প্রতিষ্ঠান, ফি, পরীক্ষা, ফলাফল) ·
   `ar`: Modern Standard Arabic. Keep "Edumate", "৳" and acronyms (SMS, PDF, OTP, ID) as they are.
2. Use it:
   - template: `{{ $t('fees.title') }}`, `:label="$t('common.save')"`
   - script: `const { t } = useI18n();` → `toast.add({ summary: t('common.saved') })`
   - plain JS / constant maps: `import { tg } from '~/utils/i18n'` with getters, so labels re-translate:
     `paid: { get label() { return tg('status.paid'); }, severity: 'success' }`
   - lists: `const options = computed(() => [{ label: t('common.all'), value: null }, …])`
3. Parameters: `"due": "Due {amount} by {date}"` → `t('fees.due', { amount, date })`. Don't build
   sentences from pieces; Bangla and Arabic word order differ.
4. Existing hardcoded Bangla: move it to `bn`, write the English and Arabic equivalents.

## Don't translate
API data, names, codes, IDs, route paths, CSS classes, log messages. Official printed documents (receipts,
marksheets, admit cards, certificates): translate the controls around them, and leave the document body
until the product decision is made.

## RTL
Prefer `gap` and logical CSS properties. If a layout needs a direction-specific fix, add it under
`[dir='rtl']` in `assets/rtl.scss`. PrimeVue `Sidebar`: `:position="$i18n.locale === 'ar' ? 'right' : 'left'"`.

## Verify
1. `npm run i18n:check` reports 0 problems (missing or extra keys per language, keys used in code but absent from `en`).
2. `npx nuxt build` succeeds.
3. Look at the screen in বাংলা and العربية: text switches, Arabic mirrors, nothing overflows.
