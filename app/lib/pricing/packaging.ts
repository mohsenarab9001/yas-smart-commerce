import type { PackagingType } from "./types";

export type PackagingPriceOption = {
  type: PackagingType;
  name: string;
  price: number;
  active: boolean;
};

export type PackagingPricingProvider = {
  getOption(
    type: PackagingType,
  ): Promise<PackagingPriceOption | undefined>;
};
