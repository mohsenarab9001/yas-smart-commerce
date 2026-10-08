export type FinancialAccountType =
  | "asset"
  | "liability"
  | "revenue"
  | "expense"
  | "equity";

export type FinancialAccount = {
  id: string;
  code: string;
  name: string;
  type: FinancialAccountType;
  currency: string;
  parentAccountId?: string;
  status: "active" | "inactive";
};
