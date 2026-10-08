"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { browserCartRepository, getBrowserCartOwner } from "../lib/cart/browserRepository";
import {
  removeCartItem,
  updateCartItemQuantity,
} from "../lib/cart/service";
import { calculateCartTotals } from "../lib/cart/totals";
import type { Cart } from "../lib/cart/types";

export default function CartPage() {
  const [cart, setCart] = useState<Cart | undefined>();
  const [isLoading, setIsLoading] = useState(true);

  async function loadCart() {
    setIsLoading(true);

    try {
      const activeCart =
        await browserCartRepository.getActive(getBrowserCartOwner());

      setCart(activeCart);
    } finally {
      setIsLoading(false);
    }
  }

  async function changeQuantity(
    itemId: string,
    quantity: number,
  ) {
    if (!cart || quantity < 1) {
      return;
    }

    const updatedCart =
      await updateCartItemQuantity(
        cart.id,
        itemId,
        quantity,
        getBrowserCartOwner(),
        browserCartRepository,
      );

    setCart(updatedCart);
  }

  async function handleRemoveItem(itemId: string) {
    if (!cart) {
      return;
    }

    const updatedCart =
      await removeCartItem(
        cart.id,
        itemId,
        getBrowserCartOwner(),
        browserCartRepository,
      );

    setCart(updatedCart);
  }

  useEffect(() => {
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

  if (isLoading) {
    return (
      <main className="min-h-screen bg-[#171A21] px-4 py-20 text-white">
        <div className="mx-auto max-w-4xl text-center text-white/50">
          Ø¯Ø± Ø­Ø§Ù„ Ø¨Ø§Ø±Ú¯Ø°Ø§Ø±ÛŒ Ø³Ø¨Ø¯ Ø®Ø±ÛŒØ¯...
        </div>
      </main>
    );
  }

  const totals = cart
    ? calculateCartTotals(cart)
    : {
        itemCount: 0,
        subtotal: 0,
      };

  return (
    <main className="min-h-screen bg-[#171A21] text-white">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <Link
          href="/shop"
          className="text-sm text-white/50 transition hover:text-white"
        >
          â† Ø§Ø¯Ø§Ù…Ù‡ Ø®Ø±ÛŒØ¯
        </Link>

        <div className="mt-8">
          <h1 className="text-3xl font-black">
            Ø³Ø¨Ø¯ Ø®Ø±ÛŒØ¯
          </h1>

          <p className="mt-2 text-sm text-white/45">
            {totals.itemCount} Ú©Ø§Ù„Ø§ Ø¯Ø± Ø³Ø¨Ø¯ Ø®Ø±ÛŒØ¯
          </p>
        </div>

        {!cart || cart.items.length === 0 ? (
          <section className="mt-10 rounded-3xl border border-white/10 bg-white/[0.04] p-10 text-center">
            <div className="text-5xl">ðŸ›’</div>

            <h2 className="mt-5 text-xl font-black">
              Ø³Ø¨Ø¯ Ø®Ø±ÛŒØ¯ Ø´Ù…Ø§ Ø®Ø§Ù„ÛŒ Ø§Ø³Øª
            </h2>

            <p className="mt-3 text-sm text-white/45">
              Ù…Ø­ØµÙˆÙ„Ø§Øª Ù…ÙˆØ±Ø¯Ù†Ø¸Ø±ØªØ§Ù† Ø±Ø§ Ø¨Ù‡ Ø³Ø¨Ø¯ Ø§Ø¶Ø§ÙÙ‡ Ú©Ù†ÛŒØ¯.
            </p>

            <Link
              href="/shop"
              className="mt-7 inline-flex rounded-2xl bg-violet-500 px-6 py-3 text-sm font-black transition hover:bg-violet-400"
            >
              Ø´Ø±ÙˆØ¹ Ø®Ø±ÛŒØ¯
            </Link>
          </section>
        ) : (
          <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_340px]">
            <section className="space-y-3">
              {cart.items.map((item) => (
                <article
                  key={item.id}
                  className="rounded-3xl border border-white/10 bg-white/[0.04] p-4"
                >
                  <div className="flex gap-4">
                    <div className="h-24 w-24 shrink-0 overflow-hidden rounded-2xl bg-white/[0.05]">
                      {item.media[0]?.type === "image" ? (
                        <img
                          src={item.media[0].url}
                          alt={item.media[0].alt ?? item.productName}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-xs text-white/20">
                          YAS
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <h2 className="font-black">
                        {item.productName}
                      </h2>

                      <p className="mt-1 text-xs text-white/40">
                        SKU: {item.sku}
                      </p>

                      <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              void changeQuantity(
                                item.id,
                                item.quantity - 1,
                              )
                            }
                            disabled={item.quantity <= 1}
                            aria-label="Ú©Ø§Ù‡Ø´ ØªØ¹Ø¯Ø§Ø¯"
                            className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.05] text-lg transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-30"
                          >
                            âˆ’
                          </button>

                          <span className="flex h-9 min-w-10 items-center justify-center rounded-xl border border-white/10 px-2 text-sm font-bold">
                            {item.quantity}
                          </span>

                          <button
                            type="button"
                            onClick={() =>
                              void changeQuantity(
                                item.id,
                                item.quantity + 1,
                              )
                            }
                            aria-label="Ø§ÙØ²Ø§ÛŒØ´ ØªØ¹Ø¯Ø§Ø¯"
                            className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.05] text-lg transition hover:bg-white/10"
                          >
                            +
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              void handleRemoveItem(item.id)
                            }
                            className="mr-2 rounded-xl px-3 py-2 text-xs font-bold text-red-300 transition hover:bg-red-400/10"
                          >
                            Ø­Ø°Ù
                          </button>
                        </div>

                        <span className="font-black">
                          {(item.quantity * item.unitPrice).toLocaleString(
                            "en-US",
                          )}{" "}
                          {item.currency}
                        </span>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </section>

            <aside className="h-fit rounded-3xl border border-white/10 bg-white/[0.04] p-5 lg:sticky lg:top-6">
              <h2 className="text-lg font-black">
                Ø®Ù„Ø§ØµÙ‡ Ø³ÙØ§Ø±Ø´
              </h2>

              <div className="mt-6 flex items-center justify-between text-sm">
                <span className="text-white/45">
                  Ø¬Ù…Ø¹ Ú©Ø§Ù„Ø§Ù‡Ø§
                </span>

                <span className="font-bold">
                  {totals.subtotal.toLocaleString("en-US")}{" "}
                  {cart.currency}
                </span>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-4">
                <span className="font-black">
                  Ù…Ø¬Ù…ÙˆØ¹
                </span>

                <span className="text-xl font-black text-violet-300">
                  {totals.subtotal.toLocaleString("en-US")}{" "}
                  {cart.currency}
                </span>
              </div>

              <button
                type="button"
                disabled
                className="mt-6 w-full cursor-not-allowed rounded-2xl bg-white/10 px-5 py-4 text-sm font-black text-white/40"
              >
                Ø§Ø¯Ø§Ù…Ù‡ Ø¨Ù‡ Ù¾Ø±Ø¯Ø§Ø®Øª â€” Ø¨Ù‡â€ŒØ²ÙˆØ¯ÛŒ
              </button>
            </aside>
          </div>
        )}
      </div>
    </main>
  );
}

