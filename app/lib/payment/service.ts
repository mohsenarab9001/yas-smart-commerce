import type {
  PaymentRepository,
} from "./repository";
import {
  localPaymentRepository,
} from "./localRepository";
import type {
  PaymentAttempt,
  PaymentIntent,
} from "./types";

export type CreatePaymentIntentInput = {
  orderId: string;
  idempotencyKey: string;
  amount: number;
  currency: string;
  provider: string;
};

function createId(prefix: string): string {
  return `${prefix}-${crypto.randomUUID()}`;
}

function now(): string {
  return new Date().toISOString();
}

function validateInput(
  input: CreatePaymentIntentInput,
): void {
  if (!input.orderId.trim()) {
    throw new Error(
      "Payment order ID is required.",
    );
  }

  if (!input.idempotencyKey.trim()) {
    throw new Error(
      "Payment idempotency key is required.",
    );
  }

  if (
    !Number.isFinite(input.amount) ||
    input.amount <= 0
  ) {
    throw new Error(
      "Payment amount must be greater than zero.",
    );
  }

  if (!input.currency.trim()) {
    throw new Error(
      "Payment currency is required.",
    );
  }

  if (!input.provider.trim()) {
    throw new Error(
      "Payment provider is required.",
    );
  }
}

export async function createPaymentIntent(
  input: CreatePaymentIntentInput,
  repository: PaymentRepository =
    localPaymentRepository,
): Promise<{
  intent: PaymentIntent;
  attempt: PaymentAttempt;
}> {
  validateInput(input);

  const existing =
    await repository.getIntentByIdempotencyKey(
      input.idempotencyKey,
    );

  if (existing) {
    const attempt =
      await repository.getAttemptByPaymentIntentId(
        existing.id,
      );

    if (!attempt) {
      throw new Error(
        "Payment intent exists without a valid payment attempt.",
      );
    }

    return {
      intent: existing,
      attempt,
    };
  }

  const timestamp = now();

  const intent: PaymentIntent = {
    id: createId("payment-intent"),
    orderId: input.orderId,
    idempotencyKey: input.idempotencyKey,
    amount: input.amount,
    currency: input.currency,
    status: "pending",
    provider: input.provider,
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  const attempt: PaymentAttempt = {
    id: createId("payment-attempt"),
    paymentIntentId: intent.id,
    provider: input.provider,
    status: "created",
    amount: input.amount,
    currency: input.currency,
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  await repository.saveIntent(intent);
  await repository.saveAttempt(attempt);

  return {
    intent,
    attempt,
  };
}

export async function attachPaymentProviderReference(
  paymentIntentId: string,
  provider: string,
  providerReference: string,
  repository: PaymentRepository =
    localPaymentRepository,
): Promise<{
  intent: PaymentIntent;
  attempt: PaymentAttempt;
}> {
  if (!paymentIntentId.trim()) {
    throw new Error(
      "Payment intent ID is required.",
    );
  }

  if (!provider.trim()) {
    throw new Error(
      "Payment provider is required.",
    );
  }

  if (!providerReference.trim()) {
    throw new Error(
      "Payment provider reference is required.",
    );
  }

  const intent =
    await repository.getIntent(paymentIntentId);

  if (!intent) {
    throw new Error(
      "Payment intent not found.",
    );
  }

  if (
    intent.provider &&
    intent.provider !== provider
  ) {
    throw new Error(
      "Payment provider cannot be changed.",
    );
  }

  if (
    intent.status === "paid" ||
    intent.status === "refunded" ||
    intent.status === "partially_refunded"
  ) {
    throw new Error(
      "Payment provider reference cannot be changed after payment completion.",
    );
  }

  const attempt =
    await repository.getAttemptByPaymentIntentId(
      paymentIntentId,
    );

  if (!attempt) {
    throw new Error(
      "Payment attempt not found for payment intent.",
    );
  }

  if (attempt.provider !== provider) {
    throw new Error(
      "Payment provider cannot be changed.",
    );
  }

  if (attempt.providerReference) {
    if (
      attempt.providerReference ===
      providerReference
    ) {
      return {
        intent,
        attempt,
      };
    }

    throw new Error(
      "Payment attempt already has a different provider reference.",
    );
  }

  const existingAttempt =
    await repository.getAttemptByProviderReference(
      provider,
      providerReference,
    );

  if (
    existingAttempt &&
    existingAttempt.id !== attempt.id
  ) {
    throw new Error(
      "Payment provider reference is already linked to another payment.",
    );
  }

  const timestamp = now();

  attempt.providerReference =
    providerReference;
  attempt.status = "pending";
  attempt.updatedAt = timestamp;

  intent.provider = provider;
  intent.providerReference =
    providerReference;
  intent.updatedAt = timestamp;

  await repository.saveAttempt(attempt);
  await repository.saveIntent(intent);

  return {
    intent,
    attempt,
  };
}
