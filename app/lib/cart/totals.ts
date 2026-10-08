import type { Cart } from "./types";

export type CartTotals = {
  itemCount: number;
  subtotal: number;
};

export function calculateCartTotals(cart: Cart): CartTotals {
  const itemCount = cart.items.reduce(
    (total, item) => total + item.quantity,
    0,
  );

  const subtotal = cart.items.reduce(
    (total, item) => total + item.quantity * item.unitPrice,
    0,
  );

  return {
    itemCount,
    subtotal,
  };
}
