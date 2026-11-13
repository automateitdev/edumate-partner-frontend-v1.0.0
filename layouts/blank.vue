<template>
    <Toast />
    <div class="flex justify-content-end p-3 no-print">
        <LanguageSwitcher />
    </div>
    <slot />
</template>

<script setup>
import Toast from 'primevue/toast';
</script>
