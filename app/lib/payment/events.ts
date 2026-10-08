export type PaymentEventType =
  | "payment_authorized"
  | "payment_paid"
  | "payment_failed"
  | "payment_cancelled"
  | "payment_refunded";

export type PaymentEvent = {
  id: string;
  paymentIntentId: string;
  attemptId?: string;
  provider: string;
  providerEventId: string;
  type: PaymentEventType;
  verified: boolean;
  processed: boolean;
  rawReference?: string;
  createdAt: string;
  processedAt?: string;
};
