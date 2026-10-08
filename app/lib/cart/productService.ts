import type { Locale } from "../i18n/config";
import { getProduct } from "../products/service";
import { addToCart } from "./service";
import type { Cart } from "./types";
import type { CartOwnerQuery, CartRepository } from "./repository";
import { localCartRepository } from "./localRepository";

export type AddProductToCartInput = {
  productId: string;
  skuId: string;
  quantity: number;
  locale?: Locale;
};

function isPriceCurrentlyValid(
  price: {
    startsAt?: string;
    endsAt?: string;
  },
  now: number,
): boolean {
  if (price.startsAt && Date.parse(price.startsAt) > now) {
    return false;
  }

  if (price.endsAt && Date.parse(price.endsAt) <= now) {
    return false;
  }

  return true;
}

export async function addProductToCart(
  input: AddProductToCartInput,
  owner: CartOwnerQuery,
  repository: CartRepository = localCartRepository,
): Promise<Cart> {
  if (!Number.isInteger(input.quantity) || input.quantity <= 0) {
    throw new Error("Cart quantity must be a positive integer.");
  }

  const product = getProduct(input.productId, input.locale);

  if (!product || product.status !== "active") {
    throw new Error("Product is not available.");
  }

  const sku = product.skus.find(
    (item) =>
      item.id === input.skuId &&
      item.productId === input.productId &&
      item.status === "active",
  );

  if (!sku) {
    throw new Error("Product SKU is not available.");
  }

  const now = Date.now();

  const price = product.prices.find(
    (item) =>
      item.skuId === sku.id &&
      item.status === "active" &&
      isPriceCurrentlyValid(item, now) &&
      (item.minQuantity === undefined ||
        input.quantity >= item.minQuantity) &&
      (item.maxQuantity === undefined ||
        input.quantity <= item.maxQuantity),
  );

  if (!price) {
    throw new Error("Product price is not available.");
  }

  const localization =
    product.localizations.find(
      (item) => item.locale === input.locale,
    ) ??
    product.localizations.find(
      (item) => item.locale === "fa",
    ) ??
    product.localizations[0];

  if (!localization) {
    throw new Error("Product localization is not available.");
  }

  return addToCart(
    {
      productId: product.id,
      skuId: sku.id,
      productName: localization.name,
      sku: sku.sku,
      quantity: input.quantity,
      unitPrice: price.price,
      currency: price.currency,
      media: product.media,
    },
    owner,
    repository,
  );
}
