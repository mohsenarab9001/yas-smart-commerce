export type SoundEvent =
  | "click"
  | "menu-open"
  | "search"
  | "success"
  | "error"
  | "cart-add"
  | "notification";

export type AudioSettings = {
  enabled: boolean;
  volume: number;
};
