import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { campaignStages } from "./stages.ts";
import { matchScore, shareLine, startStage, step } from "./sim.ts";
import { RULES, WORLD, type Input, type StageDef } from "./types.ts";
import { productionTopSlugs } from "../lib/picture.ts";

const fixture: StageDef = {
  slug: "planning",
  name: "Planning default-no",
  shortName: "Planning",
  slot: "Consent.",
  story: "A lawful yes.",
  tightness: 55,
  instrumentCode: "E4",
  instrumentLabel: "Default yes",
  unit: "homes",
  unitLabel: "homes consented",
  perHit: 1000,
  cards: [
    { kind: "instrument", label: "Default yes", code: "E4" },
    { kind: "symptom", label: "Housing target", code: "SYMP" },
    { kind: "symptom", label: "Help to Buy", code: "SYMP" },
  ],
};

const idle: Input = { left: false, right: false, fire: false };

function hitSlot(state = startStage(fixture), kind: "instrument" | "symptom" = "instrument") {
  const primed = {
    ...state,
    papers: [],
    paperTimer: 99,
    shots: [
      {
        x: state.slotX + RULES.slotW / 2 - RULES.shotW / 2,
        y: RULES.slotY + 8,
        kind,
      },
    ],
  };
  return step(primed, idle, 0.016);
}

describe("campaign stages", () => {
  it("follows rankedRoots and never includes hoppers", () => {
    const stages = campaignStages();
    assert.deepEqual(
      stages.map((s) => s.slug),
      productionTopSlugs(),
    );
    assert.equal(stages.length, 5);
    assert.ok(!stages.some((s) => s.slug === "prison-places"));
    assert.ok(!stages.some((s) => s.slug === "returns"));
  });

  it("puts exactly one instrument card on each loadout", () => {
    for (const stage of campaignStages()) {
      const instruments = stage.cards.filter((c) => c.kind === "instrument");
      assert.equal(instruments.length, 1, stage.slug);
      assert.equal(stage.cards.length, 3);
    }
  });

  it("can break every campaign stage with instruments only", () => {
    for (const stage of campaignStages()) {
      let s = startStage(stage);
      let guard = 0;
      while (s.status === "playing" && guard < 40) {
        guard += 1;
        s = {
          ...s,
          queue: 10,
          papers: [],
          paperTimer: 99,
          shots: [
            {
              x: s.slotX + RULES.slotW / 2 - RULES.shotW / 2,
              y: RULES.slotY + 8,
              kind: "instrument",
            },
          ],
        };
        s = step(s, idle, 0.016).state;
      }
      assert.equal(s.status, "won", stage.slug);
    }
  });
});

describe("combat", () => {
  it("instrument hit on the slot lowers tightness and raises throughput", () => {
    const before = startStage(fixture);
    const { state, events } = hitSlot(before, "instrument");
    assert.ok(events.some((e) => e.type === "slot-hit"));
    assert.ok(state.tightness < before.tightness);
    assert.ok(state.throughput > 0);
    assert.equal(state.instrumentHits, 1);
  });

  it("symptom hit does not lower tightness and raises the queue", () => {
    const before = startStage(fixture);
    const { state, events } = hitSlot(before, "symptom");
    assert.ok(events.some((e) => e.type === "bounce"));
    assert.equal(state.tightness, before.tightness);
    assert.ok(state.queue > before.queue);
    assert.equal(state.symptomHits, 1);
  });

  it("firing only symptoms never wins the stage", () => {
    let s = startStage({ ...fixture, tightness: 20 });
    for (let i = 0; i < 40; i++) {
      const r = hitSlot(s, "symptom");
      s = { ...r.state, shots: [], papers: [], paperTimer: 99, queue: 20 };
      if (s.status === "won") break;
    }
    assert.notEqual(s.status, "won");
    assert.ok(s.tightness > 0);
  });

  it("enough instrument hits win at tightness 0", () => {
    const s = startStage({ ...fixture, tightness: RULES.instrumentDamage });
    const { state } = hitSlot(s, "instrument");
    assert.equal(state.status, "won");
    assert.equal(state.tightness, 0);
  });

  it("space-fire spawns a shot of the selected card", () => {
    const started = startStage(fixture);
    const i = started.stage.cards.findIndex((c) => c.kind === "symptom");
    const s = { ...started, selected: i, cooldown: 0 };
    const r = step(s, { ...idle, fire: true }, 0.016);
    assert.equal(r.state.shots.length, 1);
    assert.equal(r.state.shots[0].kind, "symptom");
    assert.ok(r.events.some((e) => e.type === "fire"));
  });

  it("shuffles loadout but keeps one instrument", () => {
    const s = startStage(fixture);
    assert.equal(s.stage.cards.filter((c) => c.kind === "instrument").length, 1);
    assert.equal(s.stage.cards.length, 3);
  });

  it("queue at cap loses", () => {
    const s = startStage(fixture);
    const r = step(
      { ...s, queue: RULES.queueCap - 1, papers: [{ x: s.playerX, y: RULES.playerY, vy: 0 }] },
      idle,
      0.05,
    );
    assert.equal(r.state.status, "lost");
    assert.ok(r.events.some((e) => e.type === "lose"));
  });

  it("papers that miss the operator do not fill the queue", () => {
    const s = startStage(fixture);
    const r = step(
      {
        ...s,
        papers: [{ x: 20, y: 400, vy: 10 }],
        paperTimer: 99,
      },
      idle,
      0.05,
    );
    assert.equal(r.state.queue, s.queue);
    assert.equal(r.state.papersHit, 0);
  });
});

describe("score", () => {
  it("never goes negative", () => {
    const s = startStage(fixture);
    assert.ok(matchScore({ ...s, symptomHits: 40, papersHit: 40, queue: 100, throughput: 0 }) >= 0);
  });

  it("won share line names throughput", () => {
    const s = { ...startStage(fixture), status: "won" as const, throughput: 18600 };
    assert.match(shareLine(s), /broke the planning slot/i);
    assert.match(shareLine(s), /18,600/);
  });

  it("player stays inside the world", () => {
    let s = startStage(fixture);
    for (let i = 0; i < 80; i++) {
      s = step(s, { left: true, right: false, fire: false }, 0.05).state;
    }
    assert.ok(s.playerX >= 24);
    s = startStage(fixture);
    for (let i = 0; i < 80; i++) {
      s = step(s, { left: false, right: true, fire: false }, 0.05).state;
    }
    assert.ok(s.playerX + RULES.playerW <= WORLD.w - 24);
  });
});
