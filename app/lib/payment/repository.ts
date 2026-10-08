import type {
  PaymentAttempt,
  PaymentIntent,
} from "./types";
import type { PaymentEvent } from "./events";

export type PaymentRepository = {
  getIntent(
    paymentIntentId: string,
  ): Promise<PaymentIntent | undefined>;

  getIntentByIdempotencyKey(
    idempotencyKey: string,
  ): Promise<PaymentIntent | undefined>;

  getIntentByProviderReference(
    provider: string,
    providerReference: string,
  ): Promise<PaymentIntent | undefined>;

  saveIntent(
    intent: PaymentIntent,
  ): Promise<void>;

  getAttempt(
    attemptId: string,
  ): Promise<PaymentAttempt | undefined>;

  getAttemptByPaymentIntentId(
    paymentIntentId: string,
  ): Promise<PaymentAttempt | undefined>;

  getAttemptByProviderReference(
    provider: string,
    providerReference: string,
  ): Promise<PaymentAttempt | undefined>;

  saveAttempt(
    attempt: PaymentAttempt,
  ): Promise<void>;

  getEventByProviderEventId(
    provider: string,
    providerEventId: string,
  ): Promise<PaymentEvent | undefined>;

  saveEvent(
    event: PaymentEvent,
  ): Promise<void>;

  markEventProcessed(
    eventId: string,
    processedAt: string,
  ): Promise<void>;
};
