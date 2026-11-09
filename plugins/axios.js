import axios from 'axios';
import { useRuntimeConfig, useRouter } from 'nuxt/app';
import { useAuthStore } from '~/stores/auth';

/**
 * Every call goes to the backend with the session cookies. A 401 tries the
 * refresh cookie once, then sends the partner to the sign-in page.
 */
export default defineNuxtPlugin(() => {
    const config = useRuntimeConfig();
    const router = useRouter();
    const authStore = useAuthStore();

    axios.defaults.baseURL = config.public.BASE_URL;
    axios.defaults.withCredentials = true;
    axios.defaults.headers.common.Accept = 'application/json';

    let refreshing = null;

    axios.interceptors.response.use(
        (response) => response,
        async (error) => {
            const request = error.config ?? {};
            const url = request.url ?? '';
            const isAuthCall = ['/api/partner/login', '/api/partner/refresh', '/api/partner/logout'].some((path) => url.includes(path));

            if (error.response?.status !== 401 || request._retry || isAuthCall) {
                return Promise.reject(error);
            }

            request._retry = true;
            try {
                refreshing ??= axios.post('/api/partner/refresh').finally(() => (refreshing = null));
                await refreshing;
                return axios(request);
            } catch (refreshError) {
                authStore.clear();
                router.push('/login');
                return Promise.reject(refreshError);
            }
        }
    );
});
