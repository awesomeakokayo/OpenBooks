import { z } from "zod";

export const businessSchema = z.object({
  name: z.string().min(2, "Business name is required").max(100),
  phone: z.string().min(8, "Phone is required").max(20),
  email: z.string().email().optional().or(z.literal("")),
  address: z.string().max(200).optional(),
  description: z.string().max(500).optional(),
});

export const customerSchema = z.object({
  name: z.string().min(2).max(100),
  phone: z.string().min(8).max(20),
  email: z.string().email().optional().or(z.literal("")),
  notes: z.string().max(500).optional(),
});

export const moneySchema = z.number().positive("Amount must be greater than 0");

export const invoiceItemSchema = z.object({
  description: z.string().min(1),
  quantity: z.number().positive(),
  unitPrice: z.number().positive(),
});

export const invoiceCreateSchema = z.object({
  customerId: z.string().min(1),
  items: z.array(invoiceItemSchema).min(1),
  discount: z.number().min(0).default(0),
  dueDate: z.string().optional(),
  notes: z.string().max(1000).optional(),
  paymentMethods: z.array(z.enum(["CASH", "BANK_TRANSFER", "POS", "PAYSTACK", "OTHER", "ONLINE"])).optional(),
});
