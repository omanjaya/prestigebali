"use client";

// Floating WhatsApp button — fixed bottom-right, below the custom cursor (z 60).
// Circular disc with a monochrome WhatsApp glyph (currentColor, not an emoji),
// subtle entrance + gentle pulse, and a "Chat with us" label revealed on hover.

import { waLink } from "@/lib/site-config";
import styles from "./whatsapp-fab.module.css";

const ENQUIRY = "Hi Prestige Bali, I'd like to enquire about a car.";

export function WhatsAppFab() {
  return (
    <a
      className={styles.fab}
      href={waLink(ENQUIRY)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
    >
      <span className={styles.disc}>
        <span className={styles.pulse} aria-hidden="true" />
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12.02 2C6.6 2 2.2 6.39 2.2 11.8c0 1.9.53 3.68 1.46 5.2L2 22l5.13-1.62a9.75 9.75 0 0 0 4.89 1.31h.004c5.42 0 9.82-4.39 9.82-9.8C21.84 6.39 17.44 2 12.02 2Zm0 17.86h-.004a8.13 8.13 0 0 1-4.14-1.13l-.3-.18-3.05.96.97-2.97-.2-.31a8.05 8.05 0 0 1-1.25-4.31c0-4.5 3.68-8.16 8.2-8.16 2.19 0 4.25.85 5.8 2.4a8.1 8.1 0 0 1 2.4 5.77c-.01 4.5-3.69 8.16-8.2 8.16Zm4.5-6.11c-.25-.12-1.46-.72-1.68-.8-.23-.08-.39-.12-.56.12-.16.25-.64.8-.79.97-.14.16-.29.18-.54.06-.25-.12-1.04-.38-1.98-1.22-.73-.65-1.23-1.46-1.37-1.7-.14-.25-.02-.38.11-.5.11-.11.25-.29.37-.43.13-.14.17-.25.25-.41.08-.16.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.4-.42-.56-.42-.14-.01-.31-.01-.48-.01-.16 0-.43.06-.66.31-.23.25-.86.85-.86 2.07 0 1.22.89 2.4 1.01 2.56.12.16 1.75 2.67 4.23 3.74.59.26 1.05.4 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.46-.6 1.67-1.18.21-.58.21-1.07.14-1.18-.06-.11-.22-.17-.47-.29Z" />
        </svg>
      </span>
      <span className={styles.label}>Chat with us</span>
    </a>
  );
}

export default WhatsAppFab;
