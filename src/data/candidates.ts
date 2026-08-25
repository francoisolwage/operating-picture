import type { RankCandidate } from "../lib/rank";

/**
 * Inputs to rankBottlenecks. Tightness and scope are 0-100 judgments
 * pinned to dated official numbers in constraints.ts. Re-score when
 * a vintage moves. Do not invent a sixth root to keep a favourite topic.
 */
export const CANDIDATES: RankCandidate[] = [
  {
    slug: "state-hardware",
    tightness: 85,
    nationalScope: 100,
    unlocksOthers: 6,
    doublingTest: true,
    isSymptom: false,
  },
  {
    slug: "planning",
    tightness: 94,
    nationalScope: 95,
    unlocksOthers: 3,
    doublingTest: true,
    isSymptom: false,
  },
  {
    slug: "grid-slot",
    tightness: 98,
    nationalScope: 90,
    unlocksOthers: 2,
    doublingTest: true,
    isSymptom: false,
  },
  {
    slug: "firm-power",
    tightness: 90,
    nationalScope: 90,
    unlocksOthers: 1,
    doublingTest: true,
    isSymptom: false,
  },
  {
    slug: "acute-beds",
    tightness: 92,
    nationalScope: 70,
    unlocksOthers: 0,
    doublingTest: true,
    isSymptom: false,
  },
  {
    slug: "prison-places",
    tightness: 96,
    nationalScope: 40,
    unlocksOthers: 0,
    doublingTest: true,
    isSymptom: false,
  },
  {
    slug: "returns",
    tightness: 80,
    nationalScope: 35,
    unlocksOthers: 0,
    doublingTest: true,
    isSymptom: false,
  },
  {
    slug: "water",
    tightness: 88,
    nationalScope: 28,
    unlocksOthers: 0,
    doublingTest: true,
    isSymptom: false,
  },
  {
    slug: "skills",
    tightness: 60,
    nationalScope: 50,
    unlocksOthers: 0,
    doublingTest: false,
    isSymptom: false,
  },
  {
    slug: "gfcf",
    tightness: 70,
    nationalScope: 80,
    unlocksOthers: 0,
    doublingTest: false,
    isSymptom: true,
  },
  {
    slug: "inactivity",
    tightness: 65,
    nationalScope: 55,
    unlocksOthers: 0,
    doublingTest: false,
    isSymptom: false,
  },
];

export const CONSIDERED = [
  {
    slug: "water",
    name: "Water capacity",
    verdict:
      "Water UK / Public First (20 Jul 2026): England has spare water for 420,000 of 1.5 million pledged homes. Real in Cambridge, Sussex, and the East / South East. Nationally, consents at 186,000 already bind first. Water UK names planning and judicial review of reservoirs as the delay. Next regional slot, not a national replacement.",
  },
  {
    slug: "skills",
    name: "Skills and colleges",
    verdict:
      "A chronic British problem that predates 2008. Doubling Hallmark colleges would not connect a gigawatt or grant a consent this parliament. Labour and capital wait on a lawful yes and a plug.",
  },
  {
    slug: "gfcf",
    name: "Business investment / GFCF share of GDP",
    verdict:
      "An output. Firms do not pour concrete into a 2035 connection date or a default-no planning system. Watch it as a lagging score, not the slot.",
  },
  {
    slug: "inactivity",
    name: "Economic inactivity (9.111 million, Apr-Jun 2026)",
    verdict:
      "ONS LF2M: 9,111 thousand working-age inactive. About 30% long-term sick. The rest are students, carers, and early retirement. Not one physical slot. The LTS share is adjacent to beds and social care, not a fifth national root.",
  },
] as const;
