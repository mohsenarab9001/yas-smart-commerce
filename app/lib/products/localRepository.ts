import type { Locale } from "../i18n/config";
import {
  brandLocalizations,
  categoryLocalizations,
  productBrands,
  productCategories,
  productAttributes,
  productLocalizations,
  productMedia,
  productSpecifications,
  productPrices,
  products,
  productSeo,
  productSkus,
} from "./seed";
import type { ProductAggregate } from "./types";
import type {
  ProductListOptions,
  ProductRepository,
} from "./repository";

const productMap = new Map(
  products.map((product) => [product.id, product]),
);

const categoryMap = new Map(
  productCategories.map((category) => [category.id, category]),
);

const brandMap = new Map(
  productBrands.map((brand) => [brand.id, brand]),
);

const productLocalizationsMap = new Map(
  products.map((product) => [
    product.id,
    productLocalizations.filter(
      (localization) => localization.productId === product.id,
    ),
  ]),
);

const productSeoMap = new Map(
  products.map((product) => [
    product.id,
    productSeo.filter(
      (seo) => seo.productId === product.id,
    ),
  ]),
);

const productSkuMap = new Map(
  products.map((product) => [
    product.id,
    productSkus.filter(
      (sku) => sku.productId === product.id,
    ),
  ]),
);

const productPriceMap = new Map(
  products.map((product) => [
    product.id,
    productPrices.filter((price) =>
      productSkus.some(
        (sku) =>
          sku.productId === product.id &&
          sku.id === price.skuId,
      ),
    ),
  ]),
);

function getEffectiveProductPrice(
  product: ProductAggregate,
): number | undefined {
  const activeSkuIds = new Set(
    product.skus
      .filter((sku) => sku.status === "active")
      .map((sku) => sku.id),
  );

  const activePrices = product.prices.filter(
    (price) =>
      price.status === "active" &&
      activeSkuIds.has(price.skuId),
  );

  if (activePrices.length === 0) {
    return undefined;
  }

  return Math.min(
    ...activePrices.map((price) => price.price),
  );
}

function sortProducts(
  products: ProductAggregate[],
  sort?: ProductListOptions["sort"],
): ProductAggregate[] {
  if (!sort) {
    return products;
  }

  return [...products].sort((a, b) => {
    if (sort === "newest") {
      return (
        new Date(b.createdAt).getTime() -
        new Date(a.createdAt).getTime()
      );
    }

    const aPrice = getEffectiveProductPrice(a);
    const bPrice = getEffectiveProductPrice(b);

    if (aPrice === undefined && bPrice === undefined) {
      return 0;
    }

    if (aPrice === undefined) {
      return 1;
    }

    if (bPrice === undefined) {
      return -1;
    }

    return sort === "price-asc"
      ? aPrice - bPrice
      : bPrice - aPrice;
  });
}

function buildProductAggregate(
  productId: string,
): ProductAggregate | undefined {
  const product = productMap.get(productId);

  if (!product) {
    return undefined;
  }

  const category = categoryMap.get(product.categoryId);

  if (!category) {
    return undefined;
  }

  const brand = product.brandId
    ? brandMap.get(product.brandId)
    : undefined;

  return {
    ...product,
    category,
    categoryLocalizations: categoryLocalizations.filter(
      (localization) =>
        localization.categoryId === category.id,
    ),
    brand,
    brandLocalizations: brandLocalizations.filter(
      (localization) =>
        localization.brandId === product.brandId,
    ),
    localizations:
      productLocalizationsMap.get(product.id) ?? [],
    seo: productSeoMap.get(product.id) ?? [],
    skus: productSkuMap.get(product.id) ?? [],
    media: productMedia.filter(
      (media) => media.productId === product.id,
    ),
    attributes: productAttributes.filter(
      (attribute) => attribute.productId === product.id,
    ),
    specifications: productSpecifications.filter(
      (specification) => specification.productId === product.id,
    ),
    prices: productPriceMap.get(product.id) ?? [],
  };
}

export const localProductRepository: ProductRepository = {
  getById(productId: string, _locale?: Locale) {
    return buildProductAggregate(productId);
  },

  list(options?: ProductListOptions) {
    const result = products
      .filter((product) => {
        if (
          options?.categoryId &&
          product.categoryId !== options.categoryId
        ) {
          return false;
        }

        if (
          options?.brandId &&
          product.brandId !== options.brandId
        ) {
          return false;
        }

        if (
          options?.status &&
          product.status !== options.status
        ) {
          return false;
        }

        return true;
      })
      .map((product) => buildProductAggregate(product.id))
      .filter(
        (product): product is ProductAggregate =>
          product !== undefined,
      );

    return sortProducts(result, options?.sort);
  },
};
