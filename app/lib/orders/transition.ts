import type { OrderStatus } from "./types";

const allowedTransitions: Record<
  OrderStatus,
  readonly OrderStatus[]
> = {
  pending_payment: [
    "confirmed",
    "cancelled",
  ],
  confirmed: [
    "processing",
    "cancelled",
  ],
  processing: [
    "shipped",
    "cancelled",
  ],
  shipped: [
    "delivered",
    "returned",
  ],
  delivered: [
    "returned",
  ],
  cancelled: [],
  returned: [
    "refunded",
  ],
  refunded: [],
};

export function canTransitionOrder(
  from: OrderStatus,
  to: OrderStatus,
): boolean {
  if (from === to) {
    return true;
  }

  return allowedTransitions[from].includes(to);
}

export function assertOrderTransition(
  from: OrderStatus,
  to: OrderStatus,
): void {
  if (!canTransitionOrder(from, to)) {
    throw new Error(
      `Invalid order status transition: ${from} -> ${to}.`,
    );
  }
}
