import { CANDIDATES } from "../data/candidates";
import { rankedRoots } from "../lib/picture";
import type { Card, StageDef, Tempo } from "./types";

type Skin = {
  code: string;
  instrumentLabel: string;
  unit: string;
  unitLabel: string;
  perHit: number;
  protagonist: string;
  waiting: string;
  brief: string;
  how: string;
  win: string;
  lose: string;
};

const SKINS: Record<string, Skin> = {
  "state-hardware": {
    code: "CS1",
    instrumentLabel: "Hire and fire",
    unit: "projects",
    unitLabel: "projects finished",
    perHit: 1,
    protagonist: "Rhian, transmission engineer",
    waiting: "A corridor that exists on paper",
    brief:
      "Rhian has the route drawn. Whitehall has the grades. Policy people write. Nobody implements. The slot is hire-and-fire, not another strategy unit.",
    how: "The gold card is already in your hand. Stamp the moving gold plate. Grey cards are waste headlines. They fill the queue.",
    win: "The machine can hire. The corridor has a person attached to it.",
    lose: "The hopper filled with papers. Rhian still cannot hire.",
  },
  planning: {
    code: "E4",
    instrumentLabel: "Default yes",
    unit: "homes",
    unitLabel: "homes consented",
    perHit: 18600,
    protagonist: "Dev, small builder",
    waiting: "A lawful yes for a site he already owns",
    brief:
      "The bricks are on the lorry. The consent is not. A housing target will not stamp the form. Invert the default.",
    how: "Keep E4 selected. Hit the gold plate. A 1.5 million slogan is inventory. It bounces.",
    win: "The engineering of a line is months. You just spent those months on a yes.",
    lose: "Dev still has bricks and no lawful start.",
  },
  "grid-slot": {
    code: "E1.3",
    instrumentLabel: "12-month connection",
    unit: "GW",
    unitLabel: "GW connected",
    perHit: 7.4,
    protagonist: "Anwen, mill manager, Port Talbot",
    waiting: "A plug for kit that is already on site",
    brief:
      "The 1.5 GW kit is in the yard. The offer date is 2035. Names on a queue are not megawatts. Give her a twelve-month connection.",
    how: "Stamp the slot with E1.3. A subsidy announcement does not pour concrete.",
    win: "A date measured in months. The mill has somewhere to plug in.",
    lose: "The mill is still waiting on a network that is physically there.",
  },
  "firm-power": {
    code: "E1.1",
    instrumentLabel: "Firm nuclear",
    unit: "p",
    unitLabel: "p/kWh off the bill",
    perHit: 1.2,
    protagonist: "Anwen again, same mill",
    waiting: "A price that can beat Dunkirk",
    brief:
      "She is not competing on wages. She is competing on 26p versus 13p. Wind in a queue does not replace a dying AGR. Put firm power on the system.",
    how: "E1.1 cracks the slot. A wholesale-spike row is weather. It fills the hopper.",
    win: "The bill moves. The order book can stay in Britain.",
    lose: "France still eats the contract. The mill pays 26p.",
  },
  "acute-beds": {
    code: "NHS1",
    instrumentLabel: "Beds and discharge",
    unit: "patients",
    unitLabel: "patients completed",
    perHit: 1375,
    protagonist: "Priya, night sister",
    waiting: "A bed that is empty tonight",
    brief:
      "Tuesday's patient was ready to go home. The bed is still taken. Extra appointments will not clear a corridor. Discharge, then the list moves.",
    how: "NHS1 on the gold plate. The waiting-list headline is stock. Stamp the bed.",
    win: "An empty bed that is not occupied by someone who was ready on Tuesday.",
    lose: "Priya still has no bed. The list is still inventory.",
  },
};

function tightnessFor(slug: string): number {
  const row = CANDIDATES.find((c) => c.slug === slug);
  return row?.tightness ?? 90;
}

function otherSymptoms(selfSlug: string, roots: ReturnType<typeof rankedRoots>): Card[] {
  return roots
    .filter((c) => c.slug !== selfSlug)
    .slice(0, 2)
    .map((c) => ({
      kind: "symptom" as const,
      label: c.symptom.name,
      code: "TRAP",
    }));
}

export function campaignStages(): StageDef[] {
  const roots = rankedRoots();
  return roots.map((c, i) => {
    const skin = SKINS[c.slug];
    if (!skin) {
      throw new Error(`no game skin for ${c.slug}`);
    }
    const instrument: Card = {
      kind: "instrument",
      label: skin.instrumentLabel,
      code: skin.code,
    };
    const cards: Card[] = [instrument, ...otherSymptoms(c.slug, roots)];
    while (cards.length < 3) {
      cards.push({
        kind: "symptom",
        label: c.symptom.name,
        code: "TRAP",
      });
    }
    const tempo: Tempo = i === 0 ? "teach" : "full";
    return {
      slug: c.slug,
      name: c.name,
      shortName: c.shortName,
      slot: c.slot,
      story: c.story,
      tightness: tightnessFor(c.slug),
      instrumentCode: skin.code,
      instrumentLabel: skin.instrumentLabel,
      unit: skin.unit,
      unitLabel: skin.unitLabel,
      perHit: skin.perHit,
      cards: cards.slice(0, 3),
      tempo,
      protagonist: skin.protagonist,
      waiting: skin.waiting,
      brief: skin.brief,
      how: skin.how,
      win: skin.win,
      lose: skin.lose,
    };
  });
}

export const PROLOGUE = {
  kicker: "One parliament",
  title: "Five people. Five slots.",
  body: "Rhian cannot hire. Dev cannot start. Anwen cannot plug in, then cannot pay the bill. Priya has no empty bed. You are the operator. Throughput only moves when the gold plate cracks.",
};

export const EPILOGUE = {
  kicker: "The wire, open",
  title: "The mill has a date. The bed is empty. The consent is a yes.",
  body: "Hardware sits above the rest. You fixed the machine first, then the lawful yes, then the plug, then the power, then the bed. Inventory did not get a vote.",
};
