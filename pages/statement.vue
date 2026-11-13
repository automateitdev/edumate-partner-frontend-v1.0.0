<script setup>
import { ref, computed, onMounted } from 'vue';
import Calendar from 'primevue/calendar';
import Button from 'primevue/button';
import Message from 'primevue/message';
import { usePortalStore } from '~/stores/portal';
import { taka, formatDate, toDateString, LEDGER_STATUSES } from '~/utils/format';

/**
 * My commission statement for a period: earned, reversed, clawed back, paid
 * (with AIT) and still owed. "Print / save as PDF" uses the browser.
 */
const portal = usePortalStore();
const today = new Date();
const range = ref([new Date(today.getFullYear(), 0, 1), today]);
const statement = ref(null);
const loading = ref(false);
const error = ref(null);

const load = async () => {
    const [from, to] = range.value ?? [];
    if (!from || !to) return;
    loading.value = true;
    error.value = null;
    const result = await portal.get('statement', { from: toDateString(from), to: toDateString(to) });
    loading.value = false;
    if (result.status) statement.value = result.data;
    else error.value = result.error;
};

onMounted(load);

const s = computed(() => statement.value?.summary);
const netEarned = computed(() => (s.value ? Number(s.value.earned) - Number(s.value.reversed) + Number(s.value.clawed_back) : 0));
const owed = computed(() => (s.value ? Number(s.value.outstanding.accrued) + Number(s.value.outstanding.payable) + Number(s.value.outstanding.hold) : 0));
const print = () => window.print();
</script>

<template>
    <div class="no-print flex justify-content-between align-items-end flex-wrap gap-2 mb-3">
        <h2 class="m-0">{{ $t('nav.statement') }}</h2>
        <div class="flex gap-2 align-items-end flex-wrap">
            <Calendar v-model="range" selectionMode="range" dateFormat="dd M yy" showIcon class="w-16rem" :aria-label="$t('statement.period')" />
            <Button :label="$t('common.show')" icon="pi pi-search" :loading="loading" @click="load" />
            <Button :label="$t('statement.print')" icon="pi pi-print" severity="secondary" outlined :disabled="!statement" @click="print" />
        </div>
    </div>
    <Message v-if="error" severity="error" :closable="false">{{ error }}</Message>

    <div v-if="statement" class="portal-card">
        <div class="flex justify-content-between flex-wrap gap-2 pb-3 border-bottom-1 surface-border mb-3">
            <div>
                <div class="text-xl font-bold">{{ statement.issuer?.name }}</div>
                <div class="text-600">{{ $t('statement.title') }}</div>
            </div>
            <div class="text-right">
                <div class="font-semibold">{{ statement.partner.name }} ({{ statement.partner.code }})</div>
                <div class="text-600">{{ formatDate(statement.from) }} – {{ formatDate(statement.to) }}</div>
            </div>
        </div>

        <div class="grid">
            <div class="col-12 md:col-6">
                <div class="font-semibold mb-2">{{ $t('statement.in_period') }}</div>
                <div class="flex justify-content-between py-1"><span>{{ $t('statement.earned') }}</span><span>{{ taka(s.earned) }}</span></div>
                <div class="flex justify-content-between py-1"><span>{{ $t('statement.reversed') }}</span><span>− {{ taka(s.reversed) }}</span></div>
                <div class="flex justify-content-between py-1"><span>{{ $t('statement.clawed_back') }}</span><span>{{ taka(s.clawed_back) }}</span></div>
                <div class="flex justify-content-between py-1 font-semibold border-top-1 surface-border"><span>{{ $t('statement.net_earned') }}</span><span>{{ taka(netEarned) }}</span></div>
            </div>
            <div class="col-12 md:col-6">
                <div class="font-semibold mb-2">{{ $t('statement.paid_in_period') }}</div>
                <div class="flex justify-content-between py-1"><span>{{ $t('common.commission') }}</span><span>{{ taka(s.paid_gross) }}</span></div>
                <div class="flex justify-content-between py-1"><span>{{ $t('statement.ait_deducted') }}</span><span>− {{ taka(s.paid_tax) }}</span></div>
                <div class="flex justify-content-between py-1 font-semibold border-top-1 surface-border"><span>{{ $t('common.paid_to_you') }}</span><span>{{ taka(s.paid_net) }}</span></div>
                <div class="flex justify-content-between py-1 mt-2"><span>{{ $t('statement.still_owed') }}</span><span class="font-semibold">{{ taka(owed) }}</span></div>
            </div>
        </div>

        <div class="font-semibold mt-3 mb-2">{{ $t('statement.entries') }}</div>
        <div class="overflow-x-auto">
            <table class="w-full" style="border-collapse: collapse">
                <thead>
                    <tr class="surface-100">
                        <th class="text-left p-2">{{ $t('statement.earned_col') }}</th>
                        <th class="text-left p-2">{{ $t('common.institute') }}</th>
                        <th class="text-left p-2">{{ $t('common.for') }}</th>
                        <th class="text-right p-2">{{ $t('common.commission') }}</th>
                        <th class="text-left p-2">{{ $t('common.status') }}</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="entry in statement.entries" :key="entry.id" class="border-bottom-1 surface-border">
                        <td class="p-2">{{ formatDate(entry.earned_on) }}</td>
                        <td class="p-2">{{ entry.institute?.name }}</td>
                        <td class="p-2">{{ entry.reference }}</td>
                        <td class="p-2 text-right">{{ taka(entry.amount) }}</td>
                        <td class="p-2">{{ LEDGER_STATUSES[entry.status]?.label ?? entry.status }}</td>
                    </tr>
                    <tr v-if="!statement.entries.length"><td colspan="5" class="p-2 text-500">{{ $t('statement.empty') }}</td></tr>
                </tbody>
            </table>
        </div>
    </div>
</template>
