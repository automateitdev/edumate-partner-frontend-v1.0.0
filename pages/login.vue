<script setup>
import { ref } from 'vue';
import InputText from 'primevue/inputtext';
import Password from 'primevue/password';
import Button from 'primevue/button';
import Message from 'primevue/message';
import { useAuthStore } from '~/stores/auth';

/** Sign in with the mobile number on file and the password from the back office. */
definePageMeta({ layout: 'blank' });

const authStore = useAuthStore();
const mobile = ref('');
const password = ref('');
const error = ref(null);
const busy = ref(false);

const submit = async () => {
    if (!mobile.value.trim() || !password.value || busy.value) return;
    busy.value = true;
    error.value = null;
    const result = await authStore.login(mobile.value.trim(), password.value);
    busy.value = false;
    if (!result.status) {
        error.value = result.error;
        return;
    }
    navigateTo('/');
};
</script>

<template>
    <div class="min-h-screen flex align-items-center justify-content-center p-3">
        <form class="portal-card w-full" style="max-width: 26rem" @submit.prevent="submit">
            <div class="text-center mb-4">
                <i class="pi pi-briefcase text-4xl text-primary"></i>
                <div class="text-2xl font-bold mt-2">{{ $t('app.title') }}</div>
                <div class="text-600 mt-1">{{ $t('login.subtitle') }}</div>
            </div>

            <Message v-if="error" severity="error" :closable="false" class="mt-0">{{ error }}</Message>

            <div class="field">
                <label for="mobile" class="font-medium">{{ $t('login.mobile') }}</label>
                <InputText id="mobile" v-model="mobile" inputmode="tel" autocomplete="username" placeholder="01XXXXXXXXX" class="w-full" />
            </div>
            <div class="field">
                <label for="password" class="font-medium">{{ $t('login.password') }}</label>
                <Password inputId="password" v-model="password" :feedback="false" toggleMask autocomplete="current-password" class="w-full" inputClass="w-full" />
            </div>

            <Button type="submit" :label="$t('login.submit')" icon="pi pi-sign-in" class="w-full" :loading="busy" :disabled="!mobile.trim() || !password" />
            <p class="text-sm text-500 text-center mt-4 mb-0">{{ $t('login.forgot') }}</p>
        </form>
    </div>
</template>
