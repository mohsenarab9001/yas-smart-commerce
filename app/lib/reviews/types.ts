export type ReviewStatus =
  | "pending"
  | "published"
  | "rejected"
  | "hidden";

export type ProductReview = {
  id: string;
  productId: string;
  customerId: string;
  orderId?: string;
  rating: 1 | 2 | 3 | 4 | 5;
  title?: string;
  comment: string;
  verifiedPurchase: boolean;
  mediaIds: string[];
  helpfulCount: number;
  status: ReviewStatus;
  createdAt: string;
  updatedAt: string;
};
