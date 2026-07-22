// Shell admin: sidebar navigasi + auth guard di semua halaman /admin/*.
// Header/footer situs pelanggan disembunyikan pada rute /admin (lihat ui/hide-on-admin).
import { Inter } from "next/font/google";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { countUnreadForAdmin } from "@/lib/conversations";
import { AdminSidebar } from "./admin-sidebar";

// Font khusus dashboard: Inter — sangat legible untuk tabel/angka (tabular-nums via
// CSS .admin-shell). Serif display Cormorant tetap dipakai hanya untuk brand sidebar.
const adminSans = Inter({ subsets: ["latin"], variable: "--font-admin", display: "swap" });

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") redirect("/login");

  // Badge sidebar: booking menunggu approve + pesan pelanggan belum dibaca.
  // Gagal baca (DB down) tidak boleh menjatuhkan seluruh shell admin.
  const [approvals, chat] = await Promise.all([
    prisma.booking.count({ where: { status: "AWAITING_APPROVAL" } }).catch(() => 0),
    countUnreadForAdmin().catch(() => 0),
  ]);

  return (
    <div className={`admin-shell ${adminSans.variable}`}>
      <AdminSidebar email={session.user.email} badges={{ approvals, chat }} />
      <div className="admin-content">{children}</div>
    </div>
  );
}
