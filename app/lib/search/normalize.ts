const digitMap: Record<string, string> = {
  "۰": "0",
  "۱": "1",
  "۲": "2",
  "۳": "3",
  "۴": "4",
  "۵": "5",
  "۶": "6",
  "۷": "7",
  "۸": "8",
  "۹": "9",
  "٠": "0",
  "١": "1",
  "٢": "2",
  "٣": "3",
  "٤": "4",
  "٥": "5",
  "٦": "6",
  "٧": "7",
  "٨": "8",
  "٩": "9",
};

const characterMap: Record<string, string> = {
  ي: "ی",
  ى: "ی",
  ك: "ک",
  ة: "ه",
  "ۀ": "ه",
  "ؤ": "و",
  "إ": "ا",
  "أ": "ا",
  "ٱ": "ا",
};

export function normalizeSearchText(value: string): string {
  return value
    .normalize("NFKC")
    .replace(/[\u064B-\u065F\u0670]/g, "")
    .replace(/[يىكةۀؤإأٱ]/g, (character) => {
      return characterMap[character] ?? character;
    })
    .replace(/[۰-۹٠-٩]/g, (digit) => {
      return digitMap[digit] ?? digit;
    })
    .replace(/\u200c/g, " ")
    .replace(/[-_/\\|]+/g, " ")
    .replace(/[^\p{L}\p{N}\s.%$€£¥]/gu, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

export function tokenizeSearchText(value: string): string[] {
  const normalized = normalizeSearchText(value);

  if (!normalized) {
    return [];
  }

  return normalized
    .split(/\s+/)
    .map((token) => token.trim())
    .filter((token) => token.length > 0);
}
