// Berita Acara Serah Terima (cetak). Dokumen ivory dua kolom: Pengambilan (OUT)
// & Pengembalian (IN), dengan checklist + tanda tangan. Print-clean via module CSS.

import Link from "next/link";
import { getBooking } from "@/lib/bookings";
import {
  getHandovers,
  fuelLabel,
  CONDITION_FIELDS,
  EQUIPMENT_FIELDS,
  type HandoverView,
} from "@/lib/handovers";
import { formatDateWIB, formatWIB, MODE_LABEL, STATUS_LABEL } from "@/ui/format";
import { SITE } from "@/lib/site-config";
import { PrintButton } from "./print-button";
import styles from "./handover.module.css";

function Box({ on }: { on: boolean }) {
  return (
    <span className={`${styles.box} ${on ? styles.boxOn : styles.boxOff}`}>{on ? "☑" : "☐"}</span>
  );
}

function PhaseColumn({
  title,
  sub,
  data,
}: {
  title: string;
  sub: string;
  data?: HandoverView;
}) {
  return (
    <div className={styles.col}>
      <h3 className={styles.colHead}>{title}</h3>
      <p className={styles.colSub}>{sub}</p>

      {!data ? (
        <p className={styles.empty}>Belum dilakukan.</p>
      ) : (
        <>
          <div className={styles.readouts}>
            <div className={styles.readout}>
              <span className={styles.readoutLabel}>Odometer</span>
              <span className={styles.readoutValue}>
                {data.odometer.toLocaleString("id-ID")} km
              </span>
            </div>
            <div className={styles.readout}>
              <span className={styles.readoutLabel}>BBM</span>
              <span className={styles.readoutValue}>{fuelLabel(data.fuelEighths)}</span>
            </div>
          </div>

          <div className={styles.group}>
            <p className={styles.groupTitle}>Kondisi</p>
            {CONDITION_FIELDS.map((f) => (
              <div key={f.key} className={styles.check}>
                <Box on={data[f.key]} />
                {f.label}
              </div>
            ))}
          </div>

          <div className={styles.group}>
            <p className={styles.groupTitle}>Kelengkapan</p>
            {EQUIPMENT_FIELDS.map((f) => (
              <div key={f.key} className={styles.check}>
                <Box on={data[f.key]} />
                {f.label}
              </div>
            ))}
          </div>

          {data.accessories.length > 0 ? (
            <div className={styles.noteBlock}>
              <span className={styles.noteLabel}>Aksesori</span>
              <div className={styles.noteBody}>{data.accessories.join(", ")}</div>
            </div>
          ) : null}

          <div className={styles.noteBlock}>
            <span className={styles.noteLabel}>Baret / penyok</span>
            <div className={styles.noteBody}>{data.damageNotes ?? "— tidak ada catatan —"}</div>
          </div>

          {data.notes ? (
            <div className={styles.noteBlock}>
              <span className={styles.noteLabel}>Catatan</span>
              <div className={styles.noteBody}>{data.notes}</div>
            </div>
          ) : null}

          <div className={styles.signs}>
            <div className={styles.sign}>
              <div className={styles.signLine}>Penyewa</div>
            </div>
            <div className={styles.sign}>
              <div className={styles.signLine}>
                <span className={styles.signName}>{data.staffName ?? "Petugas"}</span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default async function HandoverPrintPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const booking = await getBooking(id);

  if (!booking) {
    return (
      <div className={styles.page}>
        <div className={`${styles.paper} ${styles.missing} print-doc`}>
          <p className={styles.docLabel}>Serah Terima</p>
          <h1 className={styles.brand} style={{ marginBottom: "0.75rem" }}>
            Dokumen tidak ditemukan
          </h1>
          <p className={styles.orgMeta} style={{ maxWidth: "none", margin: "0 auto 1.5rem" }}>
            Tidak ada booking untuk “{id}”.
          </p>
          <Link href="/" className={styles.missingLink}>
            Kembali ke beranda
          </Link>
        </div>
      </div>
    );
  }

  const { out, in: inn } = await getHandovers(id);

  return (
    <div className={styles.page}>
      <div>
        <article className={`${styles.paper} print-doc`}>
          <header className={styles.head}>
            <div>
              <h1 className={styles.brand}>
                <span>P</span>restige Bali
              </h1>
              <p className={styles.orgMeta}>
                <span>{SITE.address}</span>
                <span>{SITE.phone}</span>
                <span>{SITE.email}</span>
              </p>
            </div>
            <div className={styles.headRight}>
              <p className={styles.docLabel}>Serah Terima</p>
              <p className={styles.metaRow}>
                Booking <b>{booking.id}</b>
              </p>
              <p className={styles.metaRow}>
                Dicetak <b>{formatDateWIB(new Date())}</b>
              </p>
              <span className={styles.chip}>{STATUS_LABEL[booking.status]}</span>
            </div>
          </header>

          <hr className={styles.rule} />

          <dl className={styles.meta}>
            <div className={styles.metaItem}>
              <dt>Penyewa</dt>
              <dd>{booking.customerName}</dd>
            </div>
            <div className={styles.metaItem}>
              <dt>Kendaraan</dt>
              <dd>{booking.carName}</dd>
            </div>
            <div className={styles.metaItem}>
              <dt>Unit</dt>
              <dd>{booking.allocatedUnit ?? "—"}</dd>
            </div>
            <div className={styles.metaItem}>
              <dt>Mode</dt>
              <dd>{MODE_LABEL[booking.mode]}</dd>
            </div>
            <div className={styles.metaItem}>
              <dt>Periode</dt>
              <dd>
                {formatWIB(booking.startAt)} – {formatWIB(booking.endAt)}
              </dd>
            </div>
          </dl>

          <hr className={styles.rule} />

          <div className={styles.cols}>
            <PhaseColumn title="Pengambilan" sub="Saat unit diserahkan" data={out} />
            <PhaseColumn title="Pengembalian" sub="Saat unit dikembalikan" data={inn} />
          </div>

          <p className={styles.terms}>
            Dengan menandatangani, kedua pihak menyetujui kondisi kendaraan sebagaimana tercatat di
            atas. Dokumen ini menjadi acuan bila terdapat selisih kondisi saat pengembalian.
          </p>
        </article>

        <div className={styles.actions}>
          <PrintButton />
          <Link href={`/admin/handover/${id}`} className="btn btn-ghost">
            Edit checklist
          </Link>
        </div>
      </div>
    </div>
  );
}
