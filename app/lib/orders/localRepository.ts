import type { Order } from "./types";
import type { OrderRepository } from "./repository";

const orders = new Map<string, Order>();
const ordersByIdempotencyKey = new Map<string, string>();

export const localOrderRepository: OrderRepository = {
  async getById(orderId) {
    return orders.get(orderId);
  },

  async getByIdempotencyKey(idempotencyKey) {
    const orderId =
      ordersByIdempotencyKey.get(
        idempotencyKey,
      );

    if (!orderId) {
      return undefined;
    }

    return orders.get(orderId);
  },

  async save(order) {
    orders.set(order.id, order);

    ordersByIdempotencyKey.set(
      order.idempotencyKey,
      order.id,
    );
  },
};
