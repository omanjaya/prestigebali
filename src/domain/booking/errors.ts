// Error domain Booking. Kelas terpisah agar test bisa mengasersi jenis kegagalan.

export class DomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = new.target.name;
  }
}

/** Stok habis untuk periode yang diminta (termasuk Hold + Buffer). */
export class NoAvailabilityError extends DomainError {}

/** Transisi state yang tidak sah pada state machine Booking (ADR-0001). */
export class InvalidTransitionError extends DomainError {}
