import type { Locale } from "../i18n/config";
import type { SearchQuery } from "../search/types";
import type { AiSearchIntent } from "./types";
import { normalizeSearchText } from "../search/normalize";

const MAX_QUERY_LENGTH = 300;

function parsePriceIntent(value: string): {
  query: string;
  minPrice?: number;
  maxPrice?: number;
} {
  let query = value;
  let minPrice: number | undefined;
  let maxPrice: number | undefined;

  const betweenMatch = query.match(
    /(?:بین|between)\s+(\d+(?:\.\d+)?)\s+(?:و|and|تا)\s+(\d+(?:\.\d+)?)(?:\s*(?:دلار|usd|\$))?/i,
  );

  if (betweenMatch) {
    minPrice = Number(betweenMatch[1]);
    maxPrice = Number(betweenMatch[2]);
    query = query.replace(betweenMatch[0], " ");
  } else {
    const maxMatch = query.match(
      /(?:زیر|کمتر از|حداکثر|تا|under|below|less than|up to)\s*(?:\$)?\s*(\d+(?:\.\d+)?)\s*(?:دلار|usd|\$)?/i,
    );

    if (maxMatch) {
      maxPrice = Number(maxMatch[1]);
      query = query.replace(maxMatch[0], " ");
    }

    const minMatch = query.match(
      /(?:بیشتر از|حداقل|بالای|بالاتر از|over|above|more than|at least)\s*(?:\$)?\s*(\d+(?:\.\d+)?)\s*(?:دلار|usd|\$)?/i,
    );

    if (minMatch) {
      minPrice = Number(minMatch[1]);
      query = query.replace(minMatch[0], " ");
    }
  }

  return {
    query: query.replace(/\s+/g, " ").trim(),
    minPrice,
    maxPrice,
  };
}

function detectSort(value: string): {
  sort: SearchQuery["sort"];
  query: string;
} {
  if (/(?:ارزان|ارزان‌تر|کمترین قیمت|cheap|cheapest|lowest price)/i.test(value)) {
    return {
      sort: "price-asc",
      query: value
        .replace(/(?:ارزان‌تر|ارزان|کمترین قیمت|cheap|cheapest|lowest price)/gi, " ")
        .replace(/\s+/g, " ")
        .trim(),
    };
  }

  if (/(?:گران|گران‌تر|بیشترین قیمت|expensive|highest price)/i.test(value)) {
    return {
      sort: "price-desc",
      query: value
        .replace(/(?:گران‌تر|گران|بیشترین قیمت|expensive|highest price)/gi, " ")
        .replace(/\s+/g, " ")
        .trim(),
    };
  }

  if (/(?:جدیدترین|تازه‌ترین|newest|latest)/i.test(value)) {
    return {
      sort: "newest",
      query: value
        .replace(/(?:جدیدترین|تازه‌ترین|newest|latest)/gi, " ")
        .replace(/\s+/g, " ")
        .trim(),
    };
  }

  return {
    sort: "relevance",
    query: value,
  };
}

export function understandSearchQuery(
  input: string,
  locale: Locale,
): AiSearchIntent {
  const originalQuery = input.trim().slice(0, MAX_QUERY_LENGTH);
  const normalized = normalizeSearchText(originalQuery);

  const priceIntent = parsePriceIntent(normalized);
  const sortIntent = detectSort(priceIntent.query);

  const query = sortIntent.query.trim();

  const searchQuery: SearchQuery = {
    query: query || normalized,
    locale,
    filters: {
      ...(priceIntent.minPrice !== undefined
        ? { minPrice: priceIntent.minPrice }
        : {}),
      ...(priceIntent.maxPrice !== undefined
        ? { maxPrice: priceIntent.maxPrice }
        : {}),
    },
    sort: sortIntent.sort,
    page: 1,
    pageSize: 12,
  };

  return {
    originalQuery,
    searchQuery,
    confidence:
      priceIntent.minPrice !== undefined ||
      priceIntent.maxPrice !== undefined ||
      sortIntent.sort !== "relevance"
        ? 0.95
        : 0.75,
    provider: "local",
  };
}
