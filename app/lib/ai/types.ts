import type { Locale } from "../i18n/config";
import type { SearchQuery } from "../search/types";

export type AiSearchIntent = {
  originalQuery: string;
  searchQuery: SearchQuery;
  confidence: number;
  provider: "local";
};
