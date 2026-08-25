"use client";

import { useEffect, useRef } from "react";
import { startStage, step } from "@/game/sim";
import { RULES, WORLD, type GameEvent, type GameState, type Input, type StageDef } from "@/game/types";

type Spark = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
};

type Floater = {
  x: number;
  y: number;
  text: string;
  life: number;
  color: string;
};

type Props = {
  stage: StageDef;
  paused: boolean;
  selected: number;
  onSelected: (i: number) => void;
  onState: (s: GameState) => void;
  onLive?: () => void;
  inputRef: React.MutableRefObject<Input>;
};

const PAPER = "#f4f6f1";
const INK = "#0f172a";
const GOLD = "#b8956a";
const GOLD_FILL = "#c4985a";
const LINE = "#d5d8ce";
const TIGHT = "#8b2e2e";
const EASING = "#2f5d3a";
const MUTED = "#4a5560";

function burst(sparks: Spark[], x: number, y: number, color: string, n: number) {
  for (let i = 0; i < n; i++) {
    const a = (Math.PI * 2 * i) / n + Math.random() * 0.4;
    const sp = 40 + Math.random() * 180;
    sparks.push({
      x,
      y,
      vx: Math.cos(a) * sp,
      vy: Math.sin(a) * sp,
      life: 0.35 + Math.random() * 0.25,
      color,
    });
  }
}

export function GameCanvas({ stage, paused, onSelected, onState, onLive, inputRef }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef<GameState>(startStage(stage));
  const sparksRef = useRef<Spark[]>([]);
  const floatersRef = useRef<Floater[]>([]);
  const onStateRef = useRef(onState);
  const onLiveRef = useRef(onLive);
  const pausedRef = useRef(paused);
  onStateRef.current = onState;
  onLiveRef.current = onLive;
  pausedRef.current = paused;

  useEffect(() => {
    stateRef.current = startStage(stage);
    sparksRef.current = [];
    onStateRef.current(stateRef.current);
  }, [stage]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let last = performance.now();
    let lastHud = 0;
    let running = true;

    const fit = () => {
      const parent = canvas.parentElement;
      const cssW = parent?.clientWidth ?? 800;
      const cssH = Math.max(420, Math.min(720, cssW * (WORLD.h / WORLD.w)));
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(cssW * dpr);
      canvas.height = Math.floor(cssH * dpr);
      canvas.style.width = `${cssW}px`;
      canvas.style.height = `${cssH}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    fit();
    const ro = new ResizeObserver(fit);
    if (canvas.parentElement) ro.observe(canvas.parentElement);

    const draw = (s: GameState, cssW: number, cssH: number) => {
      const sx = cssW / WORLD.w;
      const sy = cssH / WORLD.h;
      ctx.save();
      ctx.scale(sx, sy);
      const shake = s.shake;
      if (shake > 0) {
        ctx.translate((Math.random() - 0.5) * shake, (Math.random() - 0.5) * shake);
      }

      ctx.fillStyle = PAPER;
      ctx.fillRect(0, 0, WORLD.w, WORLD.h);

      ctx.strokeStyle = LINE;
      ctx.lineWidth = 1;
      for (let x = 40; x < WORLD.w; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 20);
        ctx.lineTo(x, WORLD.h - 20);
        ctx.globalAlpha = 0.35;
        ctx.stroke();
      }
      ctx.globalAlpha = 1;

      const tide = (s.queue / 100) * 160;
      ctx.fillStyle = "rgba(139, 46, 46, 0.14)";
      ctx.fillRect(0, WORLD.h - tide, WORLD.w, tide);

      ctx.fillStyle = INK;
      ctx.fillRect(20, RULES.wallTop, WORLD.w - 40, RULES.wallBottom - RULES.wallTop);

      const cracks = Math.min(8, Math.floor((s.stage.tightness - s.tightness) / 12));
      ctx.strokeStyle = GOLD;
      ctx.lineWidth = 2;
      for (let i = 0; i < cracks; i++) {
        const x = 80 + i * 110;
        ctx.beginPath();
        ctx.moveTo(x, RULES.wallTop + 8);
        ctx.lineTo(x + 18, RULES.wallTop + 28);
        ctx.lineTo(x - 8, RULES.wallBottom - 8);
        ctx.stroke();
      }

      if (s.status === "won") {
        ctx.fillStyle = "rgba(196, 152, 90, 0.35)";
        ctx.fillRect(s.slotX - 20, RULES.wallTop - 10, RULES.slotW + 40, 130);
      }

      const pulse = 1 + Math.sin(s.elapsed * 5) * 0.03;
      const sw = RULES.slotW * pulse;
      const sh = RULES.slotH * pulse;
      const sx0 = s.slotX - (sw - RULES.slotW) / 2;
      const sy0 = RULES.slotY - (sh - RULES.slotH) / 2;
      ctx.fillStyle = s.status === "won" ? EASING : GOLD_FILL;
      roundRect(ctx, sx0, sy0, sw, sh, 8);
      ctx.fill();
      ctx.strokeStyle = GOLD;
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.fillStyle = PAPER;
      ctx.font = "600 13px Georgia, serif";
      ctx.textAlign = "center";
      ctx.fillText("AIM HERE", s.slotX + RULES.slotW / 2, RULES.slotY + 20);
      ctx.font = "700 18px Georgia, serif";
      ctx.fillText(`${Math.round(s.tightness)}% full`, s.slotX + RULES.slotW / 2, RULES.slotY + 42);
      if (s.stage.tempo === "teach" && s.instrumentHits === 0) {
        ctx.fillStyle = GOLD;
        ctx.font = "600 16px Georgia, serif";
        ctx.fillText("Stamp this plate", s.slotX + RULES.slotW / 2, RULES.slotY + 78);
      }

      ctx.fillStyle = PAPER;
      ctx.font = "700 20px Georgia, serif";
      ctx.textAlign = "left";
      ctx.fillText(s.stage.protagonist, 36, RULES.wallTop + 28);
      ctx.font = "14px Georgia, serif";
      ctx.fillStyle = LINE;
      ctx.fillText(`${s.stage.instrumentCode}  ·  ${s.stage.waiting}`, 36, RULES.wallTop + 50);

      for (const p of s.papers) {
        ctx.fillStyle = "#fff";
        ctx.strokeStyle = LINE;
        ctx.lineWidth = 1;
        ctx.fillRect(p.x, p.y, RULES.paperW, RULES.paperH);
        ctx.strokeRect(p.x, p.y, RULES.paperW, RULES.paperH);
        ctx.fillStyle = MUTED;
        ctx.font = "600 9px Georgia, serif";
        ctx.textAlign = "center";
        ctx.fillText(p.label, p.x + RULES.paperW / 2, p.y + 34);
      }

      for (const shot of s.shots) {
        ctx.fillStyle = shot.kind === "instrument" ? GOLD_FILL : MUTED;
        roundRect(ctx, shot.x, shot.y, RULES.shotW, RULES.shotH, 3);
        ctx.fill();
      }

      const card = s.stage.cards[s.selected] ?? s.stage.cards[0];
      ctx.fillStyle = card.kind === "instrument" ? GOLD_FILL : MUTED;
      roundRect(ctx, s.playerX, RULES.playerY, RULES.playerW, RULES.playerH, 4);
      ctx.fill();
      ctx.fillStyle = INK;
      ctx.font = "700 11px Georgia, serif";
      ctx.textAlign = "center";
      ctx.fillText(card.code, s.playerX + RULES.playerW / 2, RULES.playerY + 17);

      for (const sp of sparksRef.current) {
        ctx.globalAlpha = Math.max(0, sp.life * 2);
        ctx.fillStyle = sp.color;
        ctx.fillRect(sp.x, sp.y, 3, 3);
      }
      ctx.globalAlpha = 1;
      for (const f of floatersRef.current) {
        ctx.globalAlpha = Math.max(0, f.life);
        ctx.fillStyle = f.color;
        ctx.font = "700 16px Georgia, serif";
        ctx.textAlign = "center";
        ctx.fillText(f.text, f.x, f.y);
      }
      ctx.globalAlpha = 1;
      ctx.restore();
    };

    const tick = (now: number) => {
      if (!running) return;
      const dt = Math.min(0.04, (now - last) / 1000);
      last = now;
      const input = { ...inputRef.current };
      const before = stateRef.current.status;
      if (pausedRef.current && (input.fire || input.left || input.right)) {
        pausedRef.current = false;
        onLiveRef.current?.();
      }
      if (!pausedRef.current && stateRef.current.status === "playing") {
        const { state, events } = step(stateRef.current, input, dt);
        stateRef.current = state;
        applyEvents(events, state);
        if (state.status !== before || now - lastHud > 80) {
          lastHud = now;
          onStateRef.current(state);
        }
      }
      inputRef.current.fire = false;
      inputRef.current.pause = false;
      inputRef.current.select = undefined;

      sparksRef.current = sparksRef.current
        .map((sp) => ({
          ...sp,
          x: sp.x + sp.vx * dt,
          y: sp.y + sp.vy * dt,
          life: sp.life - dt,
        }))
        .filter((sp) => sp.life > 0);
      floatersRef.current = floatersRef.current
        .map((f) => ({ ...f, y: f.y - 28 * dt, life: f.life - dt }))
        .filter((f) => f.life > 0);

      const cssW = canvas.clientWidth;
      const cssH = canvas.clientHeight;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      draw(stateRef.current, cssW, cssH);
      raf = requestAnimationFrame(tick);
    };

    const applyEvents = (events: GameEvent[], s: GameState) => {
      for (const e of events) {
        if (e.type === "slot-hit") {
          burst(sparksRef.current, s.slotX + RULES.slotW / 2, RULES.slotY + 26, GOLD, 18);
          floatersRef.current.push({
            x: s.slotX + RULES.slotW / 2,
            y: RULES.slotY - 8,
            text: "Cracked",
            life: 1.1,
            color: EASING,
          });
        } else if (e.type === "bounce") {
          burst(sparksRef.current, s.slotX + RULES.slotW / 2, RULES.slotY + 26, TIGHT, 12);
          floatersRef.current.push({
            x: s.slotX + RULES.slotW / 2,
            y: RULES.slotY - 8,
            text: "Inventory",
            life: 0.9,
            color: TIGHT,
          });
        } else if (e.type === "paper-hit") {
          burst(
            sparksRef.current,
            s.playerX + RULES.playerW / 2,
            RULES.playerY,
            MUTED,
            8,
          );
        } else if (e.type === "win" || e.type === "lose") {
          onStateRef.current(s);
        }
      }
    };

    raf = requestAnimationFrame(tick);
    return () => {
      running = false;
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [inputRef, stage]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") {
        inputRef.current.left = e.type === "keydown";
        e.preventDefault();
      }
      if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") {
        inputRef.current.right = e.type === "keydown";
        e.preventDefault();
      }
      if (e.key === " " || e.key === "Enter") {
        if (e.type === "keydown") inputRef.current.fire = true;
        e.preventDefault();
      }
      if (e.type === "keydown" && (e.key === "1" || e.key === "2" || e.key === "3")) {
        onSelected(Number(e.key) - 1);
      }
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("keyup", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("keyup", onKey);
    };
  }, [inputRef, onSelected]);

  const onPointer = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * WORLD.w;
    stateRef.current.playerX = Math.max(24, Math.min(WORLD.w - RULES.playerW - 24, x - RULES.playerW / 2));
    if (e.type === "pointerdown") inputRef.current.fire = true;
  };

  return (
    <canvas
      ref={canvasRef}
      className="block w-full touch-none rounded-2xl border border-line bg-paper"
      onPointerDown={onPointer}
      onPointerMove={onPointer}
      role="img"
      aria-label={`Break the ${stage.name} slot`}
    />
  );
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}

