<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Tag from 'primevue/tag';
import Message from 'primevue/message';
import { usePortalStore } from '~/stores/portal';
import { taka, formatDate, monthLabel, PAYOUT_STATUSES, SOURCES } from '~/utils/format';

/** One payout and the commission entries it paid. */
const route = useRoute();
const portal = usePortalStore();
const payout = ref(null);
const error = ref(null);

onMounted(async () => {
    const result = await portal.get(`payouts/${route.params.id}`);
    if (result.status) payout.value = result.data;
    else error.value = result.error;
});
</script>

<template>
    <NuxtLink to="/payouts" class="text-sm"><i class="pi pi-arrow-left text-xs"></i> Payouts</NuxtLink>
    <Message v-if="error" severity="error" :closable="false">{{ error }}</Message>

    <template v-if="payout">
        <div class="flex align-items-center gap-2 my-3">
            <h2 class="m-0">{{ payout.batch_no }}</h2>
            <Tag :severity="PAYOUT_STATUSES[payout.status]?.severity" :value="PAYOUT_STATUSES[payout.status]?.label" />
        </div>

        <div class="grid">
            <div class="col-12 md:col-4">
                <div class="portal-card h-full">
                    <div class="flex justify-content-between py-1"><span class="text-600">Commission ({{ payout.entries }} entries)</span><span>{{ taka(payout.gross_amount) }}</span></div>
                    <div class="flex justify-content-between py-1"><span class="text-600">AIT {{ Number(payout.tax_pct) }}%</span><span>− {{ taka(payout.tax_amount) }}</span></div>
                    <div class="flex justify-content-between py-2 mt-1 border-top-1 surface-border font-semibold text-lg"><span>Paid to you</span><span>{{ taka(payout.net_amount) }}</span></div>
                    <div class="text-sm text-600 mt-2">Commission due up to {{ monthLabel(payout.period) }}</div>
                    <div v-if="payout.paid_on" class="text-sm text-600 mt-1">Paid {{ formatDate(payout.paid_on) }}<template v-if="payout.reference"> · ref {{ payout.reference }}</template></div>
                    <div v-if="payout.account" class="text-sm text-600 mt-1">To {{ payout.account.method.toUpperCase() }} {{ payout.account.account_no }}</div>
                </div>
            </div>
            <div class="col-12 md:col-8">
                <div class="portal-card">
                    <DataTable :value="payout.entries" size="small" scrollable stripedRows>
                        <Column header="Institute"><template #body="{ data }">{{ data.institute?.name }}</template></Column>
                        <Column header="For">
                            <template #body="{ data }">{{ data.reference }}<small class="block text-500">{{ SOURCES[data.source_type] }}</small></template>
                        </Column>
                        <Column header="Commission" bodyClass="text-right">
                            <template #body="{ data }"><span :class="{ 'text-red-500': Number(data.amount) < 0 }">{{ taka(data.amount) }}</span></template>
                        </Column>
                    </DataTable>
                </div>
            </div>
        </div>
    </template>
</template>
