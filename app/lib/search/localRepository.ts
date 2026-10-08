import type { Locale } from "../i18n/config";
import {
  categoryLocalizations,
  productCategories,
  productLocalizations,
  productPrices,
  productSeo,
  productSkus,
  products,
} from "../products/seed";
import type { SearchDocument } from "./types";
import type { SearchRepository } from "./repository";

function getLocalizedValue<T extends { locale: string }>(
  items: T[],
  locale: Locale,
): T | undefined {
  return (
    items.find((item) => item.locale === locale) ??
    items.find((item) => item.locale === "fa") ??
    items.find((item) => item.locale === "en")
  );
}

function getActivePrice(productId: string) {
  const sku = productSkus.find(
    (item) => item.productId === productId && item.status === "active",
  );

  if (!sku) {
    return undefined;
  }

  return productPrices.find(
    (item) => item.skuId === sku.id && item.status === "active",
  );
}

export const localSearchRepository: SearchRepository = {
  getDocuments(locale) {
    return products
      .filter((product) => product.status === "active")
      .map((product): SearchDocument | null => {
        const category = productCategories.find(
          (item) => item.id === product.categoryId,
        );

        if (!category || category.status !== "active") {
          return null;
        }

        const categoryLocalization = getLocalizedValue(
          categoryLocalizations.filter(
            (item) => item.categoryId === category.id,
          ),
          locale,
        );

        const localization = getLocalizedValue(
          productLocalizations.filter(
            (item) => item.productId === product.id,
          ),
          locale,
        );

        if (!localization || !categoryLocalization) {
          return null;
        }

        const sku = productSkus.find(
          (item) =>
            item.productId === product.id && item.status === "active",
        );

        const price = getActivePrice(product.id);

        const seo = productSeo.find(
          (item) =>
            item.productId === product.id && item.locale === locale,
        );

        return {
          productId: product.id,
          status: product.status,
          categoryId: product.categoryId,
          categoryName: categoryLocalization.name,
          name: localization.name,
          description: localization.description,
          slug: seo?.slug,
          sku: sku?.sku,
          barcode: sku?.barcode,
          searchableAttributes: [
            ...productLocalizations
              .filter((item) => item.productId === product.id)
              .flatMap((item) => [
                { name: "product-name", value: item.name },
                ...(item.shortDescription
                  ? [{ name: "product-short-description", value: item.shortDescription }]
                  : []),
                ...(item.description
                  ? [{ name: "product-description", value: item.description }]
                  : []),
              ]),
            ...categoryLocalizations
              .filter((item) => item.categoryId === category.id)
              .map((item) => ({
                name: "category-name",
                value: item.name,
              })),
            ...(seo?.slug ? [{ name: "seo-slug", value: seo.slug }] : []),
            ...(sku?.sku ? [{ name: "sku", value: sku.sku }] : []),
            ...(sku?.barcode ? [{ name: "barcode", value: sku.barcode }] : []),
          ],
          price: price
            ? {
                amount: price.price,
                currency: price.currency,
                compareAtPrice: price.compareAtPrice,
              }
            : undefined,
          media: [],
          createdAt: product.createdAt,
          updatedAt: product.updatedAt,
        };
      })
      .filter((document): document is SearchDocument => document !== null);
  },
};
