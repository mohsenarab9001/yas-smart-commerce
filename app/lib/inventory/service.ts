import type { InventoryItem } from "./types";
import {
  getAvailableQuantity,
} from "./availability";
import type {
  InventoryReservation,
  InventoryReservationItem,
  InventoryReservationRepository,
} from "./reservation";
import { localInventoryRepository } from "./localRepository";

export type ReserveInventoryItemInput = {
  productId: string;
  skuId: string;
  warehouseId: string;
  quantity: number;
};

export type ReserveInventoryInput = {
  idempotencyKey: string;
  orderId?: string;
  items: ReserveInventoryItemInput[];
  reservationMinutes?: number;
};

function createId(prefix: string): string {
  return `${prefix}-${crypto.randomUUID()}`;
}

function now(): string {
  return new Date().toISOString();
}

function validateQuantity(quantity: number): void {
  if (!Number.isInteger(quantity) || quantity <= 0) {
    throw new Error(
      "Inventory quantity must be a positive integer.",
    );
  }
}

function validateItems(
  items: ReserveInventoryItemInput[],
): void {
  if (items.length === 0) {
    throw new Error(
      "At least one inventory item is required.",
    );
  }

  const seenInventoryKeys = new Set<string>();

  for (const item of items) {
    if (
      !item.productId ||
      !item.skuId ||
      !item.warehouseId
    ) {
      throw new Error(
        "Inventory item identifiers are required.",
      );
    }

    const inventoryKey =
      `${item.warehouseId}:${item.skuId}`;

    if (seenInventoryKeys.has(inventoryKey)) {
      throw new Error(
        `Duplicate inventory item for SKU ${item.skuId}.`,
      );
    }

    seenInventoryKeys.add(inventoryKey);

    validateQuantity(item.quantity);
  }
}

function getReservationMinutes(
  value?: number,
): number {
  const minutes = value ?? 15;

  if (
    !Number.isInteger(minutes) ||
    minutes <= 0 ||
    minutes > 24 * 60
  ) {
    throw new Error(
      "Reservation duration must be between 1 and 1440 minutes.",
    );
  }

  return minutes;
}

function cloneInventoryItem(
  item: InventoryItem,
): InventoryItem {
  return {
    ...item,
  };
}

function createRequestFingerprint(
  input: ReserveInventoryInput,
): string {
  const items = [...input.items]
    .map((item) => ({
      productId: item.productId,
      skuId: item.skuId,
      warehouseId: item.warehouseId,
      quantity: item.quantity,
    }))
    .sort((a, b) =>
      `${a.warehouseId}:${a.skuId}`.localeCompare(
        `${b.warehouseId}:${b.skuId}`,
      ),
    );

  return JSON.stringify({
    orderId: input.orderId ?? null,
    reservationMinutes: input.reservationMinutes ?? 15,
    items,
  });
}

export async function reserveInventory(
  input: ReserveInventoryInput,
  repository: InventoryReservationRepository =
    localInventoryRepository,
): Promise<InventoryReservation> {
  if (!input.idempotencyKey.trim()) {
    throw new Error(
      "Inventory reservation idempotency key is required.",
    );
  }

  validateItems(input.items);

  const reservationMinutes =
    getReservationMinutes(
      input.reservationMinutes,
    );

  const requestFingerprint =
    createRequestFingerprint(input);

  const existing =
    await repository.getByIdempotencyKey(
      input.idempotencyKey,
    );

  if (existing) {
    if (existing.requestFingerprint !== requestFingerprint) {
      throw new Error(
        "Inventory reservation idempotency key was reused with a different request.",
      );
    }

    return existing;
  }

  const timestamp = now();

  const inventoryItems: InventoryItem[] = [];

  for (const requested of input.items) {
    const inventory =
      await repository.getInventoryItem(
        requested.warehouseId,
        requested.skuId,
      );

    if (!inventory) {
      throw new Error(
        `Inventory not found for SKU ${requested.skuId}.`,
      );
    }

    if (
      inventory.productId !== requested.productId ||
      inventory.status !== "available"
    ) {
      throw new Error(
        `Inventory is not available for SKU ${requested.skuId}.`,
      );
    }

    if (
      getAvailableQuantity(inventory) <
      requested.quantity
    ) {
      throw new Error(
        `Insufficient inventory for SKU ${requested.skuId}.`,
      );
    }

    inventoryItems.push(
      cloneInventoryItem(inventory),
    );
  }

  const reservationId = createId("reservation");

  const reservationItems: InventoryReservationItem[] =
    input.items.map((item) => ({
      id: createId("reservation-item"),
      reservationId,
      warehouseId: item.warehouseId,
      productId: item.productId,
      skuId: item.skuId,
      quantity: item.quantity,
    }));

  const inventoryUpdates = inventoryItems.map(
    (inventory, index) => {
      const requested = input.items[index];

      return {
        ...inventory,
        reservedQuantity:
          inventory.reservedQuantity +
          requested.quantity,
        updatedAt: timestamp,
      };
    },
  );

  const expiresAt = new Date(
    Date.now() +
      reservationMinutes * 60 * 1000,
  ).toISOString();

  const reservation: InventoryReservation = {
    id: reservationId,
    idempotencyKey: input.idempotencyKey,
    requestFingerprint,
    orderId: input.orderId,
    status: "active",
    items: reservationItems,
    expiresAt,
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  await repository.reserveAtomically(
    reservation,
    inventoryUpdates,
  );

  return reservation;
}

export async function releaseInventoryReservation(
  reservationId: string,
  repository: InventoryReservationRepository =
    localInventoryRepository,
): Promise<InventoryReservation> {
  const reservation =
    await repository.getById(reservationId);

  if (!reservation) {
    throw new Error(
      "Inventory reservation not found.",
    );
  }

  if (
    reservation.status === "released" ||
    reservation.status === "expired"
  ) {
    return reservation;
  }

  if (reservation.status === "confirmed") {
    throw new Error(
      "Confirmed inventory reservation cannot be released.",
    );
  }

  const timestamp = now();

  for (const reservationItem of reservation.items) {
    const inventory =
      await repository.getInventoryItem(
        reservationItem.warehouseId,
        reservationItem.skuId,
      );

    if (!inventory) {
      throw new Error(
        `Inventory not found for SKU ${reservationItem.skuId}.`,
      );
    }

    inventory.reservedQuantity = Math.max(
      0,
      inventory.reservedQuantity -
        reservationItem.quantity,
    );

    inventory.updatedAt = timestamp;

    await repository.saveInventoryItem(
      inventory,
    );
  }

  reservation.status = "released";
  reservation.updatedAt = timestamp;

  await repository.save(reservation);

  return reservation;
}

export async function confirmInventoryReservation(
  reservationId: string,
  repository: InventoryReservationRepository =
    localInventoryRepository,
): Promise<InventoryReservation> {
  const reservation =
    await repository.getById(reservationId);

  if (!reservation) {
    throw new Error(
      "Inventory reservation not found.",
    );
  }

  if (reservation.status === "confirmed") {
    return reservation;
  }

  if (
    reservation.status === "released" ||
    reservation.status === "expired"
  ) {
    throw new Error(
      "Released or expired inventory reservation cannot be confirmed.",
    );
  }

  const timestamp = now();

  for (const reservationItem of reservation.items) {
    const inventory =
      await repository.getInventoryItem(
        reservationItem.warehouseId,
        reservationItem.skuId,
      );

    if (!inventory) {
      throw new Error(
        `Inventory not found for SKU ${reservationItem.skuId}.`,
      );
    }

    if (
      inventory.reservedQuantity <
      reservationItem.quantity
    ) {
      throw new Error(
        `Reserved inventory is insufficient for SKU ${reservationItem.skuId}.`,
      );
    }

    inventory.quantity = Math.max(
      0,
      inventory.quantity -
        reservationItem.quantity,
    );

    inventory.reservedQuantity = Math.max(
      0,
      inventory.reservedQuantity -
        reservationItem.quantity,
    );

    inventory.updatedAt = timestamp;

    await repository.saveInventoryItem(
      inventory,
    );
  }

  reservation.status = "confirmed";
  reservation.updatedAt = timestamp;

  await repository.save(reservation);

  return reservation;
}

export async function expireInventoryReservation(
  reservationId: string,
  repository: InventoryReservationRepository =
    localInventoryRepository,
): Promise<InventoryReservation> {
  const reservation =
    await repository.getById(reservationId);

  if (!reservation) {
    throw new Error(
      "Inventory reservation not found.",
    );
  }

  if (
    reservation.status === "released" ||
    reservation.status === "expired"
  ) {
    return reservation;
  }

  if (reservation.status === "confirmed") {
    throw new Error(
      "Confirmed inventory reservation cannot expire.",
    );
  }

  if (
    new Date(reservation.expiresAt).getTime() >
    Date.now()
  ) {
    throw new Error(
      "Inventory reservation has not expired yet.",
    );
  }

  const timestamp = now();

  for (const reservationItem of reservation.items) {
    const inventory =
      await repository.getInventoryItem(
        reservationItem.warehouseId,
        reservationItem.skuId,
      );

    if (!inventory) {
      throw new Error(
        `Inventory not found for SKU ${reservationItem.skuId}.`,
      );
    }

    inventory.reservedQuantity = Math.max(
      0,
      inventory.reservedQuantity -
        reservationItem.quantity,
    );

    inventory.updatedAt = timestamp;

    await repository.saveInventoryItem(
      inventory,
    );
  }

  reservation.status = "expired";
  reservation.updatedAt = timestamp;

  await repository.save(reservation);

  return reservation;
}
