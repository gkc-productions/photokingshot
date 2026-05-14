import { AffiliateProductForm } from "@/components/AdminForms";
import { requireAdmin } from "@/lib/admin-auth";

export default async function NewAffiliateProductPage() {
  await requireAdmin();
  return <section className="section-shell max-w-3xl py-10"><p className="eyebrow">Admin</p><h1 className="mt-3 mb-8 text-4xl font-black">New gear recommendation</h1><AffiliateProductForm /></section>;
}
