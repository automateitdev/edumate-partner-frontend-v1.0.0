<script setup>
import { computed } from 'vue';
import Dropdown from 'primevue/dropdown';

/** English / বাংলা / العربية picker. The choice is remembered in a cookie. */
const { locale, locales, setLocale } = useI18n();
const options = computed(() => locales.value.map((l) => ({ code: l.code, name: l.name })));
const current = computed({
    get: () => locale.value,
    set: (code) => setLocale(code)
});
</script>

<template>
    <Dropdown v-model="current" :options="options" optionLabel="name" optionValue="code" class="language-switcher" :aria-label="$t('common.language')">
        <template #value="{ value }">
            <span class="flex align-items-center gap-2"><i class="pi pi-globe"></i>{{ options.find((o) => o.code === value)?.name }}</span>
        </template>
    </Dropdown>
</template>
