import type { OrderStatus } from "./types";

export type OrderStatusEvent = {
  id: string;
  orderId: string;
  fromStatus?: OrderStatus;
  toStatus: OrderStatus;
  reason?: string;
  note?: string;
  createdAt: string;
};
