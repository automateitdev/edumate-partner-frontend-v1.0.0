// Formatting and labels shared by the partner portal pages.

/** ৳1,20,000.00 — taka with Bangladeshi digit grouping. */
export const taka = (value) => {
    if (value === null || value === undefined || value === '') return '—';
    return `৳${Number(value).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

/** 01 Jan 2026 */
export const formatDate = (value) => {
    if (!value) return '—';
    return new Date(`${String(value).slice(0, 10)}T00:00:00`).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

/** Oct 2026 from 2026-10. */
export const monthLabel = (value) => {
    if (!value) return '—';
    const [y, m] = value.split('-').map(Number);
    return new Date(y, m - 1, 1).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' });
};

export const pct = (value) => (value === null || value === undefined || value === '' ? '—' : `${Number(value)}%`);

/** Y-m-d from a Date, in local time. */
export const toDateString = (date) => {
    if (!date) return null;
    const pad = (n) => String(n).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};

export const LEDGER_STATUSES = {
    accrued: { label: 'Earned, not due yet', severity: 'info' },
    payable: { label: 'Due to you', severity: 'warning' },
    paid: { label: 'Paid', severity: 'success' },
    hold: { label: 'On hold', severity: 'danger' },
    reversed: { label: 'Reversed', severity: 'secondary' }
};

export const BILL_STATUSES = {
    issued: { label: 'Issued', severity: 'info' },
    partial: { label: 'Partly paid', severity: 'warning' },
    paid: { label: 'Paid', severity: 'success' },
    overdue: { label: 'Overdue', severity: 'danger' },
    cancelled: { label: 'Cancelled', severity: 'secondary' }
};

export const PAYOUT_STATUSES = {
    verified: { label: 'Being processed', severity: 'info' },
    approved: { label: 'Approved', severity: 'warning' },
    paid: { label: 'Paid', severity: 'success' }
};

export const SOURCES = { bill_payment: 'Direct bill payment', fee_revenue: 'Fee collection' };
export const MODES = { direct_bill: 'Direct bill', fee_collection: 'Fee collection' };
export const CYCLES = { monthly: 'Monthly', quarterly: 'Quarterly', half_yearly: 'Half-yearly', yearly: 'Yearly' };
