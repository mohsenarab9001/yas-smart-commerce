import type { InventoryItem } from "./types";

export function getAvailableQuantity(item: InventoryItem): number {
  return Math.max(0, item.quantity - item.reservedQuantity);
}

export function canReserveQuantity(
  item: InventoryItem,
  quantity: number,
): boolean {
  if (!Number.isFinite(quantity) || quantity <= 0) {
    return false;
  }

  return getAvailableQuantity(item) >= quantity;
}
