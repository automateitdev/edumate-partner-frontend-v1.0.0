<script setup>
import { ref, computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Dropdown from 'primevue/dropdown';
import InputText from 'primevue/inputtext';
import Tag from 'primevue/tag';
import Message from 'primevue/message';
import { usePortalStore } from '~/stores/portal';
import { taka, formatDate, BILL_STATUSES } from '~/utils/format';

/** Direct bills of my institutes, so I can follow up what is still due. */
const { t } = useI18n();
const portal = usePortalStore();
const bills = ref([]);
const meta = ref({ current_page: 1, total: 0, per_page: 25 });
const loading = ref(false);
const error = ref(null);
const status = ref(null);
const due = ref('yes');
const search = ref('');

const statusOptions = computed(() => [{ label: t('common.all_statuses'), value: null }, ...Object.entries(BILL_STATUSES).map(([value, s]) => ({ label: s.label, value }))]);
const dueOptions = computed(() => [
    { label: t('common.still_due'), value: 'yes' },
    { label: t('bills.settled'), value: 'no' },
    { label: t('common.all'), value: null }
]);

const load = async (page = 1) => {
    loading.value = true;
    const result = await portal.get('bills', { page, status: status.value, has_due: due.value, search: search.value.trim() });
    loading.value = false;
    if (!result.status) {
        error.value = result.error;
        return;
    }
    bills.value = result.data.data;
    meta.value = result.data.meta;
};

onMounted(() => load());

let timer = null;
const onSearch = () => {
    clearTimeout(timer);
    timer = setTimeout(() => load(1), 350);
};
</script>

<template>
    <h2 class="mt-0">{{ $t('nav.bills') }}</h2>
    <Message v-if="error" severity="error" :closable="false">{{ error }}</Message>
    <div class="portal-card">
        <div class="flex gap-2 flex-wrap mb-3">
            <InputText v-model="search" :placeholder="$t('bills.search')" class="w-14rem" @input="onSearch" />
            <Dropdown v-model="due" :options="dueOptions" optionLabel="label" optionValue="value" :placeholder="$t('common.all')" class="w-10rem" @change="load(1)" />
            <Dropdown v-model="status" :options="statusOptions" optionLabel="label" optionValue="value" :placeholder="$t('common.all_statuses')" class="w-11rem" @change="load(1)" />
        </div>
        <DataTable :value="bills" :loading="loading" size="small" scrollable stripedRows :lazy="true" :paginator="meta.total > meta.per_page" :rows="meta.per_page" :totalRecords="meta.total" @page="(e) => load(e.page + 1)">
            <template #empty> {{ $t('bills.empty') }} </template>
            <Column :header="$t('common.institute')" style="min-width: 200px">
                <template #body="{ data }">
                    <NuxtLink :to="`/bills/${data.id}`" class="font-semibold no-underline text-primary">{{ data.institute?.name }}</NuxtLink>
                    <small class="block text-500">{{ data.bill_no }}</small>
                </template>
            </Column>
            <Column :header="$t('bills.period')" style="min-width: 190px">
                <template #body="{ data }">{{ formatDate(data.period_start) }} – {{ formatDate(data.period_end) }}</template>
            </Column>
            <Column :header="$t('bills.bill')" bodyClass="text-right"><template #body="{ data }">{{ taka(data.payable) }}</template></Column>
            <Column :header="$t('bills.paid')" bodyClass="text-right"><template #body="{ data }">{{ taka(data.paid) }}</template></Column>
            <Column :header="$t('bills.due')" bodyClass="text-right">
                <template #body="{ data }"><span :class="{ 'text-red-500 font-semibold': data.status === 'overdue' }">{{ data.status === 'cancelled' ? '—' : taka(data.due) }}</span></template>
            </Column>
            <Column :header="$t('bills.due_date')" style="min-width: 110px"><template #body="{ data }">{{ formatDate(data.due_date) }}</template></Column>
            <Column :header="$t('common.status')"><template #body="{ data }"><Tag :severity="BILL_STATUSES[data.status]?.severity" :value="BILL_STATUSES[data.status]?.label ?? data.status" /></template></Column>
        </DataTable>
    </div>
</template>
