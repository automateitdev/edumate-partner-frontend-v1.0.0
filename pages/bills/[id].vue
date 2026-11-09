<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import Tag from 'primevue/tag';
import Message from 'primevue/message';
import { usePortalStore } from '~/stores/portal';
import { taka, formatDate, pct, BILL_STATUSES, CYCLES } from '~/utils/format';

/** One bill of my institute: its lines, payments received, what is due, and my commission on it. */
const route = useRoute();
const portal = usePortalStore();
const bill = ref(null);
const error = ref(null);

onMounted(async () => {
    const result = await portal.get(`bills/${route.params.id}`);
    if (result.status) bill.value = result.data;
    else error.value = result.error;
});
</script>

<template>
    <NuxtLink to="/bills" class="text-sm"><i class="pi pi-arrow-left text-xs"></i> Bills</NuxtLink>
    <Message v-if="error" severity="error" :closable="false">{{ error }}</Message>

    <template v-if="bill">
        <div class="flex align-items-center gap-2 my-3 flex-wrap">
            <h2 class="m-0">{{ bill.institute?.name }}</h2>
            <Tag :severity="BILL_STATUSES[bill.status]?.severity" :value="BILL_STATUSES[bill.status]?.label ?? bill.status" />
        </div>

        <div class="grid">
            <div class="col-12 lg:col-8">
                <div class="portal-card">
                    <div class="flex justify-content-between flex-wrap gap-2 mb-3">
                        <div><span class="font-semibold">{{ bill.bill_no }}</span> <span class="text-600">· {{ CYCLES[bill.cycle] }} bill</span></div>
                        <div class="text-600">{{ formatDate(bill.period_start) }} – {{ formatDate(bill.period_end) }} · due {{ formatDate(bill.due_date) }}</div>
                    </div>
                    <div class="flex justify-content-between py-1"><span>{{ bill.student_count }} students × {{ taka(bill.rate) }}</span><span>{{ taka(bill.subtotal) }}</span></div>
                    <div v-for="item in bill.items" :key="item.id" class="flex justify-content-between py-1"><span>{{ item.description }}</span><span>{{ taka(item.amount) }}</span></div>
                    <div v-if="Number(bill.discount)" class="flex justify-content-between py-1"><span>Discount</span><span>− {{ taka(bill.discount) }}</span></div>
                    <div v-if="Number(bill.tax)" class="flex justify-content-between py-1"><span>Tax / VAT</span><span>{{ taka(bill.tax) }}</span></div>
                    <div v-for="note in bill.adjustments" :key="note.id" class="flex justify-content-between py-1"><span>{{ note.type === 'credit' ? 'Credit' : 'Debit' }} note {{ note.note_no }}</span><span>{{ note.type === 'credit' ? '−' : '+' }} {{ taka(note.amount) }}</span></div>
                    <div class="flex justify-content-between py-2 border-top-1 surface-border font-semibold"><span>Bill</span><span>{{ taka(bill.payable) }}</span></div>
                    <div v-for="payment in bill.payments" :key="payment.id" class="flex justify-content-between py-1 text-600"><span>Paid {{ formatDate(payment.paid_on) }} ({{ payment.receipt_no }})</span><span>− {{ taka(payment.amount) }}</span></div>
                    <div class="flex justify-content-between py-2 border-top-1 surface-border font-bold text-lg"><span>Still due</span><span>{{ bill.status === 'cancelled' ? taka(0) : taka(bill.due) }}</span></div>
                </div>
            </div>
            <div class="col-12 lg:col-4">
                <div class="portal-card">
                    <div class="font-semibold mb-2">Your commission on this bill</div>
                    <div class="stat-value">{{ taka(bill.commission_amount) }}</div>
                    <small class="text-500">{{ pct(bill.commission_pct) }}, earned as the institute pays. A yearly bill pays out in two halves.</small>
                </div>
            </div>
        </div>
    </template>
</template>
