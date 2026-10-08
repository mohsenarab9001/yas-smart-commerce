import type { ProductMediaItem } from "../products/media";
import type { Cart, CartItem } from "./types";
import type { CartOwnerQuery, CartRepository } from "./repository";
import { localCartRepository } from "./localRepository";

export type AddToCartInput = {
  productId: string;
  skuId: string;
  productName: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  currency: string;
  media?: ProductMediaItem[];
};

function createId(prefix: string): string {
  return `${prefix}-${crypto.randomUUID()}`;
}

function now(): string {
  return new Date().toISOString();
}

function validateQuantity(quantity: number): void {
  if (!Number.isInteger(quantity) || quantity <= 0) {
    throw new Error("Cart quantity must be a positive integer.");
  }
}

function validateOwner(owner: CartOwnerQuery): void {
  const hasCustomer = owner.customerId !== undefined;
  const hasGuest = owner.guestToken !== undefined;

  if (hasCustomer === hasGuest) {
    throw new Error(
      "Cart owner must contain exactly one customerId or guestToken.",
    );
  }

  if (hasCustomer && !owner.customerId?.trim()) {
    throw new Error("Cart customer ID is required.");
  }

  if (hasGuest && !owner.guestToken?.trim()) {
    throw new Error("Cart guest token is required.");
  }
}

function assertCartOwner(cart: Cart, owner: CartOwnerQuery): void {
  validateOwner(owner);

  if (owner.customerId !== undefined) {
    if (cart.customerId !== owner.customerId) {
      throw new Error("Cart does not belong to this customer.");
    }
    return;
  }

  if (cart.guestToken !== owner.guestToken) {
    throw new Error("Cart does not belong to this guest.");
  }
}

export async function getOrCreateCart(
  owner: CartOwnerQuery,
  repository: CartRepository = localCartRepository,
): Promise<Cart> {
  validateOwner(owner);

  const existing = await repository.getActive(owner);

  if (existing) {
    return existing;
  }

  const timestamp = now();

  const cart: Cart = {
    id: createId("cart"),
    customerId: owner.customerId,
    guestToken: owner.guestToken,
    status: "active",
    currency: "USD",
    items: [],
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  await repository.save(cart);

  return cart;
}

export async function addToCart(
  input: AddToCartInput,
  owner: CartOwnerQuery,
  repository: CartRepository = localCartRepository,
): Promise<Cart> {
  validateQuantity(input.quantity);
  validateOwner(owner);

  const cart = await getOrCreateCart(owner, repository);
  assertCartOwner(cart, owner);

  if (cart.currency !== input.currency && cart.items.length > 0) {
    throw new Error("Cart currency cannot be changed while it contains items.");
  }

  const timestamp = now();

  const existingItem = cart.items.find(
    (item) =>
      item.productId === input.productId &&
      item.skuId === input.skuId,
  );

  if (existingItem) {
    existingItem.quantity += input.quantity;
    existingItem.unitPrice = input.unitPrice;
    existingItem.productName = input.productName;
    existingItem.sku = input.sku;
    existingItem.media = input.media ?? existingItem.media;
    existingItem.updatedAt = timestamp;
  } else {
    const item: CartItem = {
      id: createId("cart-item"),
      cartId: cart.id,
      productId: input.productId,
      skuId: input.skuId,
      productName: input.productName,
      sku: input.sku,
      quantity: input.quantity,
      unitPrice: input.unitPrice,
      currency: input.currency,
      media: input.media ?? [],
      addedAt: timestamp,
      updatedAt: timestamp,
    };

    cart.items.push(item);
  }

  cart.updatedAt = timestamp;
  await repository.save(cart);

  return cart;
}

export async function updateCartItemQuantity(
  cartId: string,
  itemId: string,
  quantity: number,
  owner: CartOwnerQuery,
  repository: CartRepository = localCartRepository,
): Promise<Cart> {
  validateQuantity(quantity);

  const cart = await repository.getById(cartId);

  if (!cart || cart.status !== "active") {
    throw new Error("Active cart not found.");
  }

  assertCartOwner(cart, owner);

  const item = cart.items.find((entry) => entry.id === itemId);

  if (!item) {
    throw new Error("Cart item not found.");
  }

  item.quantity = quantity;
  item.updatedAt = now();
  cart.updatedAt = item.updatedAt;

  await repository.save(cart);

  return cart;
}

export async function removeCartItem(
  cartId: string,
  itemId: string,
  owner: CartOwnerQuery,
  repository: CartRepository = localCartRepository,
): Promise<Cart> {
  const cart = await repository.getById(cartId);

  if (!cart || cart.status !== "active") {
    throw new Error("Active cart not found.");
  }

  assertCartOwner(cart, owner);

  const nextItems = cart.items.filter((item) => item.id !== itemId);

  if (nextItems.length === cart.items.length) {
    throw new Error("Cart item not found.");
  }

  cart.items = nextItems;
  cart.updatedAt = now();

  await repository.save(cart);

  return cart;
}

export async function clearCart(
  cartId: string,
  owner: CartOwnerQuery,
  repository: CartRepository = localCartRepository,
): Promise<Cart> {
  const cart = await repository.getById(cartId);

  if (!cart || cart.status !== "active") {
    throw new Error("Active cart not found.");
  }

  assertCartOwner(cart, owner);

  cart.items = [];
  cart.updatedAt = now();

  await repository.save(cart);

  return cart;
}
