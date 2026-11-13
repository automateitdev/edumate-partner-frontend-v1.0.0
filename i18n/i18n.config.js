// vue-i18n options shared by every locale. Messages live in ./locales/*.json
// and are loaded lazily by @nuxtjs/i18n when the user switches language.
export default defineI18nConfig(() => ({
    legacy: false,
    fallbackLocale: 'en',
    // A missing Bangla or Arabic key falls back to English silently instead of
    // flooding the console; run the locale check script to find gaps.
    missingWarn: false,
    fallbackWarn: false
}));
