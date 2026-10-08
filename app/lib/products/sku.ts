export type ProductSkuStatus = "active" | "inactive";

export type ProductSkuAttribute = {
  name: string;
  value: string;
};

export type ProductSku = {
  id: string;
  productId: string;
  sku: string;
  barcode?: string;
  attributes: ProductSkuAttribute[];
  status: ProductSkuStatus;
  createdAt: string;
  updatedAt: string;
};
