export const COMPANY_NAME = "Automation LLC";

export const TRANSACTION_TYPES = [
  "income",
  "expense",
  "owner_contribution",
  "owner_draw",
] as const;

export type TransactionType = (typeof TRANSACTION_TYPES)[number];

export const PAID_BY_OPTIONS = ["llc", "owner"] as const;
export type PaidBy = (typeof PAID_BY_OPTIONS)[number];

export const PERIODS = ["week", "month", "year", "custom"] as const;
export type PeriodKey = (typeof PERIODS)[number];

export const TYPE_LABELS: Record<TransactionType, string> = {
  income: "Income",
  expense: "Expense",
  owner_contribution: "Owner contribution",
  owner_draw: "Owner draw",
};

export const PAID_BY_LABELS: Record<PaidBy, string> = {
  llc: "LLC",
  owner: "Owner",
};

export const ALLOWED_RECEIPT_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
] as const;

export const MAX_RECEIPT_BYTES = 8 * 1024 * 1024;

export const DEFAULT_PRODUCTS = [
  {
    name: "ParentPickup",
    description: "School pickup and dismissal app",
    isOverhead: false,
  },
  {
    name: "EnrollFlow",
    description: "Enrollment and registration app",
    isOverhead: false,
  },
  {
    name: "OurDugsi",
    description: "School management app",
    isOverhead: false,
  },
  {
    name: "Finiin",
    description: "Business operations app",
    isOverhead: false,
  },
  {
    name: "Shared / LLC overhead",
    description: "Costs that support more than one product. These are not split automatically.",
    isOverhead: true,
  },
] as const;

export const DEFAULT_CATEGORIES = [
  "Services and software",
  "Hardware and equipment",
  "Staff",
  "Other",
] as const;
