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
        <h2 class="m-0">Statement</h2>
        <div class="flex gap-2 align-items-end flex-wrap">
            <Calendar v-model="range" selectionMode="range" dateFormat="dd M yy" showIcon class="w-16rem" aria-label="Statement period" />
            <Button label="Show" icon="pi pi-search" :loading="loading" @click="load" />
            <Button label="Print / save as PDF" icon="pi pi-print" severity="secondary" outlined :disabled="!statement" @click="print" />
        </div>
    </div>
    <Message v-if="error" severity="error" :closable="false">{{ error }}</Message>

    <div v-if="statement" class="portal-card">
        <div class="flex justify-content-between flex-wrap gap-2 pb-3 border-bottom-1 surface-border mb-3">
            <div>
                <div class="text-xl font-bold">{{ statement.issuer?.name }}</div>
                <div class="text-600">Commission statement</div>
            </div>
            <div class="text-right">
                <div class="font-semibold">{{ statement.partner.name }} ({{ statement.partner.code }})</div>
                <div class="text-600">{{ formatDate(statement.from) }} – {{ formatDate(statement.to) }}</div>
            </div>
        </div>

        <div class="grid">
            <div class="col-12 md:col-6">
                <div class="font-semibold mb-2">In this period</div>
                <div class="flex justify-content-between py-1"><span>Commission earned</span><span>{{ taka(s.earned) }}</span></div>
                <div class="flex justify-content-between py-1"><span>Reversed (payment taken back)</span><span>− {{ taka(s.reversed) }}</span></div>
                <div class="flex justify-content-between py-1"><span>Clawed back</span><span>{{ taka(s.clawed_back) }}</span></div>
                <div class="flex justify-content-between py-1 font-semibold border-top-1 surface-border"><span>Net earned</span><span>{{ taka(netEarned) }}</span></div>
            </div>
            <div class="col-12 md:col-6">
                <div class="font-semibold mb-2">Paid in this period</div>
                <div class="flex justify-content-between py-1"><span>Commission</span><span>{{ taka(s.paid_gross) }}</span></div>
                <div class="flex justify-content-between py-1"><span>AIT deducted</span><span>− {{ taka(s.paid_tax) }}</span></div>
                <div class="flex justify-content-between py-1 font-semibold border-top-1 surface-border"><span>Paid to you</span><span>{{ taka(s.paid_net) }}</span></div>
                <div class="flex justify-content-between py-1 mt-2"><span>Still owed today</span><span class="font-semibold">{{ taka(owed) }}</span></div>
            </div>
        </div>

        <div class="font-semibold mt-3 mb-2">Entries</div>
        <div class="overflow-x-auto">
            <table class="w-full" style="border-collapse: collapse">
                <thead>
                    <tr class="surface-100">
                        <th class="text-left p-2">Earned</th>
                        <th class="text-left p-2">Institute</th>
                        <th class="text-left p-2">For</th>
                        <th class="text-right p-2">Commission</th>
                        <th class="text-left p-2">Status</th>
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
                    <tr v-if="!statement.entries.length"><td colspan="5" class="p-2 text-500">No commission in this period.</td></tr>
                </tbody>
            </table>
        </div>
    </div>
</template>
