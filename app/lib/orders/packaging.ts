export type OrderPackagingType =
  | "standard"
  | "special"
  | "gift";

export type OrderPackagingSnapshot = {
  type: OrderPackagingType;
  name: string;
  price: number;
  giftMessage?: string;
  senderName?: string;
  recipientName?: string;
};
