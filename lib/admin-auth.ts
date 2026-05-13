import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const COOKIE_NAME = "photokingshot_admin";

export async function isAdminAuthenticated() {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  return Boolean(process.env.ADMIN_PASSWORD && token === process.env.ADMIN_PASSWORD);
}

export async function requireAdmin() {
  if (!(await isAdminAuthenticated())) {
    redirect("/admin/login");
  }
}

export async function setAdminSession(password: string) {
  const store = await cookies();
  store.set(COOKIE_NAME, password, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8
  });
}

export async function clearAdminSession() {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

