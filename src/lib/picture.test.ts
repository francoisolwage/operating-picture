import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { CANDIDATES, CONSIDERED } from "../data/candidates.ts";
import { constraints, getConstraint } from "../data/constraints.ts";
import {
  adjacentHoppers,
  productionTopSlugs,
  rankLabel,
  rankedRoots,
} from "./picture.ts";
import { rankBottlenecks, slugsOf } from "./rank.ts";

const EXPECTED_TOP = [
  "state-hardware",
  "planning",
  "grid-slot",
  "firm-power",
  "acute-beds",
] as const;

const EXPECTED_HOPPERS = ["prison-places", "returns"] as const;

describe("production ranking", () => {
  it("ranks five national roots in Goldratt order", () => {
    assert.deepEqual(productionTopSlugs(), [...EXPECTED_TOP]);
    assert.deepEqual(
      rankedRoots().map((c) => c.slug),
      [...EXPECTED_TOP],
    );
    assert.deepEqual(
      rankedRoots().map((c) => c.order),
      [1, 2, 3, 4, 5],
    );
  });

  it("demotes prison places and returns to adjacent hoppers", () => {
    const hops = adjacentHoppers().map((c) => c.slug);
    assert.deepEqual(hops, [...EXPECTED_HOPPERS]);
    for (const slug of EXPECTED_HOPPERS) {
      assert.ok(!productionTopSlugs().includes(slug));
      assert.equal(rankLabel(slug).kind, "adjacent");
    }
  });

  it("does not promote water, skills, GFCF, or inactivity into the top five", () => {
    const top = new Set(productionTopSlugs());
    for (const slug of ["water", "skills", "gfcf", "inactivity"] as const) {
      assert.ok(!top.has(slug), `${slug} leaked into the top five`);
    }
    const considered = new Set(CONSIDERED.map((c) => c.slug));
    assert.ok(considered.has("water"));
    assert.ok(considered.has("skills"));
    assert.ok(considered.has("gfcf"));
    assert.ok(considered.has("inactivity"));
  });

  it("only returns slugs that have constraint pages", () => {
    for (const c of rankedRoots()) {
      assert.ok(getConstraint(c.slug), c.slug);
    }
    for (const c of adjacentHoppers()) {
      assert.ok(getConstraint(c.slug), c.slug);
    }
  });

  it("keeps every shipped constraint either a root or a hopper", () => {
    const seen = new Set([
      ...rankedRoots().map((c) => c.slug),
      ...adjacentHoppers().map((c) => c.slug),
    ]);
    assert.deepEqual(
      [...seen].sort(),
      constraints.map((c) => c.slug).sort(),
    );
  });

  it("labels roots as root 1-5", () => {
    EXPECTED_TOP.forEach((slug, i) => {
      assert.deepEqual(rankLabel(slug), { kind: "root", order: i + 1 });
    });
  });

  it("would admit water if it were national, proving replacement is live", () => {
    const boosted = CANDIDATES.map((c) =>
      c.slug === "water"
        ? { ...c, nationalScope: 95, unlocksOthers: 2 }
        : c,
    );
    const top = slugsOf(rankBottlenecks(boosted, 5));
    assert.ok(top.includes("water"));
    assert.ok(!top.includes("acute-beds"));
  });
});
