"use client";

import { useEffect, useState } from "react";
import { browserCartRepository, getBrowserCartOwner } from "../../lib/cart/browserRepository";
import { calculateCartTotals } from "../../lib/cart/totals";

export default function CartBadge() {
  const [itemCount, setItemCount] = useState(0);

  useEffect(() => {
    async function loadCart() {
      const cart = await browserCartRepository.getActive(getBrowserCartOwner());

      setItemCount(
        cart ? calculateCartTotals(cart).itemCount : 0,
      );
    }

    void loadCart();

    const handleCartUpdate = () => {
      void loadCart();
    };

    window.addEventListener(
      "yas-cart-updated",
      handleCartUpdate,
    );

    return () => {
      window.removeEventListener(
        "yas-cart-updated",
        handleCartUpdate,
      );
    };
  }, []);

  return (
    <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-violet-500 px-1 text-[10px] font-bold shadow-lg shadow-violet-500/30">
      {itemCount}
    </span>
  );
}
