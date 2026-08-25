import { CANDIDATES } from "../data/candidates";
import { rankedRoots } from "../lib/picture";
import type { Card, StageDef } from "./types";

type Skin = {
  code: string;
  instrumentLabel: string;
  unit: string;
  unitLabel: string;
  perHit: number;
};

const SKINS: Record<string, Skin> = {
  "state-hardware": {
    code: "CS1",
    instrumentLabel: "Hire and fire",
    unit: "projects",
    unitLabel: "projects finished",
    perHit: 1,
  },
  planning: {
    code: "E4",
    instrumentLabel: "Default yes",
    unit: "homes",
    unitLabel: "homes consented",
    perHit: 18600,
  },
  "grid-slot": {
    code: "E1.3",
    instrumentLabel: "12-month connection",
    unit: "GW",
    unitLabel: "GW connected",
    perHit: 7.4,
  },
  "firm-power": {
    code: "E1.1",
    instrumentLabel: "Firm nuclear",
    unit: "p",
    unitLabel: "p/kWh off the bill",
    perHit: 1.2,
  },
  "acute-beds": {
    code: "NHS1",
    instrumentLabel: "Beds and discharge",
    unit: "patients",
    unitLabel: "patients completed",
    perHit: 1375,
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
      code: "SYMP",
    }));
}

export function campaignStages(): StageDef[] {
  const roots = rankedRoots();
  return roots.map((c) => {
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
        code: "SYMP",
      });
    }
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
    };
  });
}

export function stageBySlug(slug: string): StageDef {
  const stage = campaignStages().find((s) => s.slug === slug);
  if (!stage) {
    throw new Error(`unknown stage ${slug}`);
  }
  return stage;
}
