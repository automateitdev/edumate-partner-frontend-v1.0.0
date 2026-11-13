import { ref } from 'vue';

/**
 * Bridge to the app's i18n instance for plain JS modules (stores, formatters,
 * status maps) that run outside a component's setup(). The i18n-bridge plugin
 * fills these in at startup and keeps `currentLocale` in step with switches.
 */
export const currentLocale = ref('en');
let translate = (key) => key;

export const setTranslator = (fn) => {
    translate = fn;
};

/** Translate from anywhere; reactive when read during a component render. */
export const tg = (key, params) => {
    currentLocale.value; // track locale so render functions re-run on switch
    return translate(key, params);
};

/**
 * BCP 47 tag for Intl/toLocale* calls. Western digits (123) in every language
 * (product decision: safest for amounts, rolls and phone numbers); lakh grouping kept.
 */
const INTL = { en: 'en-IN', bn: 'bn-BD-u-nu-latn', ar: 'ar-u-nu-latn' };
export const intlLocale = () => INTL[currentLocale.value] ?? 'en-IN';

/** en-GB style dates for English (01 Jan 2026), native forms otherwise. */
const DATE_INTL = { en: 'en-GB', bn: 'bn-BD-u-nu-latn', ar: 'ar-u-nu-latn' };
export const dateLocale = () => DATE_INTL[currentLocale.value] ?? 'en-GB';

export const isRtl = () => currentLocale.value === 'ar';
