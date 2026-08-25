/**
 * Goldratt ranking for national bottlenecks.
 *
 * A candidate that fails the doubling test, or that is labelled a symptom
 * (inventory, input, or output wish), is scored below every real constraint.
 * Remaining score is tightness of the slot, how much of national throughput
 * it binds, and how many other slots sit underneath it.
 */

export type RankCandidate = {
  slug: string;
  tightness: number;
  nationalScope: number;
  unlocksOthers: number;
  doublingTest: boolean;
  isSymptom: boolean;
};

export type RankedCandidate = RankCandidate & { score: number };

export const WEIGHTS = {
  tightness: 0.25,
  nationalScope: 0.35,
  unlocks: 8,
  doublingPass: 20,
  failPenalty: 100,
} as const;

export const TOP_N = 5;

function assertRange(name: string, value: number, min: number, max: number): void {
  if (!Number.isFinite(value) || value < min || value > max) {
    throw new Error(`${name} must be between ${min} and ${max}, got ${value}`);
  }
}

export function scoreCandidate(c: RankCandidate): number {
  assertRange("tightness", c.tightness, 0, 100);
  assertRange("nationalScope", c.nationalScope, 0, 100);
  assertRange("unlocksOthers", c.unlocksOthers, 0, 20);

  const base =
    c.tightness * WEIGHTS.tightness + c.nationalScope * WEIGHTS.nationalScope;

  if (c.isSymptom || !c.doublingTest) {
    return base - WEIGHTS.failPenalty;
  }

  return base + c.unlocksOthers * WEIGHTS.unlocks + WEIGHTS.doublingPass;
}

export function rankBottlenecks(
  candidates: RankCandidate[],
  topN: number = TOP_N,
): RankedCandidate[] {
  if (topN < 0) {
    throw new Error(`topN must be >= 0, got ${topN}`);
  }

  return [...candidates]
    .map((c) => ({ ...c, score: scoreCandidate(c) }))
    .sort((a, b) => b.score - a.score || a.slug.localeCompare(b.slug))
    .slice(0, topN);
}

export function slugsOf(ranked: RankedCandidate[]): string[] {
  return ranked.map((r) => r.slug);
}
