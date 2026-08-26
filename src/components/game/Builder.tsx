"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import {
  BIND_HIT,
  POLICIES,
  PROJECTS,
  SLACK_HIT,
  clockOut,
  enactPolicy,
  homeSlotOf,
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

type DockCmd =
  | { kind: "policy"; id: string; label: string; hint: string; hotkey: string }
  | { kind: "work"; id: string; label: string; hint: string; hotkey: string }
  | { kind: "year"; id: "year"; label: string; hint: string; hotkey: string };

function policyFor(id: SlotId) {
  return POLICIES.find((p) => p.slot === id)!;
}

export function Builder() {
  const [game, setGame] = useState<GameState>(() => startBuilder());
  const [booted, setBooted] = useState(false);
  const [slotI, setSlotI] = useState(0);
  const [cmdI, setCmdI] = useState(0);
  const [flash, setFlash] = useState<string | null>(null);
  const [hit, setHit] = useState<{ id: SlotId; n: number } | null>(null);
  const yearRef = useRef(game.year);
  const bindRef = useRef(game.bind);

  const slot = game.slots[slotI] ?? game.slots[0];
  const policy = policyFor(slot.id);
  const works = useMemo(() => worksForSlot(slot.id), [slot.id]);
  const onBind = slot.id === game.bind;
  const bind = game.slots.find((s) => s.id === game.bind)!;

  const dock = useMemo<DockCmd[]>(() => {
    const items: DockCmd[] = [
      {
        kind: "policy",
        id: policy.id,
        label: `Stamp ${policy.code}`,
        hint: onBind
          ? `Hits the bind −${BIND_HIT}. ${policy.blurb}`
          : `Slack −${SLACK_HIT}. Bind is still ${bind.shortName}.`,
        hotkey: "E",
      },
      ...works.map((w, i) => ({
        kind: "work" as const,
        id: w.id,
        label: w.name,
        hint: `£${w.cost}bn · ${w.years}y · ${w.blurb}`,
        hotkey: String(i + 1),
      })),
      {
        kind: "year",
        id: "year",
        label: "Clock year",
        hint:
          game.ap > 0
            ? `Forfeit ${game.ap} move${game.ap === 1 ? "" : "s"} and tick the yard.`
            : "Year already closed.",
        hotkey: "Y",
      },
    ];
    return items;
  }, [policy, works, onBind, bind.shortName, game.ap]);

  useEffect(() => {
    if (cmdI >= dock.length) setCmdI(0);
  }, [dock.length, cmdI]);

  useEffect(() => {
    if (!booted) return;
    const yearChanged = game.year !== yearRef.current;
    const bindChanged = game.bind !== bindRef.current;
    yearRef.current = game.year;
    bindRef.current = game.bind;
    if (bindChanged) {
      const i = game.slots.findIndex((s) => s.id === game.bind);
      if (i >= 0) {
        setSlotI(i);
        setCmdI(0);
      }
    }
    if (yearChanged && bindChanged) {
      setFlash(`YEAR ${game.year} · ${bind.shortName.toUpperCase()} BIND`);
    } else if (yearChanged) {
      setFlash(`YEAR ${game.year}`);
    } else if (bindChanged) {
      setFlash(`${bind.shortName.toUpperCase()} IS THE BIND`);
    }
    if (!yearChanged && !bindChanged) return;
    const t = window.setTimeout(() => setFlash(null), 900);
    return () => window.clearTimeout(t);
  }, [booted, game.year, game.bind, bind.shortName]);

  const fire = useCallback(
    (cmd: DockCmd | undefined) => {
      if (!cmd || game.phase !== "act") return;
      if (cmd.kind === "year") {
        setGame((g) => clockOut(g));
        return;
      }
      if (cmd.kind === "policy") {
        setHit({ id: slot.id, n: onBind ? BIND_HIT : SLACK_HIT });
        window.setTimeout(() => setHit(null), 700);
        setGame((g) => enactPolicy(g, cmd.id));
        return;
      }
      setGame((g) => startProject(g, cmd.id));
    },
    [game.phase, onBind, slot.id],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const block = [" ", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Enter"];
      if (block.includes(e.key)) e.preventDefault();
      if (!booted) {
        if (e.key === "Enter" || e.key === " ") setBooted(true);
        return;
      }
      if (game.phase === "won" || game.phase === "lost") {
        if (e.key === "Enter" || e.key === " ") {
          setGame(startBuilder(Date.now() % 90000));
          setSlotI(0);
          setCmdI(0);
        }
        return;
      }
      if (game.phase === "event") {
        if (e.key === "1" || e.key === "a" || e.key === "A" || e.key === "Enter") {
          setGame((g) => resolveEvent(g, 0));
        }
        if (e.key === "2" || e.key === "b" || e.key === "B") {
          setGame((g) => resolveEvent(g, 1));
        }
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
      if (e.key === "ArrowUp") {
        setCmdI((i) => (i - 1 + dock.length) % dock.length);
        return;
      }
      if (e.key === "ArrowDown") {
        setCmdI((i) => (i + 1) % dock.length);
        return;
      }
      if (e.key === "e" || e.key === "E") {
        fire(dock.find((c) => c.kind === "policy"));
        return;
      }
      if (e.key === "y" || e.key === "Y") {
        fire(dock.find((c) => c.kind === "year"));
        return;
      }
      if (e.key >= "1" && e.key <= "3") {
        const work = dock.filter((c) => c.kind === "work")[Number(e.key) - 1];
        if (work) fire(work);
        return;
      }
      if (e.key === "Enter" || e.key === " ") fire(dock[cmdI]);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [booted, cmdI, dock, fire, game.phase, game.slots.length]);

  const e = game.economy;

  return (
    <div
      data-op-console
      className="fixed inset-0 z-50 flex h-dvh flex-col overflow-hidden bg-[#10161c] text-[#f4f6f1] select-none"
    >
      <header className="flex shrink-0 items-center justify-between gap-3 border-b border-[#2a333c] px-3 py-1.5 text-[10px] tracking-[0.22em] uppercase sm:px-4 sm:text-xs">
        <Link href="/" className="text-[#c4985a] hover:underline">
          Map
        </Link>
        <p className="text-[#c4985a]">Parliament console</p>
        <p className="text-[#8b939c]">
          Y{game.year}/{game.maxYears} · {scoreOf(game)}
        </p>
      </header>

      <div className="grid shrink-0 grid-cols-4 border-b border-[#2a333c] text-center">
        <HudCell k="Moves">
          <Pips n={game.ap} max={game.apMax} />
        </HudCell>
        <HudCell k="Treasury" v={`£${game.treasury}bn`} />
        <HudCell k="Patience">
          <div className="mx-auto mt-1 h-1.5 max-w-[6rem] overflow-hidden rounded-full bg-[#2a333c]">
            <div
              className={`h-full ${game.patience < 28 ? "bg-[#8b2e2e]" : "bg-[#c4985a]"}`}
              style={{ width: `${game.patience}%` }}
            />
          </div>
          <p className="font-[family-name:var(--font-source)] text-sm sm:text-base">
            {Math.round(game.patience)}
          </p>
        </HudCell>
        <HudCell k="Britain" v={`${e.mills} mill · ${e.homes.toLocaleString("en-GB")} home`} />
      </div>

      <p className="shrink-0 truncate border-b border-[#c4985a]/30 bg-[#c4985a]/10 px-3 py-1.5 text-xs sm:px-4 sm:text-sm">
        <span className="mr-2 text-[10px] tracking-[0.2em] text-[#c4985a] uppercase">Bind</span>
        {bind.shortName} · {bind.protagonist} waits on {bind.waiting}
        <span className="ml-3 hidden text-[#8b939c] sm:inline">
          GW {e.gw} · patients {e.patients.toLocaleString("en-GB")} · halls {e.halls}
        </span>
      </p>

      <div className="relative min-h-0 flex-1">
        {!booted ? (
          <Boot onStart={() => setBooted(true)} />
        ) : game.phase === "won" || game.phase === "lost" ? (
          <End
            game={game}
            onAgain={() => {
              setGame(startBuilder(Date.now() % 90000));
              setSlotI(0);
              setCmdI(0);
            }}
          />
        ) : (
          <Board
            game={game}
            slotI={slotI}
            cmdI={cmdI}
            dock={dock}
            hit={hit}
            onSelectSlot={(i) => {
              setSlotI(i);
              setCmdI(0);
            }}
            onHoverCmd={setCmdI}
            onFire={fire}
            onPickEvent={(i) => setGame((g) => resolveEvent(g, i))}
          />
        )}

        {flash ? (
          <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center bg-[#10161c]/65">
            <p className="px-4 text-center font-[family-name:var(--font-source)] text-3xl tracking-[0.18em] text-[#c4985a] sm:text-5xl">
              {flash}
            </p>
          </div>
        ) : null}
        <div className="op-scan absolute inset-0 z-30" />
      </div>

      <p className="shrink-0 truncate border-t border-[#2a333c] bg-[#0c1116] px-3 py-2 text-sm text-[#c4985a] sm:px-4">
        ▸ {game.log[0]}
      </p>
      <p className="shrink-0 border-t border-[#2a333c] px-3 py-1.5 text-[10px] tracking-widest text-[#8b939c] uppercase">
        ←→ slot · ↑↓ dock · enter act · E stamp · 1-3 work · Y year
      </p>
    </div>
  );
}

function Board({
  game,
  slotI,
  cmdI,
  dock,
  hit,
  onSelectSlot,
  onHoverCmd,
  onFire,
  onPickEvent,
}: {
  game: GameState;
  slotI: number;
  cmdI: number;
  dock: DockCmd[];
  hit: { id: SlotId; n: number } | null;
  onSelectSlot: (i: number) => void;
  onHoverCmd: (i: number) => void;
  onFire: (cmd: DockCmd) => void;
  onPickEvent: (i: 0 | 1) => void;
}) {
  const slot = game.slots[slotI] ?? game.slots[0];
  const onBind = slot.id === game.bind;
  const stalledCount = game.flights.filter((f) => {
    const def = PROJECTS.find((p) => p.id === f.defId);
    return def ? isStalled(game, def) : f.stalled;
  }).length;

  return (
    <div className="relative flex h-full min-h-0 flex-col">
      <div className="flex min-h-0 flex-1 flex-col justify-center px-2 py-2 sm:px-6">
        <div className="flex items-stretch justify-center gap-0">
          {game.slots.map((s, i) => {
            const active = i === slotI;
            const isBind = s.id === game.bind;
            const chips = game.flights.filter((f) => {
              const def = PROJECTS.find((p) => p.id === f.defId);
              if (!def) return false;
              if (isStalled(game, def)) return s.id === game.bind;
              return homeSlotOf(def.id) === s.id;
            });
            return (
              <div key={s.id} className="flex min-w-0 flex-1 items-center">
                {i > 0 ? (
                  <div
                    className={`h-0.5 min-w-[0.4rem] flex-1 ${
                      game.slots[i - 1].id === game.bind ? "bg-[#c4985a]" : "bg-[#2a333c]"
                    }`}
                  />
                ) : null}
                <button
                  type="button"
                  onClick={() => onSelectSlot(i)}
                  className={`relative flex min-h-[6.5rem] min-w-0 flex-[2] flex-col items-center justify-center rounded-lg border px-1 py-2 sm:min-h-[7.5rem] sm:px-2 ${
                    isBind ? "op-bind border-[#c4985a] bg-[#c4985a]/15" : "border-[#2a333c]"
                  } ${active ? "ring-1 ring-[#c4985a]" : ""} ${hit?.id === s.id ? "op-hit" : ""}`}
                >
                  {hit?.id === s.id ? (
                    <span className="op-pop absolute -top-2 text-xs text-[#c4985a]">−{hit.n}</span>
                  ) : null}
                  <p className="text-[9px] tracking-widest text-[#8b939c] uppercase">
                    {isBind ? "Bind" : s.cracked ? "Open" : "Slack"}
                  </p>
                  <p className={`text-xs sm:text-sm ${isBind ? "text-[#c4985a]" : ""}`}>
                    {s.shortName}
                  </p>
                  <div className="mt-1.5 h-1.5 w-full max-w-[4.5rem] overflow-hidden rounded-full bg-[#2a333c]">
                    <div
                      className={`h-full ${
                        s.cracked ? "bg-[#6a9a74]" : isBind ? "bg-[#c4985a]" : "bg-[#8b939c]"
                      }`}
                      style={{ width: `${s.cracked ? 100 : s.tightness}%` }}
                    />
                  </div>
                  <p className="mt-1 text-[10px] text-[#8b939c]">
                    {s.cracked ? "loose" : `${Math.round(s.tightness)}%`}
                  </p>
                  {chips.length > 0 ? (
                    <p
                      className={`mt-1 max-w-full truncate text-[9px] tracking-widest uppercase ${
                        chips.some((c) => {
                          const def = PROJECTS.find((p) => p.id === c.defId);
                          return def ? isStalled(game, def) : c.stalled;
                        })
                          ? "op-stall text-[#c4985a]"
                          : "text-[#6a9a74]"
                      }`}
                    >
                      {chips.length} in yard
                    </p>
                  ) : (
                    <p className="mt-1 text-[9px] text-transparent">.</p>
                  )}
                </button>
                {i < game.slots.length - 1 ? (
                  <div
                    className={`h-0.5 min-w-[0.4rem] flex-1 ${
                      isBind ? "bg-[#c4985a]" : "bg-[#2a333c]"
                    }`}
                  />
                ) : null}
              </div>
            );
          })}
        </div>

        <YardStrip
          game={game}
          onChip={(id) => {
            const i = game.slots.findIndex((s) => s.id === id);
            if (i >= 0) onSelectSlot(i);
          }}
        />
      </div>

      <section className="shrink-0 border-t border-[#2a333c] px-2 py-2 sm:px-4">
        <p className="mb-2 truncate text-[10px] tracking-[0.2em] text-[#8b939c] uppercase">
          {slot.protagonist} · {slot.waiting}
          {stalledCount
            ? ` · ${stalledCount} stalled on the bind`
            : onBind
              ? " · gold is the only hit that counts"
              : ` · slack. bind is ${game.slots.find((s) => s.id === game.bind)?.shortName}`}
        </p>
        <div className="flex gap-2">
          {dock.map((c, i) => {
            const work = c.kind === "work" ? PROJECTS.find((p) => p.id === c.id) : null;
            const lock =
              c.kind === "work" && work
                ? lockReason(game, work)
                : c.kind === "year" && game.ap <= 0
                  ? "Year already closed."
                  : game.phase !== "act"
                    ? "Wait."
                    : c.kind === "policy" && game.ap < 1
                      ? "No moves left."
                      : null;
            const active = i === cmdI;
            const bindStamp = c.kind === "policy" && slot.id === game.bind;
            return (
              <button
                key={c.kind + c.id}
                type="button"
                disabled={Boolean(lock)}
                onMouseEnter={() => onHoverCmd(i)}
                onClick={() => {
                  onHoverCmd(i);
                  onFire(c);
                }}
                className={`min-w-0 flex-1 rounded-lg border px-2 py-2 text-left disabled:opacity-40 sm:px-3 ${
                  active ? "border-[#c4985a] bg-[#c4985a]/15" : "border-[#2a333c]"
                } ${bindStamp ? "shadow-[inset_0_0_0_1px_rgba(196,152,90,0.4)]" : ""}`}
              >
                <p className="truncate text-[11px] sm:text-sm">
                  <span className="mr-1 text-[#c4985a]">{c.hotkey}</span>
                  {c.label}
                </p>
                <p className="mt-0.5 line-clamp-2 text-[10px] leading-snug text-[#8b939c] sm:text-xs">
                  {lock ?? c.hint}
                </p>
              </button>
            );
          })}
        </div>
      </section>

      {game.phase === "event" && game.event ? (
        <div className="absolute inset-0 z-10 flex flex-col justify-end bg-[#10161c]/80 p-3 sm:justify-center sm:p-8">
          <div className="mx-auto w-full max-w-lg rounded-xl border border-[#c4985a]/50 bg-[#10161c] p-4 sm:p-6">
            <p className="text-[10px] tracking-[0.25em] text-[#c4985a] uppercase">
              Year {game.year} · Interrupt
            </p>
            <h2 className="mt-2 font-[family-name:var(--font-source)] text-2xl sm:text-3xl">
              {game.event.title}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-[#8b939c]">{game.event.body}</p>
            <div className="mt-4 grid gap-2">
              {game.event.options.map((opt, i) => (
                <button
                  key={opt.label}
                  type="button"
                  onClick={() => onPickEvent(i as 0 | 1)}
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
        </div>
      ) : null}
    </div>
  );
}

function YardStrip({
  game,
  onChip,
}: {
  game: GameState;
  onChip: (slot: SlotId) => void;
}) {
  if (game.flights.length === 0) {
    return (
      <p className="mt-3 text-center text-[11px] tracking-widest text-[#8b939c] uppercase">
        Yard empty · stamp the bind, then start a work
      </p>
    );
  }
  return (
    <div className="mt-3 flex justify-center gap-2 px-1">
      {game.flights.slice(0, 5).map((f) => {
        const d = PROJECTS.find((p) => p.id === f.defId);
        const stalled = d ? isStalled(game, d) : f.stalled;
        const seat = stalled ? game.bind : homeSlotOf(f.defId);
        return (
          <button
            key={f.uid}
            type="button"
            onClick={() => onChip(seat)}
            className={`max-w-[8rem] truncate rounded-full border px-2 py-1 text-[10px] tracking-wide uppercase ${
              stalled
                ? "op-stall border-[#c4985a] text-[#c4985a]"
                : "border-[#2a333c] text-[#6a9a74]"
            }`}
          >
            {d?.name ?? f.defId} · {stalled ? "stall" : `${f.yearsLeft}y`}
          </button>
        );
      })}
      {game.flights.length > 5 ? (
        <span className="self-center text-[10px] text-[#8b939c]">+{game.flights.length - 5}</span>
      ) : null}
    </div>
  );
}

function HudCell({
  k,
  v,
  children,
}: {
  k: string;
  v?: string;
  children?: ReactNode;
}) {
  return (
    <div className="border-r border-[#2a333c] px-2 py-1.5 last:border-r-0">
      <p className="text-[9px] tracking-widest text-[#8b939c] uppercase sm:text-[10px]">{k}</p>
      {children ?? (
        <p className="font-[family-name:var(--font-source)] text-sm sm:text-lg">{v}</p>
      )}
    </div>
  );
}

function Pips({ n, max }: { n: number; max: number }) {
  return (
    <p className="mt-1 font-[family-name:var(--font-source)] text-base tracking-[0.2em] text-[#c4985a] sm:text-lg">
      {Array.from({ length: max }, (_, i) => (i < n ? "●" : "○")).join(" ")}
    </p>
  );
}

function Boot({ onStart }: { onStart: () => void }) {
  return (
    <button
      type="button"
      onClick={onStart}
      className="flex h-full w-full flex-col items-center justify-center gap-5 px-6 text-center"
    >
      <p className="text-[10px] tracking-[0.35em] text-[#c4985a] uppercase">Operating Picture</p>
      <h1 className="font-[family-name:var(--font-source)] text-3xl sm:text-5xl">
        Parliament console
      </h1>
      <p className="max-w-md text-sm leading-relaxed text-[#8b939c]">
        One screen. The gold node is the bind. Stamp it, start a work, watch the yard. If a work
        sits, the bind has not moved. Eight years. Arrows and Enter are enough.
      </p>
      <p className="animate-pulse tracking-[0.25em] text-[#c4985a] uppercase">Enter to begin</p>
    </button>
  );
}

function End({ game, onAgain }: { game: GameState; onAgain: () => void }) {
  const won = game.phase === "won";
  const e = game.economy;
  return (
    <div className="flex h-full flex-col items-center justify-center px-6 text-center">
      <p className="text-[10px] tracking-[0.25em] text-[#c4985a] uppercase">
        {won ? "Live" : "Stalled"}
      </p>
      <h2 className="mt-3 font-[family-name:var(--font-source)] text-3xl sm:text-4xl">
        {won ? "Something real switched on" : "Still in the yard"}
      </h2>
      <p className="mt-4 max-w-md text-sm leading-relaxed text-[#8b939c]">{game.log[0]}</p>
      <p className="mt-4 text-sm text-[#8b939c]">
        Homes {e.homes.toLocaleString("en-GB")} · GW {e.gw} · patients{" "}
        {e.patients.toLocaleString("en-GB")} · mills {e.mills}
      </p>
      <p className="mt-2 font-[family-name:var(--font-source)] text-3xl">{scoreOf(game)}</p>
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
