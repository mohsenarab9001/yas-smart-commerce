import type { OrderItem } from "./types";

export type OrderTotalsInput = {
  items: OrderItem[];
  discountTotal?: number;
  shippingTotal?: number;
  packagingTotal?: number;
  taxTotal?: number;
};

export type OrderTotals = {
  subtotal: number;
  discountTotal: number;
  shippingTotal: number;
  packagingTotal: number;
  taxTotal: number;
  grandTotal: number;
};

export function calculateOrderTotals(
  input: OrderTotalsInput,
): OrderTotals {
  const subtotal = input.items.reduce(
    (total, item) => total + item.totalPrice,
    0,
  );

  const discountTotal = Math.max(0, input.discountTotal ?? 0);
  const shippingTotal = Math.max(0, input.shippingTotal ?? 0);
  const packagingTotal = Math.max(0, input.packagingTotal ?? 0);
  const taxTotal = Math.max(0, input.taxTotal ?? 0);

  const grandTotal = Math.max(
    0,
    subtotal - discountTotal + shippingTotal + packagingTotal + taxTotal,
  );

  return {
    subtotal,
    discountTotal,
    shippingTotal,
    packagingTotal,
    taxTotal,
    grandTotal,
  };
}
