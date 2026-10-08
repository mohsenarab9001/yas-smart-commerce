import Link from "next/link";
import { getRequestLocale } from "../lib/i18n/request";
import { listProducts } from "../lib/products/service";
import AddToCartButton from "../components/cart/AddToCartButton";

type ShopSort = "newest" | "price-asc" | "price-desc";

type ShopSearchParams = {
  sort?: string;
};

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<ShopSearchParams>;
}) {
  const locale = await getRequestLocale();
  const params = await searchParams;
  const sort: ShopSort | undefined =
    params.sort === "newest" ||
    params.sort === "price-asc" ||
    params.sort === "price-desc"
      ? params.sort
      : undefined;

  const products = listProducts({
    status: "active",
    locale,
    sort,
  });
  const isFa = locale === "fa";

  return (
    <main
      dir={isFa ? "rtl" : "ltr"}
      className="min-h-screen bg-[#171A21] px-4 py-10 text-white sm:px-6 lg:px-8"
    >
      <div className="mx-auto max-w-7xl">
        <Link
          href="/"
          className="text-sm font-semibold text-white/45 transition hover:text-white"
        >
          {isFa ? "← بازگشت به صفحه اصلی" : "← Back to home"}
        </Link>

        <div className="mb-10 mt-8">
          <p className="text-sm font-semibold text-violet-400">YAS</p>

          <h1 className="mt-2 text-4xl font-black tracking-tight sm:text-5xl">
            {isFa ? "فروشگاه" : "Shop"}
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-white/45 sm:text-base">
            {isFa
              ? "محصولات را بررسی کنید و محصول موردنظر خود را انتخاب کنید."
              : "Explore our products and choose what fits you best."}
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-2">
            <span className="mr-1 text-xs font-semibold text-white/35">
              {isFa ? "مرتب‌سازی:" : "Sort:"}
            </span>

            <Link
              href="/shop?sort=newest"
              className={`rounded-full border px-4 py-2 text-xs font-semibold transition ${
                sort === "newest"
                  ? "border-violet-400/40 bg-violet-500/15 text-violet-200"
                  : "border-white/10 bg-white/[0.03] text-white/50 hover:border-white/20 hover:text-white"
              }`}
            >
              {isFa ? "جدیدترین" : "Newest"}
            </Link>

            <Link
              href="/shop?sort=price-asc"
              className={`rounded-full border px-4 py-2 text-xs font-semibold transition ${
                sort === "price-asc"
                  ? "border-violet-400/40 bg-violet-500/15 text-violet-200"
                  : "border-white/10 bg-white/[0.03] text-white/50 hover:border-white/20 hover:text-white"
              }`}
            >
              {isFa ? "ارزان‌ترین" : "Price: Low to High"}
            </Link>

            <Link
              href="/shop?sort=price-desc"
              className={`rounded-full border px-4 py-2 text-xs font-semibold transition ${
                sort === "price-desc"
                  ? "border-violet-400/40 bg-violet-500/15 text-violet-200"
                  : "border-white/10 bg-white/[0.03] text-white/50 hover:border-white/20 hover:text-white"
              }`}
            >
              {isFa ? "گران‌ترین" : "Price: High to Low"}
            </Link>
          </div>
        </div>

        {products.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-white/[0.035] p-10 text-center">
            <p className="text-white/55">
              {isFa
                ? "Ø¯Ø± Ø­Ø§Ù„ Ø­Ø§Ø¶Ø± Ù…Ø­ØµÙˆÙ„ÛŒ Ø¨Ø±Ø§ÛŒ Ù†Ù…Ø§ÛŒØ´ ÙˆØ¬ÙˆØ¯ Ù†Ø¯Ø§Ø±Ø¯."
                : "There are no products available right now."}
            </p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => {
              const localization =
                product.localizations.find(
                  (item) => item.locale === locale,
                ) ?? product.localizations[0];

              const categoryLocalization =
                product.categoryLocalizations.find(
                  (item) => item.locale === locale,
                ) ?? product.categoryLocalizations[0];

              const sku =
                product.skus.find((item) => item.status === "active") ??
                product.skus[0];

              const price = sku
                ? product.prices.find(
                    (item) =>
                      item.skuId === sku.id && item.status === "active",
                  )
                : undefined;

              const image = product.media.find(
                (item) =>
                  item.type === "image" && item.status === "active",
              );

              const productName = localization?.name ?? product.id;
              const categoryName = categoryLocalization?.name ?? "";
              const currentPrice = price?.price ?? 0;
              const compareAtPrice = price?.compareAtPrice;

              const formatter = price
                ? new Intl.NumberFormat(isFa ? "fa-IR" : "en-US", {
                    style: "currency",
                    currency: price.currency,
                  })
                : null;

              return (
                <article
                  key={product.id}
                  className="group overflow-hidden rounded-3xl border border-white/[0.08] bg-white/[0.035] transition duration-300 hover:-translate-y-1 hover:border-violet-400/25"
                >
                  <Link href={`/product/${product.id}`} className="block">
                    <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-white/[0.08] via-white/[0.03] to-violet-500/[0.08]">
                      {compareAtPrice !== undefined &&
                        compareAtPrice > currentPrice && (
                          <div className="absolute left-4 top-4 z-10 rounded-full border border-white/10 bg-black/40 px-2.5 py-1 text-[10px] font-bold text-violet-300">
                            SALE
                          </div>
                        )}

                      {image ? (
                        <img
                          src={image.url}
                          alt={image.alt ?? productName}
                          loading="lazy"
                          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-6xl text-white/20">
                          <span aria-hidden="true">âœ¦</span>
                        </div>
                      )}
                    </div>

                    <div className="p-5">
                      <p className="text-xs font-medium text-white/35">
                        {categoryName}
                      </p>

                      <h2 className="mt-2 min-h-12 text-base font-bold text-white/90">
                        {productName}
                      </h2>

                      <div className="mt-4 flex items-end justify-between gap-3">
                        <div>
                          <span className="text-lg font-black text-white">
                            {formatter?.format(currentPrice) ?? "â€”"}
                          </span>

                          {compareAtPrice !== undefined &&
                            compareAtPrice > currentPrice &&
                            formatter && (
                              <span className="ml-2 text-xs text-white/25 line-through">
                                {formatter.format(compareAtPrice)}
                              </span>
                            )}
                        </div>

                        <span className="text-xs text-white/25">YAS</span>
                      </div>
                    </div>
                  </Link>

                  {sku && (
                    <div className="px-5 pb-5">
                      <AddToCartButton
                        productId={product.id}
                        skuId={sku.id}
                      />
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}

