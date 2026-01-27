export function formatMoney(amount: number, currency: string = '₦'): string {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return `${currency}0.00`;
  }
  const formattedAmount = new Intl.NumberFormat('en-NG', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
  return `${currency}${formattedAmount}`;
}
export function formatAmount(amount: number): string {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return '0.00';
  }
  return new Intl.NumberFormat('en-NG', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}