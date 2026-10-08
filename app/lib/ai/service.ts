import type { Locale } from "../i18n/config";
import { understandSearchQuery as understandLocalSearchQuery } from "./localIntent";
import type { AiSearchIntent } from "./types";

export type AiSearchProvider = {
  understandSearchQuery(
    input: string,
    locale: Locale,
  ): AiSearchIntent;
};

export const localAiSearchProvider: AiSearchProvider = {
  understandSearchQuery: understandLocalSearchQuery,
};

export function understandSearchQuery(
  input: string,
  locale: Locale,
  provider: AiSearchProvider = localAiSearchProvider,
): AiSearchIntent {
  return provider.understandSearchQuery(input, locale);
}
