<script setup>
import { ref, onMounted } from 'vue';
import Message from 'primevue/message';
import Tag from 'primevue/tag';
import { usePortalStore } from '~/stores/portal';
import { taka, pct, num, formatDate, monthLabel } from '~/utils/format';

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
    <div v-if="!data && !error" class="text-500">{{ $t('common.loading') }}</div>

    <template v-if="data">
        <div class="flex align-items-center gap-2 mb-3 flex-wrap">
            <h2 class="m-0">{{ $t('dashboard.welcome', { name: data.partner.name }) }}</h2>
            <Tag v-if="data.partner.status === 'suspended'" severity="warning" :value="$t('dashboard.suspended')" />
        </div>
        <Message v-if="data.partner.status === 'suspended'" severity="warn" :closable="false">{{ $t('dashboard.suspended_notice') }}</Message>

        <div class="grid">
            <div class="col-12 sm:col-6 lg:col-3">
                <div class="portal-card h-full">
                    <div class="stat-label">{{ $t('dashboard.due_now') }}</div>
                    <div class="stat-value text-primary">{{ taka(data.commission.payable) }}</div>
                    <small class="text-500">{{ $t('dashboard.due_now_hint') }}</small>
                </div>
            </div>
            <div class="col-12 sm:col-6 lg:col-3">
                <div class="portal-card h-full">
                    <div class="stat-label">{{ $t('dashboard.earned_not_due') }}</div>
                    <div class="stat-value">{{ taka(data.commission.accrued) }}</div>
                    <small v-if="Number(data.commission.hold)" class="text-red-500">{{ $t('dashboard.on_hold', { amount: taka(data.commission.hold) }) }}</small>
                </div>
            </div>
            <div class="col-12 sm:col-6 lg:col-3">
                <div class="portal-card h-full">
                    <div class="stat-label">{{ $t('dashboard.paid_so_far') }}</div>
                    <div class="stat-value">{{ taka(data.commission.paid) }}</div>
                    <small v-if="data.last_payout" class="text-500">{{ $t('dashboard.last_payout', { amount: taka(data.last_payout.net_amount), date: formatDate(data.last_payout.paid_on) }) }}</small>
                </div>
            </div>
            <div class="col-12 sm:col-6 lg:col-3">
                <div class="portal-card h-full">
                    <div class="stat-label">{{ $t('dashboard.rate') }}</div>
                    <div class="stat-value">{{ data.partner.commission_mode === 'tiered' ? pct(data.tier.current_pct) : pct(data.partner.default_pct) }}</div>
                    <small class="text-500">{{ $t('dashboard.active_institutes', { count: num(data.tier.active_clients) }, Number(data.tier.active_clients)) }}<template v-if="data.partner.commission_mode === 'tiered'"> · {{ $t('dashboard.tiered') }}</template></small>
                </div>
            </div>
        </div>

        <div class="grid">
            <div class="col-12 md:col-6">
                <div class="portal-card h-full">
                    <div class="font-semibold mb-3">{{ $t('dashboard.dues_title') }}</div>
                    <div class="flex justify-content-between py-1"><span class="text-600">{{ $t('dashboard.open_bills') }}</span><span>{{ num(data.dues.bills) }}</span></div>
                    <div class="flex justify-content-between py-1"><span class="text-600">{{ $t('common.still_due') }}</span><span>{{ taka(data.dues.due) }}</span></div>
                    <div class="flex justify-content-between py-1"><span class="text-600">{{ $t('dashboard.overdue_bills', { count: num(data.dues.overdue_bills) }, Number(data.dues.overdue_bills)) }}</span><span :class="{ 'text-red-500 font-semibold': Number(data.dues.overdue) > 0 }">{{ taka(data.dues.overdue) }}</span></div>
                    <NuxtLink to="/bills" class="text-sm">{{ $t('dashboard.see_bills') }}</NuxtLink>
                </div>
            </div>
            <div class="col-12 md:col-6">
                <div class="portal-card h-full">
                    <div class="font-semibold mb-3">{{ $t('dashboard.fee_collection_month', { month: monthLabel(data.fee_revenue.month) }) }}</div>
                    <div class="flex justify-content-between py-1"><span class="text-600">{{ $t('common.collected_online') }}</span><span>{{ taka(data.fee_revenue.collection) }}</span></div>
                    <div class="flex justify-content-between py-1"><span class="text-600">{{ $t('common.your_commission') }}</span><span>{{ taka(data.fee_revenue.commission) }}</span></div>
                    <NuxtLink to="/fee-revenue" class="text-sm">{{ $t('dashboard.see_fee_revenue') }}</NuxtLink>
                </div>
            </div>
        </div>
    </template>
</template>
