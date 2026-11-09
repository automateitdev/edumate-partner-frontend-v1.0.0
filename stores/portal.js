import axios from 'axios';
import { defineStore } from 'pinia';
import { errorMessage } from '~/stores/auth';

/**
 * The partner portal's read-only data. Each call resolves to
 * { status, data } or { status: false, error }.
 */
export const usePortalStore = defineStore('portal', {
    actions: {
        async get(path, params = {}) {
            try {
                const clean = Object.fromEntries(Object.entries(params).filter(([, v]) => v !== null && v !== undefined && v !== ''));
                const response = await axios.get(`/api/partner/${path}`, { params: clean });
                return { status: true, data: response.data?.payload?.data };
            } catch (error) {
                return { status: false, error: errorMessage(error) };
            }
        }
    }
});
