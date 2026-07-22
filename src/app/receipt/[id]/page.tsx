// Receipt / Kwitansi (Server Component). Renders an elegant ivory "paper"
// invoice for a single Booking, centered on the dark Noir page. Designed to
// print cleanly (Save as PDF) — see receipt.module.css @media print rules.

import { getBooking } from "@/lib/bookings";
import { formatIDR, formatWIB, formatDateWIB, MODE_LABEL, STATUS_LABEL } from "@/ui/format";
import { SITE, waLink } from "@/lib/site-config";
import { PrintButton } from "./print-button";
import styles from "./receipt.module.css";

export default async function ReceiptPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const b = await getBooking(id);

  if (!b) {
    return (
      <div className={styles.page}>
        <div className={`${styles.paper} ${styles.missing} print-doc`}>
          <p className={styles.docLabel}>Receipt</p>
          <h1 className={styles.brand} style={{ marginBottom: "0.75rem" }}>
            Receipt not found
          </h1>
          <p className={styles.orgMeta} style={{ maxWidth: "none", margin: "0 auto 1.5rem" }}>
            We couldn&rsquo;t find a receipt for &ldquo;{id}&rdquo;. Please check the link.
          </p>
          <a href="/" className={styles.missingLink}>
            Return home
          </a>
        </div>
      </div>
    );
  }

  const dp = b.dpAmount ?? 0;
  const hasSettlement = b.settlementAmount != null;
  const settlement = b.settlementAmount ?? 0;
  const totalPaid = dp + settlement;
  const hasDiscount = b.discountAmount != null && b.discountAmount > 0;
  const hasDeposit = b.depositAmount != null && b.depositAmount > 0;

  return (
    <div className={styles.page}>
      <div>
        <article className={`${styles.paper} print-doc`}>
          {/* Letterhead */}
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
              <p className={styles.docLabel}>Receipt</p>
              <p className={styles.metaRow}>
                Receipt No <b>{b.id}</b>
              </p>
              <p className={styles.metaRow}>
                Issued <b>{formatDateWIB(b.createdAt)}</b>
              </p>
              <span className={styles.chip}>{STATUS_LABEL[b.status]}</span>
            </div>
          </header>

          <hr className={styles.rule} />

          {/* Billed to + Rental details */}
          <div className={styles.blocks}>
            <section>
              <h2 className={styles.blockTitle}>Billed to</h2>
              <p className={styles.blockName}>{b.customerName}</p>
              <p className={styles.blockSub}>{b.customerPhone}</p>
            </section>

            <section>
              <h2 className={styles.blockTitle}>Rental details</h2>
              <dl style={{ margin: 0 }}>
                <div className={styles.detailRow}>
                  <dt>Car</dt>
                  <dd>{b.carName}</dd>
                </div>
                <div className={styles.detailRow}>
                  <dt>Mode</dt>
                  <dd>{MODE_LABEL[b.mode]}</dd>
                </div>
                <div className={styles.detailRow}>
                  <dt>Period</dt>
                  <dd>
                    {formatWIB(b.startAt)} &ndash; {formatWIB(b.endAt)}
                  </dd>
                </div>
                <div className={styles.detailRow}>
                  <dt>Allocated unit</dt>
                  <dd>{b.allocatedUnit ?? "—"}</dd>
                </div>
                {b.promoCode ? (
                  <div className={styles.detailRow}>
                    <dt>Promo code</dt>
                    <dd>{b.promoCode}</dd>
                  </div>
                ) : null}
              </dl>
            </section>
          </div>

          <hr className={styles.rule} />

          {/* Line items */}
          <table className={styles.items}>
            <thead>
              <tr>
                <th>Description</th>
                <th className={styles.num}>Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className={styles.itemLabel}>Down payment (DP)</td>
                <td className={styles.num}>{formatIDR(dp)}</td>
              </tr>
              {hasDiscount ? (
                <tr>
                  <td className={styles.itemLabel}>Discount ({b.promoCode ?? "promo"})</td>
                  <td className={styles.num}>&minus;{formatIDR(b.discountAmount!)}</td>
                </tr>
              ) : null}
              {hasSettlement ? (
                <tr>
                  <td className={styles.itemLabel}>Settlement</td>
                  <td className={styles.num}>{formatIDR(settlement)}</td>
                </tr>
              ) : null}
              <tr className={styles.totalRow}>
                <td className={styles.totalLabel}>Total paid</td>
                <td className={styles.num}>{formatIDR(totalPaid)}</td>
              </tr>
            </tbody>
          </table>

          {hasDiscount ? (
            <p className={styles.balanceNote}>
              Discount already reflected in the down payment / settlement amounts above — shown
              here for reference only.
            </p>
          ) : null}

          {!hasSettlement ? (
            <p className={styles.balanceNote}>Balance to be settled before handover.</p>
          ) : null}

          {hasDeposit ? (
            <div className={styles.depositHeld}>
              <span className={styles.depositHeldLabel}>Security deposit held (refundable)</span>
              <span className={styles.depositHeldAmount}>{formatIDR(b.depositAmount!)}</span>
              <p className={styles.depositHeldNote}>
                Not part of the rental total above — this deposit is refundable and is returned
                after the vehicle is returned in good condition, per the Rental Agreement below.
              </p>
            </div>
          ) : null}

          {/* Rental Agreement (fitur #6) — ringkasan syarat bilingual EN/ID, ikut tercetak */}
          <hr className={styles.rule} />
          <section className={styles.agreement}>
            <h2 className={styles.blockTitle}>Rental Agreement &middot; Perjanjian Sewa</h2>
            <ol className={styles.agreementList}>
              <li>
                <span className={styles.agreementEn}>
                  The renter must present a valid driving license (SIM) and ID card (KTP) for
                  Self-Drive rentals.
                </span>
                <span className={styles.agreementId}>
                  Penyewa wajib menunjukkan SIM dan KTP yang berlaku untuk sewa Lepas Kunci.
                </span>
              </li>
              <li>
                <span className={styles.agreementEn}>
                  The security deposit is refunded in full after the vehicle is returned in the
                  agreed condition, minus any applicable penalties (late return, mileage overage,
                  or damage).
                </span>
                <span className={styles.agreementId}>
                  Deposit jaminan dikembalikan penuh setelah unit kembali sesuai kondisi yang
                  disepakati, dikurangi denda bila ada (keterlambatan, kelebihan batas KM, atau
                  kerusakan).
                </span>
              </li>
              <li>
                <span className={styles.agreementEn}>
                  Cancellations follow the refund policy: 7+ days before start, full refund minus
                  an admin fee; 3&ndash;6 days before, 50% refund; 2 days or fewer before, no
                  refund.
                </span>
                <span className={styles.agreementId}>
                  Pembatalan mengikuti kebijakan refund: &ge;H-7 penuh dikurangi biaya admin, H-3
                  s.d. H-6 50%, &le;H-2 hangus.
                </span>
              </li>
              <li>
                <span className={styles.agreementEn}>
                  The vehicle must not be used for racing or any unlawful activity.
                </span>
                <span className={styles.agreementId}>
                  Mobil dilarang digunakan untuk balapan atau kegiatan yang melanggar hukum.
                </span>
              </li>
              <li>
                <span className={styles.agreementEn}>
                  The fuel level must be returned at the same level as at handover.
                </span>
                <span className={styles.agreementId}>
                  Bahan bakar wajib dikembalikan pada level yang sama seperti saat serah-terima.
                </span>
              </li>
            </ol>

            <div className={styles.signatures}>
              <div className={styles.sigBlock}>
                <div className={styles.sigLine} />
                <span className={styles.sigLabel}>Renter &middot; Penyewa</span>
                <span className={styles.sigName}>{b.customerName}</span>
              </div>
              <div className={styles.sigBlock}>
                <div className={styles.sigLine} />
                <span className={styles.sigLabel}>Prestige Bali</span>
                <span className={styles.sigName}>Authorized representative</span>
              </div>
            </div>
          </section>

          {/* Footer */}
          <footer className={styles.foot}>
            <p className={styles.thanks}>Thank you for choosing Prestige Bali.</p>
            <p className={styles.footContact}>
              Questions? Reach us on{" "}
              <a
                href={waLink(`Hi Prestige, about receipt ${b.id} (${b.carName}).`)}
                target="_blank"
                rel="noopener noreferrer"
              >
                WhatsApp
              </a>
              .
            </p>
            <p className={styles.terms}>
              This receipt is computer-generated and valid without a signature. Please retain it for
              your records.
            </p>
          </footer>
        </article>

        {/* Screen-only action (hidden on print) */}
        <div className={styles.actions}>
          <PrintButton />
        </div>
      </div>
    </div>
  );
}
