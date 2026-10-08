export type OrderPriceSnapshot = {
  currency: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
  discountTotal: number;
  taxTotal: number;
  totalPrice: number;
};
