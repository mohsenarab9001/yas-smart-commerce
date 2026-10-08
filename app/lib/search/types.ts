import type { Locale } from "../i18n/config";
import type { ProductMediaItem } from "../products/media";

export type SearchSort =
  | "relevance"
  | "price-asc"
  | "price-desc"
  | "newest";

export type SearchFilters = {
  categoryId?: string;
  brandId?: string;
  minPrice?: number;
  maxPrice?: number;
  currency?: string;
};

export type SearchQuery = {
  query: string;
  locale: Locale;
  filters?: SearchFilters;
  sort?: SearchSort;
  page?: number;
  pageSize?: number;
};

export type SearchDocument = {
  productId: string;
  status: "draft" | "active" | "archived";

  categoryId: string;
  categoryName: string;

  brandId?: string;
  brandName?: string;

  name: string;
  description?: string;

  slug?: string;

  sku?: string;
  barcode?: string;

  searchableAttributes: Array<{
    name: string;
    value: string;
  }>;

  price?: {
    amount: number;
    currency: string;
    compareAtPrice?: number;
  };

  media: ProductMediaItem[];

  createdAt: string;
  updatedAt: string;
};

export type SearchResultItem = {
  productId: string;

  name: string;
  description?: string;

  categoryId: string;
  categoryName: string;

  brandId?: string;
  brandName?: string;

  sku?: string;

  price?: SearchDocument["price"];

  media: ProductMediaItem[];

  score: number;
  matchedFields: string[];
};

export type SearchResult = {
  query: string;
  locale: Locale;

  items: SearchResultItem[];

  total: number;

  page: number;
  pageSize: number;
  totalPages: number;
};
