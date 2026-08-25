import { CANDIDATES } from "../data/candidates";
import { rankedRoots } from "../lib/picture";

export const WIRE = [
  "state-hardware",
  "planning",
  "grid-slot",
  "firm-power",
  "acute-beds",
] as const;

export type SlotId = (typeof WIRE)[number];

export type CardKind = "instrument" | "symptom";

export type Card = {
  id: string;
  kind: CardKind;
  slot?: SlotId;
  code: string;
  label: string;
  blurb: string;
};

export type SlotState = {
  id: SlotId;
  name: string;
  shortName: string;
  protagonist: string;
  waiting: string;
  tightness: number;
  cracked: boolean;
};

export type Status = "playing" | "won" | "lost";

export type GameState = {
  seed: number;
  year: number;
  maxYears: number;
  actionsLeft: number;
  actionsPerYear: number;
  bind: SlotId;
  slots: SlotState[];
  queue: number;
  hand: Card[];
  log: string[];
  status: Status;
  deals: number;
};

export const MAX_YEARS = 6;
export const ACTIONS = 2;
export const QUEUE_CAP = 100;
export const CRACK_AT = 35;
export const BIND_HIT = 48;
export const SLACK_HIT = 10;
export const SYMPTOM_QUEUE = 15;
export const YEAR_QUEUE = 7;

const FLAVOUR: Record<
  SlotId,
  { protagonist: string; waiting: string; cracked: string }
> = {
  "state-hardware": {
    protagonist: "Rhian, transmission engineer",
    waiting: "Someone who can hire, fire, and finish",
    cracked: "Rhian can hire. The corridor has a person attached to it.",
  },
  planning: {
    protagonist: "Dev, small builder",
    waiting: "A lawful yes for a site he already owns",
    cracked: "Dev can start. The bricks leave the lorry.",
  },
  "grid-slot": {
    protagonist: "Anwen, mill manager",
    waiting: "A plug for kit that is already on site",
    cracked: "Anwen has a date in months. The mill can plug in.",
  },
  "firm-power": {
    protagonist: "Anwen again, same mill",
    waiting: "A bill that can beat Dunkirk",
    cracked: "The night shift is viable. The order book can stay.",
  },
  "acute-beds": {
    protagonist: "Priya, night sister",
    waiting: "A bed that is empty tonight",
    cracked: "Tuesday's patient is home. Priya has a bay.",
  },
};

export const INSTRUMENTS: Card[] = [
  {
    id: "cs1",
    kind: "instrument",
    slot: "state-hardware",
    code: "CS1",
    label: "Hire and fire",
    blurb: "Works on hardware. Lets the machine finish what it starts.",
  },
  {
    id: "e4",
    kind: "instrument",
    slot: "planning",
    code: "E4",
    label: "Default yes",
    blurb: "Works on planning. A lawful yes, not a housing slogan.",
  },
  {
    id: "e13",
    kind: "instrument",
    slot: "grid-slot",
    code: "E1.3",
    label: "12-month connection",
    blurb: "Works on the grid. A plug this parliament.",
  },
  {
    id: "e11",
    kind: "instrument",
    slot: "firm-power",
    code: "E1.1",
    label: "Firm power",
    blurb: "Works on the bill. Night shifts, foundries, data halls.",
  },
  {
    id: "nhs1",
    kind: "instrument",
    slot: "acute-beds",
    code: "NHS1",
    label: "Beds and discharge",
    blurb: "Works on beds. Send home the people who are ready.",
  },
];

export const SYMPTOMS: Card[] = [
  {
    id: "s-target",
    kind: "symptom",
    code: "SLOGAN",
    label: "1.5 million homes",
    blurb: "An output wish. Does not stamp a consent.",
  },
  {
    id: "s-police",
    kind: "symptom",
    code: "SLOGAN",
    label: "More police",
    blurb: "Fills a hopper the estate cannot empty.",
  },
  {
    id: "s-appts",
    kind: "symptom",
    code: "SLOGAN",
    label: "40,000 extra appointments",
    blurb: "The list is stock. The bed is the slot.",
  },
  {
    id: "s-waste",
    kind: "symptom",
    code: "SLOGAN",
    label: "£100bn waste headline",
    blurb: "A lump. Contract value is not spend.",
  },
  {
    id: "s-subsidy",
    kind: "symptom",
    code: "SLOGAN",
    label: "Another subsidy round",
    blurb: "A wind farm in a press release is not a plug.",
  },
  {
    id: "s-spike",
    kind: "symptom",
    code: "SLOGAN",
    label: "Blame the weather",
    blurb: "Wholesale spikes are weather. The bill is a level.",
  },
];

function tightnessFor(slug: string): number {
  return CANDIDATES.find((c) => c.slug === slug)?.tightness ?? 90;
}

function mulberry(seed: number): () => number {
  let s = seed | 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pick<T>(rand: () => number, list: T[]): T {
  return list[Math.floor(rand() * list.length) % list.length];
}

function bindOf(slots: SlotState[]): SlotId {
  const live = slots.find((s) => !s.cracked);
  return live?.id ?? slots[slots.length - 1].id;
}

function log(state: GameState, line: string): GameState {
  return { ...state, log: [line, ...state.log].slice(0, 8) };
}

function conclude(state: GameState): GameState {
  if (state.queue >= QUEUE_CAP) {
    return log(
      { ...state, status: "lost", queue: QUEUE_CAP, actionsLeft: 0 },
      "The hopper overflowed. Inventory won the parliament.",
    );
  }
  const cracked = state.slots.filter((s) => s.cracked).length;
  if (cracked >= state.slots.length) {
    return log(
      { ...state, status: "won" },
      "Five slots open. The mill has a date. The bed is empty. The consent is a yes.",
    );
  }
  if (state.year > state.maxYears) {
    if (cracked >= 4 && state.queue < 55) {
      return log(
        { ...state, status: "won" },
        "Parliament ends with the wire mostly open. Queue still in hand.",
      );
    }
    return log(
      { ...state, status: "lost" },
      "The years ran out. Too many slots still tight.",
    );
  }
  return state;
}

function dealHand(state: GameState): Card[] {
  const rand = mulberry(state.seed + state.year * 97 + state.deals * 13);
  const bindCard = INSTRUMENTS.find((c) => c.slot === state.bind) ?? INSTRUMENTS[0];
  const others = INSTRUMENTS.filter((c) => c.id !== bindCard.id);
  const hand: Card[] = [];
  if (state.year === 1) {
    hand.push({ ...bindCard, id: `${bindCard.id}-y${state.year}-a` });
  } else if (rand() < 0.75) {
    hand.push({ ...bindCard, id: `${bindCard.id}-y${state.year}-a` });
  } else {
    const extra = pick(rand, others);
    hand.push({ ...extra, id: `${extra.id}-y${state.year}-a` });
  }
  const second = pick(rand, rand() < 0.55 ? others : SYMPTOMS);
  hand.push({ ...second, id: `${second.id}-y${state.year}-b` });
  const third = pick(rand, SYMPTOMS);
  hand.push({ ...third, id: `${third.id}-y${state.year}-c` });
  return hand;
}

export function startCabinet(seed = 2026): GameState {
  const roots = rankedRoots();
  const slots: SlotState[] = WIRE.map((id) => {
    const root = roots.find((r) => r.slug === id);
    const flavour = FLAVOUR[id];
    return {
      id,
      name: root?.name ?? id,
      shortName: root?.shortName ?? id,
      protagonist: flavour.protagonist,
      waiting: flavour.waiting,
      tightness: tightnessFor(id),
      cracked: false,
    };
  });
  const bind = bindOf(slots);
  const base: GameState = {
    seed,
    year: 1,
    maxYears: MAX_YEARS,
    actionsLeft: ACTIONS,
    actionsPerYear: ACTIONS,
    bind,
    slots,
    queue: 18,
    hand: [],
    log: [
      "Year 1. Hardware sits above everything. The gold BIND is the only slot that really moves.",
    ],
    status: "playing",
    deals: 1,
  };
  return { ...base, hand: dealHand(base) };
}

function advanceYear(state: GameState): GameState {
  let next: GameState = {
    ...state,
    year: state.year + 1,
    deals: state.deals + 1,
    actionsLeft: state.slots[0].cracked ? 3 : ACTIONS,
    actionsPerYear: state.slots[0].cracked ? 3 : ACTIONS,
  };
  if (next.slots.find((s) => s.id === next.bind && !s.cracked)) {
    next.queue = Math.min(QUEUE_CAP, next.queue + YEAR_QUEUE);
    next = log(
      next,
      `Winter. The ${next.slots.find((s) => s.id === next.bind)?.shortName} slot is still tight. Queue +${YEAR_QUEUE}.`,
    );
  }
  next.bind = bindOf(next.slots);
  next.hand = dealHand(next);
  if (next.year > next.maxYears) {
    return conclude(next);
  }
  next = log(next, `Year ${next.year}. Bind: ${next.slots.find((s) => s.id === next.bind)?.name}.`);
  return conclude(next);
}

export function playOnSlot(state: GameState, cardId: string, slotId: SlotId): GameState {
  if (state.status !== "playing") return state;
  const card = state.hand.find((c) => c.id === cardId);
  if (!card || state.actionsLeft <= 0) return state;
  const slots = state.slots.map((s) => ({ ...s }));
  const target = slots.find((s) => s.id === slotId);
  if (!target) return state;

  let queue = state.queue;
  let line = "";

  if (card.kind === "symptom") {
    queue = Math.min(QUEUE_CAP, queue + SYMPTOM_QUEUE);
    line = `${card.label} is inventory. Queue +${SYMPTOM_QUEUE}. ${target.protagonist.split(",")[0]} still waits.`;
  } else if (card.slot !== slotId) {
    queue = Math.min(QUEUE_CAP, queue + 4);
    line = `${card.code} does not fit ${target.shortName}. Wrong door. Queue ticks up.`;
  } else if (slotId !== state.bind) {
    target.tightness = Math.max(0, target.tightness - SLACK_HIT);
    queue = Math.min(QUEUE_CAP, queue + 5);
    const bindName = slots.find((s) => s.id === state.bind)?.name;
    line = `${card.code} on a slot with slack. Throughput barely moves. The bind is still ${bindName}.`;
  } else {
    target.tightness = Math.max(0, target.tightness - BIND_HIT);
    queue = Math.max(0, queue - 12);
    if (target.tightness <= CRACK_AT) {
      target.cracked = true;
      target.tightness = Math.min(target.tightness, 28);
      line = FLAVOUR[slotId].cracked;
    } else {
      line = `${card.code} hits the bind. ${target.shortName} tightness ${Math.round(target.tightness)}%. ${target.protagonist.split(",")[0]} felt that.`;
    }
  }

  const bind = bindOf(slots);
  let next: GameState = {
    ...state,
    slots,
    queue,
    bind,
    hand: state.hand.filter((c) => c.id !== cardId),
    actionsLeft: state.actionsLeft - 1,
  };
  next = log(next, line);
  next = conclude(next);
  if (next.status !== "playing") return next;
  if (next.actionsLeft <= 0) {
    return advanceYear(next);
  }
  return next;
}

export function changePapers(state: GameState): GameState {
  if (state.status !== "playing" || state.actionsLeft <= 0) return state;
  let next: GameState = {
    ...state,
    deals: state.deals + 1,
    actionsLeft: state.actionsLeft - 1,
  };
  next.hand = dealHand(next);
  next = log(next, "You sent the papers back. New hand. One action spent.");
  next = conclude(next);
  if (next.status !== "playing") return next;
  if (next.actionsLeft <= 0) {
    return advanceYear(next);
  }
  return next;
}

export function crackedCount(state: GameState): number {
  return state.slots.filter((s) => s.cracked).length;
}

export function bindSlot(state: GameState): SlotState {
  return state.slots.find((s) => s.id === state.bind) ?? state.slots[0];
}
