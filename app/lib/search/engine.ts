import type { SearchRepository } from "./repository";
import { localSearchRepository } from "./localRepository";
import {
  normalizeSearchText,
  tokenizeSearchText,
} from "./normalize";
import type {
  SearchDocument,
  SearchQuery,
  SearchResult,
  SearchResultItem,
} from "./types";

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 12;
const MAX_PAGE_SIZE = 48;

type ScoredDocument = {
  document: SearchDocument;
  score: number;
  matchedFields: string[];
};

function scoreTextField(
  value: string | undefined,
  query: string,
  tokens: string[],
  weights: {
    exact: number;
    contains: number;
    token: number;
  },
): { score: number; matched: boolean; matchedTokenCount: number } {
  if (!value) {
    return {
      score: 0,
      matched: false,
      matchedTokenCount: 0,
    };
  }

  const normalizedValue = normalizeSearchText(value);

  if (!normalizedValue) {
    return {
      score: 0,
      matched: false,
      matchedTokenCount: 0,
    };
  }

  let score = 0;
  let matched = false;
  let matchedTokenCount = 0;

  if (normalizedValue === query) {
    score += weights.exact;
    matched = true;
  } else if (normalizedValue.includes(query)) {
    score += weights.contains;
    matched = true;
  }

  for (const token of tokens) {
    if (token.length < 2) {
      continue;
    }

    const words = normalizedValue.split(/\s+/);

    if (
      words.some(
        (word) =>
          word === token ||
          word.startsWith(token) ||
          token.startsWith(word),
      )
    ) {
      score += weights.token;
      matched = true;
      matchedTokenCount += 1;
    }
  }

  return {
    score,
    matched,
    matchedTokenCount,
  };
}

function scoreIdentifier(
  value: string | undefined,
  query: string,
): { score: number; matched: boolean } {
  if (!value) {
    return {
      score: 0,
      matched: false,
    };
  }

  const normalizedValue = normalizeSearchText(value);

  if (!normalizedValue) {
    return {
      score: 0,
      matched: false,
    };
  }

  if (normalizedValue === query) {
    return {
      score: 220,
      matched: true,
    };
  }

  if (normalizedValue.includes(query)) {
    return {
      score: 100,
      matched: true,
    };
  }

  return {
    score: 0,
    matched: false,
  };
}

function scoreDocument(
  document: SearchDocument,
  query: string,
  tokens: string[],
): ScoredDocument | null {
  const matches = new Set<string>();
  const matchedTokens = new Set<string>();
  let score = 0;

  const fields = [
    {
      name: "name",
      value: document.name,
      weights: { exact: 150, contains: 90, token: 35 },
    },
    {
      name: "category",
      value: document.categoryName,
      weights: { exact: 55, contains: 30, token: 15 },
    },
    {
      name: "brand",
      value: document.brandName,
      weights: { exact: 70, contains: 40, token: 20 },
    },
    {
      name: "description",
      value: document.description,
      weights: { exact: 35, contains: 20, token: 8 },
    },
  ];

  for (const field of fields) {
    const result = scoreTextField(
      field.value,
      query,
      tokens,
      field.weights,
    );

    if (result.matched) {
      score += result.score;
      matches.add(field.name);
    }

    if (field.value) {
      const normalizedValue = normalizeSearchText(field.value);
      const words = normalizedValue.split(/\s+/);

      for (const token of tokens) {
        if (token.length < 2) {
          continue;
        }

        if (
          words.some(
            (word) =>
              word === token ||
              word.startsWith(token) ||
              token.startsWith(word),
          )
        ) {
          matchedTokens.add(token);
        }
      }
    }
  }

  const sku = scoreIdentifier(document.sku, query);

  if (sku.matched) {
    score += sku.score;
    matches.add("sku");
  }

  const barcode = scoreIdentifier(document.barcode, query);

  if (barcode.matched) {
    score += barcode.score;
    matches.add("barcode");
  }

  for (const attribute of document.searchableAttributes) {
    const attributeText = `${attribute.name} ${attribute.value}`;

    const attributeMatch = scoreTextField(
      attributeText,
      query,
      tokens,
      {
        exact: 35,
        contains: 25,
        token: 10,
      },
    );

    if (attributeMatch.matched) {
      score += attributeMatch.score;
      matches.add(`attribute:${attribute.name}`);
    }

    const normalizedAttribute = normalizeSearchText(attributeText);
    const words = normalizedAttribute.split(/\s+/);

    for (const token of tokens) {
      if (token.length < 2) {
        continue;
      }

      if (
        words.some(
          (word) =>
            word === token ||
            word.startsWith(token) ||
            token.startsWith(word),
        )
      ) {
        matchedTokens.add(token);
      }
    }
  }

  const identifierMatched = sku.matched || barcode.matched;

  if (
    tokens.length > 1 &&
    !identifierMatched &&
    matchedTokens.size < tokens.length
  ) {
    return null;
  }

  if (tokens.length > 1 && matchedTokens.size === tokens.length) {
    score += 80;
  }

  if (score === 0) {
    return null;
  }

  return {
    document,
    score,
    matchedFields: [...matches],
  };
}

function passesFilters(
  document: SearchDocument,
  filters: SearchQuery["filters"],
): boolean {
  if (!filters) {
    return true;
  }

  if (
    filters.categoryId &&
    document.categoryId !== filters.categoryId
  ) {
    return false;
  }

  if (
    filters.brandId &&
    document.brandId !== filters.brandId
  ) {
    return false;
  }

  if (
    filters.currency &&
    document.price?.currency !== filters.currency
  ) {
    return false;
  }

  if (
    filters.minPrice !== undefined &&
    (document.price === undefined ||
      document.price.amount < filters.minPrice)
  ) {
    return false;
  }

  if (
    filters.maxPrice !== undefined &&
    (document.price === undefined ||
      document.price.amount > filters.maxPrice)
  ) {
    return false;
  }

  return true;
}

function sortResults(
  results: ScoredDocument[],
  sort: SearchQuery["sort"],
): void {
  results.sort((a, b) => {
    if (sort === "price-asc") {
      return (
        (a.document.price?.amount ?? Number.POSITIVE_INFINITY) -
        (b.document.price?.amount ?? Number.POSITIVE_INFINITY)
      );
    }

    if (sort === "price-desc") {
      return (
        (b.document.price?.amount ?? Number.NEGATIVE_INFINITY) -
        (a.document.price?.amount ?? Number.NEGATIVE_INFINITY)
      );
    }

    if (sort === "newest") {
      return (
        Date.parse(b.document.createdAt) -
        Date.parse(a.document.createdAt)
      );
    }

    if (b.score !== a.score) {
      return b.score - a.score;
    }

    return a.document.name.localeCompare(b.document.name);
  });
}

export function searchProducts(
  request: SearchQuery,
  repository: SearchRepository = localSearchRepository,
): SearchResult {
  const normalizedQuery = normalizeSearchText(request.query);
  const tokens = tokenizeSearchText(request.query);

  const page = Math.max(
    DEFAULT_PAGE,
    Math.floor(request.page ?? DEFAULT_PAGE),
  );

  const pageSize = Math.min(
    MAX_PAGE_SIZE,
    Math.max(
      1,
      Math.floor(request.pageSize ?? DEFAULT_PAGE_SIZE),
    ),
  );

  if (!normalizedQuery || tokens.length === 0) {
    return {
      query: request.query,
      locale: request.locale,
      items: [],
      total: 0,
      page,
      pageSize,
      totalPages: 0,
    };
  }

  const documents = repository
    .getDocuments(request.locale)
    .filter((document) =>
      passesFilters(document, request.filters),
    );

  const scoredResults = documents
    .map((document) =>
      scoreDocument(document, normalizedQuery, tokens),
    )
    .filter(
      (result): result is ScoredDocument => result !== null,
    );

  sortResults(
    scoredResults,
    request.sort ?? "relevance",
  );

  const total = scoredResults.length;
  const totalPages = Math.ceil(total / pageSize);

  const safePage =
    totalPages > 0
      ? Math.min(page, totalPages)
      : page;

  const start = (safePage - 1) * pageSize;

  const items: SearchResultItem[] = scoredResults
    .slice(start, start + pageSize)
    .map(
      ({
        document,
        score,
        matchedFields,
      }) => ({
        productId: document.productId,
        name: document.name,
        description: document.description,
        categoryId: document.categoryId,
        categoryName: document.categoryName,
        brandId: document.brandId,
        brandName: document.brandName,
        sku: document.sku,
        price: document.price,
        media: document.media,
        score,
        matchedFields,
      }),
    );

  return {
    query: request.query,
    locale: request.locale,
    items,
    total,
    page: safePage,
    pageSize,
    totalPages,
  };
}
