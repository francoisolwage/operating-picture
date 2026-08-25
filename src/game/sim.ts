import { RULES, WORLD, type GameEvent, type GameState, type Input, type StageDef, type StepResult } from "./types";

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

export function startStage(stage: StageDef): GameState {
  return {
    stage: { ...stage, cards: shuffleCards(stage.cards, stage.slug) },
    tightness: stage.tightness,
    queue: 12,
    throughput: 0,
    playerX: WORLD.w / 2 - RULES.playerW / 2,
    slotX: WORLD.w / 2 - RULES.slotW / 2,
    slotDir: 1,
    selected: 0,
    shots: [],
    papers: [],
    cooldown: 0,
    paperTimer: 0.4,
    status: "playing",
    elapsed: 0,
    instrumentHits: 0,
    symptomHits: 0,
    papersHit: 0,
    shake: 0,
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
  }

  let vx = 0;
  if (input.left) vx -= RULES.playerSpeed;
  if (input.right) vx += RULES.playerSpeed;
  next.playerX = clamp(next.playerX + vx * dt, 24, WORLD.w - RULES.playerW - 24);

  next.slotX += next.slotDir * RULES.slotSpeed * dt;
  if (next.slotX <= 40) {
    next.slotX = 40;
    next.slotDir = 1;
  } else if (next.slotX + RULES.slotW >= WORLD.w - 40) {
    next.slotX = WORLD.w - 40 - RULES.slotW;
    next.slotDir = -1;
  }

  if (input.fire && next.cooldown <= 0) {
    const card = next.stage.cards[next.selected];
    next.shots.push({
      x: next.playerX + RULES.playerW / 2 - RULES.shotW / 2,
      y: RULES.playerY - 10,
      kind: card.kind,
    });
    next.cooldown = RULES.fireCooldown;
    events.push({ type: "fire", kind: card.kind });
  }

  next.paperTimer -= dt;
  if (next.paperTimer <= 0) {
    next.papers.push({
      x: 50 + ((next.elapsed * 9301) % (WORLD.w - 100 - RULES.paperW)),
      y: RULES.wallBottom + 8,
      vy: RULES.paperSpeed + (next.tightness / 100) * 40,
    });
    next.paperTimer = RULES.paperSpawn * (0.7 + (next.tightness / 100) * 0.5);
  }

  const liveShots = [];
  for (const shot of next.shots) {
    shot.y -= RULES.shotSpeed * dt;
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
    const inWall = shot.y <= RULES.wallBottom && shot.y + RULES.shotH >= RULES.wallTop;
    if (inSlot) {
      if (shot.kind === "instrument") {
        const damage = RULES.instrumentDamage;
        next.tightness = clamp(next.tightness - damage, 0, 100);
        next.throughput += next.stage.perHit;
        next.instrumentHits += 1;
        next.shake = 7;
        next.queue = clamp(next.queue - 4, 0, RULES.queueCap);
        events.push({ type: "slot-hit", kind: "instrument", damage });
      } else {
        next.queue = clamp(next.queue + RULES.symptomQueue, 0, RULES.queueCap);
        next.symptomHits += 1;
        next.shake = 4;
        events.push({ type: "bounce" });
      }
      continue;
    }
    if (inWall) {
      if (shot.kind === "instrument") {
        const damage = RULES.instrumentDamage * RULES.glanceScale;
        next.tightness = clamp(next.tightness - damage, 0, 100);
        next.throughput += next.stage.perHit * RULES.glanceScale;
        events.push({ type: "slot-hit", kind: "instrument", damage });
      } else {
        next.queue = clamp(next.queue + RULES.symptomQueue * 0.5, 0, RULES.queueCap);
        next.symptomHits += 1;
        events.push({ type: "bounce" });
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
      events.push({ type: "paper-hit" });
      continue;
    }
    livePapers.push(paper);
  }
  next.papers = livePapers;

  if (next.tightness <= 0) {
    next.tightness = 0;
    next.status = "won";
    events.push({ type: "win" });
  } else if (next.queue >= RULES.queueCap) {
    next.queue = RULES.queueCap;
    next.status = "lost";
    events.push({ type: "lose" });
  }

  return { state: next, events };
}
