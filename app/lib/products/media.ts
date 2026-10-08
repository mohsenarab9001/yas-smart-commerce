export type ProductMediaType = "image" | "video";

export type ProductMediaStatus = "active" | "hidden";

export type ProductMediaItem = {
  id: string;
  productId: string;
  type: ProductMediaType;
  url: string;
  thumbnailUrl?: string;
  alt?: string;
  mimeType?: string;
  width?: number;
  height?: number;
  durationSeconds?: number;
  sortOrder: number;
  status: ProductMediaStatus;
};
