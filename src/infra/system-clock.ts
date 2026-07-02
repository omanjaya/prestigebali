// Implementasi `Clock` nyata untuk runtime aplikasi.
// Waktu deterministik dipakai lewat fake Clock saat test (lihat testing/fakes.ts);
// di produksi kita cukup memakai jam sistem.

import type { Clock } from "@/domain/booking/ports";

export const systemClock: Clock = {
  now: () => new Date(),
};
