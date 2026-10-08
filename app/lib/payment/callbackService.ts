import type { PaymentEvent } from "./events";
import type { PaymentRepository } from "./repository";
import { localPaymentRepository } from "./localRepository";
import type {
  PaymentCallbackInput,
  PaymentCallbackResult,
  PaymentCallbackDependencies,
} from "./callback";
import { getPaymentEventType } from "./eventType";
import { assertPaymentTransition } from "./transition";

function createId(prefix: string): string {
  return `${prefix}-${crypto.randomUUID()}`;
}

function now(): string {
  return new Date().toISOString();
}

export async function processPaymentCallback(
  input: PaymentCallbackInput,
  dependencies: PaymentCallbackDependencies,
  repository: PaymentRepository =
    localPaymentRepository,
): Promise<PaymentCallbackResult> {
  if (!input.provider.trim()) {
    throw new Error("Payment provider is required.");
  }

  if (!input.providerEventId.trim()) {
    throw new Error(
      "Payment provider event ID is required.",
    );
  }

  if (!input.providerReference.trim()) {
    throw new Error(
      "Payment provider reference is required.",
    );
  }

  const existingEvent =
    await repository.getEventByProviderEventId(
      input.provider,
      input.providerEventId,
    );

  if (existingEvent?.processed) {
    return {
      eventId: existingEvent.id,
      paymentIntentId: existingEvent.paymentIntentId,
      type: existingEvent.type,
      processed: true,
    };
  }

  const intent =
    await repository.getIntentByProviderReference(
      input.provider,
      input.providerReference,
    );

  if (!intent) {
    throw new Error(
      "Payment intent not found for provider reference.",
    );
  }

  const attempt =
    await repository.getAttemptByPaymentIntentId(
      intent.id,
    );

  if (!attempt) {
    throw new Error(
      "Payment attempt not found for payment intent.",
    );
  }

  if (
    attempt.providerReference !==
    input.providerReference
  ) {
    throw new Error(
      "Payment provider reference does not match payment attempt.",
    );
  }

  const verification =
    await dependencies.provider.verifyCallback({
      provider: input.provider,
      providerReference: input.providerReference,
      providerEventId: input.providerEventId,
      payload: input.payload,
    });

  if (!verification.verified) {
    throw new Error(
      "Payment callback verification failed.",
    );
  }

  const type = getPaymentEventType(
    verification.status,
  );

  const event: PaymentEvent =
    existingEvent ?? {
      id: createId("payment-event"),
      paymentIntentId: intent.id,
      attemptId: attempt.id,
      provider: input.provider,
      providerEventId: input.providerEventId,
      type,
      verified: true,
      processed: false,
      rawReference: input.providerReference,
      createdAt: now(),
    };

  if (existingEvent) {
    if (
      existingEvent.paymentIntentId !== intent.id ||
      existingEvent.type !== type
    ) {
      throw new Error(
        "Payment event conflicts with existing payment state.",
      );
    }

    existingEvent.verified = true;
  } else {
    await repository.saveEvent(event);
  }

  const nextStatus =
    verification.status;

  assertPaymentTransition(
    intent.status,
    nextStatus,
  );

  intent.status = nextStatus;
  intent.updatedAt = now();

  if (nextStatus === "paid") {
    attempt.status = "paid";
  } else if (nextStatus === "authorized") {
    attempt.status = "authorized";
  } else if (nextStatus === "failed") {
    attempt.status = "failed";
  } else if (nextStatus === "cancelled") {
    attempt.status = "cancelled";
  }

  attempt.updatedAt = now();

  await repository.saveAttempt(attempt);
  await repository.saveIntent(intent);

  await repository.markEventProcessed(
    event.id,
    now(),
  );

  return {
    eventId: event.id,
    paymentIntentId: intent.id,
    type,
    processed: true,
  };
}
