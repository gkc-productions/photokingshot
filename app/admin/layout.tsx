import { AdminNav } from "@/components/AdminNav";
import { isAdminAuthenticated } from "@/lib/admin-auth";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const authed = await isAdminAuthenticated();
  return (
    <>
      {authed ? <AdminNav /> : null}
      <main>{children}</main>
    </>
  );
}
