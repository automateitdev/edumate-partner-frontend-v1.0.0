<script setup>
import { ref, onMounted } from 'vue';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Calendar from 'primevue/calendar';
import Button from 'primevue/button';
import Message from 'primevue/message';
import { usePortalStore } from '~/stores/portal';
import { taka, monthLabel } from '~/utils/format';

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
    <h2 class="mt-0">Fee revenue</h2>
    <Message v-if="error" severity="error" :closable="false">{{ error }}</Message>

    <div v-if="data" class="grid">
        <div class="col-12 sm:col-4"><div class="portal-card mb-0"><div class="stat-label">Collected online</div><div class="stat-value">{{ taka(data.summary.collection) }}</div><small class="text-500">{{ data.summary.payments }} payments</small></div></div>
        <div class="col-12 sm:col-4"><div class="portal-card mb-0"><div class="stat-label">Edumate's charge</div><div class="stat-value">{{ taka(data.summary.revenue) }}</div></div></div>
        <div class="col-12 sm:col-4"><div class="portal-card mb-0"><div class="stat-label">Your commission</div><div class="stat-value text-primary">{{ taka(data.summary.commission) }}</div></div></div>
    </div>

    <div class="portal-card mt-3">
        <div class="flex gap-2 flex-wrap align-items-center mb-3">
            <Calendar v-model="from" view="month" dateFormat="M yy" class="w-9rem" aria-label="From month" />
            <span class="text-500">to</span>
            <Calendar v-model="to" view="month" dateFormat="M yy" class="w-9rem" aria-label="To month" />
            <Button label="Show" icon="pi pi-search" size="small" :loading="loading" @click="load" />
        </div>
        <DataTable :value="data?.rows ?? []" :loading="loading" size="small" scrollable stripedRows>
            <template #empty> No online fee collection for your institutes in these months. </template>
            <Column header="Month"><template #body="{ data: row }">{{ monthLabel(row.month) }}</template></Column>
            <Column header="Institute" style="min-width: 200px"><template #body="{ data: row }">{{ row.institute?.name }}</template></Column>
            <Column header="Payments" bodyClass="text-right"><template #body="{ data: row }">{{ row.payments }}</template></Column>
            <Column header="Collected" bodyClass="text-right"><template #body="{ data: row }">{{ taka(row.collection) }}</template></Column>
            <Column header="Your commission" bodyClass="text-right"><template #body="{ data: row }"><span class="font-semibold">{{ taka(row.commission) }}</span></template></Column>
        </DataTable>
    </div>
</template>
