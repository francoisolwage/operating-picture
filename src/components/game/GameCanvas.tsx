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

type Props = {
  stage: StageDef;
  paused: boolean;
  selected: number;
  onSelected: (i: number) => void;
  onState: (s: GameState) => void;
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

export function GameCanvas({ stage, paused, selected, onSelected, onState, inputRef }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef<GameState>(startStage(stage));
  const sparksRef = useRef<Spark[]>([]);
  const onStateRef = useRef(onState);
  const selectedRef = useRef(selected);
  const pausedRef = useRef(paused);
  onStateRef.current = onState;
  selectedRef.current = selected;
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

      ctx.fillStyle = s.status === "won" ? EASING : GOLD_FILL;
      roundRect(ctx, s.slotX, RULES.slotY, RULES.slotW, RULES.slotH, 8);
      ctx.fill();
      ctx.strokeStyle = GOLD;
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.fillStyle = PAPER;
      ctx.font = "600 13px Georgia, serif";
      ctx.textAlign = "center";
      ctx.fillText("THE SLOT", s.slotX + RULES.slotW / 2, RULES.slotY + 22);
      ctx.font = "700 16px Georgia, serif";
      ctx.fillText(`${Math.round(s.tightness)}%`, s.slotX + RULES.slotW / 2, RULES.slotY + 40);

      ctx.fillStyle = PAPER;
      ctx.font = "700 22px Georgia, serif";
      ctx.textAlign = "left";
      ctx.fillText(s.stage.name, 36, RULES.wallTop + 28);
      ctx.font = "14px Georgia, serif";
      ctx.fillStyle = LINE;
      ctx.fillText(s.stage.instrumentCode, 36, RULES.wallTop + 50);

      for (const p of s.papers) {
        ctx.fillStyle = "#fff";
        ctx.strokeStyle = LINE;
        ctx.lineWidth = 1;
        ctx.fillRect(p.x, p.y, RULES.paperW, RULES.paperH);
        ctx.strokeRect(p.x, p.y, RULES.paperW, RULES.paperH);
        ctx.strokeStyle = MUTED;
        ctx.beginPath();
        ctx.moveTo(p.x + 8, p.y + 14);
        ctx.lineTo(p.x + RULES.paperW - 8, p.y + 14);
        ctx.moveTo(p.x + 8, p.y + 24);
        ctx.lineTo(p.x + RULES.paperW - 14, p.y + 24);
        ctx.moveTo(p.x + 8, p.y + 34);
        ctx.lineTo(p.x + RULES.paperW - 10, p.y + 34);
        ctx.stroke();
      }

      for (const shot of s.shots) {
        ctx.fillStyle = shot.kind === "instrument" ? GOLD_FILL : MUTED;
        roundRect(ctx, shot.x, shot.y, RULES.shotW, RULES.shotH, 3);
        ctx.fill();
      }

      ctx.fillStyle = GOLD_FILL;
      roundRect(ctx, s.playerX, RULES.playerY, RULES.playerW, RULES.playerH, 4);
      ctx.fill();
      ctx.fillStyle = INK;
      ctx.font = "700 11px Georgia, serif";
      ctx.textAlign = "center";
      ctx.fillText("STAMP", s.playerX + RULES.playerW / 2, RULES.playerY + 15);

      for (const sp of sparksRef.current) {
        ctx.globalAlpha = Math.max(0, sp.life * 2);
        ctx.fillStyle = sp.color;
        ctx.fillRect(sp.x, sp.y, 3, 3);
      }
      ctx.globalAlpha = 1;
      ctx.restore();
    };

    const tick = (now: number) => {
      if (!running) return;
      const dt = Math.min(0.04, (now - last) / 1000);
      last = now;
      const input = { ...inputRef.current, select: selectedRef.current };
      const before = stateRef.current.status;
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

      sparksRef.current = sparksRef.current
        .map((sp) => ({
          ...sp,
          x: sp.x + sp.vx * dt,
          y: sp.y + sp.vy * dt,
          life: sp.life - dt,
        }))
        .filter((sp) => sp.life > 0);

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
          burst(sparksRef.current, s.slotX + RULES.slotW / 2, RULES.slotY + 26, GOLD, 14);
        } else if (e.type === "bounce") {
          burst(sparksRef.current, s.slotX + RULES.slotW / 2, RULES.slotY + 26, TIGHT, 10);
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

