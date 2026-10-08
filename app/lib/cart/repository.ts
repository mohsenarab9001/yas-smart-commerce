import type { Cart } from "./types";

export type CartOwnerQuery = {
  customerId?: string;
  guestToken?: string;
};

export type CartRepository = {
  getById(cartId: string): Promise<Cart | undefined>;
  getActive(owner: CartOwnerQuery): Promise<Cart | undefined>;
  save(cart: Cart): Promise<void>;
  delete(cartId: string): Promise<void>;
};
