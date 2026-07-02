// Adapter Prisma untuk port CarModelReader (baca data Mobil untuk logika Booking).

import type { CarModelReader } from "@/domain/booking/ports";
import { prisma } from "@/lib/prisma";

export class PrismaCarModelReader implements CarModelReader {
  /** Jumlah Stok (total Unit) sebuah Mobil, atau null bila Mobil tidak ada. */
  async getStock(carModelId: string): Promise<number | null> {
    const model = await prisma.carModel.findUnique({
      where: { id: carModelId },
      select: { stock: true },
    });
    return model?.stock ?? null;
  }
}

/** Factory jika lebih suka instansiasi via fungsi. */
export function createPrismaCarModelReader(): CarModelReader {
  return new PrismaCarModelReader();
}
