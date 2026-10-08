import type { InventoryItem } from "./types";

export type InventoryReservationStatus =
  | "active"
  | "confirmed"
  | "released"
  | "expired";

export type InventoryReservationItem = {
  id: string;
  reservationId: string;
  warehouseId: string;
  productId: string;
  skuId: string;
  quantity: number;
};

export type InventoryReservation = {
  id: string;
  idempotencyKey: string;
  requestFingerprint: string;
  orderId?: string;
  status: InventoryReservationStatus;
  items: InventoryReservationItem[];
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
};

export type InventoryReservationRepository = {
  getById(
    reservationId: string,
  ): Promise<InventoryReservation | undefined>;

  getByIdempotencyKey(
    idempotencyKey: string,
  ): Promise<InventoryReservation | undefined>;

  save(
    reservation: InventoryReservation,
  ): Promise<void>;

  reserveAtomically(
    reservation: InventoryReservation,
    inventoryUpdates: InventoryItem[],
  ): Promise<void>;

  getInventoryItem(
    warehouseId: string,
    skuId: string,
  ): Promise<InventoryItem | undefined>;

  saveInventoryItem(
    item: InventoryItem,
  ): Promise<void>;
};
