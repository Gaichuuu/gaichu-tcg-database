const USD_CENTS = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

const USD_WHOLE = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export function formatUsd(value: number, { cents = true } = {}): string {
  return (cents ? USD_CENTS : USD_WHOLE).format(value);
}
