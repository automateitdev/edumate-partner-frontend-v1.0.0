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
                { id: 'theme-css', rel: 'stylesheet', type: 'text/css', href: '/themes/aura-light-green/theme.css' }
            ]
        }
    },

    modules: ['nuxt-primevue', '@pinia/nuxt'],

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

    plugins: ['~/plugins/axios.js'],

    css: ['primeicons/primeicons.css', 'primeflex/primeflex.scss', 'primevue/resources/primevue.min.css', '@/assets/styles.scss'],
    compatibilityDate: '2024-10-07'
});
