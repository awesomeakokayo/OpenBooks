export default function CustomersPage() {
  return (
    <div className="mx-auto max-w-[1200px] flex flex-col gap-4">
      <h1 className="font-heading text-2xl font-bold text-plum">Customers</h1>
      <div className="rounded-[16px] bg-pale-sage p-12 text-center">
        <p className="font-heading font-bold text-plum">No customers yet</p>
        <p className="mt-1 text-sm text-plum/60">Add your first customer to start keeping track. Coming in Phase 2.</p>
      </div>
    </div>
  );
}
