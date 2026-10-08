import type { ProductRepository } from "../products/repository";
import { localProductRepository } from "../products/localRepository";
import type { PackagingRepository } from "./packagingRepository";
import { localPackagingRepository } from "./localPackagingRepository";
import type {
  PricingRequest,
  PricingResult,
  PricedItem,
} from "./types";

export type PricingDependencies = {
  products: ProductRepository;
  packaging: PackagingRepository;
};

const defaultDependencies: PricingDependencies = {
  products: localProductRepository,
  packaging: localPackagingRepository,
};

function validateRequest(input: PricingRequest): void {
  if (!input.currency.trim()) {
    throw new Error("Pricing currency is required.");
  }

  if (input.items.length === 0) {
    throw new Error("Pricing requires at least one item.");
  }

  for (const item of input.items) {
    if (!item.productId || !item.skuId) {
      throw new Error("Pricing item identifiers are required.");
    }

    if (!Number.isInteger(item.quantity) || item.quantity <= 0) {
      throw new Error(
        "Pricing item quantity must be a positive integer.",
      );
    }
  }
}

function isPriceCurrentlyValid(
  price: {
    status: "active" | "scheduled" | "expired";
    startsAt?: string;
    endsAt?: string;
  },
  now: Date,
): boolean {
  if (price.status !== "active") {
    return false;
  }

  if (price.startsAt && new Date(price.startsAt) > now) {
    return false;
  }

  if (price.endsAt && new Date(price.endsAt) <= now) {
    return false;
  }

  return true;
}

export async function calculatePricing(
  input: PricingRequest,
  dependencies: PricingDependencies = defaultDependencies,
): Promise<PricingResult> {
  validateRequest(input);

  const now = new Date();
  const pricedItems: PricedItem[] = [];

  for (const item of input.items) {
    const product = dependencies.products.getById(item.productId);

    if (!product) {
      throw new Error(
        `Product not found: ${item.productId}`,
      );
    }

    const sku = product.skus.find(
      (candidate) =>
        candidate.id === item.skuId &&
        candidate.productId === item.productId &&
        candidate.status === "active",
    );

    if (!sku) {
      throw new Error(
        `Active SKU not found: ${item.skuId}`,
      );
    }

    const price = product.prices.find(
      (candidate) =>
        candidate.skuId === sku.id &&
        candidate.currency === input.currency &&
        candidate.price >= 0 &&
        isPriceCurrentlyValid(candidate, now),
    );

    if (!price) {
      throw new Error(
        `Active price not found for SKU: ${item.skuId}`,
      );
    }

    const subtotal = price.price * item.quantity;

    pricedItems.push({
      productId: product.id,
      skuId: sku.id,
      quantity: item.quantity,
      unitPrice: price.price,
      subtotal,
      currency: price.currency,
    });
  }

  const subtotal = pricedItems.reduce(
    (total, item) => total + item.subtotal,
    0,
  );

  const packaging = await dependencies.packaging.getOption(
    input.options.packagingType,
  );

  if (!packaging) {
    throw new Error(
      "Selected packaging option is unavailable.",
    );
  }

  const discountTotal = 0;
  const shippingTotal = 0;
  const packagingTotal = packaging.price;
  const taxTotal = 0;

  const grandTotal = Math.max(
    0,
    subtotal -
      discountTotal +
      shippingTotal +
      packagingTotal +
      taxTotal,
  );

  return {
    items: pricedItems,
    subtotal,
    discountTotal,
    shippingTotal,
    packagingTotal,
    taxTotal,
    grandTotal,
  };
}
