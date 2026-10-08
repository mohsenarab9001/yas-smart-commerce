export type InventoryStatus = "available" | "reserved" | "damaged" | "blocked";

export type { Warehouse, WarehouseStatus } from "./warehouse";

export type InventoryItem = {
  id: string;
  warehouseId: string;
  productId: string;
  skuId: string;
  quantity: number;
  reservedQuantity: number;
  status: InventoryStatus;
  updatedAt: string;
};

export type StockMovementType =
  | "purchase"
  | "sale"
  | "return"
  | "adjustment"
  | "transfer"
  | "damage"
  | "reservation"
  | "release";

export type StockMovement = {
  id: string;
  warehouseId: string;
  productId: string;
  skuId: string;
  type: StockMovementType;
  quantity: number;
  referenceId?: string;
  note?: string;
  createdAt: string;
};
