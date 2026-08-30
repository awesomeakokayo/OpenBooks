import { z } from "zod";

export const businessSchema = z.object({
  name: z.string().trim().min(2, "Business name is required").max(100),
  phone: z.string().trim().min(8, "Business phone is required").max(20),
  email: z.string().trim().email("Enter a valid business email").optional().or(z.literal("")),
  address: z.string().trim().max(200).optional(),
  description: z.string().trim().max(500).optional(),
});

export const paymentSettingsSchema = z
  .object({
    bankTransferEnabled: z.boolean(),
    cashEnabled: z.boolean(),
    posEnabled: z.boolean(),
    bankName: z.string().trim().max(100).optional().or(z.literal("")),
    accountName: z.string().trim().max(120).optional().or(z.literal("")),
    accountNumber: z.string().trim().regex(/^\d{10}$/, "Enter a valid 10-digit Nigerian account number").optional().or(z.literal("")),
  })
  .superRefine((data, ctx) => {
    if (!data.bankTransferEnabled && !data.cashEnabled && !data.posEnabled) {
      ctx.addIssue({ code: "custom", message: "Choose at least one payment method", path: ["bankTransferEnabled"] });
    }

    if (data.bankTransferEnabled) {
      if (!data.bankName) ctx.addIssue({ code: "custom", message: "Bank name is required for bank transfer", path: ["bankName"] });
      if (!data.accountName) ctx.addIssue({ code: "custom", message: "Account name is required for bank transfer", path: ["accountName"] });
      if (!data.accountNumber) ctx.addIssue({ code: "custom", message: "Account number is required for bank transfer", path: ["accountNumber"] });
    }
  });

export const customerSchema = z.object({
  name: z.string().trim().min(2).max(100),
  phone: z.string().trim().min(8).max(20),
  email: z.string().trim().email().optional().or(z.literal("")),
  notes: z.string().trim().max(500).optional(),
});

export const moneySchema = z.number().finite().positive("Amount must be greater than 0");

export const invoiceItemSchema = z.object({
  description: z.string().trim().min(1).max(500),
  quantity: z.number().finite().positive(),
  unitPrice: z.number().finite().positive(),
});

export const invoiceCreateSchema = z.object({
  customerId: z.string().min(1),
  items: z.array(invoiceItemSchema).min(1),
  discount: z.number().finite().min(0).default(0),
  dueDate: z.string().datetime().optional().or(z.literal("")),
  notes: z.string().max(1000).optional(),
  paymentMethods: z.array(z.enum(["CASH", "BANK_TRANSFER", "POS"])).optional(),
});

export const paymentCreateSchema = z.object({
  businessId: z.string().min(1),
  customerId: z.string().min(1),
  invoiceId: z.string().min(1).optional().nullable(),
  amount: moneySchema,
  method: z.enum(["CASH", "BANK_TRANSFER", "POS"]),
  reference: z.string().trim().max(200).optional(),
  notes: z.string().trim().max(1000).optional(),
});

export const saleCreateSchema = z.object({
  businessId: z.string().min(1),
  customerId: z.string().min(1).optional().nullable(),
  description: z.string().trim().min(1).max(500),
  quantity: z.number().finite().positive(),
  unitPrice: moneySchema,
  discount: z.number().finite().min(0).default(0),
  paymentMethod: z.enum(["CASH", "BANK_TRANSFER", "POS"]).optional().nullable(),
  saleDate: z.string().datetime().optional(),
  notes: z.string().trim().max(1000).optional(),
});

export const expenseCreateSchema = z.object({
  businessId: z.string().min(1),
  category: z.enum(["TRANSPORT", "MATERIALS", "ELECTRICITY", "RENT", "DATA", "SUPPLIES", "OTHER"]),
  amount: moneySchema,
  description: z.string().trim().max(1000).optional(),
  paymentMethod: z.enum(["CASH", "BANK_TRANSFER", "POS"]).optional().nullable(),
  expenseDate: z.string().datetime().optional(),
});
