export type PricingItemInput = {
  productId: string;
  skuId: string;
  quantity: number;
};

export type PricingRequest = {
  items: PricingItemInput[];
  currency: string;
  options: PricingOptions;
};

export type PackagingType =
  | "standard"
  | "special"
  | "gift";

export type PricingOptions = {
  packagingType: PackagingType;
};

export type PricedItem = {
  productId: string;
  skuId: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  currency: string;
};

export type PricingResult = {
  items: PricedItem[];
  subtotal: number;
  discountTotal: number;
  shippingTotal: number;
  packagingTotal: number;
  taxTotal: number;
  grandTotal: number;
};
