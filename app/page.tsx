import Link from "next/link";
import CartBadge from "./components/cart/CartBadge";
import { getRequestLocale } from "./lib/i18n/request";
import { messages } from "./lib/i18n/messages";
import YasSearch from "./components/home/YasSearch";
import YasSearchTrigger from "./components/home/YasSearchTrigger";
import AddToCartButton from "./components/cart/AddToCartButton";
import { listProducts } from "./lib/products/service";

export default async function Home() {
  const locale = await getRequestLocale();
  const t = messages[locale];
  const products = listProducts({ status: "active", locale });
  const yasPicks = ["smart-watch-pro", "wireless-headphones", "ultra-keyboard", "smart-desk-lamp"].map((id) => products.find((product) => product.id === id)).filter((product): product is NonNullable<typeof product> => Boolean(product));
  const freshProducts = products.slice(-4);

  return (
    <main className="min-h-screen bg-[#171A21] text-white">


      <section className="relative isolate overflow-hidden">
        <div
          className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_40%,rgba(124,58,237,0.20),transparent_32%),radial-gradient(circle_at_80%_30%,rgba(37,99,235,0.16),transparent_30%)]"
          aria-hidden="true"
        />

        <div className="mx-auto grid min-h-[calc(100vh-4.5rem)] max-w-7xl items-center gap-14 px-4 py-16 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-20">
          <div className="max-w-2xl text-center lg:text-start">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-violet-400/20 bg-violet-400/[0.08] px-4 py-2 text-xs font-semibold text-violet-300">
              <span className="h-2 w-2 rounded-full bg-violet-400 shadow-[0_0_12px_rgba(167,139,250,0.9)]" />
              {t.heroLabel}
            </div>

            <h1 className="text-5xl font-black leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
              {t.heroTitle}
            </h1>

            <p className="mx-auto mt-7 max-w-xl text-base leading-8 text-white/60 sm:text-lg lg:mx-0">
              {t.heroDescription}
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:justify-center lg:justify-start">
              <a
                href="#"
                className="rounded-2xl bg-gradient-to-r from-violet-500 to-blue-500 px-7 py-4 text-sm font-bold shadow-xl shadow-violet-500/20 transition hover:-translate-y-1 hover:shadow-violet-500/30"
              >
                {t.heroButton}
              </a>

              <a
                href="#"
                className="rounded-2xl border border-white/10 bg-white/[0.06] px-7 py-4 text-sm font-bold text-white/90 transition hover:-translate-y-1 hover:bg-white/10"
              >
                {t.heroSecondary}
              </a>
            </div>

            <div className="mt-9 flex flex-wrap justify-center gap-6 text-xs text-white/45 lg:justify-start">
              <span>âœ¦ Smart shopping</span>
              <span>âœ¦ Modern experience</span>
              <span>âœ¦ Easy discovery</span>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-xl">
            <div
              className="absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-500/20 blur-3xl"
              aria-hidden="true"
            />

            <div className="relative aspect-square overflow-hidden rounded-[2.5rem] border border-white/10 bg-white/[0.045] shadow-2xl shadow-violet-950/30 backdrop-blur-xl">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(139,92,246,0.28),transparent_45%)]" />

              <div className="absolute left-1/2 top-1/2 flex h-44 w-44 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-[2rem] bg-gradient-to-br from-violet-500 via-indigo-500 to-blue-500 text-7xl font-black shadow-2xl shadow-violet-500/30 sm:h-52 sm:w-52 sm:text-8xl">
                Y
              </div>

              <div className="absolute left-5 top-5 rounded-2xl border border-white/10 bg-[#1D2129]/80 px-4 py-3 backdrop-blur-xl">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-white/40">
                  YAS
                </p>
                <p className="mt-1 text-sm font-bold">Smart Commerce</p>
              </div>

              <div className="absolute bottom-5 right-5 rounded-2xl border border-white/10 bg-[#1D2129]/80 px-4 py-3 backdrop-blur-xl">
                <p className="text-[10px] font-semibold text-violet-300">
                  DISCOVER
                </p>
                <p className="mt-1 text-sm font-bold">Something better</p>
              </div>

              <div className="absolute right-8 top-24 h-3 w-3 rounded-full bg-blue-400 shadow-[0_0_20px_rgba(96,165,250,0.9)]" />
              <div className="absolute bottom-24 left-10 h-2 w-2 rounded-full bg-violet-300 shadow-[0_0_18px_rgba(196,181,253,0.9)]" />
            </div>
          </div>
        </div>
      </section>

      <YasSearch locale={locale} />

      <section className="border-t border-white/[0.06] px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-violet-400">
                {t.categories}
              </p>
              <h2 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
                Explore by category
              </h2>
            </div>

            <a
              href="#"
              className="text-sm font-semibold text-white/55 transition hover:text-white"
            >
              View all →
            </a>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {Array.from(
              new Map(
                products.map((product) => {
                  const category =
                    product.categoryLocalizations.find(
                      (item) => item.locale === locale,
                    ) ??
                    product.categoryLocalizations[0];

                  return [
                    product.category.id,
                    {
                      product,
                      name: category?.name ?? product.category.id,
                    },
                  ];
                }),
              ).values(),
            )
              .slice(0, 6)
              .map(({ product, name }, index) => (

                <a
                  key={product.category.id}
                  href="#"
                  className="group relative overflow-hidden rounded-3xl border border-white/[0.08] bg-white/[0.035] transition duration-300 hover:-translate-y-1 hover:border-violet-400/25 hover:bg-white/[0.06]"
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-white/[0.03]">
                    {product.media[0]?.type === "image" ? (
                      <img
                        src={product.media[0].url}
                        alt={product.media[0].alt ?? name}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-4xl text-white/20">
                        ✦
                      </div>
                    )}

                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

                    <span className="absolute right-4 top-4 text-[10px] font-bold tracking-widest text-white/60">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                  </div>

                  <div className="p-4">
                    <h3 className="text-sm font-bold text-white/90">{name}</h3>
                    <span className="mt-2 inline-block text-xs text-white/35 transition group-hover:text-violet-300">
                      Explore →
                    </span>
                  </div>
                </a>
              ))}
          </div>
        </div>
      </section>
            <section className="border-t border-white/[0.06] px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-violet-400">
                YAS PICKS
              </p>
              <h2 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
                Featured Products
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-white/45">
                Selected products worth discovering, with a clean and modern shopping experience.
              </p>
            </div>

            <Link
              href="/shop"
              className="text-sm font-semibold text-white/55 transition hover:text-white"
            >
              View all â†’
            </Link>
          </div>

          <div className="flex gap-4 overflow-x-auto scroll-smooth pb-4 snap-x snap-mandatory">
            {yasPicks.map((product) => {
              const localization =
                product.localizations.find(
                  (item) => item.locale === locale,
                ) ??
                product.localizations[0];

              const categoryLocalization =
                product.categoryLocalizations.find(
                  (item) => item.locale === locale,
                ) ??
                product.categoryLocalizations[0];

              const sku =
                product.skus.find(
                  (item) => item.status === "active",
                ) ?? product.skus[0];

              const price =
                sku
                  ? product.prices.find(
                      (item) =>
                        item.skuId === sku.id &&
                        item.status === "active",
                    )
                  : undefined;

              const productName =
                localization?.name ?? product.id;

              const categoryName =
                categoryLocalization?.name ?? "";

              const currentPrice = price?.price ?? 0;
              const compareAtPrice = price?.compareAtPrice;

              return (
                <article
                  key={product.id}
                  className="group w-[76vw] shrink-0 snap-start overflow-hidden rounded-3xl border border-white/[0.08] bg-white/[0.035] transition duration-300 hover:-translate-y-1 hover:border-violet-400/25 hover:bg-white/[0.055] sm:w-[340px] lg:w-[360px]"
                >
                  <Link
                    href={`/product/${product.id}`}
                    className="block"
                  >
                    <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-white/[0.08] via-white/[0.03] to-violet-500/[0.08]">
                      {compareAtPrice !== undefined &&
                        compareAtPrice > currentPrice && (
                          <div className="absolute left-4 top-4 z-10 rounded-full border border-white/10 bg-black/30 px-2.5 py-1 text-[10px] font-bold text-violet-300 backdrop-blur">
                            SALE
                          </div>
                        )}

                      {product.media[0]?.type === "image" ? (
  <img
    src={product.media[0].url}
    alt={product.media[0].alt ?? productName}
    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
  />
) : (
  <div className="flex h-full items-center justify-center text-7xl transition duration-500 group-hover:scale-110">
    <span aria-hidden="true">✦</span>
  </div>
)}
                    </div>

                    <div className="p-5">
                      <p className="text-xs font-medium text-white/35">
                        {categoryName}
                      </p>

                      <h3 className="mt-2 text-base font-bold text-white/90">
                        {productName}
                      </h3>

                      <div className="mt-4 flex items-end justify-between gap-3">
                        <div>
                          <span className="text-lg font-black text-white">
                            {price
                              ? new Intl.NumberFormat(
                                  locale === "fa" ? "fa-IR" : "en-US",
                                  {
                                    style: "currency",
                                    currency: price?.currency ?? "USD",
                                  },
                                ).format(currentPrice)
                              : "â€”"}
                          </span>

                          {compareAtPrice !== undefined &&
                            compareAtPrice > currentPrice && (
                              <span className="ml-2 text-xs text-white/25 line-through">
                                {new Intl.NumberFormat(
                                  locale === "fa"
                                    ? "fa-IR"
                                    : "en-US",
                                  {
                                    style: "currency",
                                    currency: price?.currency ?? "USD",
                                  },
                                ).format(compareAtPrice)}
                              </span>
                            )}
                        </div>

                        <span className="text-xs text-white/30">
                          YAS
                        </span>
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
        </div>
      </section>
<section className="border-t border-white/[0.06] px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-violet-400">
                BEST SELLERS
              </p>
              <h2 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
                Most Loved Products
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-white/45">
                Products customers are choosing again and again.
              </p>
            </div>

            <a
              href="#"
              className="text-sm font-semibold text-white/55 transition hover:text-white"
            >
              Explore best sellers â†’
            </a>
          </div>

          <div className="flex gap-4 overflow-x-auto scroll-smooth pb-4 snap-x snap-mandatory">
            {[
  {
    rank: "01",
    productId: "smart-watch-pro",
    sold: "1.2k sold",
    rating: "4.9",
  },
  {
    rank: "02",
    productId: "wireless-headphones",
    sold: "980 sold",
    rating: "4.8",
  },
  {
    rank: "03",
    productId: "ultra-keyboard",
    sold: "760 sold",
    rating: "4.8",
  },
  {
    rank: "04",
    productId: "smart-desk-lamp",
    sold: "640 sold",
    rating: "4.7",
  },
]
  .map((item) => ({
    item,
    product: products.find((product) => product.id === item.productId),
  }))
  .filter(
    (
      entry,
    ): entry is {
      item: {
        rank: string;
        productId: string;
        sold: string;
        rating: string;
      };
      product: NonNullable<typeof products[number]>;
    } => Boolean(entry.product),
  )
  .map(({ item, product }) => ({
    ...item,
    product,
  }))
  .map((product) => (
              <article
  key={product.product.id}
  className="group flex min-h-36 w-[78vw] shrink-0 snap-start overflow-hidden rounded-3xl border border-white/[0.08] bg-white/[0.035] transition duration-300 hover:-translate-y-1 hover:border-violet-400/25 hover:bg-white/[0.055] sm:w-[520px]"
>
  <div className="relative flex w-28 shrink-0 items-center justify-center overflow-hidden bg-gradient-to-br from-white/[0.08] to-violet-500/[0.08] sm:w-36">
    {product.product.media[0]?.type === "image" ? (
      <img
        src={product.product.media[0].url}
        alt={
          product.product.media[0].alt ??
          product.product.localizations[0]?.name ??
          "YAS Product"
        }
        className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
      />
    ) : (
      <span
        className="text-5xl transition duration-300 group-hover:scale-110"
        aria-hidden="true"
      >
        ✦
      </span>
    )}
  </div>

  <div className="flex min-w-0 flex-1 flex-col justify-between p-4 sm:p-5">
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <p className="text-[10px] font-bold tracking-widest text-violet-400">
          #{product.rank}
        </p>

        <p className="mt-1 text-xs text-white/30">
          {product.product.categoryLocalizations[0]?.name ?? product.product.category.id}
        </p>

        <h3 className="mt-1 truncate text-base font-bold text-white/90">
          {product.product.localizations[0]?.name ?? product.product.id}
        </h3>
      </div>

      <button
        type="button"
        aria-label={`Add ${product.product.localizations[0]?.name ?? product.product.id} to cart`}
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.05] text-lg text-white/70 transition hover:bg-violet-500 hover:text-white"
      >
        +
      </button>
    </div>

    <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
      <div>
        <span className="text-lg font-black text-white">
          {product.product.prices[0]?.price ?? "—"}
        </span>
        <span className="ml-3 text-xs text-white/35">
          {product.sold}
        </span>
      </div>

      <span className="text-xs text-amber-300/80">
        ★ {product.rating}
      </span>
    </div>
  </div>
</article>
            ))}
          </div>
        </div>
      </section>

      {/* YAS CAMPAIGN BANNER */}
      <section className="border-t border-white/[0.06] px-4 py-20 sm:px-6 lg:px-8">
  <div className="mx-auto max-w-7xl">
    <div className="mb-10">
      <p className="text-sm font-semibold text-violet-400">NEW ARRIVALS</p>
      <h2 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">Fresh to YAS</h2>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-white/45">
        Discover the latest products added to our collection.
      </p>
    </div>

    <div className="flex gap-4 overflow-x-auto scroll-smooth pb-4 snap-x snap-mandatory">
      {freshProducts
        .filter((product): product is NonNullable<typeof product> => Boolean(product))
        .map((product) => {
          const productName =
            product.localizations.find((item) => item.locale === locale)?.name ??
            product.localizations[0]?.name ??
            product.id;
          const category =
            product.categoryLocalizations.find((item) => item.locale === locale)?.name ??
            product.categoryLocalizations[0]?.name ??
            product.category.id;
          const price = product.prices[0]?.price;

          return (
            <article
              key={product.id}
              className="group w-[76vw] shrink-0 snap-start overflow-hidden rounded-3xl border border-white/[0.08] bg-white/[0.035] transition duration-300 hover:-translate-y-1 hover:border-violet-400/25 hover:bg-white/[0.055] sm:w-[340px] lg:w-[360px]"
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-white/[0.03]">
                <span className="absolute left-4 top-4 z-10 rounded-full border border-violet-400/20 bg-violet-500/10 px-3 py-1 text-[10px] font-bold tracking-widest text-violet-300">
                  NEW
                </span>

                {product.media[0]?.type === "image" ? (
                  <img
                    src={product.media[0].url}
                    alt={product.media[0].alt ?? productName}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-5xl text-white/20">
                    ✦
                  </div>
                )}
              </div>

              <div className="p-5">
                <p className="text-xs font-medium text-white/35">{category}</p>
                <h3 className="mt-2 text-base font-bold text-white/90">{productName}</h3>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-lg font-black text-white">
                    {price != null ? `$${price}` : "—"}
                  </span>
                  <span className="text-xs text-white/30">Available now</span>
                </div>
              </div>
            </article>
          );
        })}
    </div>
  </div>
</section>

      {/* YAS ABOUT CONTACT */}
      <section className="border-t border-white/[0.06] px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-2">
          <div className="rounded-[2rem] border border-white/[0.08] bg-white/[0.025] p-6 sm:p-8">
            <span className="text-xs font-bold tracking-[0.2em] text-violet-400">
              ABOUT YAS
            </span>

            <h2 className="mt-3 text-3xl font-black tracking-tight text-white sm:text-4xl">
              Ø¯Ø±Ø¨Ø§Ø±Ù‡ ÛŒØ§Ø³
            </h2>

            <p className="mt-5 max-w-xl text-sm leading-7 text-white/50 sm:text-base">
              ÛŒØ§Ø³ Ø¨Ø§ Ù‡Ø¯Ù Ø³Ø§Ø®ØªÙ† ÛŒÚ© ØªØ¬Ø±Ø¨Ù‡ Ø®Ø±ÛŒØ¯ Ø³Ø§Ø¯Ù‡ØŒ Ù‡ÙˆØ´Ù…Ù†Ø¯ Ùˆ Ù…Ø¯Ø±Ù† Ø´Ú©Ù„ Ú¯Ø±ÙØªÙ‡ Ø§Ø³Øª.
              Ù…Ø§ ØªÙ„Ø§Ø´ Ù…ÛŒâ€ŒÚ©Ù†ÛŒÙ… Ù¾ÛŒØ¯Ø§ Ú©Ø±Ø¯Ù† Ù…Ø­ØµÙˆÙ„ Ù…Ù†Ø§Ø³Ø¨ØŒ Ù…Ù‚Ø§ÛŒØ³Ù‡ Ùˆ Ø®Ø±ÛŒØ¯ Ø±Ø§ Ø¨Ø±Ø§ÛŒ Ù…Ø´ØªØ±ÛŒ
              Ø³Ø±ÛŒØ¹â€ŒØªØ± Ùˆ Ù„Ø°Øªâ€ŒØ¨Ø®Ø´â€ŒØªØ± Ú©Ù†ÛŒÙ….
            </p>

            <div className="mt-7 grid grid-cols-3 gap-3">
              <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-4">
                <p className="text-xl font-black text-white">Smart</p>
                <p className="mt-1 text-xs text-white/35">Ø®Ø±ÛŒØ¯ Ù‡ÙˆØ´Ù…Ù†Ø¯</p>
              </div>

              <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-4">
                <p className="text-xl font-black text-white">Modern</p>
                <p className="mt-1 text-xs text-white/35">ØªØ¬Ø±Ø¨Ù‡ Ù…Ø¯Ø±Ù†</p>
              </div>

              <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-4">
                <p className="text-xl font-black text-white">YAS</p>
                <p className="mt-1 text-xs text-white/35">Ù‡Ù…Ø±Ø§Ù‡ Ø®Ø±ÛŒØ¯</p>
              </div>
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/[0.08] bg-white/[0.025] p-6 sm:p-8">
            <span className="text-xs font-bold tracking-[0.2em] text-violet-400">
              CONTACT US
            </span>

            <h2 className="mt-3 text-3xl font-black tracking-tight text-white sm:text-4xl">
              ØªÙ…Ø§Ø³ Ø¨Ø§ Ù…Ø§
            </h2>

            <p className="mt-5 text-sm leading-7 text-white/50 sm:text-base">
              Ø³ÙˆØ§Ù„ÛŒ Ø¯Ø§Ø±ÛŒØ¯ ÛŒØ§ Ø¨Ù‡ Ø±Ø§Ù‡Ù†Ù…Ø§ÛŒÛŒ Ù†ÛŒØ§Ø² Ø¯Ø§Ø±ÛŒØ¯ØŸ Ø§Ø² Ø·Ø±ÛŒÙ‚ Ø±Ø§Ù‡â€ŒÙ‡Ø§ÛŒ Ø§Ø±ØªØ¨Ø§Ø·ÛŒ
              Ø²ÛŒØ± Ø¨Ø§ ØªÛŒÙ… ÛŒØ§Ø³ Ø¯Ø± ØªÙ…Ø§Ø³ Ø¨Ø§Ø´ÛŒØ¯.
            </p>

            <div className="mt-7 space-y-3">
              <div className="flex items-center gap-4 rounded-2xl border border-white/[0.07] bg-white/[0.03] p-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-500/10 text-xl">
                  âœ‰ï¸
                </span>
                <div>
                  <p className="text-xs text-white/35">Email</p>
                  <p className="mt-1 text-sm font-semibold text-white/80">
                    contact@yas.example
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 rounded-2xl border border-white/[0.07] bg-white/[0.03] p-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-500/10 text-xl">
                  ðŸ’¬
                </span>
                <div>
                  <p className="text-xs text-white/35">Support</p>
                  <p className="mt-1 text-sm font-semibold text-white/80">
                    Ù¾Ø´ØªÛŒØ¨Ø§Ù†ÛŒ ÛŒØ§Ø³
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 rounded-2xl border border-white/[0.07] bg-white/[0.03] p-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-500/10 text-xl">
                  ðŸ“
                </span>
                <div>
                  <p className="text-xs text-white/35">Location</p>
                  <p className="mt-1 text-sm font-semibold text-white/80">
                    YAS Smart Commerce
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

    </main>
  );
}










