import type { Locale } from "../i18n/config";
import type { ProductAggregate } from "./types";

export type ProductSort =
  | "newest"
  | "price-asc"
  | "price-desc";

export type ProductListOptions = {
  locale?: Locale;
  categoryId?: string;
  brandId?: string;
  status?: ProductAggregate["status"];
  sort?: ProductSort;
};

export type ProductRepository = {
  getById(
    productId: string,
    locale?: Locale,
  ): ProductAggregate | undefined;

  list(
    options?: ProductListOptions,
  ): ProductAggregate[];
};
