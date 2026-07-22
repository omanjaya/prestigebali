// Admin — Settings (US42). Server Component: memuat nilai efektif tiap kunci lewat
// getSettings() (DB bila ada, selain itu fallback env/konstanta) sebagai defaultValue
// form, dan menghitung fallback murni (tanpa DB) untuk hint "Default: …" di tiap
// input. Guard: hanya ADMIN, selain itu → /login (layout admin sudah menjaga juga,
// pengecekan di sini mengikuti pola halaman admin lain untuk konsistensi).

import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getSettings, SETTING_DEFS, type SettingKey } from "@/lib/settings";
import { Container, PageHeader } from "@/ui/primitives";
import { SettingsForm } from "./settings-form";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") redirect("/login");

  const settings = await getSettings();

  const fallbacks = {} as Record<SettingKey, number>;
  for (const key of Object.keys(SETTING_DEFS) as SettingKey[]) {
    fallbacks[key] = SETTING_DEFS[key].fallback();
  }

  return (
    <Container style={{ maxWidth: 760, paddingBottom: "3rem" }}>
      <PageHeader
        kicker="Admin · Pengaturan"
        title="Settings"
        subtitle="Atur aturan booking & kurs tampilan. Perubahan langsung berlaku tanpa restart."
      />
      <SettingsForm settings={settings} fallbacks={fallbacks} />
    </Container>
  );
}
