import type { Order } from "./types";

export type OrderRepository = {
  getById(
    orderId: string,
  ): Promise<Order | undefined>;

  getByIdempotencyKey(
    idempotencyKey: string,
  ): Promise<Order | undefined>;

  save(
    order: Order,
  ): Promise<void>;
};
