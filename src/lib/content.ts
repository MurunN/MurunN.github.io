export type TimelineItem = {
  id: string;
  yearLabel: string;
  eraMn: string;
  eraEn: string;
  titleMn: string;
  titleEn: string;
  summaryMn: string;
  summaryEn: string;
  factsMn: string[];
  factsEn: string[];
  sortOrder: number;
  published: boolean;
};

export function parseFacts(value: string): string[] {
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return value.split("\n").map((item) => item.trim()).filter(Boolean);
  }
}
