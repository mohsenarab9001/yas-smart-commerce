import type { Order } from "./types";
import type { OrderItem } from "./types";
import type { OrderRepository } from "./repository";
import { localOrderRepository } from "./localRepository";
import type { ValidatedOrderTotals } from "./validatedTotals";
import type { OrderPackagingSnapshot } from "./packaging";

export type CreateOrderInput = {
  idempotencyKey: string;
  customerId?: string;
  guestToken?: string;
  currency: string;
  items: OrderItem[];
  shippingAddress?: Order["shippingAddress"];
  billingAddress?: Order["billingAddress"];
  packaging?: OrderPackagingSnapshot;
  inventoryReservationId?: string;
  paymentIntentId?: string;
  totals: ValidatedOrderTotals;
};

function createId(prefix: string): string {
  return `${prefix}-${crypto.randomUUID()}`;
}

function createOrderNumber(): string {
  return `YAS-${Date.now()}-${crypto.randomUUID()
    .slice(0, 8)
    .toUpperCase()}`;
}

function now(): string {
  return new Date().toISOString();
}

function validateInput(
  input: CreateOrderInput,
): void {
  if (!input.idempotencyKey.trim()) {
    throw new Error(
      "Order idempotency key is required.",
    );
  }

  if (!input.currency.trim()) {
    throw new Error(
      "Order currency is required.",
    );
  }

  if (input.items.length === 0) {
    throw new Error(
      "Order must contain at least one item.",
    );
  }

  for (const item of input.items) {
    if (
      !item.productId ||
      !item.skuId ||
      !item.productName ||
      !item.sku
    ) {
      throw new Error(
        "Order item snapshot is incomplete.",
      );
    }

    if (
      !Number.isInteger(item.quantity) ||
      item.quantity <= 0
    ) {
      throw new Error(
        "Order item quantity must be a positive integer.",
      );
    }

    if (
      !Number.isFinite(item.unitPrice) ||
      item.unitPrice < 0
    ) {
      throw new Error(
        "Order item price is invalid.",
      );
    }

    if (
      !Number.isFinite(item.totalPrice) ||
      item.totalPrice < 0
    ) {
      throw new Error(
        "Order item total price is invalid.",
      );
    }
  }
}

export async function createOrder(
  input: CreateOrderInput,
  repository: OrderRepository =
    localOrderRepository,
): Promise<Order> {
  validateInput(input);

  const existing =
    await repository.getByIdempotencyKey(
      input.idempotencyKey,
    );

  if (existing) {
    return existing;
  }

  const totals = input.totals;

  const timestamp = now();

  const order: Order = {
    id: createId("order"),
    orderNumber: createOrderNumber(),
    idempotencyKey: input.idempotencyKey,
    customerId: input.customerId,
    guestToken: input.guestToken,
    status: "pending_payment",
    paymentStatus: "pending",
    currency: input.currency,
    subtotal: totals.subtotal,
    discountTotal: totals.discountTotal,
    shippingTotal: totals.shippingTotal,
    packagingTotal: totals.packagingTotal,
    taxTotal: totals.taxTotal,
    grandTotal: totals.grandTotal,
    shippingAddress: input.shippingAddress,
    billingAddress: input.billingAddress,
    packaging: input.packaging,
    inventoryReservationId: input.inventoryReservationId,
    paymentIntentId: input.paymentIntentId,
    items: input.items,
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  await repository.save(order);

  return order;
}
