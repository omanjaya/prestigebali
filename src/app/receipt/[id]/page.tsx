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
                <td className={styles.itemLabel}>Deposit (DP)</td>
                <td className={styles.num}>{formatIDR(dp)}</td>
              </tr>
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

          {!hasSettlement ? (
            <p className={styles.balanceNote}>Balance to be settled before handover.</p>
          ) : null}

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
