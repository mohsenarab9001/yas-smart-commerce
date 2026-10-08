import type {
  PaymentAttempt,
  PaymentIntent,
} from "./types";

export type PaymentCreateRequest = {
  paymentIntent: PaymentIntent;
  attempt: PaymentAttempt;
  returnUrl?: string;
};

export type PaymentCreateResult = {
  provider: string;
  providerReference: string;
  checkoutUrl?: string;
  requiresAction: boolean;
};

export type PaymentVerifyRequest = {
  provider: string;
  providerReference: string;
  providerEventId: string;
  payload: unknown;
};

export type PaymentVerifyResult = {
  verified: boolean;
  status:
    | "authorized"
    | "paid"
    | "failed"
    | "cancelled"
    | "refunded";
};

export type PaymentProvider = {
  createPayment(
    request: PaymentCreateRequest,
  ): Promise<PaymentCreateResult>;

  verifyCallback(
    request: PaymentVerifyRequest,
  ): Promise<PaymentVerifyResult>;
};
