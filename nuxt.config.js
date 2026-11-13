// https://nuxt.com/docs/api/configuration/nuxt-config
// Partner portal: a client-rendered app like the other Edumate portals. It
// talks to the backend's /api/partner routes; the session lives in httpOnly
// cookies the backend sets, so BASE_URL must be the backend's origin.
export default defineNuxtConfig({
    typescript: false,
    ssr: false,

    app: {
        head: {
            title: 'Partner Portal',
            link: [
                { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
                { id: 'theme-css', rel: 'stylesheet', type: 'text/css', href: '/themes/aura-light-green/theme.css' },
                { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
                { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;500;600;700&family=Noto+Sans+Arabic:wght@400;500;600;700&display=swap' }
            ]
        }
    },

    modules: ['nuxt-primevue', '@pinia/nuxt', '@nuxtjs/i18n'],

    // Bangla, English and Arabic. No URL prefixes: the choice is kept in the
    // edumate_locale cookie, first visits follow the browser language.
    i18n: {
        strategy: 'no_prefix',
        defaultLocale: 'en',
        lazy: true,
        langDir: 'locales',
        vueI18n: './i18n.config.js',
        locales: [
            { code: 'en', language: 'en-US', name: 'English', file: 'en.json', dir: 'ltr' },
            { code: 'bn', language: 'bn-BD', name: 'বাংলা', file: 'bn.json', dir: 'ltr' },
            { code: 'ar', language: 'ar', name: 'العربية', file: 'ar.json', dir: 'rtl' }
        ],
        detectBrowserLanguage: {
            useCookie: true,
            cookieKey: 'edumate_locale',
            redirectOn: 'root',
            fallbackLocale: 'en'
        }
    },

    primevue: {
        options: { ripple: true }
    },

    build: {
        transpile: ['primevue']
    },

    vite: {
        css: {
            preprocessorOptions: {
                scss: { api: 'modern-compiler' }
            }
        }
    },

    runtimeConfig: {
        public: {
            BASE_URL: process.env.BASE_URL
        }
    },

    plugins: ['~/plugins/axios.js', '~/plugins/i18n-bridge.js'],

    css: ['primeicons/primeicons.css', 'primeflex/primeflex.scss', 'primevue/resources/primevue.min.css', '@/assets/styles.scss', '@/assets/rtl.scss'],
    compatibilityDate: '2024-10-07'
});
