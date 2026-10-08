import type { OrderAddressSnapshot } from "../orders/address";

export type CheckoutCustomer = {
  customerId?: string;
  guestToken?: string;
};

export type CheckoutInput = {
  cartId: string;
  customer: CheckoutCustomer;
  shippingAddress: OrderAddressSnapshot;
  billingAddress?: OrderAddressSnapshot;
  idempotencyKey: string;
};

export type CheckoutResult = {
  orderId: string;
  orderNumber: string;
  paymentIntentId: string;
  status: "pending_payment";
  paymentStatus: "pending";
};
