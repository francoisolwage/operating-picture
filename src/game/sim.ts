import {
  RULES,
  WORLD,
  type Card,
  type GameEvent,
  type GameState,
  type Input,
  type StageDef,
  type StepResult,
} from "./types";

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

function overlaps(
  ax: number,
  ay: number,
  aw: number,
  ah: number,
  bx: number,
  by: number,
  bw: number,
  bh: number,
): boolean {
  return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
}

function shuffleCards(cards: StageDef["cards"], slug: string): StageDef["cards"] {
  const copy = [...cards];
  let seed = 0;
  for (let i = 0; i < slug.length; i++) seed += slug.charCodeAt(i);
  for (let i = copy.length - 1; i > 0; i--) {
    seed = (Math.imul(seed, 1103515245) + 12345) | 0;
    const j = Math.abs(seed) % (i + 1);
    const tmp = copy[i];
    copy[i] = copy[j];
    copy[j] = tmp;
  }
  return copy;
}

export function instrumentIndex(cards: Card[]): number {
  const i = cards.findIndex((c) => c.kind === "instrument");
  return i < 0 ? 0 : i;
}

const PAPER_LABELS = ["Policy paper", "Target", "Press release", "Strategy"];

export function startStage(stage: StageDef): GameState {
  const cards = shuffleCards(stage.cards, stage.slug);
  const selected = instrumentIndex(cards);
  const teach = stage.tempo === "teach";
  return {
    stage: { ...stage, cards },
    tightness: stage.tightness,
    queue: teach ? 6 : 14,
    throughput: 0,
    playerX: WORLD.w / 2 - RULES.playerW / 2,
    slotX: WORLD.w / 2 - RULES.slotW / 2,
    slotDir: 1,
    selected,
    shots: [],
    papers: [],
    cooldown: 0,
    paperTimer: teach ? 99 : 1.2,
    status: "playing",
    elapsed: 0,
    instrumentHits: 0,
    symptomHits: 0,
    papersHit: 0,
    shake: 0,
    coach: stage.how,
  };
}

export function matchScore(state: GameState): number {
  const raw =
    state.throughput * 10 +
    state.instrumentHits * 40 -
    state.symptomHits * 55 -
    state.papersHit * 25 -
    state.queue * 2;
  return Math.max(0, Math.round(raw));
}

export function shareLine(state: GameState): string {
  const n =
    state.stage.unit === "homes" || state.stage.unit === "patients"
      ? Math.round(state.throughput).toLocaleString("en-GB")
      : state.throughput.toFixed(1);
  if (state.status === "won") {
    return `I broke the ${state.stage.shortName.toLowerCase()} slot. ${n} ${state.stage.unitLabel}.`;
  }
  return `The ${state.stage.shortName.toLowerCase()} slot held. Queue at ${Math.round(state.queue)}%.`;
}

export function step(state: GameState, input: Input, dt: number): StepResult {
  const events: GameEvent[] = [];
  if (state.status === "won" || state.status === "lost") {
    return { state, events };
  }
  if (input.pause) {
    const nextStatus = state.status === "paused" ? "playing" : "paused";
    events.push({ type: "pause" });
    return { state: { ...state, status: nextStatus }, events };
  }
  if (state.status === "paused") {
    return { state, events };
  }

  const next: GameState = {
    ...state,
    shots: state.shots.map((s) => ({ ...s })),
    papers: state.papers.map((p) => ({ ...p })),
    elapsed: state.elapsed + dt,
    cooldown: Math.max(0, state.cooldown - dt),
    shake: Math.max(0, state.shake - dt * 18),
  };

  if (input.select !== undefined && input.select >= 0 && input.select < next.stage.cards.length) {
    next.selected = input.select;
    const card = next.stage.cards[next.selected];
    next.coach =
      card.kind === "instrument"
        ? `Gold card. Stamp ${card.code} on the plate.`
        : `${card.label} is inventory. Switch back to ${next.stage.instrumentCode}.`;
  }

  let vx = 0;
  if (input.left) vx -= RULES.playerSpeed;
  if (input.right) vx += RULES.playerSpeed;
  next.playerX = clamp(next.playerX + vx * dt, 24, WORLD.w - RULES.playerW - 24);

  const slotSpeed = next.stage.tempo === "teach" ? RULES.teachSlotSpeed : RULES.slotSpeed;
  next.slotX += next.slotDir * slotSpeed * dt;
  if (next.slotX <= 40) {
    next.slotX = 40;
    next.slotDir = 1;
  } else if (next.slotX + RULES.slotW >= WORLD.w - 40) {
    next.slotX = WORLD.w - 40 - RULES.slotW;
    next.slotDir = -1;
  }

  if (input.fire && next.cooldown <= 0) {
    const card = next.stage.cards[next.selected] ?? next.stage.cards[0];
    next.shots.push({
      x: next.playerX + RULES.playerW / 2 - RULES.shotW / 2,
      y: RULES.playerY - 10,
      kind: card.kind,
    });
    next.cooldown = RULES.fireCooldown;
    events.push({ type: "fire", kind: card.kind });
    if (card.kind === "symptom") {
      next.coach = `${card.label} will bounce. The plate wants ${next.stage.instrumentCode}.`;
    }
  }

  const teachHoldPapers = next.stage.tempo === "teach" && next.instrumentHits === 0;
  if (!teachHoldPapers) {
    next.paperTimer -= dt;
    if (next.paperTimer <= 0) {
      next.papers.push({
        x: 50 + ((next.elapsed * 9301) % (WORLD.w - 100 - RULES.paperW)),
        y: RULES.wallBottom + 8,
        vy: RULES.paperSpeed + (next.tightness / 100) * 40,
        label: PAPER_LABELS[Math.floor(next.elapsed * 3) % PAPER_LABELS.length],
      });
      next.paperTimer = RULES.paperSpawn * (0.75 + (next.tightness / 100) * 0.45);
    }
  }

  const slotCx = next.slotX + RULES.slotW / 2;
  const liveShots = [];
  for (const shot of next.shots) {
    shot.y -= RULES.shotSpeed * dt;
    if (shot.kind === "instrument") {
      const dx = slotCx - (shot.x + RULES.shotW / 2);
      shot.x += clamp(dx, -90, 90) * dt * RULES.aimAssist;
    }
    if (shot.y + RULES.shotH < 0) continue;
    const inSlot = overlaps(
      shot.x,
      shot.y,
      RULES.shotW,
      RULES.shotH,
      next.slotX,
      RULES.slotY,
      RULES.slotW,
      RULES.slotH,
    );
    if (inSlot) {
      if (shot.kind === "instrument") {
        const damage = RULES.instrumentDamage;
        next.tightness = clamp(next.tightness - damage, 0, 100);
        next.throughput += next.stage.perHit;
        next.instrumentHits += 1;
        next.shake = 7;
        next.queue = clamp(next.queue - 5, 0, RULES.queueCap);
        const coach = `The slot cracked. ${next.stage.protagonist.split(",")[0]} felt that.`;
        next.coach = coach;
        events.push({ type: "slot-hit", kind: "instrument", damage, coach });
      } else {
        next.queue = clamp(next.queue + RULES.symptomQueue, 0, RULES.queueCap);
        next.symptomHits += 1;
        next.shake = 4;
        const coach = "That was inventory. Gold plate. Gold card.";
        next.coach = coach;
        events.push({ type: "bounce", coach });
      }
      continue;
    }
    liveShots.push(shot);
  }
  next.shots = liveShots;

  const livePapers = [];
  for (const paper of next.papers) {
    paper.y += paper.vy * dt;
    if (paper.y > WORLD.h + 20) continue;
    const hitPlayer = overlaps(
      paper.x,
      paper.y,
      RULES.paperW,
      RULES.paperH,
      next.playerX,
      RULES.playerY,
      RULES.playerW,
      RULES.playerH,
    );
    if (hitPlayer) {
      next.queue = clamp(next.queue + RULES.paperQueue, 0, RULES.queueCap);
      next.papersHit += 1;
      next.shake = 5;
      const coach = `${paper.label} hit you. Dodge the paper. Stamp the plate.`;
      next.coach = coach;
      events.push({ type: "paper-hit", coach });
      continue;
    }
    livePapers.push(paper);
  }
  next.papers = livePapers;

  if (next.tightness <= 0) {
    next.tightness = 0;
    next.status = "won";
    next.coach = next.stage.win;
    events.push({ type: "win" });
  } else if (next.queue >= RULES.queueCap) {
    next.queue = RULES.queueCap;
    next.status = "lost";
    next.coach = next.stage.lose;
    events.push({ type: "lose" });
  }

  return { state: next, events };
}
