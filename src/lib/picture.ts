import { CANDIDATES } from "../data/candidates";
import { constraints, getConstraint, type Constraint } from "../data/constraints";
import { TOP_N, rankBottlenecks, slugsOf } from "./rank";

export type RankKind = "root" | "adjacent";

export function rankedRoots(topN: number = TOP_N): Constraint[] {
  const ranked = rankBottlenecks(CANDIDATES, topN);
  return ranked.map((r, i) => {
    const c = getConstraint(r.slug);
    if (!c) {
      throw new Error(`ranked slug has no constraint page: ${r.slug}`);
    }
    return { ...c, order: i + 1 };
  });
}

export function adjacentHoppers(): Constraint[] {
  const top = new Set(rankedRoots().map((c) => c.slug));
  return constraints.filter((c) => !top.has(c.slug));
}

export function rankLabel(slug: string): { kind: RankKind; order: number } {
  const roots = rankedRoots();
  const rootIndex = roots.findIndex((c) => c.slug === slug);
  if (rootIndex >= 0) {
    return { kind: "root", order: rootIndex + 1 };
  }
  const hops = adjacentHoppers();
  const hopIndex = hops.findIndex((c) => c.slug === slug);
  if (hopIndex < 0) {
    throw new Error(`slug is not a shipped constraint: ${slug}`);
  }
  return { kind: "adjacent", order: roots.length + hopIndex + 1 };
}

export function productionTopSlugs(): string[] {
  return slugsOf(rankBottlenecks(CANDIDATES, TOP_N));
}
