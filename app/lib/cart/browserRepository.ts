import type { Cart } from "./types";
import type { CartOwnerQuery, CartRepository } from "./repository";

const STORAGE_KEY = "yas-cart";
const GUEST_TOKEN_KEY = "yas-guest-token";

function readCart(): Cart | undefined {
  if (typeof window === "undefined") return undefined;

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return undefined;

  try {
    return JSON.parse(raw) as Cart;
  } catch {
    window.localStorage.removeItem(STORAGE_KEY);
    return undefined;
  }
}

function createGuestToken(): string {
  return `guest-${crypto.randomUUID()}`;
}

export function getBrowserCartOwner(): CartOwnerQuery {
  if (typeof window === "undefined") {
    return { guestToken: "server-unavailable" };
  }

  let guestToken = window.localStorage.getItem(GUEST_TOKEN_KEY);

  if (!guestToken) {
    guestToken = createGuestToken();
    window.localStorage.setItem(GUEST_TOKEN_KEY, guestToken);
  }

  return { guestToken };
}

function matchesOwner(cart: Cart, owner: CartOwnerQuery): boolean {
  if (owner.customerId !== undefined) {
    return cart.customerId === owner.customerId;
  }

  return cart.guestToken === owner.guestToken;
}

export const browserCartRepository: CartRepository = {
  async getById(cartId) {
    const cart = readCart();
    return cart?.id === cartId ? cart : undefined;
  },

  async getActive(owner) {
    const cart = readCart();

    if (!cart || cart.status !== "active") {
      return undefined;
    }

    return matchesOwner(cart, owner) ? cart : undefined;
  },

  async save(cart) {
    if (typeof window === "undefined") return;

    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(cart),
    );

    window.dispatchEvent(
      new CustomEvent("yas-cart-updated"),
    );
  },

  async delete(cartId) {
    const cart = readCart();

    if (!cart || cart.id !== cartId) {
      return;
    }

    window.localStorage.removeItem(STORAGE_KEY);

    window.dispatchEvent(
      new CustomEvent("yas-cart-updated"),
    );
  },
};
