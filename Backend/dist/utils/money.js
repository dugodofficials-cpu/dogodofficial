"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatAmount = exports.formatMoney = void 0;
function formatMoney(amount, currency = '₦') {
    if (amount === null || amount === undefined || isNaN(amount)) {
        return `${currency}0.00`;
    }
    const formattedAmount = new Intl.NumberFormat('en-NG', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(amount);
    return `${currency}${formattedAmount}`;
}
exports.formatMoney = formatMoney;
function formatAmount(amount) {
    if (amount === null || amount === undefined || isNaN(amount)) {
        return '0.00';
    }
    return new Intl.NumberFormat('en-NG', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(amount);
}
exports.formatAmount = formatAmount;
//# sourceMappingURL=money.js.map