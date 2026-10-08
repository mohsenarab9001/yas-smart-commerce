export type WarehouseStatus = "active" | "inactive";

export type Warehouse = {
  id: string;
  name: string;
  code: string;
  status: WarehouseStatus;
};

export type WarehouseRepository = {
  getById(warehouseId: string): Promise<Warehouse | undefined>;
  list(): Promise<Warehouse[]>;
};
