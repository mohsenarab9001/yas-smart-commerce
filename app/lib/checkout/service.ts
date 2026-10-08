import type { CartRepository } from "../cart/repository";
import { localCartRepository } from "../cart/localRepository";
import { calculatePricing } from "../pricing/service";
import {
  reserveInventory,
  releaseInventoryReservation,
} from "../inventory/service";
import type { InventoryReservationRepository } from "../inventory/reservation";
import { localInventoryRepository } from "../inventory/localRepository";
import { createOrder } from "../orders/service";
import type { OrderItem } from "../orders/types";
import type { OrderAddressSnapshot } from "../orders/address";
import type { OrderRepository } from "../orders/repository";
import { localOrderRepository } from "../orders/localRepository";
import {
  createPaymentIntent,
} from "../payment/service";
import type { PaymentRepository } from "../payment/repository";
import { localPaymentRepository } from "../payment/localRepository";

export type CheckoutDependencies = {
  carts: CartRepository;
  orders: OrderRepository;
  payments: PaymentRepository;
  inventory: InventoryReservationRepository;
};

const defaultDependencies: CheckoutDependencies = {
  carts: localCartRepository,
  orders: localOrderRepository,
  payments: localPaymentRepository,
  inventory: localInventoryRepository,
};

export type CheckoutServiceInput = {
  cartId: string;
  customerId?: string;
  guestToken?: string;
  shippingAddress: OrderAddressSnapshot;
  billingAddress?: OrderAddressSnapshot;
  packagingType: "standard" | "special" | "gift";
  idempotencyKey: string;
  currency: string;
  paymentProvider: string;
};

function validateInput(input: CheckoutServiceInput): void {
  if (!input.cartId.trim()) {
    throw new Error("Checkout cart ID is required.");
  }

  if (!input.idempotencyKey.trim()) {
    throw new Error("Checkout idempotency key is required.");
  }

  if (!input.currency.trim()) {
    throw new Error("Checkout currency is required.");
  }

  if (!input.paymentProvider.trim()) {
    throw new Error("Checkout payment provider is required.");
  }

  const hasCustomer = Boolean(input.customerId?.trim());
  const hasGuest = Boolean(input.guestToken?.trim());

  if (hasCustomer === hasGuest) {
    throw new Error(
      "Checkout requires exactly one customer ID or guest token.",
    );
  }
}

function assertCartOwnership(
  cart: {
    customerId?: string;
    guestToken?: string;
  },
  input: CheckoutServiceInput,
): void {
  if (
    input.customerId !== undefined &&
    cart.customerId !== input.customerId
  ) {
    throw new Error("Cart does not belong to this customer.");
  }

  if (
    input.guestToken !== undefined &&
    cart.guestToken !== input.guestToken
  ) {
    throw new Error("Cart does not belong to this guest.");
  }
}

export async function createCheckout(
  input: CheckoutServiceInput,
  dependencies: CheckoutDependencies = defaultDependencies,
) {
  validateInput(input);

  const existingOrder =
    await dependencies.orders.getByIdempotencyKey(
      input.idempotencyKey,
    );

  if (existingOrder) {
    if (!existingOrder.paymentIntentId) {
      throw new Error(
        "Checkout already exists without a payment intent.",
      );
    }

    return {
      orderId: existingOrder.id,
      orderNumber: existingOrder.orderNumber,
      paymentIntentId: existingOrder.paymentIntentId,
      status: existingOrder.status,
      paymentStatus: existingOrder.paymentStatus,
      grandTotal: existingOrder.grandTotal,
      currency: existingOrder.currency,
    };
  }

  const cart = await dependencies.carts.getById(
    input.cartId,
  );

  if (!cart || cart.status !== "active") {
    throw new Error("Active cart not found.");
  }

  assertCartOwnership(cart, input);

  if (cart.items.length === 0) {
    throw new Error("Cannot checkout an empty cart.");
  }

  if (cart.currency !== input.currency) {
    throw new Error(
      "Checkout currency does not match the cart.",
    );
  }

  const pricing = await calculatePricing({
    currency: input.currency,
    items: cart.items.map((item) => ({
      productId: item.productId,
      skuId: item.skuId,
      quantity: item.quantity,
    })),
    options: {
      packagingType: input.packagingType,
    },
  });

  const reservation = await reserveInventory(
    {
      idempotencyKey: input.idempotencyKey,
      items: cart.items.map((item) => ({
        productId: item.productId,
        skuId: item.skuId,
        warehouseId: "main-warehouse",
        quantity: item.quantity,
      })),
    },
    dependencies.inventory,
  );

  try {
    const orderItems: OrderItem[] = pricing.items.map(
      (pricedItem) => {
        const cartItem = cart.items.find(
          (candidate) =>
            candidate.productId === pricedItem.productId &&
            candidate.skuId === pricedItem.skuId,
        );

        if (!cartItem) {
          throw new Error(
            `Cart item not found for SKU ${pricedItem.skuId}.`,
          );
        }

        return {
          id: `order-item-${crypto.randomUUID()}`,
          orderId: "",
          productId: pricedItem.productId,
          skuId: pricedItem.skuId,
          productName: cartItem.productName,
          sku: cartItem.sku,
          attributes: {},
          mediaUrl: cartItem.media[0]?.url,
          currency: pricedItem.currency,
          unitPrice: pricedItem.unitPrice,
          quantity: pricedItem.quantity,
          subtotal: pricedItem.subtotal,
          discountTotal: 0,
          taxTotal: 0,
          totalPrice: pricedItem.subtotal,
        };
      },
    );

    const order = await createOrder(
      {
        idempotencyKey: input.idempotencyKey,
        customerId: input.customerId,
        guestToken: input.guestToken,
        currency: input.currency,
        items: orderItems,
        shippingAddress: input.shippingAddress,
        billingAddress: input.billingAddress,
        packaging: {
          type: input.packagingType,
          name: input.packagingType,
          price: pricing.packagingTotal,
        },
        inventoryReservationId: reservation.id,
        totals: {
          subtotal: pricing.subtotal,
          discountTotal: pricing.discountTotal,
          shippingTotal: pricing.shippingTotal,
          packagingTotal: pricing.packagingTotal,
          taxTotal: pricing.taxTotal,
          grandTotal: pricing.grandTotal,
        },
      },
      dependencies.orders,
    );

    const payment = await createPaymentIntent(
      {
        orderId: order.id,
        idempotencyKey: input.idempotencyKey,
        amount: order.grandTotal,
        currency: order.currency,
        provider: input.paymentProvider,
      },
      dependencies.payments,
    );

    order.paymentIntentId = payment.intent.id;
    await dependencies.orders.save(order);

    return {
      orderId: order.id,
      orderNumber: order.orderNumber,
      paymentIntentId: payment.intent.id,
      status: order.status,
      paymentStatus: order.paymentStatus,
      grandTotal: order.grandTotal,
      currency: order.currency,
    };
  } catch (error) {
    try {
      await releaseInventoryReservation(
        reservation.id,
        dependencies.inventory,
      );
    } catch {
      // Preserve the original checkout error.
    }

    throw error;
  }
}
