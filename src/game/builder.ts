export const WIRE = [
  "state-hardware",
  "planning",
  "grid-slot",
  "firm-power",
  "acute-beds",
] as const;

export type SlotId = (typeof WIRE)[number];

export type Phase = "act" | "event" | "won" | "lost";

export type SlotState = {
  id: SlotId;
  name: string;
  shortName: string;
  protagonist: string;
  waiting: string;
  tightness: number;
  cracked: boolean;
};

export type Flight = {
  uid: string;
  defId: string;
  yearsLeft: number;
  stalled: boolean;
};

export type Economy = {
  homes: number;
  gw: number;
  patients: number;
  mills: number;
  halls: number;
  income: number;
};

export type EventOpt = { label: string; hint: string };
export type GameEvent = {
  id: string;
  title: string;
  body: string;
  options: EventOpt[];
};

export type ProjectDef = {
  id: string;
  name: string;
  blurb: string;
  cost: number;
  years: number;
  max: number;
  stallOn: SlotId[];
  needs: SlotId[];
  locked: string;
  done: string;
  effect: Partial<Economy> & { tightness?: Partial<Record<SlotId, number>>; income?: number };
};

export type PolicyDef = {
  id: string;
  code: string;
  name: string;
  slot: SlotId;
  blurb: string;
};

export type GameState = {
  seed: number;
  year: number;
  maxYears: number;
  ap: number;
  apMax: number;
  treasury: number;
  patience: number;
  bind: SlotId;
  slots: SlotState[];
  flights: Flight[];
  built: string[];
  economy: Economy;
  log: string[];
  phase: Phase;
  event: GameEvent | null;
  nextUid: number;
};

export const MAX_YEARS = 8;
export const CRACK_AT = 40;
export const BIND_HIT = 36;
export const SLACK_HIT = 8;

const FLAVOUR: Record<
  SlotId,
  { name: string; shortName: string; protagonist: string; waiting: string; cracked: string }
> = {
  "state-hardware": {
    name: "State hardware",
    shortName: "Hardware",
    protagonist: "Rhian",
    waiting: "hire, fire, finish",
    cracked: "Rhian can hire. Projects start to move.",
  },
  planning: {
    name: "Planning default-no",
    shortName: "Planning",
    protagonist: "Dev",
    waiting: "a lawful yes",
    cracked: "Dev's bricks can leave the lorry.",
  },
  "grid-slot": {
    name: "Grid connection",
    shortName: "Grid",
    protagonist: "Anwen",
    waiting: "a plug this parliament",
    cracked: "The mill has a date in months.",
  },
  "firm-power": {
    name: "Firm power",
    shortName: "Power",
    protagonist: "Anwen",
    waiting: "a bill that beats Dunkirk",
    cracked: "The night shift pays. Foundries can stay hot.",
  },
  "acute-beds": {
    name: "Acute beds",
    shortName: "Beds",
    protagonist: "Priya",
    waiting: "a bed empty tonight",
    cracked: "Tuesday's patient is home.",
  },
};

export const PROJECTS: ProjectDef[] = [
  {
    id: "intake",
    name: "Angliot intake",
    blurb: "Put implementers in post. Hardware eases even while it is the bind.",
    cost: 2,
    years: 1,
    max: 3,
    stallOn: [],
    needs: [],
    locked: "",
    done: "A cohort of implementers is in post.",
    effect: { tightness: { "state-hardware": -24 } },
  },
  {
    id: "corridor",
    name: "Rhian's corridor",
    blurb: "A transmission route. Stalls while hardware or planning is the bind.",
    cost: 5,
    years: 3,
    max: 2,
    stallOn: ["state-hardware", "planning"],
    needs: [],
    locked: "",
    done: "Steel in the air. Grid tightness falls.",
    effect: { tightness: { "grid-slot": -30 }, gw: 2 },
  },
  {
    id: "town",
    name: "Dev's site",
    blurb: "Homes on land he already owns. Stalls on default-no.",
    cost: 4,
    years: 2,
    max: 3,
    stallOn: ["planning"],
    needs: [],
    locked: "",
    done: "Consents become starts. Families move in.",
    effect: { homes: 70000 },
  },
  {
    id: "connector",
    name: "12-month connections",
    blurb: "An authority that issues real dates. Stalls if the machine cannot finish a project.",
    cost: 4,
    years: 2,
    max: 2,
    stallOn: ["state-hardware"],
    needs: [],
    locked: "",
    done: "Ready projects get a date this parliament.",
    effect: { tightness: { "grid-slot": -32 }, gw: 3 },
  },
  {
    id: "reactor",
    name: "Firm reactor",
    blurb: "Dispatchable gigawatts. Long. Stalls on hardware, planning, and grid.",
    cost: 8,
    years: 4,
    max: 1,
    stallOn: ["state-hardware", "planning", "grid-slot"],
    needs: [],
    locked: "",
    done: "Firm power on the system. The bill can move.",
    effect: { tightness: { "firm-power": -38 }, gw: 5, income: 2 },
  },
  {
    id: "mill",
    name: "Port Talbot restart",
    blurb: "The kit is in the yard. Needs grid and power loose enough to run a night shift.",
    cost: 5,
    years: 2,
    max: 2,
    stallOn: ["grid-slot", "firm-power"],
    needs: ["grid-slot", "firm-power"],
    locked: "The mill still pays Dunkirk's bill. Ease grid and power first.",
    done: "The mill is running. Orders can stay in Britain.",
    effect: { mills: 1, income: 3 },
  },
  {
    id: "hall",
    name: "Data hall",
    blurb: "Servers follow cheap overnight power and a plug.",
    cost: 4,
    years: 2,
    max: 2,
    stallOn: ["grid-slot", "firm-power"],
    needs: ["grid-slot", "firm-power"],
    locked: "They will site in Dublin until power and plugs are real.",
    done: "A hall in Britain, not a press release.",
    effect: { halls: 1, income: 2 },
  },
  {
    id: "discharge",
    name: "Priya's discharge teams",
    blurb: "Send home the people who are ready. Does not stall on the bind.",
    cost: 2,
    years: 1,
    max: 4,
    stallOn: [],
    needs: [],
    locked: "",
    done: "Bays free overnight. The list can move.",
    effect: { tightness: { "acute-beds": -22 }, patients: 11000 },
  },
  {
    id: "ward",
    name: "Ward block",
    blurb: "New beds. Stalls if Whitehall cannot finish a building and planning says no.",
    cost: 6,
    years: 3,
    max: 2,
    stallOn: ["state-hardware", "planning"],
    needs: [],
    locked: "",
    done: "Empty beds exist. Corridor care has less excuse.",
    effect: { tightness: { "acute-beds": -16 }, patients: 8000, income: 1 },
  },
];

export const SLOT_WORKS: Record<SlotId, string[]> = {
  "state-hardware": ["intake", "corridor", "connector"],
  planning: ["town", "ward"],
  "grid-slot": ["corridor", "connector"],
  "firm-power": ["reactor", "mill", "hall"],
  "acute-beds": ["discharge", "ward"],
};

export function worksForSlot(id: SlotId): ProjectDef[] {
  return SLOT_WORKS[id]
    .map((pid) => PROJECTS.find((p) => p.id === pid))
    .filter((p): p is ProjectDef => Boolean(p));
}

export const POLICIES: PolicyDef[] = [
  {
    id: "cs1",
    code: "CS1",
    name: "Hire and fire",
    slot: "state-hardware",
    blurb: "The machine. Hits hardware hard if it is the bind.",
  },
  {
    id: "e4",
    code: "E4",
    name: "Default yes",
    slot: "planning",
    blurb: "A lawful yes. Housing targets will not stamp the form.",
  },
  {
    id: "e13",
    code: "E1.3",
    name: "Connection dates",
    slot: "grid-slot",
    blurb: "Months, not 2035. Names on a queue are not megawatts.",
  },
  {
    id: "e11",
    code: "E1.1",
    name: "Firm power act",
    slot: "firm-power",
    blurb: "Night shifts, foundries, heat, servers.",
  },
  {
    id: "nhs1",
    code: "NHS1",
    name: "Beds and discharge",
    slot: "acute-beds",
    blurb: "The bed is the slot. Extra appointments are stock.",
  },
];

const EVENTS: GameEvent[] = [
  {
    id: "target",
    title: "The 1.5 million wish",
    body: "The papers want a housing number tonight. A target is not a consent.",
    options: [
      { label: "Announce the target", hint: "+£4bn now. Patience takes a hit." },
      { label: "Refuse the slogan", hint: "No money. No queue." },
    ],
  },
  {
    id: "winter",
    title: "Winter in Priya's bay",
    body: "Occupancy spikes. Corridor care is back on the ten o'clock news.",
    options: [
      { label: "Fund discharge now", hint: "£2bn, beds ease." },
      { label: "Ride it out", hint: "Beds tighten. Patience falls." },
    ],
  },
  {
    id: "agr",
    title: "An AGR comes off",
    body: "Firm gigawatts walk. Intermittent names on a queue do not replace them.",
    options: [
      { label: "Accelerate the reactor path", hint: "£3bn. Power eases a little." },
      { label: "Hope the wind blows", hint: "Power tightens." },
    ],
  },
  {
    id: "waste",
    title: "A £100bn headline",
    body: "Contract value is not spend. The bind is that the state cannot finish.",
    options: [
      { label: "Feed the headline", hint: "Patience falls. You look busy." },
      { label: "Point at the bind", hint: "No change. Honest." },
    ],
  },
  {
    id: "dublin",
    title: "A data hall is shopping",
    body: "They will go to Dublin if the plug and the bill are still a joke.",
    options: [
      { label: "Discount a hall", hint: "Next hall costs £2bn less if you can build it." },
      { label: "Let them leave", hint: "Patience falls." },
    ],
  },
];

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

function bindOf(slots: SlotState[]): SlotId {
  return slots.find((s) => !s.cracked)?.id ?? slots[slots.length - 1].id;
}

function slot(state: GameState, id: SlotId): SlotState {
  return state.slots.find((s) => s.id === id)!;
}

function applyTightness(slots: SlotState[], delta: Partial<Record<SlotId, number>> | undefined): SlotState[] {
  if (!delta) return slots.map((s) => ({ ...s }));
  return slots.map((s) => {
    const d = delta[s.id] ?? 0;
    const tightness = clamp(s.tightness + d, 0, 100);
    const cracked = tightness <= CRACK_AT;
    return { ...s, tightness, cracked };
  });
}

function withLog(state: GameState, line: string): GameState {
  return { ...state, log: [line, ...state.log].slice(0, 10) };
}

function projectDef(id: string): ProjectDef {
  const d = PROJECTS.find((p) => p.id === id);
  if (!d) throw new Error(`unknown project ${id}`);
  return d;
}

export function inFlightCount(state: GameState, defId: string): number {
  return state.flights.filter((f) => f.defId === defId).length + state.built.filter((b) => b === defId).length;
}

export function isStalled(state: GameState, def: ProjectDef): boolean {
  return def.stallOn.some((id) => state.bind === id && slot(state, id).tightness > CRACK_AT);
}

export function lockReason(state: GameState, def: ProjectDef): string | null {
  if (inFlightCount(state, def.id) >= def.max) return "Already in train.";
  if (state.treasury < def.cost) return `Needs £${def.cost}bn.`;
  if (state.ap < 1) return "No moves left this year.";
  for (const id of def.needs) {
    if (slot(state, id).tightness > 55) return def.locked;
  }
  return null;
}

export function startBuilder(seed = 2026): GameState {
  const slots: SlotState[] = WIRE.map((id) => ({
    id,
    name: FLAVOUR[id].name,
    shortName: FLAVOUR[id].shortName,
    protagonist: FLAVOUR[id].protagonist,
    waiting: FLAVOUR[id].waiting,
    tightness: id === "state-hardware" ? 82 : id === "planning" ? 88 : id === "grid-slot" ? 90 : id === "firm-power" ? 84 : 86,
    cracked: false,
  }));
  return {
    seed,
    year: 1,
    maxYears: MAX_YEARS,
    ap: 3,
    apMax: 3,
    treasury: 16,
    patience: 78,
    bind: bindOf(slots),
    slots,
    flights: [],
    built: [],
    economy: { homes: 0, gw: 0, patients: 0, mills: 0, halls: 0, income: 5 },
    log: [
      "Year 1. Hardware sits above everything. If Rhian cannot hire, corridors stall in the yard.",
    ],
    phase: "act",
    event: null,
    nextUid: 1,
  };
}

function finishIfNeeded(state: GameState): GameState {
  if (state.patience <= 0) {
    return withLog(
      { ...state, phase: "lost", patience: 0, ap: 0 },
      "Patience hit zero. The country kept the slogans and lost the mill.",
    );
  }
  const story =
    state.economy.mills >= 1 && state.economy.homes >= 50000 && state.economy.patients >= 8000;
  const prestige = state.slots.every((s) => s.cracked) && state.economy.mills + state.economy.halls >= 1;
  if (story || prestige) {
    return withLog(
      { ...state, phase: "won" },
      story
        ? "The mill is running. Homes went up. Priya has a bay. Parliament did the physical thing."
        : "The wire is open and something real plugged in.",
    );
  }
  if (state.year > state.maxYears) {
    return withLog(
      { ...state, phase: "lost" },
      "The years ran out. Too much still sitting in the yard.",
    );
  }
  return state;
}

function maybeEvent(state: GameState): GameState {
  if (state.year <= 1 || state.year > state.maxYears) return state;
  const ev = EVENTS[(state.year + state.seed) % EVENTS.length];
  return {
    ...state,
    phase: "event",
    event: ev,
  };
}

function tickYear(state: GameState): GameState {
  let slots = state.slots.map((s) => ({ ...s }));
  let economy = { ...state.economy };
  const built = [...state.built];
  const still: Flight[] = [];
  let patience = state.patience;
  let logLine = "";

  for (const f of state.flights) {
    const def = projectDef(f.defId);
    const bind = bindOf(slots);
    const stalled = def.stallOn.includes(bind) && slots.find((s) => s.id === bind)!.tightness > CRACK_AT;
    if (stalled) {
      patience -= 4;
      logLine = `${def.name} sat in the yard. The bind is still ${FLAVOUR[bind].shortName}.`;
      still.push({ ...f, stalled: true });
      continue;
    }
    const yearsLeft = f.yearsLeft - 1;
    if (yearsLeft <= 0) {
      built.push(def.id);
      if (def.effect.tightness) slots = applyTightness(slots, def.effect.tightness);
      economy = {
        ...economy,
        homes: economy.homes + (def.effect.homes ?? 0),
        gw: economy.gw + (def.effect.gw ?? 0),
        patients: economy.patients + (def.effect.patients ?? 0),
        mills: economy.mills + (def.effect.mills ?? 0),
        halls: economy.halls + (def.effect.halls ?? 0),
        income: economy.income + (def.effect.income ?? 0),
      };
      logLine = def.done;
    } else {
      still.push({ ...f, yearsLeft, stalled: false });
    }
  }

  const bind = bindOf(slots);
  if (slots.find((s) => s.id === bind)!.tightness > 70) patience -= 5;
  const hardwareOpen = slots[0].cracked;
  const apMax = hardwareOpen ? 4 : 3;
  let next: GameState = {
    ...state,
    year: state.year + 1,
    ap: apMax,
    apMax,
    treasury: state.treasury + economy.income,
    patience: clamp(patience, 0, 100),
    bind,
    slots,
    flights: still,
    built,
    economy,
    event: null,
    phase: "act",
  };
  if (logLine) next = withLog(next, logLine);
  next = withLog(next, `Year ${next.year}. Treasury +£${economy.income}bn. Bind: ${FLAVOUR[bind].name}.`);
  next = finishIfNeeded(next);
  if (next.phase !== "act") return next;
  return maybeEvent(next);
}

function afterAct(state: GameState): GameState {
  let next = finishIfNeeded(state);
  if (next.phase !== "act") return next;
  if (next.ap <= 0) return tickYear(next);
  return next;
}

export function startProject(state: GameState, defId: string): GameState {
  if (state.phase !== "act") return state;
  const def = projectDef(defId);
  const lock = lockReason(state, def);
  if (lock) return withLog(state, lock);
  const flight: Flight = {
    uid: `p${state.nextUid}`,
    defId,
    yearsLeft: def.years,
    stalled: isStalled(state, def),
  };
  let next: GameState = {
    ...state,
    ap: state.ap - 1,
    treasury: state.treasury - def.cost,
    flights: [...state.flights, flight],
    nextUid: state.nextUid + 1,
  };
  next = withLog(
    next,
    flight.stalled
      ? `${def.name} is in the yard, stalled on the ${FLAVOUR[state.bind].shortName} bind.`
      : `${def.name} started. ${def.years} year${def.years === 1 ? "" : "s"}.`,
  );
  return afterAct(next);
}

export function enactPolicy(state: GameState, policyId: string): GameState {
  if (state.phase !== "act" || state.ap < 1) return state;
  const pol = POLICIES.find((p) => p.id === policyId);
  if (!pol) return state;
  const hit = state.bind === pol.slot ? BIND_HIT : SLACK_HIT;
  const slots = applyTightness(state.slots, { [pol.slot]: -hit });
  const bind = bindOf(slots);
  const crackedNow = slots.find((s) => s.id === pol.slot)!.cracked && !slot(state, pol.slot).cracked;
  let next: GameState = {
    ...state,
    ap: state.ap - 1,
    slots,
    bind,
  };
  next = withLog(
    next,
    crackedNow
      ? FLAVOUR[pol.slot].cracked
      : state.bind === pol.slot
        ? `${pol.code} hits the bind. ${FLAVOUR[pol.slot].shortName} ${Math.round(slots.find((s) => s.id === pol.slot)!.tightness)}%.`
        : `${pol.code} on slack. The bind is still ${FLAVOUR[state.bind].shortName}.`,
  );
  return afterAct(next);
}

export function resolveEvent(state: GameState, option: 0 | 1): GameState {
  if (state.phase !== "event" || !state.event) return state;
  const id = state.event.id;
  let next: GameState = { ...state, phase: "act", event: null };
  if (id === "target" && option === 0) {
    next.treasury += 4;
    next.patience = clamp(next.patience - 12, 0, 100);
    next = withLog(next, "You bought a headline. Dev still has no yes.");
  } else if (id === "target") {
    next = withLog(next, "You refused the wish. The bricks wait on a lawful yes.");
  } else if (id === "winter" && option === 0) {
    if (next.treasury >= 2) {
      next.treasury -= 2;
      next.slots = applyTightness(next.slots, { "acute-beds": -14 });
      next.bind = bindOf(next.slots);
      next = withLog(next, "Discharge money hits the ward. Priya has a little room.");
    } else {
      next.slots = applyTightness(next.slots, { "acute-beds": 10 });
      next.patience = clamp(next.patience - 8, 0, 100);
      next.bind = bindOf(next.slots);
      next = withLog(next, "No money for discharge. The bay stays full.");
    }
  } else if (id === "winter") {
    next.slots = applyTightness(next.slots, { "acute-beds": 12 });
    next.patience = clamp(next.patience - 8, 0, 100);
    next.bind = bindOf(next.slots);
    next = withLog(next, "Winter did what occupancy always does.");
  } else if (id === "agr" && option === 0) {
    if (next.treasury >= 3) {
      next.treasury -= 3;
      next.slots = applyTightness(next.slots, { "firm-power": -10 });
      next.bind = bindOf(next.slots);
      next = withLog(next, "A down payment on firm power. The mill notices.");
    } else {
      next.slots = applyTightness(next.slots, { "firm-power": 8 });
      next.bind = bindOf(next.slots);
      next = withLog(next, "No cash. The AGR walked.");
    }
  } else if (id === "agr") {
    next.slots = applyTightness(next.slots, { "firm-power": 12 });
    next.bind = bindOf(next.slots);
    next = withLog(next, "Firm gigawatts left the system.");
  } else if (id === "waste" && option === 0) {
    next.patience = clamp(next.patience - 10, 0, 100);
    next = withLog(next, "A lump sum on the front page. The machine still cannot finish.");
  } else if (id === "waste") {
    next = withLog(next, "You named the slot. The headline moved on.");
  } else if (id === "dublin" && option === 0) {
    next = withLog(next, "A discount is on the table if the plug and the bill are real.");
    next.treasury += 2;
  } else if (id === "dublin") {
    next.patience = clamp(next.patience - 6, 0, 100);
    next = withLog(next, "The hall went to Dublin.");
  }
  next.bind = bindOf(next.slots);
  return finishIfNeeded(next);
}

export function scoreOf(state: GameState): number {
  const e = state.economy;
  return (
    Math.round(e.homes / 2000) +
    e.gw * 8 +
    Math.round(e.patients / 1000) +
    e.mills * 25 +
    e.halls * 18 +
    state.slots.filter((s) => s.cracked).length * 6
  );
}
