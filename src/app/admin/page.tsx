import type { Metadata } from "next";
import { AdminPanel } from "@/components/admin/AdminPanel";

export const metadata: Metadata = {
  title: "Заявки — КВАРТА",
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  return (
    <main className="min-h-dvh">
      <AdminPanel />
    </main>
  );
}
