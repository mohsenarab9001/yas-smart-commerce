import { NextResponse } from "next/server";
import { isLocale } from "../../lib/i18n/config";
import { searchProducts } from "../../lib/search/engine";
import type { SearchQuery } from "../../lib/search/types";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<SearchQuery>;

    if (typeof body.query !== "string") {
      return NextResponse.json(
        { error: "Invalid search query" },
        { status: 400 },
      );
    }

    const locale = typeof body.locale === "string" && isLocale(body.locale)
      ? body.locale
      : "fa";

    const result = searchProducts({
      query: body.query,
      locale,
      filters: body.filters,
      sort: body.sort,
      page: body.page,
      pageSize: body.pageSize,
    });

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "no-store",
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Search request failed" },
      { status: 500 },
    );
  }
}
