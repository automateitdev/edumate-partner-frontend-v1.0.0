// Formatting and labels shared by the partner portal pages. Numbers, dates and
// labels follow the chosen language (see utils/i18n.js).
import { tg, intlLocale, dateLocale } from '~/utils/i18n';

/** ৳1,20,000.00 — taka with Bangladeshi digit grouping. */
export const taka = (value) => {
    if (value === null || value === undefined || value === '') return '—';
    return `৳${Number(value).toLocaleString(intlLocale(), { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

/** 01 Jan 2026 */
export const formatDate = (value) => {
    if (!value) return '—';
    return new Date(`${String(value).slice(0, 10)}T00:00:00`).toLocaleDateString(dateLocale(), { day: '2-digit', month: 'short', year: 'numeric' });
};

/** Oct 2026 from 2026-10. */
export const monthLabel = (value) => {
    if (!value) return '—';
    const [y, m] = value.split('-').map(Number);
    return new Date(y, m - 1, 1).toLocaleDateString(dateLocale(), { month: 'short', year: 'numeric' });
};

/** A plain count in the chosen language's digits (Bangla digits for bn). */
export const num = (value) => (value === null || value === undefined || value === '' ? '—' : Number(value).toLocaleString(intlLocale()));

export const pct = (value) => (value === null || value === undefined || value === '' ? '—' : `${Number(value).toLocaleString(intlLocale())}%`);

/** Y-m-d from a Date, in local time. */
export const toDateString = (date) => {
    if (!date) return null;
    const pad = (n) => String(n).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};

export const LEDGER_STATUSES = {
    accrued: { get label() { return tg('status.ledger.accrued'); }, severity: 'info' },
    payable: { get label() { return tg('status.ledger.payable'); }, severity: 'warning' },
    paid: { get label() { return tg('status.ledger.paid'); }, severity: 'success' },
    hold: { get label() { return tg('status.ledger.hold'); }, severity: 'danger' },
    reversed: { get label() { return tg('status.ledger.reversed'); }, severity: 'secondary' }
};

export const BILL_STATUSES = {
    issued: { get label() { return tg('status.bill.issued'); }, severity: 'info' },
    partial: { get label() { return tg('status.bill.partial'); }, severity: 'warning' },
    paid: { get label() { return tg('status.bill.paid'); }, severity: 'success' },
    overdue: { get label() { return tg('status.bill.overdue'); }, severity: 'danger' },
    cancelled: { get label() { return tg('status.bill.cancelled'); }, severity: 'secondary' }
};

export const PAYOUT_STATUSES = {
    verified: { get label() { return tg('status.payout.verified'); }, severity: 'info' },
    approved: { get label() { return tg('status.payout.approved'); }, severity: 'warning' },
    paid: { get label() { return tg('status.payout.paid'); }, severity: 'success' }
};

export const SOURCES = {
    get bill_payment() { return tg('source.bill_payment'); },
    get fee_revenue() { return tg('source.fee_revenue'); }
};
export const MODES = {
    get direct_bill() { return tg('mode.direct_bill'); },
    get fee_collection() { return tg('mode.fee_collection'); }
};
export const CYCLES = {
    get monthly() { return tg('cycle.monthly'); },
    get quarterly() { return tg('cycle.quarterly'); },
    get half_yearly() { return tg('cycle.half_yearly'); },
    get yearly() { return tg('cycle.yearly'); }
};
