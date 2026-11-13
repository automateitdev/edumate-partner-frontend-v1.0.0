<script setup>
import { ref, computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Dropdown from 'primevue/dropdown';
import Tag from 'primevue/tag';
import Message from 'primevue/message';
import { usePortalStore } from '~/stores/portal';
import { taka, pct, formatDate, LEDGER_STATUSES, SOURCES } from '~/utils/format';

/** Every commission entry: what earned it, when it is due, and where it stands. */
const { t } = useI18n();
const portal = usePortalStore();
const entries = ref([]);
const summary = ref(null);
const meta = ref({ current_page: 1, total: 0, per_page: 25 });
const loading = ref(false);
const error = ref(null);
const status = ref(null);
const source = ref(null);

const statusOptions = computed(() => [{ label: t('common.all_statuses'), value: null }, ...Object.entries(LEDGER_STATUSES).map(([value, s]) => ({ label: s.label, value }))]);
const sourceOptions = computed(() => [{ label: t('commission.all_sources'), value: null }, ...Object.keys(SOURCES).map((value) => ({ label: SOURCES[value], value }))]);

const load = async (page = 1) => {
    loading.value = true;
    const result = await portal.get('commission', { page, status: status.value, source_type: source.value });
    loading.value = false;
    if (!result.status) {
        error.value = result.error;
        return;
    }
    entries.value = result.data.data;
    summary.value = result.data.summary;
    meta.value = result.data.meta;
};

onMounted(() => load());

const cards = computed(() => ['payable', 'accrued', 'paid', 'hold'].map((key) => ({ key, ...LEDGER_STATUSES[key], amount: summary.value?.[key]?.amount })));
</script>

<template>
    <h2 class="mt-0">{{ $t('nav.commission') }}</h2>
    <Message v-if="error" severity="error" :closable="false">{{ error }}</Message>

    <div class="grid">
        <div v-for="card in cards" :key="card.key" class="col-6 lg:col-3">
            <div class="portal-card h-full mb-0">
                <div class="stat-label">{{ card.label }}</div>
                <div class="stat-value">{{ taka(card.amount) }}</div>
            </div>
        </div>
    </div>

    <div class="portal-card mt-3">
        <div class="flex gap-2 flex-wrap mb-3">
            <Dropdown v-model="status" :options="statusOptions" optionLabel="label" optionValue="value" :placeholder="$t('common.all_statuses')" class="w-12rem" @change="load(1)" />
            <Dropdown v-model="source" :options="sourceOptions" optionLabel="label" optionValue="value" :placeholder="$t('commission.all_sources')" class="w-12rem" @change="load(1)" />
        </div>
        <DataTable :value="entries" :loading="loading" size="small" scrollable stripedRows :lazy="true" :paginator="meta.total > meta.per_page" :rows="meta.per_page" :totalRecords="meta.total" @page="(e) => load(e.page + 1)">
            <template #empty> {{ $t('commission.empty') }} </template>
            <Column :header="$t('common.institute')" style="min-width: 180px">
                <template #body="{ data }">{{ data.institute?.name }}</template>
            </Column>
            <Column :header="$t('common.for')" style="min-width: 220px">
                <template #body="{ data }">
                    <div>{{ data.reference }}</div>
                    <small class="text-500">{{ SOURCES[data.source_type] }}<template v-if="data.entry_type === 'clawback'"> · {{ $t('commission.taken_back') }}</template></small>
                </template>
            </Column>
            <Column :header="$t('common.commission')" bodyClass="text-right" style="min-width: 120px">
                <template #body="{ data }">
                    <span class="font-semibold" :class="{ 'text-red-500': Number(data.amount) < 0 }">{{ taka(data.amount) }}</span>
                    <small class="block text-500">{{ $t('commission.pct_of', { pct: pct(data.pct), base: taka(data.base_amount) }) }}</small>
                </template>
            </Column>
            <Column :header="$t('commission.earned_due')" style="min-width: 130px">
                <template #body="{ data }">{{ formatDate(data.earned_on) }}<small class="block text-500">{{ $t('commission.due_on', { date: formatDate(data.due_on) }) }}</small></template>
            </Column>
            <Column :header="$t('common.status')" style="min-width: 150px">
                <template #body="{ data }">
                    <Tag :severity="LEDGER_STATUSES[data.status]?.severity" :value="LEDGER_STATUSES[data.status]?.label ?? data.status" />
                    <small v-if="data.hold_reason" class="block text-500 mt-1">{{ data.hold_reason }}</small>
                    <NuxtLink v-if="data.batch" :to="`/payouts/${data.batch.id}`" class="block text-sm mt-1">{{ data.batch.batch_no }}</NuxtLink>
                </template>
            </Column>
        </DataTable>
    </div>
</template>
