"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  POLICIES,
  PROJECTS,
  enactPolicy,
  isStalled,
  lockReason,
  resolveEvent,
  scoreOf,
  startBuilder,
  startProject,
  worksForSlot,
  type GameState,
  type SlotId,
} from "@/game/builder";

type View = "play" | "yard" | "score";

function policyFor(id: SlotId) {
  return POLICIES.find((p) => p.slot === id)!;
}

export function Builder() {
  const [game, setGame] = useState<GameState>(() => startBuilder());
  const [booted, setBooted] = useState(false);
  const [view, setView] = useState<View>("play");
  const [slotI, setSlotI] = useState(0);
  const [cmdI, setCmdI] = useState(0);
  const [flash, setFlash] = useState<string | null>(null);
  const yearRef = useRef(game.year);
  const rootRef = useRef<HTMLDivElement>(null);

  const slot = game.slots[slotI] ?? game.slots[0];
  const policy = policyFor(slot.id);
  const works = useMemo(() => worksForSlot(slot.id), [slot.id]);
  const commands = useMemo(
    () => [
      { kind: "policy" as const, id: policy.id, label: `Enact ${policy.code}`, hint: policy.blurb },
      ...works.map((w) => ({
        kind: "work" as const,
        id: w.id,
        label: `Start ${w.name}`,
        hint: `£${w.cost}bn · ${w.years}y · ${w.blurb}`,
      })),
    ],
    [policy, works],
  );

  useEffect(() => {
    if (cmdI >= commands.length) setCmdI(0);
  }, [commands.length, cmdI]);

  useEffect(() => {
    if (game.year !== yearRef.current) {
      yearRef.current = game.year;
      setFlash(`YEAR ${game.year}`);
      const t = window.setTimeout(() => setFlash(null), 900);
      return () => window.clearTimeout(t);
    }
  }, [game.year]);

  const run = useCallback(
    (kind: "policy" | "work", id: string) => {
      if (game.phase !== "act") return;
      setGame((g) => (kind === "policy" ? enactPolicy(g, id) : startProject(g, id)));
    },
    [game.phase],
  );

  const fire = useCallback(() => {
    const cmd = commands[cmdI];
    if (cmd) run(cmd.kind, cmd.id);
  }, [cmdI, commands, run]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") e.preventDefault();
      if (!booted) {
        if (e.key === "Enter" || e.key === " ") setBooted(true);
        return;
      }
      if (game.phase === "won" || game.phase === "lost") {
        if (e.key === "Enter") {
          setGame(startBuilder(Date.now() % 90000));
          setView("play");
          setSlotI(0);
        }
        return;
      }
      if (game.phase === "event") {
        if (e.key === "1" || e.key === "a" || e.key === "A") setGame((g) => resolveEvent(g, 0));
        if (e.key === "2" || e.key === "b" || e.key === "B") setGame((g) => resolveEvent(g, 1));
        return;
      }
      if (e.key === "Escape") {
        setView("play");
        return;
      }
      if (e.key === "y" || e.key === "Y") {
        setView((v) => (v === "yard" ? "play" : "yard"));
        return;
      }
      if (e.key === "s" || e.key === "S") {
        setView((v) => (v === "score" ? "play" : "score"));
        return;
      }
      if (e.key >= "1" && e.key <= "5") {
        setSlotI(Number(e.key) - 1);
        setView("play");
        setCmdI(0);
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setCmdI((i) => (i - 1 + commands.length) % commands.length);
        return;
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setCmdI((i) => (i + 1) % commands.length);
        return;
      }
      if (e.key === "ArrowLeft") {
        setSlotI((i) => (i - 1 + game.slots.length) % game.slots.length);
        setCmdI(0);
        return;
      }
      if (e.key === "ArrowRight") {
        setSlotI((i) => (i + 1) % game.slots.length);
        setCmdI(0);
        return;
      }
      if (e.key === "Enter" || e.key === " ") fire();
      if (e.key === "e" || e.key === "E") run("policy", policy.id);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [booted, commands.length, fire, game.phase, game.slots.length, policy.id, run]);

  const bind = game.slots.find((s) => s.id === game.bind)!;
  const stalledHere = game.flights.filter((f) => {
    const def = PROJECTS.find((p) => p.id === f.defId);
    return def ? isStalled(game, def) : f.stalled;
  });

  return (
    <div
      ref={rootRef}
      data-op-console
      className="fixed inset-0 z-50 flex flex-col bg-[#10161c] text-[#f4f6f1]"
    >
      <header className="flex shrink-0 items-center justify-between gap-3 border-b border-[#2a333c] px-4 py-2 text-xs tracking-widest uppercase">
        <Link href="/" className="text-[#c4985a] hover:underline">
          Map
        </Link>
        <p className="text-[#c4985a]">Operating console</p>
        <p className="text-[#8b939c]">
          Y{game.year}/{game.maxYears}
        </p>
      </header>

      <div className="grid shrink-0 grid-cols-4 border-b border-[#2a333c] text-center text-[11px] tracking-widest uppercase sm:text-xs">
        <HudCell k="Moves" v={`${game.ap}/${game.apMax}`} />
        <HudCell k="Treasury" v={`£${game.treasury}bn`} />
        <HudCell k="Patience" v={`${Math.round(game.patience)}`} />
        <HudCell k="Score" v={String(scoreOf(game))} />
      </div>

      <div className="shrink-0 border-b border-[#c4985a]/40 bg-[#c4985a]/10 px-4 py-2">
        <p className="text-[10px] tracking-[0.2em] text-[#c4985a] uppercase">Bind</p>
        <p className="text-sm sm:text-base">
          {bind.shortName} · {bind.protagonist} waits on {bind.waiting}
        </p>
      </div>

      <div className="relative min-h-0 flex-1">
        {!booted ? (
          <Boot onStart={() => setBooted(true)} />
        ) : game.phase === "won" || game.phase === "lost" ? (
          <End game={game} onAgain={() => { setGame(startBuilder(Date.now() % 90000)); setView("play"); }} />
        ) : game.phase === "event" && game.event ? (
          <EventScreen
            game={game}
            onPick={(i) => setGame(resolveEvent(game, i))}
          />
        ) : view === "yard" ? (
          <Yard game={game} bindName={bind.shortName} />
        ) : view === "score" ? (
          <Score game={game} />
        ) : (
          <div className="flex h-full min-h-0">
            <nav className="flex w-[30%] min-w-[7.5rem] flex-col border-r border-[#2a333c] sm:w-44">
              {game.slots.map((s, i) => {
                const active = i === slotI;
                const isBind = s.id === game.bind;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => {
                      setSlotI(i);
                      setCmdI(0);
                    }}
                    className={`flex-1 border-b border-[#2a333c] px-2 py-2 text-left ${
                      active ? "bg-[#c4985a]/15" : ""
                    }`}
                  >
                    <p className="text-[9px] tracking-widest text-[#8b939c] uppercase">
                      {i + 1} {isBind ? "Bind" : s.cracked ? "Open" : "Slack"}
                    </p>
                    <p className={`text-sm ${isBind ? "text-[#c4985a]" : ""}`}>{s.shortName}</p>
                    <div className="mt-1 h-1 overflow-hidden rounded-full bg-[#2a333c]">
                      <div
                        className={`h-full ${s.cracked ? "bg-[#6a9a74]" : isBind ? "bg-[#c4985a]" : "bg-[#8b939c]"}`}
                        style={{ width: `${s.cracked ? 100 : s.tightness}%` }}
                      />
                    </div>
                  </button>
                );
              })}
            </nav>
            <section className="flex min-h-0 min-w-0 flex-1 flex-col p-3 sm:p-4">
              <p className="text-[10px] tracking-[0.2em] text-[#8b939c] uppercase">
                {slot.protagonist} · {slot.waiting}
              </p>
              <h2 className="mt-1 font-[family-name:var(--font-source)] text-2xl">
                {slot.cracked ? `${slot.shortName} open` : `${Math.round(slot.tightness)}% tight`}
              </h2>
              <p className="mt-1 text-sm text-[#8b939c]">
                {stalledHere.length
                  ? `${stalledHere.length} work${stalledHere.length === 1 ? "" : "s"} stalled on the bind.`
                  : "Pick a command. Gold hits the bind."}
              </p>
              <ul className="mt-3 min-h-0 flex-1 space-y-2 overflow-hidden">
                {commands.map((c, i) => {
                  const work = c.kind === "work" ? works.find((w) => w.id === c.id) : null;
                  const lock = work ? lockReason(game, work) : game.ap < 1 ? "No moves left." : null;
                  const onBind = c.kind === "policy" && policy.slot === game.bind;
                  const active = i === cmdI;
                  return (
                    <li key={c.id + c.kind}>
                      <button
                        type="button"
                        disabled={Boolean(lock)}
                        onClick={() => {
                          setCmdI(i);
                          run(c.kind, c.id);
                        }}
                        onMouseEnter={() => setCmdI(i)}
                        className={`w-full rounded-lg border px-3 py-2 text-left disabled:opacity-40 ${
                          active
                            ? "border-[#c4985a] bg-[#c4985a]/15"
                            : "border-[#2a333c]"
                        }`}
                      >
                        <p className="text-sm">
                          <span className="mr-2 text-[#c4985a]">{i + 1}.</span>
                          {c.label}
                          {onBind ? <span className="ml-2 text-[10px] tracking-widest text-[#c4985a] uppercase">Bind</span> : null}
                        </p>
                        <p className="mt-0.5 line-clamp-2 text-xs text-[#8b939c]">
                          {lock ?? c.hint}
                        </p>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </section>
          </div>
        )}

        {flash ? (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-[#10161c]/70">
            <p className="font-[family-name:var(--font-source)] text-4xl tracking-[0.2em] text-[#c4985a]">
              {flash}
            </p>
          </div>
        ) : null}
      </div>

      <p className="shrink-0 truncate border-t border-[#2a333c] bg-[#0c1116] px-4 py-2 text-sm text-[#c4985a]">
        ▸ {game.log[0]}
      </p>
      <div className="flex shrink-0 flex-wrap gap-2 border-t border-[#2a333c] px-3 py-2 text-[10px] tracking-widest text-[#8b939c] uppercase">
        <button type="button" className="rounded border border-[#2a333c] px-2 py-1 hover:text-[#f4f6f1]" onClick={() => setView("play")}>
          Wire
        </button>
        <button type="button" className="rounded border border-[#2a333c] px-2 py-1 hover:text-[#f4f6f1]" onClick={() => setView("yard")}>
          Yard {game.flights.length}
        </button>
        <button type="button" className="rounded border border-[#2a333c] px-2 py-1 hover:text-[#f4f6f1]" onClick={() => setView("score")}>
          Britain
        </button>
        <span className="ml-auto hidden sm:inline">1-5 slot · arrows command · enter do · E enact · Y yard · S britain</span>
      </div>
    </div>
  );
}

function HudCell({ k, v }: { k: string; v: string }) {
  return (
    <div className="border-r border-[#2a333c] px-2 py-2 last:border-r-0">
      <p className="text-[#8b939c]">{k}</p>
      <p className="font-[family-name:var(--font-source)] text-base text-[#f4f6f1] sm:text-lg">{v}</p>
    </div>
  );
}

function Boot({ onStart }: { onStart: () => void }) {
  return (
    <button
      type="button"
      onClick={onStart}
      className="flex h-full w-full flex-col items-center justify-center gap-6 px-6 text-center"
    >
      <p className="text-[10px] tracking-[0.35em] text-[#c4985a] uppercase">Operating Picture</p>
      <h1 className="font-[family-name:var(--font-source)] text-3xl sm:text-5xl">Parliament console</h1>
      <p className="max-w-md text-sm leading-relaxed text-[#8b939c]">
        Rhian cannot hire. Dev cannot start. Anwen cannot plug in. Priya has no bay.
        You have eight years. The gold bind is the only slot that really moves.
      </p>
      <p className="animate-pulse tracking-[0.25em] text-[#c4985a] uppercase">Enter to begin</p>
    </button>
  );
}

function EventScreen({
  game,
  onPick,
}: {
  game: GameState;
  onPick: (i: 0 | 1) => void;
}) {
  const ev = game.event!;
  return (
    <div className="flex h-full flex-col justify-center px-5">
      <p className="text-[10px] tracking-[0.25em] text-[#c4985a] uppercase">Year {game.year} · Interrupt</p>
      <h2 className="mt-3 font-[family-name:var(--font-source)] text-3xl">{ev.title}</h2>
      <p className="mt-3 max-w-lg text-sm leading-relaxed text-[#8b939c]">{ev.body}</p>
      <div className="mt-6 grid gap-2">
        {ev.options.map((opt, i) => (
          <button
            key={opt.label}
            type="button"
            onClick={() => onPick(i as 0 | 1)}
            className="rounded-lg border border-[#2a333c] px-4 py-3 text-left hover:border-[#c4985a]"
          >
            <p>
              <span className="mr-2 text-[#c4985a]">{i + 1}.</span>
              {opt.label}
            </p>
            <p className="mt-1 text-xs text-[#8b939c]">{opt.hint}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

function Yard({ game, bindName }: { game: GameState; bindName: string }) {
  return (
    <div className="h-full overflow-hidden p-4">
      <p className="text-[10px] tracking-[0.25em] text-[#c4985a] uppercase">Yard</p>
      <h2 className="mt-1 text-2xl">Works in flight</h2>
      {game.flights.length === 0 ? (
        <p className="mt-4 text-sm text-[#8b939c]">Empty. Open a slot and start a work.</p>
      ) : (
        <ul className="mt-4 space-y-2">
          {game.flights.map((f) => {
            const d = PROJECTS.find((p) => p.id === f.defId);
            const name = d?.name ?? f.defId;
            const stalled = d ? isStalled(game, d) : f.stalled;
            return (
              <li key={f.uid} className="border border-[#2a333c] px-3 py-2">
                <p>{name}</p>
                <p className="text-xs text-[#8b939c]">
                  {stalled ? `Stalled on ${bindName}` : `${f.yearsLeft}y left`}
                </p>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function Score({ game }: { game: GameState }) {
  const e = game.economy;
  return (
    <div className="flex h-full flex-col justify-center px-6">
      <p className="text-[10px] tracking-[0.25em] text-[#c4985a] uppercase">Built Britain</p>
      <ul className="mt-4 space-y-2 text-lg">
        <li>Homes {e.homes.toLocaleString("en-GB")}</li>
        <li>GW {e.gw}</li>
        <li>Patients {e.patients.toLocaleString("en-GB")}</li>
        <li>Mills {e.mills}</li>
        <li>Data halls {e.halls}</li>
        <li>Income £{e.income}bn / year</li>
      </ul>
      <p className="mt-6 text-sm text-[#8b939c]">Win: mill running, homes up, Priya has a bay.</p>
    </div>
  );
}

function End({ game, onAgain }: { game: GameState; onAgain: () => void }) {
  const won = game.phase === "won";
  return (
    <div className="flex h-full flex-col items-center justify-center px-6 text-center">
      <p className="text-[10px] tracking-[0.25em] text-[#c4985a] uppercase">
        {won ? "Live" : "Stalled"}
      </p>
      <h2 className="mt-3 font-[family-name:var(--font-source)] text-3xl sm:text-4xl">
        {won ? "Something real switched on" : "Still in the yard"}
      </h2>
      <p className="mt-4 max-w-md text-sm leading-relaxed text-[#8b939c]">{game.log[0]}</p>
      <p className="mt-4 font-[family-name:var(--font-source)] text-3xl">{scoreOf(game)}</p>
      <button
        type="button"
        onClick={onAgain}
        className="mt-8 tracking-[0.2em] text-[#c4985a] uppercase"
      >
        Enter · another parliament
      </button>
    </div>
  );
}
