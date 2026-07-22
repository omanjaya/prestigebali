// Admin · Reports — export CSV. Route Handler (GET) yang membaca filter dari
// query string PERSIS seperti halaman Reports (from/to/mode/status/carModelId),
// memanggil getReports() dengan filter yang sama, lalu menghasilkan satu berkas
// CSV berisi beberapa "blok" laporan (ringkasan pendapatan; booking per mobil;
// utilisasi; pembayaran tertunda), dipisah baris kosong + baris judul blok.
//
// Guard: hanya ADMIN (session role), selain itu → 401. Selalu segar (tak pernah
// di-cache) karena mencerminkan filter & data DB saat request.

import { auth } from "@/auth";
import { getReports, type ReportFilter } from "@/lib/reports";
import type { BookingStatus, RentalMode } from "@/domain/booking/booking";
import { formatWIB } from "@/ui/format";

export const dynamic = "force-dynamic";

const MODE_VALUES: RentalMode[] = ["SELF_DRIVE", "CHAUFFEUR"];
const STATUS_VALUES: BookingStatus[] = [
  "REQUESTED",
  "AWAITING_APPROVAL",
  "CONFIRMED",
  "EXPIRED",
  "ONGOING",
  "COMPLETED",
  "CANCELLED",
];

/** Escape sebuah nilai CSV: bungkus dalam tanda kutip bila mengandung koma/kutip/baris baru. */
function csvEscape(value: string | number): string {
  const s = String(value);
  if (/["\n\r,]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

function row(values: Array<string | number>): string {
  return values.map(csvEscape).join(",");
}

export async function GET(request: Request): Promise<Response> {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return new Response("Unauthorized", { status: 401 });
  }

  const url = new URL(request.url);
  const sp = url.searchParams;

  const fromRaw = sp.get("from") ?? "";
  const toRaw = sp.get("to") ?? "";
  const modeRaw = sp.get("mode") ?? "";
  const statusRaw = sp.get("status") ?? "";
  const carModelIdRaw = sp.get("carModelId") ?? "";

  const fromDate = fromRaw ? new Date(`${fromRaw}T00:00:00`) : undefined;
  const toDate = toRaw ? new Date(`${toRaw}T23:59:59.999`) : undefined;

  const filter: ReportFilter = {
    from: fromDate && !Number.isNaN(fromDate.getTime()) ? fromDate : undefined,
    to: toDate && !Number.isNaN(toDate.getTime()) ? toDate : undefined,
    mode: MODE_VALUES.includes(modeRaw as RentalMode) ? (modeRaw as RentalMode) : undefined,
    status: STATUS_VALUES.includes(statusRaw as BookingStatus)
      ? (statusRaw as BookingStatus)
      : undefined,
    carModelId: carModelIdRaw || undefined,
  };

  const report = await getReports(new Date(), filter);
  const { revenueTotal, revenueThisMonth, dpTotal, settlementTotal, totalBookings, activeBookings, perCar, mode, outstanding, utilizationDays } = report;

  const lines: string[] = [];

  // ---- Ringkasan pendapatan ----
  lines.push("Ringkasan Pendapatan");
  lines.push(row(["Metrik", "Nilai"]));
  lines.push(row(["Total Pendapatan", revenueTotal]));
  lines.push(row(["Pendapatan Bulan Ini", revenueThisMonth]));
  lines.push(row(["Total DP Diterima", dpTotal]));
  lines.push(row(["Total Pelunasan", settlementTotal]));
  lines.push(row(["Total Booking", totalBookings]));
  lines.push(row(["Booking Aktif", activeBookings]));

  lines.push("");

  // ---- Booking per mobil ----
  lines.push("Booking per Mobil");
  lines.push(row(["Mobil", "Booking", "Pendapatan", "Hari Disewa", "Stok"]));
  if (perCar.length === 0) {
    lines.push(row(["(tidak ada data)", "", "", "", ""]));
  } else {
    for (const r of perCar) {
      lines.push(row([r.carName, r.bookings, r.revenue, r.daysRented, r.stock]));
    }
  }

  lines.push("");

  // ---- Utilisasi ----
  lines.push("Utilisasi");
  lines.push(row(["Metrik", "Nilai"]));
  lines.push(row(["Total Hari Sewa Armada", utilizationDays]));
  lines.push(row(["Booking Self-Drive", mode.selfDrive]));
  lines.push(row(["Booking Chauffeur", mode.chauffeur]));

  lines.push("");

  // ---- Pembayaran tertunda ----
  lines.push("Pembayaran Tertunda");
  lines.push(row(["Booking ID", "Mobil", "Pelanggan", "DP", "Tanggal Mulai"]));
  if (outstanding.length === 0) {
    lines.push(row(["(tidak ada data)", "", "", "", ""]));
  } else {
    for (const o of outstanding) {
      lines.push(row([o.id, o.carName, o.customerName, o.dpAmount, formatWIB(o.startAt)]));
    }
  }

  const csv = lines.join("\r\n") + "\r\n";

  return new Response(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="prestige-report.csv"',
    },
  });
}
