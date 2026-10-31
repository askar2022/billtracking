export function dollarsToCents(value: string | number): number {
  const raw = typeof value === "number" ? value.toString() : value.trim();
  if (!raw) {
    throw new Error("Enter an amount.");
  }

  const normalized = raw.replace(/[$,\s]/g, "");
  if (!/^\d+(\.\d{1,2})?$/.test(normalized)) {
    throw new Error("Enter a valid dollar amount with up to two decimal places.");
  }

  const [dollars, cents = ""] = normalized.split(".");
  const amount = Number(dollars) * 100 + Number(cents.padEnd(2, "0"));
  if (!Number.isInteger(amount) || amount <= 0) {
    throw new Error("Amount must be greater than $0.00.");
  }
  if (amount > 1_000_000_000_00) {
    throw new Error("Amount is too large.");
  }
  return amount;
}

export function centsToDollarInput(cents: number): string {
  return (cents / 100).toFixed(2);
}

export function formatUsd(cents: number, options?: { sign?: boolean }): string {
  const absolute = Math.abs(cents) / 100;
  const formatted = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(absolute);

  if (!options?.sign) {
    return cents < 0 ? `-${formatted}` : formatted;
  }

  if (cents > 0) return `+${formatted}`;
  if (cents < 0) return `-${formatted}`;
  return formatted;
}

export function signedAmountCents(type: string, amountCents: number): number {
  if (type === "expense" || type === "owner_draw") {
    return -Math.abs(amountCents);
  }
  return Math.abs(amountCents);
}

export function percentChange(current: number, previous: number): number | null {
  if (previous === 0) {
    return current === 0 ? 0 : null;
  }
  return Math.round(((current - previous) / Math.abs(previous)) * 100);
}
