import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { LoginForm } from "@/components/admin/LoginForm";
import { ADMIN_COOKIE, verifyAdminToken } from "@/lib/admin-auth";
import { getServerEnv } from "@/lib/env";

export const metadata: Metadata = {
  title: "Вход — КВАРТА",
  robots: { index: false, follow: false },
};

// Mirror of /admin: the bounce decision needs the session cookie at request
// time, so the segment is allowed to block rather than prerender.
export const instant = false;

export default async function AdminLoginPage() {
  // Same guard as /admin: the bounce decision needs the session cookie and
  // the current clock at request time, outside any prerendered shell.
  await connection();
  const token = (await cookies()).get(ADMIN_COOKIE)?.value;
  if (verifyAdminToken(getServerEnv().ADMIN_PASSWORD, token)) {
    redirect("/admin");
  }
  return (
    <main className="flex min-h-dvh items-center justify-center px-4 py-16">
      <LoginForm />
    </main>
  );
}
