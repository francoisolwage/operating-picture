import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  ACTIONS,
  BIND_HIT,
  CRACK_AT,
  INSTRUMENTS,
  QUEUE_CAP,
  SYMPTOMS,
  bindSlot,
  changePapers,
  crackedCount,
  playOnSlot,
  startCabinet,
  type GameState,
} from "./cabinet.ts";
import { productionTopSlugs } from "../lib/picture.ts";

function withHand(state: GameState, cards: GameState["hand"]): GameState {
  return { ...state, hand: cards, actionsLeft: Math.max(state.actionsLeft, 1) };
}

const cs1 = { ...INSTRUMENTS[0], id: "test-cs1" };
const e4 = { ...INSTRUMENTS[1], id: "test-e4" };
const slogan = { ...SYMPTOMS[0], id: "test-slogan" };

describe("cabinet setup", () => {
  it("opens on the ranked five with hardware as the bind", () => {
    const g = startCabinet(2026);
    assert.deepEqual(
      g.slots.map((s) => s.id),
      productionTopSlugs(),
    );
    assert.equal(g.bind, "state-hardware");
    assert.equal(g.year, 1);
    assert.equal(g.hand.length, 3);
    assert.equal(g.status, "playing");
    assert.ok(g.hand.some((c) => c.code === "CS1"));
  });
});

describe("plays", () => {
  it("hits the bind with its instrument and lowers tightness", () => {
    const g0 = withHand(startCabinet(1), [cs1]);
    const before = bindSlot(g0).tightness;
    const g1 = playOnSlot(g0, cs1.id, "state-hardware");
    assert.equal(bindSlot(g0).tightness - BIND_HIT, g1.slots[0].tightness);
    assert.ok(g1.slots[0].tightness < before);
    assert.ok(g1.queue < g0.queue);
    assert.equal(g1.hand.length, 0);
  });

  it("slogans fill the queue and leave tightness alone", () => {
    const g0 = withHand(startCabinet(1), [slogan]);
    const t = g0.slots[0].tightness;
    const g1 = playOnSlot(g0, slogan.id, "state-hardware");
    assert.equal(g1.slots[0].tightness, t);
    assert.ok(g1.queue > g0.queue);
    assert.match(g1.log[0] ?? "", /inventory/i);
  });

  it("an instrument on the wrong slot does not crack the bind", () => {
    const g0 = withHand(startCabinet(1), [e4]);
    const g1 = playOnSlot(g0, e4.id, "state-hardware");
    assert.equal(g1.slots[0].cracked, false);
    assert.equal(g1.bind, "state-hardware");
    assert.match(g1.log[0] ?? "", /wrong door/i);
  });

  it("an instrument off the bind is slack and does not move the gold slot much", () => {
    const g0 = withHand(startCabinet(1), [e4]);
    const plan0 = g0.slots.find((s) => s.id === "planning")!.tightness;
    const g1 = playOnSlot(g0, e4.id, "planning");
    const plan1 = g1.slots.find((s) => s.id === "planning")!.tightness;
    assert.ok(plan0 - plan1 <= 12);
    assert.equal(g1.bind, "state-hardware");
    assert.match(g1.log[0] ?? "", /slack/i);
  });

  it("two bind hits crack hardware and move the bind down the wire", () => {
    let g = withHand(startCabinet(1), [cs1, { ...cs1, id: "cs1-b" }]);
    g = { ...g, actionsLeft: 2 };
    g = playOnSlot(g, cs1.id, "state-hardware");
    g = playOnSlot(g, "cs1-b", "state-hardware");
    assert.equal(g.slots[0].cracked, true);
    assert.ok(g.slots[0].tightness <= CRACK_AT);
    assert.equal(g.bind, "planning");
  });

  it("queue at cap loses", () => {
    const g0 = withHand(
      { ...startCabinet(1), queue: QUEUE_CAP - 1 },
      [slogan],
    );
    const g1 = playOnSlot(g0, slogan.id, "state-hardware");
    assert.equal(g1.status, "lost");
  });

  it("changing papers costs an action and deals a new hand", () => {
    const g0 = startCabinet(3);
    const ids = g0.hand.map((c) => c.id).join(",");
    const g1 = changePapers(g0);
    assert.equal(g1.actionsLeft, ACTIONS - 1);
    assert.equal(g1.hand.length, 3);
    assert.notEqual(g1.hand.map((c) => c.id).join(","), ids);
  });

  it("cracking every slot wins", () => {
    let g = startCabinet(9);
    g = {
      ...g,
      slots: g.slots.map((s) => ({ ...s, cracked: true, tightness: 20 })),
      bind: "acute-beds",
      hand: [cs1],
      actionsLeft: 1,
      queue: 10,
    };
    g = playOnSlot(g, cs1.id, "state-hardware");
    assert.equal(g.status, "won");
  });
});
