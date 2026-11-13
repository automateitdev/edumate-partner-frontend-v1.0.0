import axios from 'axios';
import { watch } from 'vue';
import { currentLocale, setTranslator } from '~/utils/i18n';

/**
 * Wires the chosen language into the rest of the app:
 *  - plain JS modules can translate through utils/i18n (tg),
 *  - every API call carries Accept-Language so the backend answers in kind,
 *  - <html lang dir> follows the locale, so Arabic lays out right-to-left.
 */
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
        };

        apply(i18n.locale.value);
        watch(i18n.locale, apply);
    }
});
