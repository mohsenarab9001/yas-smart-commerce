import type { PaymentEventType } from "./events";
import type { PaymentProvider } from "./provider";

export type PaymentCallbackInput = {
  provider: string;
  providerEventId: string;
  providerReference: string;
  payload: unknown;
};

export type PaymentCallbackResult = {
  eventId: string;
  paymentIntentId: string;
  type: PaymentEventType;
  processed: boolean;
};

export type PaymentCallbackDependencies = {
  provider: PaymentProvider;
};
