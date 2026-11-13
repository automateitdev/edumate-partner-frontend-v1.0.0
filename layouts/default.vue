<script setup>
import { ref, computed } from 'vue';
import { useRoute } from 'vue-router';
import Button from 'primevue/button';
import Sidebar from 'primevue/sidebar';
import Toast from 'primevue/toast';
import { useAuthStore } from '~/stores/auth';

/** The portal frame: the partner's name and sign-out on top, the sections on the left. */
const { t } = useI18n();
const route = useRoute();
const authStore = useAuthStore();
const menuOpen = ref(false);

const NAV = computed(() => [
    { label: t('nav.overview'), icon: 'pi pi-home', to: '/' },
    { label: t('nav.institutes'), icon: 'pi pi-building', to: '/institutes' },
    { label: t('nav.commission'), icon: 'pi pi-percentage', to: '/commission' },
    { label: t('nav.payouts'), icon: 'pi pi-wallet', to: '/payouts' },
    { label: t('nav.statement'), icon: 'pi pi-file', to: '/statement' },
    { label: t('nav.bills'), icon: 'pi pi-money-bill', to: '/bills' },
    { label: t('nav.fee_revenue'), icon: 'pi pi-chart-line', to: '/fee-revenue' },
    { label: t('nav.account'), icon: 'pi pi-user', to: '/account' }
]);

const isActive = (to) => (to === '/' ? route.path === '/' : route.path.startsWith(to));

const logout = async () => {
    await authStore.logout();
    navigateTo('/login');
};
</script>

<template>
    <Toast />
    <div class="min-h-screen flex flex-column">
        <header class="no-print flex align-items-center justify-content-between px-4 py-3 surface-card shadow-1">
            <div class="flex align-items-center gap-2">
                <Button icon="pi pi-bars" text rounded class="md:hidden" :aria-label="$t('common.open_menu')" @click="menuOpen = true" />
                <span class="text-xl font-bold text-primary">{{ $t('app.title') }}</span>
            </div>
            <div class="flex align-items-center gap-3">
                <span class="hidden sm:inline text-700">{{ authStore.partner?.name }} <small class="text-500">{{ authStore.partner?.code }}</small></span>
                <LanguageSwitcher />
                <Button :label="$t('common.sign_out')" icon="pi pi-sign-out" size="small" text severity="secondary" @click="logout" />
            </div>
        </header>

        <div class="flex flex-1">
            <nav class="no-print hidden md:block surface-card border-right-1 surface-border p-3" style="width: 15rem">
                <NuxtLink v-for="item in NAV" :key="item.to" :to="item.to" class="flex align-items-center gap-2 p-2 mb-1 border-round no-underline" :class="isActive(item.to) ? 'bg-primary-50 text-primary font-semibold' : 'text-700 hover:surface-100'">
                    <i :class="item.icon"></i>
                    <span>{{ item.label }}</span>
                </NuxtLink>
            </nav>

            <main class="flex-1 p-3 md:p-4" style="min-width: 0">
                <slot />
            </main>
        </div>
    </div>

    <Sidebar v-model:visible="menuOpen" :header="$t('app.title')" :position="$i18n.locale === 'ar' ? 'right' : 'left'">
        <NuxtLink v-for="item in NAV" :key="item.to" :to="item.to" class="flex align-items-center gap-2 p-2 mb-1 border-round no-underline" :class="isActive(item.to) ? 'bg-primary-50 text-primary font-semibold' : 'text-700'" @click="menuOpen = false">
            <i :class="item.icon"></i>
            <span>{{ item.label }}</span>
        </NuxtLink>
    </Sidebar>
</template>
