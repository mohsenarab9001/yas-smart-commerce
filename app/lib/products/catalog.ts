export type ProductCategoryStatus = "active" | "inactive";

export type ProductCategory = {
  id: string;
  parentId?: string;
  status: ProductCategoryStatus;
};

export type ProductCategoryLocalization = {
  categoryId: string;
  locale: string;
  name: string;
  slug: string;
  description?: string;
};

export type ProductBrand = {
  id: string;
  status: ProductCategoryStatus;
};

export type ProductBrandLocalization = {
  brandId: string;
  locale: string;
  name: string;
  slug: string;
  description?: string;
};

export type ProductLocalization = {
  productId: string;
  locale: string;
  name: string;
  shortDescription?: string;
  description?: string;
};

export type ProductSeo = {
  productId: string;
  locale: string;
  slug: string;
  metaTitle?: string;
  metaDescription?: string;
};
