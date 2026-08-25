export const WORLD = { w: 1000, h: 720 } as const;

export const RULES = {
  playerSpeed: 460,
  playerW: 86,
  playerH: 22,
  playerY: 640,
  shotSpeed: 780,
  shotW: 18,
  shotH: 28,
  fireCooldown: 0.28,
  instrumentDamage: 11,
  glanceScale: 0.35,
  symptomQueue: 14,
  paperQueue: 9,
  paperSpawn: 1.15,
  paperSpeed: 165,
  paperW: 46,
  paperH: 58,
  queueCap: 100,
  slotW: 168,
  slotH: 52,
  slotY: 86,
  slotSpeed: 105,
  wallTop: 48,
  wallBottom: 148,
} as const;

export type CardKind = "instrument" | "symptom";

export type Card = {
  kind: CardKind;
  label: string;
  code: string;
};

export type Shot = {
  x: number;
  y: number;
  kind: CardKind;
};

export type Paper = {
  x: number;
  y: number;
  vy: number;
};

export type StageDef = {
  slug: string;
  name: string;
  shortName: string;
  slot: string;
  story: string;
  tightness: number;
  instrumentCode: string;
  instrumentLabel: string;
  unit: string;
  unitLabel: string;
  perHit: number;
  cards: Card[];
};

export type MatchStatus = "playing" | "won" | "lost" | "paused";

export type GameState = {
  stage: StageDef;
  tightness: number;
  queue: number;
  throughput: number;
  playerX: number;
  slotX: number;
  slotDir: 1 | -1;
  selected: number;
  shots: Shot[];
  papers: Paper[];
  cooldown: number;
  paperTimer: number;
  status: MatchStatus;
  elapsed: number;
  instrumentHits: number;
  symptomHits: number;
  papersHit: number;
  shake: number;
};

export type Input = {
  left: boolean;
  right: boolean;
  fire: boolean;
  select?: number;
  pause?: boolean;
};

export type GameEvent =
  | { type: "slot-hit"; kind: CardKind; damage: number }
  | { type: "bounce" }
  | { type: "paper-hit" }
  | { type: "fire"; kind: CardKind }
  | { type: "win" }
  | { type: "lose" }
  | { type: "pause" };

export type StepResult = {
  state: GameState;
  events: GameEvent[];
};
