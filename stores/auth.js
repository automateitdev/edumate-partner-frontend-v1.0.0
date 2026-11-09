import axios from 'axios';
import { defineStore } from 'pinia';

/** The signed-in partner. The session itself is in httpOnly cookies. */
export const useAuthStore = defineStore('auth', {
    state: () => ({
        partner: null,
        checked: false
    }),

    actions: {
        async login(mobile, password) {
            try {
                const response = await axios.post('/api/partner/login', { mobile, password });
                this.partner = response.data?.payload?.data?.partner ?? null;
                this.checked = true;
                return { status: true };
            } catch (error) {
                return { status: false, error: errorMessage(error) };
            }
        },

        /** Who is signed in, asked once per page load. */
        async fetchMe() {
            if (this.checked) return this.partner;
            try {
                const response = await axios.get('/api/partner/me');
                this.partner = response.data?.payload?.data?.partner ?? null;
            } catch {
                this.partner = null;
            }
            this.checked = true;
            return this.partner;
        },

        async logout() {
            try {
                await axios.post('/api/partner/logout');
            } finally {
                this.clear();
            }
        },

        async changePassword(payload) {
            try {
                const response = await axios.post('/api/partner/change-password', payload);
                return { status: true, message: response.data?.payload?.data?.message };
            } catch (error) {
                return { status: false, error: errorMessage(error) };
            }
        },

        clear() {
            this.partner = null;
            this.checked = true;
        }
    }
});

/** The backend's error envelope as one line of text. */
export const errorMessage = (error) => {
    const errors = error?.response?.data?.errors;
    const list = errors?.validation_error ?? errors?.request_error ?? errors?.not_found ?? errors?.system_error;
    if (Array.isArray(list) && list.length) return list.map((e) => e.message).join('\n');
    if (error?.response?.status === 429) return 'Too many attempts. Wait a minute and try again.';
    return 'Something went wrong. Please try again.';
};
