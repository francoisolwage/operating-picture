"use client";

import { formatThroughput } from "@/game/format";
import type { GameState } from "@/game/types";

type Props = {
  state: GameState;
  selected: number;
  onSelect: (i: number) => void;
  onFire: () => void;
  onPause: () => void;
};

export function Hud({ state, selected, onSelect, onFire, onPause }: Props) {
  return (
    <div className="mt-4 space-y-4">
      <p className="rounded-2xl border border-gold/40 bg-gold/10 px-4 py-3 text-sm leading-relaxed">
        {state.coach}
      </p>
      <div className="grid gap-4 lg:grid-cols-[1fr_auto]">
        <div className="grid gap-3 sm:grid-cols-3">
          {state.stage.cards.map((card, i) => {
            const active = i === selected;
            const gold = card.kind === "instrument";
            return (
              <button
                key={`${card.code}-${card.label}`}
                type="button"
                onClick={() => onSelect(i)}
                className={`rounded-2xl border p-4 text-left transition ${
                  active
                    ? gold
                      ? "border-gold bg-gold/15 ring-2 ring-gold/40"
                      : "border-tight bg-tight/10"
                    : "border-line bg-paper"
                }`}
              >
                <p className="text-xs tracking-widest text-muted uppercase">
                  {gold ? "Breaks the slot" : "Fills the queue"} · {i + 1}
                </p>
                <p
                  className={`mt-2 font-[family-name:var(--font-source)] text-2xl ${gold ? "text-gold" : "text-tight"}`}
                >
                  {card.code}
                </p>
                <p className="mt-1 text-sm leading-relaxed">{card.label}</p>
              </button>
            );
          })}
        </div>
        <div className="flex flex-col justify-between gap-3 rounded-2xl border border-line p-4 sm:min-w-[220px]">
          <div>
            <p className="text-xs tracking-widest text-muted uppercase">Throughput</p>
            <p className="mt-1 font-[family-name:var(--font-source)] text-3xl">
              {formatThroughput(state.throughput, state.stage.unit)}
            </p>
            <p className="text-sm text-muted">{state.stage.unitLabel}</p>
          </div>
          <div>
            <p className="text-xs tracking-widest text-muted uppercase">Queue</p>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-line">
              <div
                className="h-full bg-tight"
                style={{ width: `${Math.min(100, state.queue)}%` }}
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onFire}
              className="flex-1 rounded-full bg-ink px-4 py-3 text-sm text-paper"
            >
              Stamp the plate
            </button>
            <button
              type="button"
              onClick={onPause}
              className="rounded-full border border-line px-4 py-3 text-sm"
            >
              Pause
            </button>
          </div>
          <p className="text-xs text-muted">
            Drag to aim. Gold card, gold plate. Space stamps.
          </p>
        </div>
      </div>
    </div>
  );
}
