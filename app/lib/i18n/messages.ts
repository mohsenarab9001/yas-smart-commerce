import type { Locale } from "./config";

export const messages = {
  fa: {
    home: "خانه",
    shop: "فروشگاه",
    categories: "دسته‌بندی‌ها",
    offers: "پیشنهادها",
    search: "جستجو",
    cart: "سبد خرید",
    account: "حساب من",
    menu: "باز کردن منو",
    heroLabel: "فروشگاه هوشمند یاس",
    heroTitle: "خریدی ساده، هوشمند و مطمئن",
    heroDescription:
      "محصولات موردنیازتان را پیدا کنید، گزینه‌ها را مقایسه کنید و با تجربه‌ای سریع و مدرن خرید کنید.",
    heroButton: "مشاهده فروشگاه",
    heroSecondary: "مشاهده پیشنهادها",
    soundSettings: "تنظیمات صدا",
    siteSound: "صدای سایت",
    on: "فعال",
    off: "خاموش",
    volume: "بلندی صدا",
    toggleSound: "فعال یا غیرفعال کردن صدا",
    accountShort: "حساب",
  },

  en: {
    home: "Home",
    shop: "Shop",
    categories: "Categories",
    offers: "Offers",
    search: "Search",
    cart: "Cart",
    account: "My Account",
    menu: "Open menu",
    heroLabel: "YAS Smart Commerce",
    heroTitle: "A simpler, smarter way to shop",
    heroDescription:
      "Discover the products you need, compare your options, and enjoy a fast modern shopping experience.",
    heroButton: "Explore the shop",
    heroSecondary: "View offers",
    soundSettings: "Sound settings",
    siteSound: "Site sound",
    on: "On",
    off: "Off",
    volume: "Volume",
    toggleSound: "Toggle sound",
    accountShort: "Account",
  },
} satisfies Record<Locale, Record<string, string>>;

export type Messages = (typeof messages)[Locale];
