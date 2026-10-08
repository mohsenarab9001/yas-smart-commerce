export type ProductStatus =
  | "draft"
  | "active"
  | "archived";

export type Product = {
  id: string;
  categoryId: string;
  brandId?: string;
  status: ProductStatus;
  createdAt: string;
  updatedAt: string;
};

import type {
  ProductBrand,
  ProductBrandLocalization,
  ProductCategory,
  ProductCategoryLocalization,
  ProductLocalization,
  ProductSeo,
} from "./catalog";
import type { ProductSku } from "./sku";
import type { ProductMediaItem } from "./media";
import type {
  ProductAttribute,
  ProductSpecification,
} from "./attributes";
import type { ProductPrice } from "./pricing";

export type ProductAggregate = Product & {
  category: ProductCategory;
  categoryLocalizations: ProductCategoryLocalization[];
  brand?: ProductBrand;
  brandLocalizations: ProductBrandLocalization[];
  localizations: ProductLocalization[];
  seo: ProductSeo[];
  skus: ProductSku[];
  media: ProductMediaItem[];
  attributes: ProductAttribute[];
  specifications: ProductSpecification[];
  prices: ProductPrice[];
};
