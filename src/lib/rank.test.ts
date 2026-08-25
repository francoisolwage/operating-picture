import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  type RankCandidate,
  WEIGHTS,
  rankBottlenecks,
  scoreCandidate,
  slugsOf,
} from "./rank.ts";

function cand(partial: Partial<RankCandidate> & { slug: string }): RankCandidate {
  return {
    tightness: 50,
    nationalScope: 50,
    unlocksOthers: 0,
    doublingTest: true,
    isSymptom: false,
    ...partial,
  };
}

describe("scoreCandidate", () => {
  it("adds the doubling bonus only when the test passes and it is not a symptom", () => {
    const live = scoreCandidate(
      cand({ slug: "live", tightness: 80, nationalScope: 80, doublingTest: true }),
    );
    const dead = scoreCandidate(
      cand({ slug: "dead", tightness: 80, nationalScope: 80, doublingTest: false }),
    );
    assert.ok(live > dead);
    assert.equal(live - dead, WEIGHTS.doublingPass + WEIGHTS.failPenalty);
  });

  it("penalises symptoms even if they look tight", () => {
    const slot = scoreCandidate(cand({ slug: "slot", tightness: 70, doublingTest: true }));
    const wish = scoreCandidate(
      cand({ slug: "wish", tightness: 99, isSymptom: true, doublingTest: false }),
    );
    assert.ok(slot > wish);
    assert.ok(wish < 0);
  });

  it("lets unlocksOthers lift a meta-constraint above a tighter local hopper", () => {
    const hardware = scoreCandidate(
      cand({
        slug: "hardware",
        tightness: 80,
        nationalScope: 100,
        unlocksOthers: 6,
      }),
    );
    const cells = scoreCandidate(
      cand({
        slug: "cells",
        tightness: 99,
        nationalScope: 40,
        unlocksOthers: 0,
      }),
    );
    assert.ok(hardware > cells);
  });

  it("prefers national scope over raw tightness", () => {
    const national = scoreCandidate(
      cand({ slug: "national", tightness: 80, nationalScope: 90 }),
    );
    const local = scoreCandidate(
      cand({ slug: "local", tightness: 100, nationalScope: 20 }),
    );
    assert.ok(national > local);
  });

  it("rejects out-of-range tightness", () => {
    assert.throws(() => scoreCandidate(cand({ slug: "x", tightness: 101 })));
    assert.throws(() => scoreCandidate(cand({ slug: "x", tightness: -1 })));
  });
});

describe("rankBottlenecks", () => {
  const field: RankCandidate[] = [
    cand({ slug: "symptom-queue", tightness: 100, nationalScope: 90, isSymptom: true, doublingTest: false }),
    cand({ slug: "local-hopper", tightness: 99, nationalScope: 25 }),
    cand({ slug: "meta", tightness: 82, nationalScope: 100, unlocksOthers: 5 }),
    cand({ slug: "national-a", tightness: 95, nationalScope: 90, unlocksOthers: 2 }),
    cand({ slug: "national-b", tightness: 90, nationalScope: 88, unlocksOthers: 1 }),
    cand({ slug: "national-c", tightness: 88, nationalScope: 70 }),
    cand({ slug: "failed-double", tightness: 97, nationalScope: 80, doublingTest: false }),
  ];

  it("returns the top N by score, never a symptom or failed doubling test", () => {
    const top = rankBottlenecks(field, 5);
    const slugs = slugsOf(top);
    assert.equal(top.length, 5);
    assert.deepEqual(slugs, [
      "meta",
      "national-a",
      "national-b",
      "national-c",
      "local-hopper",
    ]);
    assert.ok(!slugs.includes("symptom-queue"));
    assert.ok(!slugs.includes("failed-double"));
  });

  it("replaces a weak national slot when a stronger candidate is added", () => {
    const extra = cand({
      slug: "new-bind",
      tightness: 93,
      nationalScope: 85,
      unlocksOthers: 1,
    });
    const top = slugsOf(rankBottlenecks([...field, extra], 5));
    assert.ok(top.includes("new-bind"));
    assert.ok(!top.includes("local-hopper"));
  });

  it("is deterministic", () => {
    const a = slugsOf(rankBottlenecks(field, 5));
    const b = slugsOf(rankBottlenecks(field, 5));
    assert.deepEqual(a, b);
  });

  it("returns an empty list for topN 0 and for no candidates", () => {
    assert.deepEqual(rankBottlenecks(field, 0), []);
    assert.deepEqual(rankBottlenecks([], 5), []);
  });

  it("breaks score ties by slug", () => {
    const tied: RankCandidate[] = [
      cand({ slug: "zeta", tightness: 80, nationalScope: 80 }),
      cand({ slug: "alpha", tightness: 80, nationalScope: 80 }),
    ];
    assert.deepEqual(slugsOf(rankBottlenecks(tied, 2)), ["alpha", "zeta"]);
  });
});
