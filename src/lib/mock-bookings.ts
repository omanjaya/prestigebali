// Data booking MOCK untuk UI Status & Admin (belum ada DB/read-API). Bentuknya adalah
// proyeksi tampilan gabungan Booking + Mobil. Ganti dgn query nyata saat DB siap.
// Istilah & status mengikuti CONTEXT.md / ADR-0001.

import type { BookingStatus, RentalMode } from "@/domain/booking/booking";

export interface BookingView {
  id: string;
  carModelId: string;
  carName: string; // "Toyota Alphard"
  customerName: string;
  customerPhone: string;
  mode: RentalMode;
  status: BookingStatus;
  startAt: Date;
  endAt: Date;
  dpAmount?: number;
  settlementAmount?: number;
  /** Warna/plat unit yang dialokasikan admin, bila sudah. */
  allocatedUnit?: string;
  createdAt: Date;
}

const BOOKINGS: BookingView[] = [
  {
    id: "bk-1001",
    carModelId: "toyota-alphard",
    carName: "Toyota Alphard",
    customerName: "Budi Santoso",
    customerPhone: "0812-1111-2222",
    mode: "CHAUFFEUR",
    status: "CONFIRMED",
    startAt: new Date("2026-08-10T01:00:00.000Z"),
    endAt: new Date("2026-08-10T13:00:00.000Z"),
    dpAmount: 900_000,
    createdAt: new Date("2026-07-01T04:00:00.000Z"),
  },
  {
    id: "bk-1002",
    carModelId: "mercedes-s-class",
    carName: "Mercedes-Benz S 450",
    customerName: "Sari Dewi",
    customerPhone: "0813-3333-4444",
    mode: "SELF_DRIVE",
    status: "AWAITING_APPROVAL",
    startAt: new Date("2026-08-15T02:00:00.000Z"),
    endAt: new Date("2026-08-18T02:00:00.000Z"),
    dpAmount: 2_500_000,
    createdAt: new Date("2026-07-02T02:30:00.000Z"),
  },
  {
    id: "bk-1003",
    carModelId: "ferrari-488",
    carName: "Ferrari 488 GTB",
    customerName: "Andi Wijaya",
    customerPhone: "0811-5555-6666",
    mode: "SELF_DRIVE",
    status: "REQUESTED",
    startAt: new Date("2026-09-01T02:00:00.000Z"),
    endAt: new Date("2026-09-02T02:00:00.000Z"),
    createdAt: new Date("2026-07-02T08:00:00.000Z"),
  },
  {
    id: "bk-1004",
    carModelId: "range-rover-vogue",
    carName: "Land Rover Range Rover Vogue",
    customerName: "Rina Kartika",
    customerPhone: "0812-7777-8888",
    mode: "CHAUFFEUR",
    status: "COMPLETED",
    startAt: new Date("2026-06-20T01:00:00.000Z"),
    endAt: new Date("2026-06-20T13:00:00.000Z"),
    dpAmount: 1_200_000,
    settlementAmount: 2_800_000,
    allocatedUnit: "Hitam · B 1 RRV",
    createdAt: new Date("2026-06-10T03:00:00.000Z"),
  },
];

export function listBookings(): BookingView[] {
  return BOOKINGS;
}

export function getBooking(id: string): BookingView | undefined {
  return BOOKINGS.find((b) => b.id === id);
}
