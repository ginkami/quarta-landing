import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { AdminPanel } from "@/components/admin/AdminPanel";
import { ADMIN_COOKIE, verifyAdminToken } from "@/lib/admin-auth";
import { getServerEnv } from "@/lib/env";

export const metadata: Metadata = {
  title: "Заявки — КВАРТА",
  robots: { index: false, follow: false },
};

// The auth gate reads the session cookie on every request, so this segment
// intentionally blocks the navigation instead of serving a static shell.
export const instant = false;

export default async function AdminPage() {
  // Prerendering stops here: the token check below reads the current clock,
  // which the prerenderer treats as an unstable value — request time only.
  await connection();
  const token = (await cookies()).get(ADMIN_COOKIE)?.value;
  if (!verifyAdminToken(getServerEnv().ADMIN_PASSWORD, token)) {
    redirect("/admin/login");
  }
  return (
    <main className="min-h-dvh">
      <AdminPanel />
    </main>
  );
}
