// Agregasi laporan admin (PRD): Pendapatan, Booking per Mobil & Mode, Utilisasi armada,
// Pembayaran Tertunda. Dihitung dari data DB (listBookings + listCarModels).

import { listBookings, type BookingView } from "@/lib/bookings";
import { listCarModels } from "@/lib/catalog";

const DAY_MS = 86_400_000;

function isRevenueBearing(b: BookingView): boolean {
  return b.status !== "CANCELLED" && b.status !== "EXPIRED";
}
function bookingRevenue(b: BookingView): number {
  return (b.dpAmount ?? 0) + (b.settlementAmount ?? 0);
}
function rentalDays(b: BookingView): number {
  return Math.max(1, Math.round((b.endAt.getTime() - b.startAt.getTime()) / DAY_MS));
}

export interface CarReportRow {
  carModelId: string;
  carName: string;
  bookings: number;
  revenue: number;
  daysRented: number;
  stock: number;
}
export interface ModeReport {
  selfDrive: number;
  chauffeur: number;
}
export interface OutstandingRow {
  id: string;
  carName: string;
  customerName: string;
  dpAmount: number;
  startAt: Date;
}
export interface ReportData {
  revenueTotal: number;
  revenueThisMonth: number;
  dpTotal: number;
  settlementTotal: number;
  totalBookings: number;
  activeBookings: number;
  perCar: CarReportRow[];
  mode: ModeReport;
  outstanding: OutstandingRow[];
  /** Total hari-sewa aktif di seluruh armada (proxy utilisasi). */
  utilizationDays: number;
  /** Waktu laporan dibuat (untuk header). */
  generatedAt: Date;
}

export async function getReports(now: Date = new Date()): Promise<ReportData> {
  const [bookings, cars] = await Promise.all([listBookings(), listCarModels()]);

  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
  const revenueBearing = bookings.filter(isRevenueBearing);

  const revenueTotal = revenueBearing.reduce((s, b) => s + bookingRevenue(b), 0);
  const revenueThisMonth = revenueBearing
    .filter((b) => b.createdAt.getTime() >= monthStart)
    .reduce((s, b) => s + bookingRevenue(b), 0);
  const dpTotal = revenueBearing.reduce((s, b) => s + (b.dpAmount ?? 0), 0);
  const settlementTotal = revenueBearing.reduce((s, b) => s + (b.settlementAmount ?? 0), 0);

  const activeBookings = bookings.filter((b) =>
    ["REQUESTED", "AWAITING_APPROVAL", "CONFIRMED", "ONGOING"].includes(b.status),
  ).length;

  // Per-mobil: gabungkan agar setiap Mobil (walau 0 booking) tampil.
  const byCar = new Map<string, CarReportRow>();
  for (const c of cars) {
    byCar.set(c.id, {
      carModelId: c.id,
      carName: `${c.brand} ${c.name}`,
      bookings: 0,
      revenue: 0,
      daysRented: 0,
      stock: c.stock,
    });
  }
  for (const b of bookings) {
    const row =
      byCar.get(b.carModelId) ??
      ({ carModelId: b.carModelId, carName: b.carName, bookings: 0, revenue: 0, daysRented: 0, stock: 0 } as CarReportRow);
    row.bookings += 1;
    if (isRevenueBearing(b)) {
      row.revenue += bookingRevenue(b);
      row.daysRented += rentalDays(b);
    }
    byCar.set(b.carModelId, row);
  }
  const perCar = [...byCar.values()].sort((a, b) => b.revenue - a.revenue || b.bookings - a.bookings);

  const mode: ModeReport = {
    selfDrive: bookings.filter((b) => b.mode === "SELF_DRIVE").length,
    chauffeur: bookings.filter((b) => b.mode === "CHAUFFEUR").length,
  };

  const outstanding: OutstandingRow[] = bookings
    .filter((b) => b.status === "CONFIRMED" && b.dpAmount != null && b.settlementAmount == null)
    .map((b) => ({
      id: b.id,
      carName: b.carName,
      customerName: b.customerName,
      dpAmount: b.dpAmount ?? 0,
      startAt: b.startAt,
    }))
    .sort((a, b) => a.startAt.getTime() - b.startAt.getTime());

  const utilizationDays = perCar.reduce((s, r) => s + r.daysRented, 0);

  return {
    revenueTotal,
    revenueThisMonth,
    dpTotal,
    settlementTotal,
    totalBookings: bookings.length,
    activeBookings,
    perCar,
    mode,
    outstanding,
    utilizationDays,
    generatedAt: now,
  };
}
