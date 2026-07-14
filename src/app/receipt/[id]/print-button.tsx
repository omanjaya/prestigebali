"use client";

// Print / Save-PDF trigger for the receipt page. Client-only because it calls
// window.print(). Hidden on paper via @media print (see receipt.module.css).

import styles from "./receipt.module.css";

export function PrintButton() {
  return (
    <button type="button" className={styles.printBtn} onClick={() => window.print()}>
      Print / Save PDF
    </button>
  );
}

export default PrintButton;
