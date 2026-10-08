import type { ProductMediaItem } from "../products/media";

export type CartStatus = "active" | "checked_out" | "abandoned";

export type CartOwner = {
  customerId?: string;
  guestToken?: string;
};

export type CartItem = {
  id: string;
  cartId: string;
  productId: string;
  skuId: string;
  productName: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  currency: string;
  media: ProductMediaItem[];
  addedAt: string;
  updatedAt: string;
};

export type Cart = {
  id: string;
  customerId?: string;
  guestToken?: string;
  status: CartStatus;
  currency: string;
  items: CartItem[];
  createdAt: string;
  updatedAt: string;
};
