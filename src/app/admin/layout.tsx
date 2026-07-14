// Shell admin: sub-nav bersama + auth guard di semua halaman /admin/*.
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AdminNav } from "./admin-nav";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") redirect("/login");

  return (
    <>
      <AdminNav email={session.user.email} />
      {children}
    </>
  );
}
