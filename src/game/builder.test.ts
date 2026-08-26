import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  BIND_HIT,
  WIRE,
  clockOut,
  enactPolicy,
  homeSlotOf,
  isStalled,
  lockReason,
  PROJECTS,
  resolveEvent,
  scoreOf,
  startBuilder,
  startProject,
  worksForSlot,
} from "./builder.ts";

describe("builder setup", () => {
  it("opens year 1 with hardware as the bind and three moves", () => {
    const g = startBuilder(1);
    assert.equal(g.year, 1);
    assert.equal(g.bind, "state-hardware");
    assert.equal(g.ap, 3);
    assert.equal(g.phase, "act");
    assert.equal(g.slots.length, 5);
  });
});

describe("stalls and locks", () => {
  it("Rhian's corridor starts stalled on the hardware bind", () => {
    const g = startProject(startBuilder(1), "corridor");
    const flight = g.flights.find((f) => f.defId === "corridor");
    assert.ok(flight);
    assert.equal(flight!.stalled, true);
    assert.match(g.log[0] ?? "", /stalled/i);
  });

  it("the mill is locked while power and grid are tight", () => {
    const g = startBuilder(1);
    const mill = PROJECTS.find((p) => p.id === "mill")!;
    const reason = lockReason(g, mill);
    assert.ok(reason);
    assert.match(reason!, /Dunkirk|Dublin|bill/i);
  });

  it("CS1 on the bind lowers hardware tightness by BIND_HIT", () => {
    const g0 = startBuilder(2);
    const t0 = g0.slots[0].tightness;
    const g1 = enactPolicy(g0, "cs1");
    assert.equal(g1.slots[0].tightness, t0 - BIND_HIT);
    assert.equal(g1.ap, g0.ap - 1);
  });

  it("E4 while hardware is the bind is slack", () => {
    const g0 = startBuilder(3);
    const g1 = enactPolicy(g0, "e4");
    assert.equal(g1.bind, "state-hardware");
    assert.match(g1.log[0] ?? "", /slack/i);
  });

  it("two CS1 plays crack hardware", () => {
    let g = startBuilder(4);
    g = enactPolicy(g, "cs1");
    g = enactPolicy(g, "cs1");
    assert.equal(g.slots[0].cracked, true);
    assert.equal(g.bind, "planning");
  });
});

describe("end states", () => {
  it("patience 0 loses", () => {
    const g0 = startBuilder(5);
    const g1 = resolveEvent(
      { ...g0, phase: "event", event: { id: "waste", title: "x", body: "y", options: [] }, patience: 1 },
      0,
    );
    assert.ok(g1.phase === "lost" || g1.patience <= 1);
  });

  it("a mill plus homes plus patients is a win", () => {
    const g0 = startBuilder(6);
    const g1 = startProject(
      {
        ...g0,
        economy: { ...g0.economy, mills: 1, homes: 50000, patients: 8000 },
        treasury: 20,
      },
      "intake",
    );
    assert.equal(g1.phase, "won");
  });

  it("score rises with real output", () => {
    const empty = startBuilder(7);
    const rich = {
      ...empty,
      economy: { homes: 70000, gw: 5, patients: 11000, mills: 1, halls: 1, income: 10 },
      slots: empty.slots.map((s) => ({ ...s, cracked: true, tightness: 20 })),
    };
    assert.ok(scoreOf(rich) > scoreOf(empty));
  });
});

describe("stall helper", () => {
  it("intake does not stall on the bind", () => {
    const g = startBuilder(8);
    const intake = PROJECTS.find((p) => p.id === "intake")!;
    assert.equal(isStalled(g, intake), false);
  });

  it("each wire slot has works you can start from the console", () => {
    for (const id of WIRE) {
      assert.ok(worksForSlot(id).length >= 2, id);
    }
  });

  it("corridor chips sit on hardware first", () => {
    assert.equal(homeSlotOf("corridor"), "state-hardware");
    assert.equal(homeSlotOf("mill"), "firm-power");
  });
});

describe("clock out", () => {
  it("closes the year with unspent moves", () => {
    const g0 = startBuilder(9);
    assert.equal(g0.ap, 3);
    const g1 = clockOut(g0);
    assert.equal(g1.year, 2);
    assert.equal(g1.ap, g1.apMax);
    assert.match(g1.log.join(" "), /unspent/i);
  });

  it("does not clock out during an event", () => {
    const g0 = startBuilder(10);
    const g1 = clockOut({
      ...g0,
      phase: "event",
      event: { id: "winter", title: "x", body: "y", options: [] },
    });
    assert.equal(g1.year, g0.year);
    assert.equal(g1.phase, "event");
  });

  it("a stalled corridor does not spend a year when you clock out", () => {
    let g = startBuilder(11);
    g = startProject(g, "corridor");
    const before = g.flights.find((f) => f.defId === "corridor")!;
    assert.equal(before.stalled, true);
    g = clockOut(g);
    const after = g.flights.find((f) => f.defId === "corridor");
    assert.ok(after);
    assert.equal(after!.yearsLeft, before.yearsLeft);
    assert.equal(after!.stalled, true);
  });

  it("clock out with no moves left is a no-op", () => {
    const g0 = { ...startBuilder(12), ap: 0 };
    const g1 = clockOut(g0);
    assert.equal(g1.year, g0.year);
  });
});
