import type { InventoryItem } from "./types";
import type { Warehouse } from "./warehouse";
import { productSkus } from "../products/seed";

const DATE = "2026-01-01T00:00:00.000Z";

export const warehouses: Warehouse[] = [
  {
    id: "main-warehouse",
    name: "انبار اصلی",
    code: "MAIN",
    status: "active",
  },
];

export const inventoryItems: InventoryItem[] = productSkus.map((sku) => ({
  id: `inventory-${sku.id}`,
  warehouseId: "main-warehouse",
  productId: sku.productId,
  skuId: sku.id,
  quantity: 10,
  reservedQuantity: 0,
  status: "available",
  updatedAt: DATE,
}));
