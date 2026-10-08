export type OrderItemSnapshot = {
  productId: string;
  skuId: string;
  productName: string;
  sku: string;
  attributes: Record<string, string>;
  mediaUrl?: string;
};
