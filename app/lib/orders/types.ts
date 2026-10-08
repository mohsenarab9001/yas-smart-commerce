import type { OrderAddressSnapshot } from "./address";
import type { OrderItemSnapshot } from "./itemSnapshot";
import type { OrderPriceSnapshot } from "./pricing";
import type { OrderPackagingSnapshot } from "./packaging";

export type OrderStatus =
  | "pending_payment"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "returned"
  | "refunded";

export type PaymentStatus =
  | "pending"
  | "authorized"
  | "paid"
  | "failed"
  | "refunded"
  | "partially_refunded";

export type OrderItem = OrderItemSnapshot &
  OrderPriceSnapshot & {
    id: string;
    orderId: string;
  };

export type Order = {
  id: string;
  orderNumber: string;
  idempotencyKey: string;
  customerId?: string;
  guestToken?: string;

  status: OrderStatus;
  paymentStatus: PaymentStatus;

  currency: string;

  subtotal: number;
  discountTotal: number;
  shippingTotal: number;
  packagingTotal: number;
  taxTotal: number;
  grandTotal: number;

  shippingAddress?: OrderAddressSnapshot;
  packaging?: OrderPackagingSnapshot;
  billingAddress?: OrderAddressSnapshot;

  inventoryReservationId?: string;
  paymentIntentId?: string;
  invoiceId?: string;

  items: OrderItem[];

  createdAt: string;
  updatedAt: string;
};
