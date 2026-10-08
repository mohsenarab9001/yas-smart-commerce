import type { PaymentIntentStatus } from "./types";

const allowedTransitions: Record<
  PaymentIntentStatus,
  readonly PaymentIntentStatus[]
> = {
  pending: [
    "requires_action",
    "authorized",
    "paid",
    "failed",
    "cancelled",
  ],
  requires_action: [
    "authorized",
    "paid",
    "failed",
    "cancelled",
  ],
  authorized: [
    "paid",
    "failed",
    "cancelled",
  ],
  paid: [
    "refunded",
    "partially_refunded",
  ],
  failed: [],
  cancelled: [],
  refunded: [],
  partially_refunded: [
    "refunded",
  ],
};

export function canTransitionPayment(
  from: PaymentIntentStatus,
  to: PaymentIntentStatus,
): boolean {
  if (from === to) {
    return true;
  }

  return allowedTransitions[from].includes(to);
}

export function assertPaymentTransition(
  from: PaymentIntentStatus,
  to: PaymentIntentStatus,
): void {
  if (!canTransitionPayment(from, to)) {
    throw new Error(
      `Invalid payment status transition: ${from} -> ${to}.`,
    );
  }
}
