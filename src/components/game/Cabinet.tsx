"use client";

import { useState } from "react";
import {
  bindSlot,
  changePapers,
  crackedCount,
  playOnSlot,
  startCabinet,
  type Card,
  type GameState,
  type SlotId,
} from "@/game/cabinet";

export function Cabinet() {
  const [game, setGame] = useState<GameState>(() => startCabinet());
  const [held, setHeld] = useState<string | null>(null);

  const bind = bindSlot(game);
  const heldCard = game.hand.find((c) => c.id === held) ?? null;

  const play = (slotId: SlotId) => {
    if (!held || game.status !== "playing") return;
    setGame(playOnSlot(game, held, slotId));
    setHeld(null);
  };

  const redraw = () => {
    if (game.status !== "playing") return;
    setGame(changePapers(game));
    setHeld(null);
  };

  const reset = () => {
    setGame(startCabinet(Date.now() % 100000));
    setHeld(null);
  };

  if (game.status !== "playing") {
    const won = game.status === "won";
    return (
      <article className="mx-auto max-w-2xl">
        <p className="text-xs tracking-[0.2em] text-gold uppercase">
          {won ? "Parliament done" : "Inventory won"}
        </p>
        <h1 className="mt-4 text-4xl sm:text-5xl">
          {won ? "The wire is open" : "The hopper overflowed"}
        </h1>
        <p className="mt-6 text-lg leading-relaxed">{game.log[0]}</p>
        <p className="mt-4 text-muted">
          {crackedCount(game)} of {game.slots.length} slots cracked. Queue{" "}
          {Math.round(game.queue)}.
        </p>
        <ul className="mt-8 space-y-2">
          {game.slots.map((s) => (
            <li key={s.id} className="text-muted">
              {s.cracked ? "Open" : "Tight"} · {s.protagonist}
            </li>
          ))}
        </ul>
        <button
          type="button"
          onClick={reset}
          className="mt-8 rounded-full bg-ink px-6 py-3 text-paper"
        >
          Another parliament
        </button>
      </article>
    );
  }

  return (
    <div>
      <p className="text-xs tracking-[0.2em] text-gold uppercase">The cabinet</p>
      <h1 className="mt-4 max-w-3xl text-4xl leading-tight sm:text-5xl">
        One parliament. One bind at a time.
      </h1>
      <p className="mt-4 max-w-2xl leading-relaxed">
        You get {game.actionsPerYear} moves a year, {game.maxYears} years.
        Play the gold instrument on the gold BIND. Slogans fill the queue.
        Hardware sits above the rest: crack it, and you earn a third move.
      </p>

      <div className="mt-8 grid gap-3 sm:grid-cols-3">
        <Stat label="Year" value={`${game.year} / ${game.maxYears}`} />
        <Stat label="Moves left" value={String(game.actionsLeft)} />
        <Stat label="Queue" value={`${Math.round(game.queue)}%`} bar={game.queue} danger />
      </div>

      <p className="mt-6 rounded-2xl border border-gold/50 bg-gold/10 px-4 py-3 leading-relaxed">
        <span className="text-xs tracking-widest text-gold uppercase">The bind</span>
        <br />
        {bind.name}. {bind.protagonist} waits: {bind.waiting}. Instrument{" "}
        {instrumentCode(bind.id)}.
      </p>

      <h2 className="mt-10 text-xl">The wire</h2>
      <ol className="mt-4 space-y-3">
        {game.slots.map((s) => {
          const isBind = s.id === game.bind;
          const fits = heldCard?.kind === "instrument" && heldCard.slot === s.id;
          return (
            <li key={s.id}>
              <button
                type="button"
                onClick={() => play(s.id)}
                disabled={!held}
                className={`w-full rounded-2xl border p-4 text-left transition ${
                  isBind
                    ? "border-gold bg-gold/10"
                    : "border-line bg-paper"
                } ${held ? "hover:border-gold cursor-pointer" : "opacity-95"} ${
                  fits ? "ring-2 ring-gold/50" : ""
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="text-xs tracking-widest text-muted uppercase">
                      {isBind ? "Bind" : s.cracked ? "Open" : "Slack"} · {s.shortName}
                    </p>
                    <p className="mt-1 text-lg">{s.protagonist}</p>
                    <p className="mt-1 text-sm text-muted">{s.waiting}</p>
                  </div>
                  <p className="font-[family-name:var(--font-source)] text-2xl">
                    {s.cracked ? "Open" : `${Math.round(s.tightness)}%`}
                  </p>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-line">
                  <div
                    className={`h-full ${s.cracked ? "bg-easing" : isBind ? "bg-gold-fill" : "bg-ink/30"}`}
                    style={{ width: `${s.cracked ? 100 : Math.min(100, s.tightness)}%` }}
                  />
                </div>
                {held ? (
                  <p className="mt-2 text-xs text-gold">
                    {fits
                      ? `Play ${heldCard.code} here`
                      : heldCard?.kind === "symptom"
                        ? "Slogan: this will fill the queue"
                        : "Wrong instrument for this door"}
                  </p>
                ) : null}
              </button>
            </li>
          );
        })}
      </ol>
      {!held ? (
        <p className="mt-2 text-sm text-muted">Pick a card below, then tap a slot.</p>
      ) : null}

      <h2 className="mt-10 text-xl">Your papers</h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        {game.hand.map((c) => (
          <CardButton
            key={c.id}
            card={c}
            selected={held === c.id}
            onSelect={() => setHeld(c.id === held ? null : c.id)}
          />
        ))}
      </div>
      <button
        type="button"
        onClick={redraw}
        className="mt-4 rounded-full border border-line px-5 py-2 text-sm"
      >
        Send the papers back (one move)
      </button>

      <h2 className="mt-10 text-xl">What just happened</h2>
      <ul className="mt-3 space-y-2">
        {game.log.map((line, i) => (
          <li key={`${i}-${line.slice(0, 24)}`} className="text-sm leading-relaxed text-muted">
            {line}
          </li>
        ))}
      </ul>
    </div>
  );
}

function instrumentCode(id: SlotId): string {
  switch (id) {
    case "state-hardware":
      return "CS1";
    case "planning":
      return "E4";
    case "grid-slot":
      return "E1.3";
    case "firm-power":
      return "E1.1";
    case "acute-beds":
      return "NHS1";
    default:
      return "";
  }
}

function Stat({
  label,
  value,
  bar,
  danger,
}: {
  label: string;
  value: string;
  bar?: number;
  danger?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-line p-4">
      <p className="text-xs tracking-widest text-muted uppercase">{label}</p>
      <p className="mt-2 font-[family-name:var(--font-source)] text-2xl">{value}</p>
      {bar !== undefined ? (
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-line">
          <div
            className={`h-full ${danger ? "bg-tight" : "bg-gold-fill"}`}
            style={{ width: `${Math.min(100, bar)}%` }}
          />
        </div>
      ) : null}
    </div>
  );
}

function CardButton({
  card,
  selected,
  onSelect,
}: {
  card: Card;
  selected: boolean;
  onSelect: () => void;
}) {
  const gold = card.kind === "instrument";
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={`rounded-2xl border p-4 text-left transition ${
        selected
          ? gold
            ? "border-gold bg-gold/15 ring-2 ring-gold/40"
            : "border-tight bg-tight/10 ring-2 ring-tight/30"
          : "border-line bg-paper"
      }`}
    >
      <p className="text-xs tracking-widest text-muted uppercase">
        {gold ? "Instrument" : "Slogan"} {card.slot ? `· ${card.code}` : ""}
      </p>
      <p className={`mt-2 text-xl ${gold ? "text-gold" : "text-tight"}`}>{card.label}</p>
      <p className="mt-2 text-sm leading-relaxed text-muted">{card.blurb}</p>
    </button>
  );
}
