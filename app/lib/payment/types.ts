export type PaymentIntentStatus =
  | "pending"
  | "requires_action"
  | "authorized"
  | "paid"
  | "failed"
  | "cancelled"
  | "refunded"
  | "partially_refunded";

export type PaymentAttemptStatus =
  | "created"
  | "pending"
  | "authorized"
  | "paid"
  | "failed"
  | "cancelled";

export type PaymentIntent = {
  id: string;
  orderId: string;
  idempotencyKey: string;
  amount: number;
  currency: string;
  status: PaymentIntentStatus;
  provider?: string;
  providerReference?: string;
  createdAt: string;
  updatedAt: string;
};

export type PaymentAttempt = {
  id: string;
  paymentIntentId: string;
  provider: string;
  status: PaymentAttemptStatus;
  providerReference?: string;
  amount: number;
  currency: string;
  createdAt: string;
  updatedAt: string;
};
