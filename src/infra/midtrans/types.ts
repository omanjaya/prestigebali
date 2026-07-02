// Request/response shapes for the Midtrans REST API subset we use.
// Only the fields this adapter reads/writes are typed; Midtrans returns more.
// Refs:
//   Snap:   https://docs.midtrans.com/reference/create-transaction (POST /snap/v1/transactions)
//   Refund: https://docs.midtrans.com/reference/refund-transaction  (POST /v2/{order_id}/refund)

/** Body untuk membuat transaksi Snap. `gross_amount` dalam rupiah utuh (Int). */
export interface SnapTransactionRequest {
  transaction_details: {
    order_id: string;
    gross_amount: number;
  };
}

/** Respons sukses Snap: token + URL redirect ke halaman pembayaran hosted. */
export interface SnapTransactionResponse {
  token: string;
  redirect_url: string;
}

/** Body untuk refund transaksi (Core API). */
export interface RefundRequest {
  /** Idempotency key refund; unik per percobaan refund untuk sebuah order. */
  refund_key: string;
  amount: number;
  reason: string;
}

/** Respons refund (Core API). Field opsional karena bergantung status. */
export interface RefundResponse {
  status_code: string;
  transaction_id?: string;
  order_id?: string;
  refund_key?: string;
  refund_amount?: string;
}

/**
 * Bentuk error umum Midtrans (baik Snap maupun Core).
 * Snap: `error_messages: string[]`. Core: `status_message: string`.
 */
export interface MidtransErrorResponse {
  status_code?: string;
  status_message?: string;
  error_messages?: string[];
}
