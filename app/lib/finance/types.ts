export type FinancialTransactionType =
  | "sale"
  | "payment"
  | "refund"
  | "commission"
  | "payout"
  | "adjustment";

export type FinancialTransactionStatus =
  | "pending"
  | "completed"
  | "failed"
  | "cancelled";

export type FinancialTransaction = {
  id: string;
  type: FinancialTransactionType;
  status: FinancialTransactionStatus;
  orderId?: string;
  customerId?: string;
  vendorId?: string;
  amount: number;
  currency: string;
  referenceId?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
};

export type LedgerEntryType = "debit" | "credit";

export type LedgerEntry = {
  id: string;
  transactionId: string;
  accountId: string;
  type: LedgerEntryType;
  amount: number;
  currency: string;
  description?: string;
  createdAt: string;
};
