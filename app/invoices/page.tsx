export default function InvoicesPage() {
  return (
    <div className="mx-auto max-w-[1200px] flex flex-col gap-4">
      <h1 className="font-heading text-2xl font-bold text-plum">Invoices</h1>
      <div className="rounded-[16px] bg-pale-sage p-12 text-center">
        <p className="font-heading font-bold text-plum">No invoices yet</p>
        <p className="mt-1 text-sm text-plum/60">Create your first invoice to send to a customer. Coming in Phase 3.</p>
      </div>
    </div>
  );
}
