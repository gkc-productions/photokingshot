import { ClientGalleryForm } from "@/components/GalleryAdminForms";
import { requireAdmin } from "@/lib/admin-auth";

export default async function NewClientGalleryPage() {
  await requireAdmin();
  return (
    <section className="section-shell max-w-3xl py-10">
      <p className="eyebrow">Admin</p>
      <h1 className="mt-3 mb-8 text-4xl font-black">New client gallery</h1>
      <ClientGalleryForm />
    </section>
  );
}
