export type ProductAttributeValue = string | number | boolean;

export type ProductAttribute = {
  id: string;
  productId: string;
  name: string;
  value: ProductAttributeValue;
  unit?: string;
  sortOrder: number;
  searchable: boolean;
  filterable: boolean;
};

export type ProductSpecification = {
  id: string;
  productId: string;
  group: string;
  name: string;
  value: string;
  unit?: string;
  sortOrder: number;
};
