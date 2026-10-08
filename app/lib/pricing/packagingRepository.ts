import type { PackagingType } from "./types";
import type { PackagingPriceOption } from "./packaging";

export type PackagingRepository = {
  getOption(
    type: PackagingType,
  ): Promise<PackagingPriceOption | undefined>;
};
