<script setup>
import { ref, onMounted } from 'vue';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Tag from 'primevue/tag';
import Message from 'primevue/message';
import { usePortalStore } from '~/stores/portal';
import { taka, formatDate, monthLabel, PAYOUT_STATUSES } from '~/utils/format';

/** My payouts: commission paid to me, AIT taken off, and the account it went to. */
const portal = usePortalStore();
const payouts = ref([]);
const loading = ref(true);
const error = ref(null);

onMounted(async () => {
    const result = await portal.get('payouts');
    loading.value = false;
    if (result.status) payouts.value = result.data.payouts;
    else error.value = result.error;
});
</script>

<template>
    <h2 class="mt-0">Payouts</h2>
    <Message v-if="error" severity="error" :closable="false">{{ error }}</Message>
    <div class="portal-card">
        <DataTable :value="payouts" :loading="loading" size="small" scrollable stripedRows>
            <template #empty> No payout yet. </template>
            <Column header="Payout" style="min-width: 150px">
                <template #body="{ data }">
                    <NuxtLink :to="`/payouts/${data.id}`" class="font-semibold no-underline text-primary">{{ data.batch_no }}</NuxtLink>
                    <small class="block text-500">commission up to {{ monthLabel(data.period) }}</small>
                </template>
            </Column>
            <Column header="Commission" bodyClass="text-right"><template #body="{ data }">{{ taka(data.gross_amount) }}</template></Column>
            <Column header="AIT" bodyClass="text-right"><template #body="{ data }">− {{ taka(data.tax_amount) }}</template></Column>
            <Column header="Paid to you" bodyClass="text-right"><template #body="{ data }"><span class="font-semibold">{{ taka(data.net_amount) }}</span></template></Column>
            <Column header="Status" style="min-width: 160px">
                <template #body="{ data }">
                    <Tag :severity="PAYOUT_STATUSES[data.status]?.severity" :value="PAYOUT_STATUSES[data.status]?.label" />
                    <small v-if="data.paid_on" class="block text-500 mt-1">{{ formatDate(data.paid_on) }}<template v-if="data.account"> · {{ data.account.method.toUpperCase() }} {{ data.account.account_no }}</template></small>
                </template>
            </Column>
        </DataTable>
    </div>
</template>
