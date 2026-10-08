"use client";

import { useState } from "react";
import { useAudio } from "../../lib/audio/AudioProvider";
import { addProductToCart } from "../../lib/cart/productService";
import {
  browserCartRepository,
  getBrowserCartOwner,
} from "../../lib/cart/browserRepository";

type AddToCartButtonProps = {
  productId: string;
  skuId: string;
};

export default function AddToCartButton({
  productId,
  skuId,
}: AddToCartButtonProps) {
  const { play } = useAudio();
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [added, setAdded] = useState(false);

  function decreaseQuantity() {
    setQuantity((current) => Math.max(1, current - 1));
    setAdded(false);
  }

  function increaseQuantity() {
    setQuantity((current) => current + 1);
    setAdded(false);
  }

  async function handleAddToCart() {
    if (isAdding) {
      return;
    }

    setIsAdding(true);
    setAdded(false);

    try {
      await addProductToCart(
        {
          productId,
          skuId,
          quantity,
        },
        getBrowserCartOwner(),
        browserCartRepository,
      );

      play("cart-add");
      setAdded(true);
    } catch (error) {
      console.error("[YAS CART ERROR]", error);
      play("error");
    } finally {
      setIsAdding(false);
    }
  }

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between gap-4">
        <span className="text-sm font-semibold text-white/55">
          تعداد
        </span>

        <div className="flex items-center overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04]">
          <button
            type="button"
            onClick={decreaseQuantity}
            disabled={quantity === 1 || isAdding}
            aria-label="کاهش تعداد"
            className="flex h-12 w-12 items-center justify-center text-xl font-bold text-white/70 transition hover:bg-white/[0.08] hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
          >
            −
          </button>

          <span
            aria-live="polite"
            className="flex h-12 min-w-12 items-center justify-center border-x border-white/10 px-3 text-base font-black text-white"
          >
            {quantity}
          </span>

          <button
            type="button"
            onClick={increaseQuantity}
            disabled={isAdding}
            aria-label="افزایش تعداد"
            className="flex h-12 w-12 items-center justify-center text-xl font-bold text-white/70 transition hover:bg-white/[0.08] hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
          >
            +
          </button>
        </div>
      </div>

      <button
        type="button"
        onClick={handleAddToCart}
        disabled={isAdding}
        className="mt-4 w-full rounded-2xl bg-violet-500 px-6 py-4 text-base font-black text-white transition hover:bg-violet-400 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isAdding
          ? "در حال افزودن..."
          : added
            ? `به سبد اضافه شد ✓ (${quantity})`
            : "افزودن به سبد خرید"}
      </button>
    </div>
  );
}
