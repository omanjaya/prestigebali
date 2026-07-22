"use server";

// Server Actions untuk mengganti bahasa & mata uang (menulis cookie lalu revalidate).

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

import { isCurrency } from "@/lib/currency";
import { CURRENCY_COOKIE, isLocale, LOCALE_COOKIE, LOCALE_DEFAULT_CURRENCY } from "./config";

const YEAR = 60 * 60 * 24 * 365;

export async function setLocaleAction(formData: FormData): Promise<void> {
  const locale = String(formData.get("locale") ?? "");
  if (!isLocale(locale)) return;
  const jar = await cookies();
  jar.set(LOCALE_COOKIE, locale, { maxAge: YEAR, path: "/" });
  // Ganti bahasa ikut mengganti mata uang default — kecuali pengunjung pernah
  // memilih mata uang sendiri (cookie currency sudah ada).
  if (!jar.get(CURRENCY_COOKIE)) {
    jar.set(CURRENCY_COOKIE, LOCALE_DEFAULT_CURRENCY[locale], { maxAge: YEAR, path: "/" });
  }
  revalidatePath("/", "layout");
}

export async function setCurrencyAction(formData: FormData): Promise<void> {
  const currency = String(formData.get("currency") ?? "");
  if (!isCurrency(currency)) return;
  const jar = await cookies();
  jar.set(CURRENCY_COOKIE, currency, { maxAge: YEAR, path: "/" });
  revalidatePath("/", "layout");
}
