// Impl `NotificationSender` (port domain) yang fan-out satu kejadian ke banyak kanal
// sesuai ADR-0003 (WhatsApp utama, Email cadangan, Web Push). Best-effort: kegagalan
// satu kanal tidak membatalkan kanal lain — sesuai "lapisan pengiriman abstrak dari kanal".

import type { NotificationSender } from "@/domain/booking/ports";
import type { Channel, ChannelMessage } from "@/infra/notifications/channels";
import {
  EmailChannel,
  WebPushChannel,
  WhatsappChannel,
} from "@/infra/notifications/channels";
import { renderMessage } from "@/infra/notifications/messages";

export interface MultiChannelNotificationSenderOptions {
  /**
   * Kanal terurut sesuai prioritas ADR-0003 (WhatsApp dulu, lalu Email, lalu Web Push).
   * Urutan hanya menentukan urutan mulai; pengiriman tetap paralel & best-effort.
   */
  channels: Channel[];
}

export class MultiChannelNotificationSender implements NotificationSender {
  private readonly channels: Channel[];

  constructor(options: MultiChannelNotificationSenderOptions) {
    this.channels = options.channels;
  }

  async send(input: {
    event: ChannelMessage["event"];
    recipientRole: ChannelMessage["recipientRole"];
    bookingId?: string;
    payload?: Record<string, unknown>;
  }): Promise<void> {
    const rendered = renderMessage(input);
    const message: ChannelMessage = {
      event: input.event,
      recipientRole: input.recipientRole,
      subject: rendered.subject,
      body: rendered.body,
      bookingId: input.bookingId,
      payload: input.payload,
    };

    // Fan-out ke semua kanal secara paralel; best-effort (satu gagal tak menghentikan lain).
    const results = await Promise.allSettled(
      this.channels.map((channel) => channel.sendMessage(message)),
    );

    results.forEach((result, index) => {
      if (result.status === "rejected") {
        const channelName = this.channels[index]?.name ?? `#${index}`;
        console.error(
          `[notifications] kanal "${channelName}" gagal untuk ${input.event} -> ${input.recipientRole}:`,
          result.reason,
        );
      }
    });
  }
}

/**
 * Factory default dari environment, dengan urutan prioritas ADR-0003:
 * WhatsApp (utama, placeholder) -> Email -> Web Push.
 *
 * Kanal Email & Web Push hanya diaktifkan bila env-nya lengkap; keduanya opsional agar
 * skeleton bisa jalan (mis. Web Push belum di-wire). WhatsApp selalu ada (no-op placeholder).
 */
export function createNotificationSenderFromEnv(
  env: NodeJS.ProcessEnv = process.env,
): MultiChannelNotificationSender {
  const channels: Channel[] = [new WhatsappChannel()];

  if (env.SMTP_URL && env.EMAIL_FROM) {
    channels.push(EmailChannel.fromEnv(env));
  } else {
    console.warn(
      "[notifications] Email dinonaktifkan: SMTP_URL/EMAIL_FROM belum di-set (.env.example)",
    );
  }

  if (env.VAPID_SUBJECT && env.VAPID_PUBLIC_KEY && env.VAPID_PRIVATE_KEY) {
    channels.push(WebPushChannel.fromEnv(env));
  } else {
    // Web Push belum sepenuhnya di-wire (VAPID keys + langganan). Lihat TODO di channels.ts.
    console.warn(
      "[notifications] Web Push dinonaktifkan: kunci VAPID belum di-set (belum di-wire)",
    );
  }

  return new MultiChannelNotificationSender({ channels });
}
