export const getCurrencySymbol = (currencyCode: string): string => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currencyCode,
        currencyDisplay: 'symbol'
    }).formatToParts(1).find(part => part.type === 'currency')?.value || currencyCode;
};