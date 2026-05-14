import type { Metadata } from "next";
import { AdminLoginForm } from "@/components/AdminLoginForm";

export const metadata: Metadata = {
  title: "Admin Login"
};

export default function AdminLoginPage() {
  return (
    <section className="section-shell py-16">
      <p className="eyebrow text-center">Admin</p>
      <h1 className="mt-4 text-center text-4xl font-black">PhotoKingShot Login</h1>
      <p className="muted-copy mx-auto mt-4 max-w-xl text-center">Simple environment-password protection for version one. Future: replace this with NextAuth or Clerk for role-based accounts and audit trails.</p>
      <AdminLoginForm />
    </section>
  );
}
