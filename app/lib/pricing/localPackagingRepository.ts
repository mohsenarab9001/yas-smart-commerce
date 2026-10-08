import type {
  PackagingPriceOption,
} from "./packaging";
import type {
  PackagingRepository,
} from "./packagingRepository";
import type {
  PackagingType,
} from "./types";

const options: PackagingPriceOption[] = [
  {
    type: "standard",
    name: "بسته‌بندی عادی",
    price: 0,
    active: true,
  },
  {
    type: "special",
    name: "بسته‌بندی ویژه",
    price: 0,
    active: true,
  },
  {
    type: "gift",
    name: "بسته‌بندی ویژه هدیه",
    price: 0,
    active: true,
  },
];

export const localPackagingRepository: PackagingRepository = {
  async getOption(type: PackagingType) {
    return options.find(
      (option) =>
        option.type === type &&
        option.active,
    );
  },
};
