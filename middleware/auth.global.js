import { useAuthStore } from '~/stores/auth';

/** Every page but the sign-in page needs a signed-in partner. */
export default defineNuxtRouteMiddleware(async (to) => {
    const authStore = useAuthStore();
    const partner = await authStore.fetchMe();

    if (to.path === '/login') {
        return partner ? navigateTo('/') : undefined;
    }

    if (!partner) {
        return navigateTo('/login');
    }
});
