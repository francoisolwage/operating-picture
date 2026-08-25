"use client";

import { useMemo, useRef, useState } from "react";
import { formatThroughput } from "@/game/format";
import { EPILOGUE, PROLOGUE, campaignStages } from "@/game/stages";
import { matchScore, shareLine, startStage } from "@/game/sim";
import type { GameState, Input, StageDef } from "@/game/types";
import { GameCanvas } from "./GameCanvas";
import { Hud } from "./Hud";

type Screen = "menu" | "brief" | "play" | "debrief" | "epilogue";

type Ledger = {
  projects: number;
  homes: number;
  gw: number;
  pence: number;
  patients: number;
};

const emptyLedger: Ledger = {
  projects: 0,
  homes: 0,
  gw: 0,
  pence: 0,
  patients: 0,
};

function addThroughput(ledger: Ledger, stage: StageDef, n: number): Ledger {
  const next = { ...ledger };
  if (stage.unit === "projects") next.projects += n;
  if (stage.unit === "homes") next.homes += n;
  if (stage.unit === "GW") next.gw += n;
  if (stage.unit === "p") next.pence += n;
  if (stage.unit === "patients") next.patients += n;
  return next;
}

export function Campaign() {
  const stages = useMemo(() => campaignStages(), []);
  const [screen, setScreen] = useState<Screen>("menu");
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState(0);
  const [paused, setPaused] = useState(false);
  const [state, setState] = useState<GameState>(() => startStage(stages[0]));
  const [campaignScore, setCampaignScore] = useState(0);
  const [ledger, setLedger] = useState<Ledger>(emptyLedger);
  const [campaign, setCampaign] = useState(true);
  const inputRef = useRef<Input>({ left: false, right: false, fire: false });
  const scoredRef = useRef(false);

  const stage: StageDef = stages[index];

  const openBrief = (i: number, asCampaign: boolean) => {
    scoredRef.current = false;
    setCampaign(asCampaign);
    setIndex(i);
    const started = startStage(stages[i]);
    setSelected(started.selected);
    setPaused(false);
    setState(started);
    setScreen("brief");
  };

  const startPlay = () => {
    const started = startStage(stages[index]);
    scoredRef.current = false;
    setSelected(started.selected);
    setPaused(false);
    setState(started);
    setScreen("play");
  };

  const onState = (s: GameState) => {
    setState(s);
    setSelected(s.selected);
    if ((s.status === "won" || s.status === "lost") && !scoredRef.current) {
      scoredRef.current = true;
      setScreen("debrief");
      if (s.status === "won") {
        setCampaignScore((n) => n + matchScore(s));
        setLedger((cur) => addThroughput(cur, s.stage, s.throughput));
      }
    }
  };

  const copyShare = async () => {
    try {
      await navigator.clipboard.writeText(
        `${shareLine(state)} ${matchScore(state)} pts. operating-picture.vercel.app/play`,
      );
    } catch {
      /* clipboard may be blocked */
    }
  };

  const pickCard = (i: number) => {
    setSelected(i);
    inputRef.current.select = i;
  };

  if (screen === "menu") {
    return (
      <div>
        <p className="text-xs tracking-[0.2em] text-gold uppercase">{PROLOGUE.kicker}</p>
        <h1 className="mt-4 max-w-3xl text-4xl leading-tight sm:text-6xl">
          {PROLOGUE.title}
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed">{PROLOGUE.body}</p>
        <p className="mt-4 max-w-2xl text-muted">
          Gold card on the gold plate. Grey cards are slogans. They bounce and
          fill the queue. One parliament. Five chapters.
        </p>
        <button
          type="button"
          onClick={() => {
            setCampaignScore(0);
            setLedger(emptyLedger);
            openBrief(0, true);
          }}
          className="mt-8 rounded-full bg-ink px-6 py-3 text-paper"
        >
          Open chapter one
        </button>
        <ul className="mt-12 divide-y divide-line border-y border-line">
          {stages.map((s, i) => (
            <li key={s.slug} className="flex items-center justify-between gap-4 py-5">
              <div>
                <p className="text-xs tracking-widest text-muted uppercase">
                  Chapter {String(i + 1).padStart(2, "0")} · {s.instrumentCode}
                </p>
                <p className="mt-1 text-xl">{s.protagonist}</p>
                <p className="mt-1 max-w-xl text-sm text-muted">{s.waiting}</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setCampaignScore(0);
                  setLedger(emptyLedger);
                  openBrief(i, false);
                }}
                className="shrink-0 text-sm text-gold underline decoration-gold underline-offset-4"
              >
                This chapter
              </button>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  if (screen === "brief") {
    return (
      <article className="mx-auto max-w-2xl">
        <p className="text-xs tracking-[0.2em] text-gold uppercase">
          Chapter {String(index + 1).padStart(2, "0")} · {stage.instrumentCode}
        </p>
        <h1 className="mt-4 text-4xl sm:text-5xl">{stage.protagonist}</h1>
        <p className="mt-3 text-lg text-muted">{stage.waiting}</p>
        <p className="mt-6 text-lg leading-relaxed">{stage.brief}</p>
        <p className="mt-6 rounded-2xl border border-gold/40 bg-gold/10 p-4 leading-relaxed">
          {stage.how}
        </p>
        <button
          type="button"
          onClick={startPlay}
          className="mt-8 rounded-full bg-ink px-6 py-3 text-paper"
        >
          Stamp the slot
        </button>
      </article>
    );
  }

  if (screen === "epilogue") {
    return (
      <article className="mx-auto max-w-2xl">
        <p className="text-xs tracking-[0.2em] text-gold uppercase">{EPILOGUE.kicker}</p>
        <h1 className="mt-4 text-4xl sm:text-5xl">{EPILOGUE.title}</h1>
        <p className="mt-6 text-lg leading-relaxed">{EPILOGUE.body}</p>
        <ul className="mt-8 space-y-2 text-muted">
          <li>{Math.round(ledger.projects)} projects finished</li>
          <li>{Math.round(ledger.homes).toLocaleString("en-GB")} homes consented</li>
          <li>{ledger.gw.toFixed(1)} GW connected</li>
          <li>{ledger.pence.toFixed(1)} p/kWh off the bill</li>
          <li>{Math.round(ledger.patients).toLocaleString("en-GB")} patients completed</li>
        </ul>
        <p className="mt-6 font-[family-name:var(--font-source)] text-4xl">{campaignScore}</p>
        <button
          type="button"
          onClick={() => setScreen("menu")}
          className="mt-8 rounded-full bg-ink px-6 py-3 text-paper"
        >
          Back to the wire
        </button>
      </article>
    );
  }

  if (screen === "debrief") {
    const won = state.status === "won";
    const last = index >= stages.length - 1;
    return (
      <article className="mx-auto max-w-2xl">
        <p className="text-xs tracking-[0.2em] text-gold uppercase">
          {won ? "Reversal" : "The hopper won"}
        </p>
        <h1 className="mt-4 text-4xl sm:text-5xl">{state.stage.protagonist}</h1>
        <p className="mt-6 text-lg leading-relaxed">
          {won ? state.stage.win : state.stage.lose}
        </p>
        <p className="mt-4 text-muted">{shareLine(state)}</p>
        <p className="mt-8 font-[family-name:var(--font-source)] text-4xl">
          {matchScore(state)}
        </p>
        <p className="text-sm text-muted">
          {formatThroughput(state.throughput, state.stage.unit)} {state.stage.unitLabel}
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          {won && campaign && !last ? (
            <button
              type="button"
              onClick={() => openBrief(index + 1, true)}
              className="rounded-full bg-ink px-6 py-3 text-paper"
            >
              Next chapter
            </button>
          ) : null}
          {won && campaign && last ? (
            <button
              type="button"
              onClick={() => setScreen("epilogue")}
              className="rounded-full bg-ink px-6 py-3 text-paper"
            >
              Close the parliament
            </button>
          ) : null}
          <button
            type="button"
            onClick={startPlay}
            className="rounded-full border border-line px-6 py-3"
          >
            Try again
          </button>
          <button
            type="button"
            onClick={copyShare}
            className="rounded-full border border-gold px-6 py-3 text-gold"
          >
            Copy line
          </button>
          <button
            type="button"
            onClick={() => setScreen("menu")}
            className="rounded-full px-6 py-3 text-muted"
          >
            Chapters
          </button>
        </div>
      </article>
    );
  }

  return (
    <div>
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs tracking-[0.2em] text-gold uppercase">
            Chapter {String(index + 1).padStart(2, "0")} · {stage.protagonist}
          </p>
          <h1 className="mt-2 text-3xl">{stage.waiting}</h1>
        </div>
        <p className="text-sm text-muted">Parliament {campaignScore}</p>
      </div>
      <GameCanvas
        key={stage.slug + "-" + index}
        stage={stage}
        paused={paused}
        selected={selected}
        onSelected={pickCard}
        onState={onState}
        inputRef={inputRef}
      />
      <Hud
        state={state}
        selected={selected}
        onSelect={pickCard}
        onFire={() => {
          inputRef.current.fire = true;
        }}
        onPause={() => setPaused((p) => !p)}
      />
      {paused ? (
        <p className="mt-3 text-center text-sm text-muted">Paused. Stamp when you are ready.</p>
      ) : null}
    </div>
  );
}
