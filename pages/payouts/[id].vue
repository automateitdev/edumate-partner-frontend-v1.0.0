<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Tag from 'primevue/tag';
import Message from 'primevue/message';
import { usePortalStore } from '~/stores/portal';
import { taka, num, formatDate, monthLabel, PAYOUT_STATUSES, SOURCES } from '~/utils/format';

/** One payout and the commission entries it paid. */
const route = useRoute();
const portal = usePortalStore();
const payout = ref(null);
const error = ref(null);

/** `entries` is the list of paid entries; fall back to it being a plain count. */
const entryCount = computed(() => (Array.isArray(payout.value?.entries) ? payout.value.entries.length : Number(payout.value?.entries ?? 0)));

onMounted(async () => {
    const result = await portal.get(`payouts/${route.params.id}`);
    if (result.status) payout.value = result.data;
    else error.value = result.error;
});
</script>

<template>
    <NuxtLink to="/payouts" class="text-sm"><i class="pi pi-arrow-left text-xs"></i> {{ $t('nav.payouts') }}</NuxtLink>
    <Message v-if="error" severity="error" :closable="false">{{ error }}</Message>

    <template v-if="payout">
        <div class="flex align-items-center gap-2 my-3">
            <h2 class="m-0">{{ payout.batch_no }}</h2>
            <Tag :severity="PAYOUT_STATUSES[payout.status]?.severity" :value="PAYOUT_STATUSES[payout.status]?.label" />
        </div>

        <div class="grid">
            <div class="col-12 md:col-4">
                <div class="portal-card h-full">
                    <div class="flex justify-content-between py-1"><span class="text-600">{{ $t('payouts.commission_entries', { count: num(entryCount) }, entryCount) }}</span><span>{{ taka(payout.gross_amount) }}</span></div>
                    <div class="flex justify-content-between py-1"><span class="text-600">{{ $t('payouts.ait_pct', { pct: num(payout.tax_pct) }) }}</span><span>− {{ taka(payout.tax_amount) }}</span></div>
                    <div class="flex justify-content-between py-2 mt-1 border-top-1 surface-border font-semibold text-lg"><span>{{ $t('common.paid_to_you') }}</span><span>{{ taka(payout.net_amount) }}</span></div>
                    <div class="text-sm text-600 mt-2">{{ $t('payouts.due_up_to', { month: monthLabel(payout.period) }) }}</div>
                    <div v-if="payout.paid_on" class="text-sm text-600 mt-1">{{ $t('payouts.paid_on', { date: formatDate(payout.paid_on) }) }}<template v-if="payout.reference"> · {{ $t('payouts.ref', { ref: payout.reference }) }}</template></div>
                    <div v-if="payout.account" class="text-sm text-600 mt-1">{{ $t('payouts.to_account', { method: payout.account.method.toUpperCase(), account: payout.account.account_no }) }}</div>
                </div>
            </div>
            <div class="col-12 md:col-8">
                <div class="portal-card">
                    <DataTable :value="payout.entries" size="small" scrollable stripedRows>
                        <Column :header="$t('common.institute')"><template #body="{ data }">{{ data.institute?.name }}</template></Column>
                        <Column :header="$t('common.for')">
                            <template #body="{ data }">{{ data.reference }}<small class="block text-500">{{ SOURCES[data.source_type] }}</small></template>
                        </Column>
                        <Column :header="$t('common.commission')" bodyClass="text-right">
                            <template #body="{ data }"><span :class="{ 'text-red-500': Number(data.amount) < 0 }">{{ taka(data.amount) }}</span></template>
                        </Column>
                    </DataTable>
                </div>
            </div>
        </div>
    </template>
</template>
