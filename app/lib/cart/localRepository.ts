import type { Cart } from "./types";
import type { CartOwnerQuery, CartRepository } from "./repository";

const carts = new Map<string, Cart>();

function matchesOwner(cart: Cart, owner: CartOwnerQuery): boolean {
  if (owner.customerId !== undefined) {
    return cart.customerId === owner.customerId;
  }

  return cart.guestToken === owner.guestToken;
}

export const localCartRepository: CartRepository = {
  async getById(cartId) {
    return carts.get(cartId);
  },

  async getActive(owner) {
    for (const cart of carts.values()) {
      if (
        cart.status === "active" &&
        matchesOwner(cart, owner)
      ) {
        return cart;
      }
    }

    return undefined;
  },

  async save(cart) {
    carts.set(cart.id, cart);
  },

  async delete(cartId) {
    carts.delete(cartId);
  },
};
