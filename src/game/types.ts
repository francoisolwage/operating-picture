export const WORLD = { w: 1000, h: 720 } as const;

export const RULES = {
  playerSpeed: 480,
  playerW: 96,
  playerH: 26,
  playerY: 640,
  shotSpeed: 720,
  shotW: 20,
  shotH: 30,
  fireCooldown: 0.3,
  instrumentDamage: 12,
  symptomQueue: 12,
  paperQueue: 8,
  paperSpawn: 1.35,
  paperSpeed: 140,
  paperW: 52,
  paperH: 62,
  queueCap: 100,
  slotW: 210,
  slotH: 58,
  slotY: 82,
  slotSpeed: 78,
  teachSlotSpeed: 42,
  wallTop: 44,
  wallBottom: 152,
  aimAssist: 2.2,
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
  label: string;
};

export type Tempo = "teach" | "full";

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
  tempo: Tempo;
  protagonist: string;
  waiting: string;
  brief: string;
  how: string;
  win: string;
  lose: string;
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
  coach: string;
};

export type Input = {
  left: boolean;
  right: boolean;
  fire: boolean;
  select?: number;
  pause?: boolean;
};

export type GameEvent =
  | { type: "slot-hit"; kind: CardKind; damage: number; coach: string }
  | { type: "bounce"; coach: string }
  | { type: "paper-hit"; coach: string }
  | { type: "fire"; kind: CardKind }
  | { type: "win" }
  | { type: "lose" }
  | { type: "pause" };

export type StepResult = {
  state: GameState;
  events: GameEvent[];
};
