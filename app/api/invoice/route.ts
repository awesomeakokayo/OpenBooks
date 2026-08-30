import { NextRequest, NextResponse } from "next/server";
import { getInvoiceByPublicToken } from "@/lib/invoices/service";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  if (!token) return NextResponse.json({ error: "token required" }, { status: 400 });
  const invoice = await getInvoiceByPublicToken(token);
  if (!invoice) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const bankTransferEnabled = invoice.paymentMethods.some((pm) => pm.method === "BANK_TRANSFER");

  // Public response contains only recipient-facing fields. Internal IDs,
  // provider data, payment metadata and database relations never cross the
  // public invoice boundary.
  const safe = {
    invoiceNumber: invoice.invoiceNumber,
    status: invoice.status,
    total: invoice.total,
    subtotal: invoice.subtotal,
    discount: invoice.discount,
    issueDate: invoice.issueDate,
    dueDate: invoice.dueDate,
    notes: invoice.notes,
    business: {
      name: invoice.business.name,
      phone: invoice.business.phone,
      email: invoice.business.email,
      address: invoice.business.address,
      logoUrl: invoice.business.logoUrl,
      paymentSetting: bankTransferEnabled && invoice.business.paymentSetting?.bankTransferEnabled
        ? {
            bankName: invoice.business.paymentSetting.bankName,
            accountName: invoice.business.paymentSetting.accountName,
            accountNumber: invoice.business.paymentSetting.accountNumber,
          }
        : null,
    },
    customer: { name: invoice.customer.name },
    items: invoice.items.map((item) => ({
      description: item.description,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      lineTotal: item.lineTotal,
    })),
    paymentMethods: invoice.paymentMethods
      .filter((pm) => ["BANK_TRANSFER", "CASH", "POS"].includes(pm.method))
      .map((pm) => ({ method: pm.method })),
    amountPaid: invoice.payments.reduce((sum, p) => sum + Number(p.amount), 0),
  };
  return NextResponse.json(safe, { headers: { "Cache-Control": "private, no-store" } });
}
