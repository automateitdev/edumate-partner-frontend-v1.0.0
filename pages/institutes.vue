<script setup>
import { ref, onMounted } from 'vue';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Message from 'primevue/message';
import { usePortalStore } from '~/stores/portal';
import { taka, pct, num, formatDate, MODES, CYCLES } from '~/utils/format';

/** The institutes assigned to me, how they pay, and my commission % on each today. */
const portal = usePortalStore();
const institutes = ref([]);
const loading = ref(true);
const error = ref(null);

onMounted(async () => {
    const result = await portal.get('institutes');
    loading.value = false;
    if (result.status) institutes.value = result.data.institutes;
    else error.value = result.error;
});
</script>

<template>
    <h2 class="mt-0">{{ $t('nav.institutes') }}</h2>
    <Message v-if="error" severity="error" :closable="false">{{ error }}</Message>
    <div class="portal-card">
        <DataTable :value="institutes" :loading="loading" size="small" scrollable stripedRows>
            <template #empty> {{ $t('institutes.empty') }} </template>
            <Column :header="$t('common.institute')" style="min-width: 220px">
                <template #body="{ data }">
                    <div class="font-semibold">{{ data.institute.name }}</div>
                    <small class="text-500">{{ data.institute.institute_id }}<template v-if="data.institute.district"> · {{ data.institute.district }}</template></small>
                </template>
            </Column>
            <Column :header="$t('institutes.since')" style="min-width: 110px">
                <template #body="{ data }">{{ formatDate(data.since) }}</template>
            </Column>
            <Column :header="$t('institutes.how_they_pay')" style="min-width: 170px">
                <template #body="{ data }">
                    <template v-if="data.billing">
                        {{ MODES[data.billing.mode] }} · {{ CYCLES[data.billing.cycle] }}
                        <small v-if="data.billing.mode === 'direct_bill'" class="block text-500">{{ $t('institutes.per_student', { amount: taka(data.billing.rate_per_student) }) }}</small>
                    </template>
                    <span v-else class="text-500">{{ $t('institutes.not_set_up') }}</span>
                </template>
            </Column>
            <Column :header="$t('institutes.students')" bodyClass="text-right" style="min-width: 90px">
                <template #body="{ data }">{{ num(data.students) }}</template>
            </Column>
            <Column :header="$t('institutes.your_pct')" bodyClass="text-right" style="min-width: 90px">
                <template #body="{ data }"><span class="font-semibold">{{ pct(data.commission_pct) }}</span></template>
            </Column>
        </DataTable>
    </div>
</template>
