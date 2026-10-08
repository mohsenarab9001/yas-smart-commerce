import type { InventoryItem } from "./types";
import type {
  InventoryReservation,
  InventoryReservationRepository,
} from "./reservation";
import type { Warehouse } from "./warehouse";
import { inventoryItems as seedInventoryItems, warehouses } from "./seed";

const reservations = new Map<string, InventoryReservation>();
const reservationsByIdempotencyKey = new Map<string, string>();
const inventoryItems = new Map<string, InventoryItem>();

for (const item of seedInventoryItems) {
  inventoryItems.set(`${item.warehouseId}:${item.skuId}`, {
    ...item,
  });
}

const warehouseItems = new Map<string, Warehouse>(
  warehouses.map((warehouse) => [warehouse.id, warehouse]),
);

function inventoryKey(
  warehouseId: string,
  skuId: string,
): string {
  return `${warehouseId}:${skuId}`;
}

export const localWarehouseRepository = {
  async getById(warehouseId: string): Promise<Warehouse | undefined> {
    const warehouse = warehouseItems.get(warehouseId);
    return warehouse ? { ...warehouse } : undefined;
  },

  async list(): Promise<Warehouse[]> {
    return [...warehouseItems.values()].map((warehouse) => ({
      ...warehouse,
    }));
  },
};

export const localInventoryRepository: InventoryReservationRepository = {
  async getById(reservationId) {
    return reservations.get(reservationId);
  },

  async getByIdempotencyKey(idempotencyKey) {
    const reservationId =
      reservationsByIdempotencyKey.get(idempotencyKey);

    if (!reservationId) {
      return undefined;
    }

    return reservations.get(reservationId);
  },

  async save(reservation) {
    reservations.set(reservation.id, reservation);
    reservationsByIdempotencyKey.set(
      reservation.idempotencyKey,
      reservation.id,
    );
  },

  async reserveAtomically(reservation, inventoryUpdates) {
    for (const item of inventoryUpdates) {
      inventoryItems.set(
        inventoryKey(item.warehouseId, item.skuId),
        { ...item },
      );
    }

    reservations.set(reservation.id, { ...reservation });
    reservationsByIdempotencyKey.set(
      reservation.idempotencyKey,
      reservation.id,
    );
  },

  async getInventoryItem(warehouseId, skuId) {
    const item = inventoryItems.get(
      inventoryKey(warehouseId, skuId),
    );

    return item ? { ...item } : undefined;
  },

  async saveInventoryItem(item) {
    inventoryItems.set(
      inventoryKey(item.warehouseId, item.skuId),
      { ...item },
    );
  },
};
