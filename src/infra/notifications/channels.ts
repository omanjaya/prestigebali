// Kanal pengiriman Notifikasi (ADR-0003): WhatsApp (utama), Email (cadangan), Web Push.
// Setiap kanal mengimplementasikan `Channel`; fan-out satu-kejadian->banyak-kanal ada di
// multi-channel-notification-sender.ts. Adapter di sini fokus ke *bagaimana* mengirim,
// bukan *kapan* — teks pesan sudah dirender (lihat messages.ts).

import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";
import webpush from "web-push";
import type { PushSubscription } from "web-push";

import type { NotificationEvent } from "@/domain/booking/ports";
import type { RecipientRole } from "@/infra/notifications/messages";

/** Pesan siap-kirim yang diterima tiap kanal (sudah dirender ke subject/body). */
export interface ChannelMessage {
  event: NotificationEvent;
  recipientRole: RecipientRole;
  subject: string;
  body: string;
  bookingId?: string;
  payload?: Record<string, unknown>;
}

/**
 * Abstraksi kanal tunggal. Dibuat sengaja minimal (satu method) agar menambah/mengganti
 * kanal tidak menyebar ke seluruh kode (lihat konsekuensi ADR-0003).
 */
export interface Channel {
  /** Nama kanal untuk logging/diagnostik (mis. "email", "webpush", "whatsapp"). */
  readonly name: string;
  /** Kirim satu pesan. Boleh melempar; fan-out di pengirim menangani kegagalan per-kanal. */
  sendMessage(input: ChannelMessage): Promise<void>;
}

// --------------------------------------------------------------------------------------
// Email — nodemailer via SMTP_URL, from EMAIL_FROM.
// --------------------------------------------------------------------------------------

export interface EmailChannelConfig {
  /** URL SMTP (mis. "smtps://user:pass@smtp.host:465"). Dari env SMTP_URL. */
  smtpUrl: string;
  /** Alamat pengirim (From). Dari env EMAIL_FROM. */
  from: string;
  /**
   * Cara menentukan alamat email tujuan dari sebuah pesan. Wiring alamat penerima nyata
   * (lookup Akun Pelanggan / mailbox Admin) belum ada — default mengambil `payload.to`.
   * TODO: sambungkan ke direktori Akun (CONTEXT.md: Akun) saat tersedia.
   */
  resolveRecipient?: (input: ChannelMessage) => string | undefined;
}

export class EmailChannel implements Channel {
  readonly name = "email";
  private readonly transporter: Transporter;
  private readonly from: string;
  private readonly resolveRecipient: NonNullable<EmailChannelConfig["resolveRecipient"]>;

  constructor(config: EmailChannelConfig) {
    this.transporter = nodemailer.createTransport(config.smtpUrl);
    this.from = config.from;
    this.resolveRecipient =
      config.resolveRecipient ??
      ((input) => {
        const to = input.payload?.["to"];
        return typeof to === "string" ? to : undefined;
      });
  }

  /** Buat EmailChannel dari environment (SMTP_URL, EMAIL_FROM). */
  static fromEnv(env: NodeJS.ProcessEnv = process.env): EmailChannel {
    const smtpUrl = env.SMTP_URL;
    const from = env.EMAIL_FROM;
    if (!smtpUrl) throw new Error("EmailChannel: SMTP_URL belum di-set");
    if (!from) throw new Error("EmailChannel: EMAIL_FROM belum di-set");
    return new EmailChannel({ smtpUrl, from });
  }

  async sendMessage(input: ChannelMessage): Promise<void> {
    const to = this.resolveRecipient(input);
    if (!to) {
      // Tanpa alamat tujuan tak ada yang bisa dikirim; jangan lempar agar kanal lain jalan.
      // TODO: hilangkan cabang ini setelah resolusi alamat Akun tersambung.
      console.warn(`[notifications:email] lewati ${input.event}: alamat tujuan tidak diketahui`);
      return;
    }
    await this.transporter.sendMail({
      from: this.from,
      to,
      subject: input.subject,
      text: input.body,
    });
  }
}

// --------------------------------------------------------------------------------------
// Web Push — web-push (VAPID). Sumber subscription masih stub (belum di-wire).
// --------------------------------------------------------------------------------------

/** Sumber langganan Web Push untuk sebuah pesan. Stub sampai persistensi tersedia. */
export interface PushSubscriptionSource {
  /** Kembalikan subscription aktif untuk penerima pesan ini (bisa kosong). */
  getSubscriptions(input: ChannelMessage): Promise<PushSubscription[]>;
}

export interface WebPushChannelConfig {
  /** Subject VAPID (mailto: atau URL). Dari env VAPID_SUBJECT. */
  vapidSubject: string;
  /** Kunci publik VAPID. Dari env VAPID_PUBLIC_KEY. */
  vapidPublicKey: string;
  /** Kunci privat VAPID. Dari env VAPID_PRIVATE_KEY. */
  vapidPrivateKey: string;
  /**
   * Sumber subscription. Belum di-wire ke DB/tabel langganan.
   * TODO: implementasikan PushSubscriptionSource dari penyimpanan langganan browser.
   */
  subscriptionSource?: PushSubscriptionSource;
}

/** Stub default: belum ada langganan tersimpan, jadi tidak pernah mengirim. */
const emptySubscriptionSource: PushSubscriptionSource = {
  async getSubscriptions() {
    // TODO: ganti dengan lookup langganan Web Push milik penerima.
    return [];
  },
};

export class WebPushChannel implements Channel {
  readonly name = "webpush";
  private readonly subscriptionSource: PushSubscriptionSource;

  constructor(config: WebPushChannelConfig) {
    webpush.setVapidDetails(
      config.vapidSubject,
      config.vapidPublicKey,
      config.vapidPrivateKey,
    );
    this.subscriptionSource = config.subscriptionSource ?? emptySubscriptionSource;
  }

  /**
   * Buat WebPushChannel dari environment (VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY).
   * Catatan: variabel VAPID belum ada di .env.example (Web Push belum sepenuhnya di-wire).
   */
  static fromEnv(env: NodeJS.ProcessEnv = process.env): WebPushChannel {
    const vapidSubject = env.VAPID_SUBJECT;
    const vapidPublicKey = env.VAPID_PUBLIC_KEY;
    const vapidPrivateKey = env.VAPID_PRIVATE_KEY;
    if (!vapidSubject || !vapidPublicKey || !vapidPrivateKey) {
      throw new Error(
        "WebPushChannel: VAPID_SUBJECT/VAPID_PUBLIC_KEY/VAPID_PRIVATE_KEY belum di-set",
      );
    }
    return new WebPushChannel({ vapidSubject, vapidPublicKey, vapidPrivateKey });
  }

  async sendMessage(input: ChannelMessage): Promise<void> {
    const subscriptions = await this.subscriptionSource.getSubscriptions(input);
    if (subscriptions.length === 0) {
      // Tidak ada langganan (sumber masih stub) — no-op tanpa melempar.
      return;
    }
    const notification = JSON.stringify({
      title: input.subject,
      body: input.body,
      data: { event: input.event, bookingId: input.bookingId },
    });
    // Kirim ke semua langganan; kegagalan satu langganan tak menggagalkan yang lain.
    const results = await Promise.allSettled(
      subscriptions.map((sub) => webpush.sendNotification(sub, notification)),
    );
    const failed = results.filter((r) => r.status === "rejected");
    if (failed.length > 0) {
      console.error(
        `[notifications:webpush] ${failed.length}/${subscriptions.length} langganan gagal untuk ${input.event}`,
      );
    }
  }
}

// --------------------------------------------------------------------------------------
// WhatsApp — kanal UTAMA per ADR-0003, tetapi vendor DITUNDA per ADR-0005.
// Placeholder no-op yang mencatat; ganti dengan adapter vendor (Fonnte/Twilio/WA Business).
// --------------------------------------------------------------------------------------

export class WhatsappChannel implements Channel {
  readonly name = "whatsapp";

  async sendMessage(input: ChannelMessage): Promise<void> {
    // TODO(ADR-0005): vendor WhatsApp belum dipilih. Ini placeholder no-op.
    // Saat vendor dipilih, kirim lewat WhatsApp API pihak ketiga (env WHATSAPP_* — TBD).
    // WhatsApp adalah kanal UTAMA (ADR-0003); jadikan ini implementasi nyata pertama.
    console.info(
      `[notifications:whatsapp] (placeholder, vendor ditunda) ${input.event} -> ${input.recipientRole}: ${input.subject}`,
    );
  }
}
