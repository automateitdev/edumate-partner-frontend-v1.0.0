import axios from 'axios';
import { watch } from 'vue';
import { currentLocale, setTranslator, dateLocale } from '~/utils/i18n';

/**
 * Wires the chosen language into the rest of the app:
 *  - plain JS modules can translate through utils/i18n (tg),
 *  - every API call carries Accept-Language so the backend answers in kind,
 *  - <html lang dir> follows the locale, so Arabic lays out right-to-left,
 *  - PrimeVue's own texts (calendar month/day names, password strength) follow it too.
 */

/** Month and day names from Intl, so the calendars need no translation files. */
const names = (loc, opts, count, make) => Array.from({ length: count }, (_, i) => make(i).toLocaleDateString(loc, opts));
const month = (i) => new Date(2026, i, 1);
const day = (i) => new Date(2026, 0, 4 + i); // 4 Jan 2026 is a Sunday

const primeLocale = (t) => {
    const loc = dateLocale();
    return {
        monthNames: names(loc, { month: 'long' }, 12, month),
        monthNamesShort: names(loc, { month: 'short' }, 12, month),
        dayNames: names(loc, { weekday: 'long' }, 7, day),
        dayNamesShort: names(loc, { weekday: 'short' }, 7, day),
        dayNamesMin: names(loc, { weekday: 'narrow' }, 7, day),
        passwordPrompt: t('common.password_prompt'),
        weak: t('common.password_weak'),
        medium: t('common.password_medium'),
        strong: t('common.password_strong'),
        emptyMessage: t('common.no_options'),
        emptyFilterMessage: t('common.no_options'),
        emptySearchMessage: t('common.no_options'),
        emptySelectionMessage: t('common.no_selection')
    };
};

export default defineNuxtPlugin({
    name: 'i18n-bridge',
    dependsOn: ['i18n:plugin'],
    setup(nuxtApp) {
        const i18n = nuxtApp.$i18n;
        setTranslator((key, params) => i18n.t(key, params ?? {}));

        const apply = (code) => {
            currentLocale.value = code;
            axios.defaults.headers.common['Accept-Language'] = code;
            const meta = i18n.locales.value.find((l) => (typeof l === 'string' ? l : l.code) === code);
            if (typeof document !== 'undefined') {
                document.documentElement.lang = meta?.language ?? code;
                document.documentElement.dir = meta?.dir ?? 'ltr';
            }
            const primevue = nuxtApp.vueApp.config.globalProperties.$primevue;
            if (primevue?.config?.locale) Object.assign(primevue.config.locale, primeLocale((key) => i18n.t(key)));
        };

        apply(i18n.locale.value);
        watch(i18n.locale, apply);
    }
});
