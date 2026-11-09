<script setup>
import { ref, onMounted } from 'vue';
import Message from 'primevue/message';
import Tag from 'primevue/tag';
import { usePortalStore } from '~/stores/portal';
import { taka, pct, formatDate, monthLabel } from '~/utils/format';

/** Overview: commission by status, tier, dues of my institutes, this month's fee collection. */
const portal = usePortalStore();
const data = ref(null);
const error = ref(null);

onMounted(async () => {
    const result = await portal.get('dashboard');
    if (result.status) data.value = result.data;
    else error.value = result.error;
});
</script>

<template>
    <Message v-if="error" severity="error" :closable="false">{{ error }}</Message>
    <div v-if="!data && !error" class="text-500">Loading…</div>

    <template v-if="data">
        <div class="flex align-items-center gap-2 mb-3 flex-wrap">
            <h2 class="m-0">Welcome, {{ data.partner.name }}</h2>
            <Tag v-if="data.partner.status === 'suspended'" severity="warning" value="Suspended" />
        </div>
        <Message v-if="data.partner.status === 'suspended'" severity="warn" :closable="false">Your partnership is suspended. Commission earned now is on hold until it is reactivated.</Message>

        <div class="grid">
            <div class="col-12 sm:col-6 lg:col-3">
                <div class="portal-card h-full">
                    <div class="stat-label">Due to you now</div>
                    <div class="stat-value text-primary">{{ taka(data.commission.payable) }}</div>
                    <small class="text-500">paid out in the next payout</small>
                </div>
            </div>
            <div class="col-12 sm:col-6 lg:col-3">
                <div class="portal-card h-full">
                    <div class="stat-label">Earned, not due yet</div>
                    <div class="stat-value">{{ taka(data.commission.accrued) }}</div>
                    <small v-if="Number(data.commission.hold)" class="text-red-500">{{ taka(data.commission.hold) }} on hold</small>
                </div>
            </div>
            <div class="col-12 sm:col-6 lg:col-3">
                <div class="portal-card h-full">
                    <div class="stat-label">Paid to you so far</div>
                    <div class="stat-value">{{ taka(data.commission.paid) }}</div>
                    <small v-if="data.last_payout" class="text-500">last {{ taka(data.last_payout.net_amount) }} on {{ formatDate(data.last_payout.paid_on) }}</small>
                </div>
            </div>
            <div class="col-12 sm:col-6 lg:col-3">
                <div class="portal-card h-full">
                    <div class="stat-label">Your commission rate</div>
                    <div class="stat-value">{{ data.partner.commission_mode === 'tiered' ? pct(data.tier.current_pct) : pct(data.partner.default_pct) }}</div>
                    <small class="text-500">{{ data.tier.active_clients }} active institutes<template v-if="data.partner.commission_mode === 'tiered'"> · tiered</template></small>
                </div>
            </div>
        </div>

        <div class="grid">
            <div class="col-12 md:col-6">
                <div class="portal-card h-full">
                    <div class="font-semibold mb-3">Dues of your institutes</div>
                    <div class="flex justify-content-between py-1"><span class="text-600">Open bills</span><span>{{ data.dues.bills }}</span></div>
                    <div class="flex justify-content-between py-1"><span class="text-600">Still due</span><span>{{ taka(data.dues.due) }}</span></div>
                    <div class="flex justify-content-between py-1"><span class="text-600">Overdue ({{ data.dues.overdue_bills }} bills)</span><span :class="{ 'text-red-500 font-semibold': Number(data.dues.overdue) > 0 }">{{ taka(data.dues.overdue) }}</span></div>
                    <NuxtLink to="/bills" class="text-sm">See the bills</NuxtLink>
                </div>
            </div>
            <div class="col-12 md:col-6">
                <div class="portal-card h-full">
                    <div class="font-semibold mb-3">Fee collection, {{ monthLabel(data.fee_revenue.month) }}</div>
                    <div class="flex justify-content-between py-1"><span class="text-600">Collected online</span><span>{{ taka(data.fee_revenue.collection) }}</span></div>
                    <div class="flex justify-content-between py-1"><span class="text-600">Your commission</span><span>{{ taka(data.fee_revenue.commission) }}</span></div>
                    <NuxtLink to="/fee-revenue" class="text-sm">See fee revenue</NuxtLink>
                </div>
            </div>
        </div>
    </template>
</template>
