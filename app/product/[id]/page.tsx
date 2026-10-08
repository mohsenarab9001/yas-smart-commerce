import Link from "next/link";
import { headers } from "next/headers";
import { detectLocale } from "../../lib/i18n/config";
import { getProduct } from "../../lib/products/service";
import AddToCartButton from "../../components/cart/AddToCartButton";

type ProductPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ProductPage({
  params,
}: ProductPageProps) {
  const { id } = await params;
  const requestHeaders = await headers();
  const locale = detectLocale(
    requestHeaders.get("accept-language"),
  );

  const product = getProduct(id, locale);

  if (!product) {
    return (
      <main className="min-h-screen bg-[#171A21] px-4 py-20 text-white">
        <div className="mx-auto max-w-3xl text-center">
          <div className="text-5xl">404</div>
          <h1 className="mt-6 text-2xl font-black">
            Ù…Ø­ØµÙˆÙ„ Ù¾ÛŒØ¯Ø§ Ù†Ø´Ø¯
          </h1>
          <p className="mt-3 text-sm text-white/50">
            Ø§ÛŒÙ† Ù…Ø­ØµÙˆÙ„ ÙˆØ¬ÙˆØ¯ Ù†Ø¯Ø§Ø±Ø¯ ÛŒØ§ Ø¯ÛŒÚ¯Ø± Ø¯Ø± Ø¯Ø³ØªØ±Ø³ Ù†ÛŒØ³Øª.
          </p>
          <Link
            href="/"
            className="mt-8 inline-flex rounded-2xl bg-violet-500 px-6 py-3 text-sm font-bold text-white transition hover:bg-violet-400"
          >
            Ø¨Ø§Ø²Ú¯Ø´Øª Ø¨Ù‡ ØµÙØ­Ù‡ Ø§ØµÙ„ÛŒ
          </Link>
        </div>
      </main>
    );
  }

  const localization =
    product.localizations.find(
      (item) => item.locale === locale,
    ) ?? product.localizations[0];

  const categoryLocalization =
    product.categoryLocalizations.find(
      (item) => item.locale === locale,
    ) ?? product.categoryLocalizations[0];

  const activeSku =
    product.skus.find((sku) => sku.status === "active") ??
    product.skus[0];

  const activePrice = activeSku
    ? product.prices.find(
        (price) =>
          price.skuId === activeSku.id &&
          price.status === "active",
      )
    : undefined;

  const media = product.media
    .filter((item) => item.status === "active")
    .sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <main className="min-h-screen bg-[#171A21] text-white">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-white/50 transition hover:text-white"
        >
          <span aria-hidden="true">â†’</span>
          Ø¨Ø§Ø²Ú¯Ø´Øª
        </Link>

        <div className="mt-8 grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <section>
            <div className="overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.04]">
              {media[0]?.type === "image" ? (
                <img
                  src={media[0].url}
                  alt={
                    media[0].alt ??
                    localization?.name ??
                    "YAS Product"
                  }
                  className="aspect-square w-full object-cover"
                />
              ) : (
                <div className="flex aspect-square items-center justify-center text-white/20">
                  <span className="text-7xl">YAS</span>
                </div>
              )}
            </div>

            {media.length > 1 && (
              <div className="mt-4 grid grid-cols-4 gap-3">
                {media.slice(0, 4).map((item) => (
                  <div
                    key={item.id}
                    className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04]"
                  >
                    {item.type === "image" ? (
                      <img
                        src={item.url}
                        alt={item.alt ?? ""}
                        className="aspect-square w-full object-cover"
                      />
                    ) : (
                      <div className="flex aspect-square items-center justify-center text-xs text-white/40">
                        Video
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="flex flex-col">
            <div className="text-xs font-bold uppercase tracking-[0.18em] text-violet-300">
              {categoryLocalization?.name ?? "YAS"}
            </div>

            <h1 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">
              {localization?.name ?? "Ù…Ø­ØµÙˆÙ„ YAS"}
            </h1>

            {localization?.shortDescription && (
              <p className="mt-4 text-base leading-8 text-white/55">
                {localization.shortDescription}
              </p>
            )}

            {activePrice && (
              <div className="mt-8 rounded-3xl border border-white/10 bg-white/[0.04] p-5">
                <div className="text-xs text-white/40">
                  Ù‚ÛŒÙ…Øª
                </div>

                <div className="mt-2 flex items-end gap-2">
                  <span className="text-3xl font-black text-white">
                    {activePrice.price.toLocaleString(
                      locale === "fa" ? "fa-IR" : "en-US",
                    )}
                  </span>

                  <span className="pb-1 text-sm text-white/45">
                    {activePrice.currency}
                  </span>
                </div>

                {activePrice.compareAtPrice &&
                  activePrice.compareAtPrice > activePrice.price && (
                    <div className="mt-2 text-sm text-white/35 line-through">
                      {activePrice.compareAtPrice.toLocaleString(
                        locale === "fa" ? "fa-IR" : "en-US",
                      )}{" "}
                      {activePrice.currency}
                    </div>
                  )}
              </div>
            )}

            {activeSku && (
              <div className="mt-4 text-xs text-white/35">
                SKU: {activeSku.sku}
              </div>
            )}

            {activeSku && (
              <AddToCartButton
                productId={product.id}
                skuId={activeSku.id}
              />
            )}

            {localization?.description && (
              <div className="mt-10 border-t border-white/10 pt-8">
                <h2 className="text-lg font-black">
                  Ø¯Ø±Ø¨Ø§Ø±Ù‡ Ù…Ø­ØµÙˆÙ„
                </h2>

                <p className="mt-4 whitespace-pre-line text-sm leading-8 text-white/55">
                  {localization.description}
                </p>
              </div>
            )}

            {product.specifications.length > 0 && (
              <div className="mt-10 border-t border-white/10 pt-8">
                <h2 className="text-lg font-black">
                  Ù…Ø´Ø®ØµØ§Øª
                </h2>

                <div className="mt-4 divide-y divide-white/[0.06] rounded-2xl border border-white/10">
                  {product.specifications
                    .sort(
                      (a, b) => a.sortOrder - b.sortOrder,
                    )
                    .map((specification) => (
                      <div
                        key={specification.id}
                        className="flex items-center justify-between gap-4 px-4 py-3 text-sm"
                      >
                        <span className="text-white/45">
                          {specification.name}
                        </span>

                        <span className="text-right font-semibold text-white/80">
                          {specification.value}
                          {specification.unit
                            ? ` ${specification.unit}`
                            : ""}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}

