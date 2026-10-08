export type ProductPriceStatus =
  | "active"
  | "scheduled"
  | "expired";

export type ProductPrice = {
  id: string;
  skuId: string;
  currency: string;
  price: number;
  compareAtPrice?: number;
  costPrice?: number;
  minQuantity?: number;
  maxQuantity?: number;
  startsAt?: string;
  endsAt?: string;
  status: ProductPriceStatus;
};
