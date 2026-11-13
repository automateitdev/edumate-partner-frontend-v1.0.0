<script setup>
import { ref, onMounted } from 'vue';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Calendar from 'primevue/calendar';
import Button from 'primevue/button';
import Message from 'primevue/message';
import { usePortalStore } from '~/stores/portal';
import { taka, num, monthLabel } from '~/utils/format';

/** Online fee collection of my institutes, by month, and my commission from it. */
const portal = usePortalStore();
const today = new Date();
const from = ref(new Date(today.getFullYear(), today.getMonth() - 5, 1));
const to = ref(today);
const data = ref(null);
const loading = ref(false);
const error = ref(null);

const ym = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;

const load = async () => {
    loading.value = true;
    const result = await portal.get('fee-revenue', { month_from: ym(from.value), month_to: ym(to.value) });
    loading.value = false;
    if (result.status) data.value = result.data;
    else error.value = result.error;
};

onMounted(load);
</script>

<template>
    <h2 class="mt-0">{{ $t('nav.fee_revenue') }}</h2>
    <Message v-if="error" severity="error" :closable="false">{{ error }}</Message>

    <div v-if="data" class="grid">
        <div class="col-12 sm:col-4"><div class="portal-card mb-0"><div class="stat-label">{{ $t('common.collected_online') }}</div><div class="stat-value">{{ taka(data.summary.collection) }}</div><small class="text-500">{{ $t('feeRevenue.payments_count', { count: num(data.summary.payments) }, Number(data.summary.payments)) }}</small></div></div>
        <div class="col-12 sm:col-4"><div class="portal-card mb-0"><div class="stat-label">{{ $t('feeRevenue.edumate_charge') }}</div><div class="stat-value">{{ taka(data.summary.revenue) }}</div></div></div>
        <div class="col-12 sm:col-4"><div class="portal-card mb-0"><div class="stat-label">{{ $t('common.your_commission') }}</div><div class="stat-value text-primary">{{ taka(data.summary.commission) }}</div></div></div>
    </div>

    <div class="portal-card mt-3">
        <div class="flex gap-2 flex-wrap align-items-center mb-3">
            <Calendar v-model="from" view="month" dateFormat="M yy" class="w-9rem" :aria-label="$t('feeRevenue.from_month')" />
            <span class="text-500">{{ $t('feeRevenue.to') }}</span>
            <Calendar v-model="to" view="month" dateFormat="M yy" class="w-9rem" :aria-label="$t('feeRevenue.to_month')" />
            <Button :label="$t('common.show')" icon="pi pi-search" size="small" :loading="loading" @click="load" />
        </div>
        <DataTable :value="data?.rows ?? []" :loading="loading" size="small" scrollable stripedRows>
            <template #empty> {{ $t('feeRevenue.empty') }} </template>
            <Column :header="$t('feeRevenue.month')"><template #body="{ data: row }">{{ monthLabel(row.month) }}</template></Column>
            <Column :header="$t('common.institute')" style="min-width: 200px"><template #body="{ data: row }">{{ row.institute?.name }}</template></Column>
            <Column :header="$t('feeRevenue.payments')" bodyClass="text-right"><template #body="{ data: row }">{{ num(row.payments) }}</template></Column>
            <Column :header="$t('feeRevenue.collected')" bodyClass="text-right"><template #body="{ data: row }">{{ taka(row.collection) }}</template></Column>
            <Column :header="$t('common.your_commission')" bodyClass="text-right"><template #body="{ data: row }"><span class="font-semibold">{{ taka(row.commission) }}</span></template></Column>
        </DataTable>
    </div>
</template>
