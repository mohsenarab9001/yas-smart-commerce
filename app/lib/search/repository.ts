import type { Locale } from "../i18n/config";
import type { SearchDocument } from "./types";

export type SearchRepository = {
  getDocuments(locale: Locale): SearchDocument[];
};
