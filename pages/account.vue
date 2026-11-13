<script setup>
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useToast } from 'primevue/usetoast';
import Password from 'primevue/password';
import Button from 'primevue/button';
import Message from 'primevue/message';
import { useAuthStore } from '~/stores/auth';
import { pct } from '~/utils/format';

/** My details as Edumate has them, and changing my password. */
const { t } = useI18n();
const toast = useToast();
const authStore = useAuthStore();
const partner = computed(() => authStore.partner);

const form = ref({ current_password: '', password: '', password_confirmation: '' });
const error = ref(null);
const busy = ref(false);

const canSave = computed(() => form.value.current_password && form.value.password.length >= 8 && form.value.password === form.value.password_confirmation);

const save = async () => {
    if (!canSave.value || busy.value) return;
    busy.value = true;
    error.value = null;
    const result = await authStore.changePassword(form.value);
    busy.value = false;
    if (!result.status) {
        error.value = result.error;
        return;
    }
    form.value = { current_password: '', password: '', password_confirmation: '' };
    toast.add({ severity: 'success', summary: t('account.changed'), detail: t('account.changed_detail'), life: 5000 });
};
</script>

<template>
    <h2 class="mt-0">{{ $t('nav.account') }}</h2>
    <div class="grid">
        <div class="col-12 md:col-6">
            <div class="portal-card h-full">
                <div class="font-semibold mb-3">{{ $t('account.details') }}</div>
                <div class="flex justify-content-between py-1"><span class="text-600">{{ $t('account.code') }}</span><span>{{ partner?.code }}</span></div>
                <div class="flex justify-content-between py-1"><span class="text-600">{{ $t('account.name') }}</span><span>{{ partner?.name }}</span></div>
                <div class="flex justify-content-between py-1"><span class="text-600">{{ $t('account.mobile') }}</span><span>{{ partner?.mobile }}</span></div>
                <div class="flex justify-content-between py-1"><span class="text-600">{{ $t('account.email') }}</span><span>{{ partner?.email ?? '—' }}</span></div>
                <div class="flex justify-content-between py-1"><span class="text-600">{{ $t('common.commission') }}</span><span>{{ partner?.commission_mode === 'tiered' ? $t('account.tiered') : $t('account.fixed', { pct: pct(partner?.default_pct) }) }}</span></div>
                <div class="flex justify-content-between py-1"><span class="text-600">{{ $t('account.ait') }}</span><span>{{ pct(partner?.tax_rate) }}</span></div>
                <p class="text-sm text-500 mb-0 mt-3">{{ $t('account.contact') }}</p>
            </div>
        </div>
        <div class="col-12 md:col-6">
            <form class="portal-card h-full" @submit.prevent="save">
                <div class="font-semibold mb-3">{{ $t('account.change_password') }}</div>
                <Message v-if="error" severity="error" :closable="false" class="mt-0">{{ error }}</Message>
                <div class="field">
                    <label for="current" class="font-medium">{{ $t('account.current') }}</label>
                    <Password inputId="current" v-model="form.current_password" :feedback="false" toggleMask autocomplete="current-password" class="w-full" inputClass="w-full" />
                </div>
                <div class="field">
                    <label for="new" class="font-medium">{{ $t('account.new') }}</label>
                    <Password inputId="new" v-model="form.password" toggleMask autocomplete="new-password" class="w-full" inputClass="w-full" />
                </div>
                <div class="field">
                    <label for="confirm" class="font-medium">{{ $t('account.confirm') }}</label>
                    <Password inputId="confirm" v-model="form.password_confirmation" :feedback="false" toggleMask autocomplete="new-password" class="w-full" inputClass="w-full" />
                    <small v-if="form.password_confirmation && form.password !== form.password_confirmation" class="text-red-500">{{ $t('account.mismatch') }}</small>
                </div>
                <Button type="submit" :label="$t('account.change_password')" icon="pi pi-lock" :loading="busy" :disabled="!canSave" />
            </form>
        </div>
    </div>
</template>
