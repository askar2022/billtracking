import { z } from "zod";
import {
  PAID_BY_OPTIONS,
  TRANSACTION_TYPES,
  type TransactionType,
} from "@/lib/constants";
import { parseDateInput } from "@/lib/dates";
import { dollarsToCents } from "@/lib/money";

const optionalText = z
  .string()
  .trim()
  .max(500)
  .optional()
  .transform((value) => value || undefined);

export const authSchema = z.object({
  email: z.string().trim().email("Enter a valid email address.").toLowerCase(),
  password: z.string().min(8, "Password must be at least 8 characters."),
});

export const setupSchema = authSchema.extend({
  name: z.string().trim().min(2, "Enter your name.").max(80),
});

export const settingsSchema = z
  .object({
    name: z.string().trim().min(2, "Enter your name.").max(80),
    email: z.string().trim().email("Enter a valid email address.").toLowerCase(),
    currentPassword: z.string().optional(),
    newPassword: z.string().optional(),
  })
  .superRefine((value, ctx) => {
    if (value.newPassword) {
      if (!value.currentPassword) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["currentPassword"],
          message: "Enter your current password to set a new one.",
        });
      }
      if (value.newPassword.length < 8) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["newPassword"],
          message: "New password must be at least 8 characters.",
        });
      }
    }
  });

export const productSchema = z.object({
  name: z.string().trim().min(2, "Enter a product name.").max(80),
  description: optionalText,
});

export const categorySchema = z.object({
  name: z.string().trim().min(2, "Enter a category name.").max(80),
});

const transactionBaseSchema = z.object({
  type: z.enum(TRANSACTION_TYPES),
  amount: z.string().min(1, "Enter an amount."),
  date: z.string().min(1, "Enter a payment date."),
  description: z.string().trim().min(1, "Enter a description.").max(200),
  vendor: optionalText,
  payer: optionalText,
  paidBy: z.enum(PAID_BY_OPTIONS).optional(),
  notes: z.string().trim().max(2000).optional().transform((value) => value || undefined),
  productId: z.string().optional(),
  categoryId: z.string().optional(),
});

export const transactionSchema = transactionBaseSchema.superRefine((value, ctx) => {
  try {
    dollarsToCents(value.amount);
  } catch (error) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["amount"],
      message: error instanceof Error ? error.message : "Enter a valid amount.",
    });
  }

  if (!parseDateInput(value.date)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["date"],
      message: "Enter a valid date.",
    });
  }

  if (value.type === "income") {
    if (!value.productId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["productId"],
        message: "Choose which app or product earned this income.",
      });
    }
    if (!value.payer) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["payer"],
        message: "Enter who or what paid this income.",
      });
    }
  }

  if (value.type === "expense") {
    if (!value.vendor) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["vendor"],
        message: "Enter the vendor.",
      });
    }
    if (!value.categoryId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["categoryId"],
        message: "Choose an expense category.",
      });
    }
    if (!value.productId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["productId"],
        message: "Choose an app, product, or Shared / LLC overhead.",
      });
    }
    if (!value.paidBy) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["paidBy"],
        message: "Choose who paid: LLC or owner.",
      });
    }
  }
});

export type TransactionInput = z.infer<typeof transactionSchema>;

export function fieldErrors(error: z.ZodError): Record<string, string> {
  const result: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path[0]?.toString() ?? "form";
    if (!result[key]) {
      result[key] = issue.message;
    }
  }
  return result;
}

export function isTransactionType(value: string): value is TransactionType {
  return (TRANSACTION_TYPES as readonly string[]).includes(value);
}
