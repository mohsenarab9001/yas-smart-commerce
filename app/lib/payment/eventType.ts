import type { PaymentEventType } from "./events";
import type { PaymentVerifyResult } from "./provider";

export function getPaymentEventType(
  status: PaymentVerifyResult["status"],
): PaymentEventType {
  switch (status) {
    case "authorized":
      return "payment_authorized";

    case "paid":
      return "payment_paid";

    case "failed":
      return "payment_failed";

    case "cancelled":
      return "payment_cancelled";

    case "refunded":
      return "payment_refunded";
  }
}
