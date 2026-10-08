import type { Locale } from "../i18n/config";
import type {
  ProductListOptions,
  ProductRepository,
} from "./repository";
import { localProductRepository } from "./localRepository";
import type { ProductAggregate } from "./types";

export function getProduct(
  productId: string,
  locale?: Locale,
  repository: ProductRepository = localProductRepository,
): ProductAggregate | undefined {
  return repository.getById(productId, locale);
}

export function listProducts(
  options?: ProductListOptions,
  repository: ProductRepository = localProductRepository,
): ProductAggregate[] {
  return repository.list(options);
}
