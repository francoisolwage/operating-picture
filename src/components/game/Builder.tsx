"use client";

import { useState } from "react";
import {
  POLICIES,
  PROJECTS,
  enactPolicy,
  inFlightCount,
  isStalled,
  lockReason,
  resolveEvent,
  scoreOf,
  startBuilder,
  startProject,
  type GameState,
  type ProjectDef,
} from "@/game/builder";

function defById(id: string): ProjectDef {
  return PROJECTS.find((p) => p.id === id)!;
}

export function Builder() {
  const [game, setGame] = useState<GameState>(() => startBuilder());

  const reset = () => setGame(startBuilder(Date.now() % 90000));
  const bind = game.slots.find((s) => s.id === game.bind)!;

  if (game.phase === "won" || game.phase === "lost") {
    const won = game.phase === "won";
    return (
      <article className="mx-auto max-w-2xl">
        <p className="text-xs tracking-[0.2em] text-gold uppercase">
          {won ? "Parliament" : "The yard won"}
        </p>
        <h1 className="mt-4 text-4xl sm:text-5xl">
          {won ? "Something real switched on" : "Still in the yard"}
        </h1>
        <p className="mt-6 text-lg leading-relaxed">{game.log[0]}</p>
        <Ledger game={game} />
        <p className="mt-6 font-[family-name:var(--font-source)] text-4xl">{scoreOf(game)}</p>
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

  if (game.phase === "event" && game.event) {
    const ev = game.event;
    return (
      <article className="mx-auto max-w-2xl">
        <p className="text-xs tracking-[0.2em] text-gold uppercase">
          Year {game.year} · A row lands
        </p>
        <h1 className="mt-4 text-4xl">{ev.title}</h1>
        <p className="mt-6 text-lg leading-relaxed">{ev.body}</p>
        <div className="mt-8 grid gap-3">
          {ev.options.map((opt, i) => (
            <button
              key={opt.label}
              type="button"
              onClick={() => setGame(resolveEvent(game, i as 0 | 1))}
              className="rounded-2xl border border-line p-4 text-left hover:border-gold"
            >
              <p className="text-lg">{opt.label}</p>
              <p className="mt-1 text-sm text-muted">{opt.hint}</p>
            </button>
          ))}
        </div>
      </article>
    );
  }

  return (
    <div>
      <p className="text-xs tracking-[0.2em] text-gold uppercase">Parliament builder</p>
      <h1 className="mt-4 max-w-3xl text-4xl leading-tight sm:text-5xl">
        Build Britain. Watch the bind stall the yard.
      </h1>
      <p className="mt-4 max-w-2xl leading-relaxed">
        Start works. Enact the instrument on the gold BIND or they sit unfinished.
        Win by restarting the mill, getting homes up, and freeing Priya a bay.
        Slogans pay today and steal patience tomorrow.
      </p>

      <div className="mt-8 grid gap-3 sm:grid-cols-4">
        <Chip label="Year" value={`${game.year} / ${game.maxYears}`} />
        <Chip label="Moves" value={`${game.ap} / ${game.apMax}`} />
        <Chip label="Treasury" value={`£${game.treasury}bn`} />
        <Chip label="Patience" value={`${Math.round(game.patience)}%`} bar={game.patience} />
      </div>

      <p className="mt-6 rounded-2xl border border-gold/50 bg-gold/10 px-4 py-3 leading-relaxed">
        <span className="text-xs tracking-widest text-gold uppercase">The bind</span>
        <br />
        {bind.name}. {bind.protagonist} waits on {bind.waiting}. Works in the yard that
        need this slot will not advance until you ease it.
      </p>

      <h2 className="mt-10 text-xl">The wire</h2>
      <ol className="mt-4 space-y-2">
        {game.slots.map((s) => (
          <li
            key={s.id}
            className={`rounded-2xl border p-4 ${s.id === game.bind ? "border-gold bg-gold/10" : "border-line"}`}
          >
            <div className="flex items-baseline justify-between gap-3">
              <p>
                <span className="text-xs tracking-widest text-muted uppercase">
                  {s.id === game.bind ? "Bind" : s.cracked ? "Open" : "Slack"}
                </span>
                <br />
                {s.shortName} · {s.protagonist}
              </p>
              <p className="font-[family-name:var(--font-source)] text-2xl">
                {s.cracked ? "Open" : `${Math.round(s.tightness)}%`}
              </p>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-line">
              <div
                className={`h-full ${s.cracked ? "bg-easing" : s.id === game.bind ? "bg-gold-fill" : "bg-ink/25"}`}
                style={{ width: `${s.cracked ? 100 : s.tightness}%` }}
              />
            </div>
          </li>
        ))}
      </ol>

      <h2 className="mt-10 text-xl">In the yard</h2>
      {game.flights.length === 0 ? (
        <p className="mt-2 text-sm text-muted">Nothing building yet. Start a work below.</p>
      ) : (
        <ul className="mt-3 space-y-2">
          {game.flights.map((f) => {
            const d = defById(f.defId);
            const stalled = isStalled(game, d);
            return (
              <li key={f.uid} className="rounded-2xl border border-line p-4">
                <p className="text-lg">{d.name}</p>
                <p className="text-sm text-muted">
                  {stalled
                    ? `Stalled on the ${bind.shortName} bind. Years left ${f.yearsLeft}.`
                    : `${f.yearsLeft} year${f.yearsLeft === 1 ? "" : "s"} left.`}
                </p>
              </li>
            );
          })}
        </ul>
      )}

      <h2 className="mt-10 text-xl">Start a work (1 move)</h2>
      <div className="mt-4 grid gap-3">
        {PROJECTS.map((p) => {
          const lock = lockReason(game, p);
          const n = inFlightCount(game, p.id);
          return (
            <button
              key={p.id}
              type="button"
              disabled={Boolean(lock)}
              onClick={() => setGame(startProject(game, p.id))}
              className="rounded-2xl border border-line p-4 text-left enabled:hover:border-gold disabled:opacity-50"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="text-lg">{p.name}</p>
                <p className="text-sm text-muted">
                  £{p.cost}bn · {p.years}y{n ? ` · ${n} in train` : ""}
                </p>
              </div>
              <p className="mt-1 text-sm leading-relaxed text-muted">{p.blurb}</p>
              {lock ? <p className="mt-2 text-sm text-tight">{lock}</p> : null}
            </button>
          );
        })}
      </div>

      <h2 className="mt-10 text-xl">Enact a policy (1 move)</h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {POLICIES.map((p) => {
          const onBind = p.slot === game.bind;
          return (
            <button
              key={p.id}
              type="button"
              disabled={game.ap < 1}
              onClick={() => setGame(enactPolicy(game, p.id))}
              className={`rounded-2xl border p-4 text-left enabled:hover:border-gold disabled:opacity-50 ${
                onBind ? "border-gold bg-gold/10" : "border-line"
              }`}
            >
              <p className="text-xs tracking-widest text-gold uppercase">{p.code}</p>
              <p className="mt-1 text-lg">{p.name}</p>
              <p className="mt-1 text-sm text-muted">{p.blurb}</p>
              {onBind ? (
                <p className="mt-2 text-xs text-gold">Hits the bind</p>
              ) : (
                <p className="mt-2 text-xs text-muted">Slack: small effect</p>
              )}
            </button>
          );
        })}
      </div>

      <h2 className="mt-10 text-xl">Built Britain</h2>
      <Ledger game={game} />

      <h2 className="mt-10 text-xl">The book</h2>
      <ul className="mt-3 space-y-2">
        {game.log.map((line, i) => (
          <li key={`${i}-${line.slice(0, 20)}`} className="text-sm leading-relaxed text-muted">
            {line}
          </li>
        ))}
      </ul>
    </div>
  );
}

function Ledger({ game }: { game: GameState }) {
  const e = game.economy;
  return (
    <ul className="mt-4 grid gap-2 sm:grid-cols-2 text-sm">
      <li>Homes consented {e.homes.toLocaleString("en-GB")}</li>
      <li>GW connected {e.gw}</li>
      <li>Patients completed {e.patients.toLocaleString("en-GB")}</li>
      <li>Mills running {e.mills}</li>
      <li>Data halls {e.halls}</li>
      <li>Income £{e.income}bn / year</li>
    </ul>
  );
}

function Chip({
  label,
  value,
  bar,
}: {
  label: string;
  value: string;
  bar?: number;
}) {
  return (
    <div className="rounded-2xl border border-line p-4">
      <p className="text-xs tracking-widest text-muted uppercase">{label}</p>
      <p className="mt-1 font-[family-name:var(--font-source)] text-2xl">{value}</p>
      {bar !== undefined ? (
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-line">
          <div className="h-full bg-gold-fill" style={{ width: `${bar}%` }} />
        </div>
      ) : null}
    </div>
  );
}

