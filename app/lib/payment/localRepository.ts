import type { PaymentEvent } from "./events";
import type { PaymentRepository } from "./repository";
import type {
  PaymentAttempt,
  PaymentIntent,
} from "./types";

const intents = new Map<string, PaymentIntent>();
const intentsByIdempotencyKey = new Map<string, string>();

const attempts = new Map<string, PaymentAttempt>();
const attemptsByProviderReference = new Map<
  string,
  string
>();

const events = new Map<string, PaymentEvent>();
const eventsByProviderEventId = new Map<
  string,
  string
>();

function providerReferenceKey(
  provider: string,
  providerReference: string,
): string {
  return `${provider}:${providerReference}`;
}

function providerEventKey(
  provider: string,
  providerEventId: string,
): string {
  return `${provider}:${providerEventId}`;
}

export const localPaymentRepository: PaymentRepository = {
  async getIntent(paymentIntentId) {
    return intents.get(paymentIntentId);
  },

  async getIntentByIdempotencyKey(idempotencyKey) {
    const intentId =
      intentsByIdempotencyKey.get(idempotencyKey);

    if (!intentId) {
      return undefined;
    }

    return intents.get(intentId);
  },

  async getIntentByProviderReference(
    provider,
    providerReference,
  ) {
    for (const intent of intents.values()) {
      if (
        intent.provider === provider &&
        intent.providerReference === providerReference
      ) {
        return intent;
      }
    }

    return undefined;
  },

  async saveIntent(intent) {
    intents.set(intent.id, intent);

    intentsByIdempotencyKey.set(
      intent.idempotencyKey,
      intent.id,
    );
  },

  async getAttempt(attemptId) {
    return attempts.get(attemptId);
  },

  async getAttemptByPaymentIntentId(paymentIntentId) {
    for (const attempt of attempts.values()) {
      if (attempt.paymentIntentId === paymentIntentId) {
        return attempt;
      }
    }

    return undefined;
  },

  async getAttemptByProviderReference(
    provider,
    providerReference,
  ) {
    return attempts.get(
      attemptsByProviderReference.get(
        providerReferenceKey(
          provider,
          providerReference,
        ),
      ) ?? "",
    );
  },

  async saveAttempt(attempt) {
    attempts.set(attempt.id, attempt);

    if (attempt.providerReference) {
      attemptsByProviderReference.set(
        providerReferenceKey(
          attempt.provider,
          attempt.providerReference,
        ),
        attempt.id,
      );
    }
  },

  async getEventByProviderEventId(
    provider,
    providerEventId,
  ) {
    return events.get(
      eventsByProviderEventId.get(
        providerEventKey(
          provider,
          providerEventId,
        ),
      ) ?? "",
    );
  },

  async saveEvent(event) {
    events.set(event.id, event);

    eventsByProviderEventId.set(
      providerEventKey(
        event.provider,
        event.providerEventId,
      ),
      event.id,
    );
  },

  async markEventProcessed(eventId, processedAt) {
    const event = events.get(eventId);

    if (!event) {
      throw new Error(
        "Payment event not found.",
      );
    }

    event.processed = true;
    event.processedAt = processedAt;

    events.set(event.id, event);
  },
};
