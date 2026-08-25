"use client";

import { useMemo, useRef, useState } from "react";
import { formatThroughput } from "@/game/format";
import { campaignStages } from "@/game/stages";
import { matchScore, shareLine, startStage } from "@/game/sim";
import type { GameState, Input, StageDef } from "@/game/types";
import { GameCanvas } from "./GameCanvas";
import { Hud } from "./Hud";

type Screen = "menu" | "play" | "result";

export function Campaign() {
  const stages = useMemo(() => campaignStages(), []);
  const [screen, setScreen] = useState<Screen>("menu");
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState(0);
  const [paused, setPaused] = useState(false);
  const [state, setState] = useState<GameState>(() => startStage(stages[0]));
  const [campaignScore, setCampaignScore] = useState(0);
  const inputRef = useRef<Input>({ left: false, right: false, fire: false });
  const scoredRef = useRef(false);

  const stage: StageDef = stages[index];

  const begin = (i: number) => {
    scoredRef.current = false;
    setIndex(i);
    setSelected(0);
    setPaused(false);
    setState(startStage(stages[i]));
    setScreen("play");
  };

  const onState = (s: GameState) => {
    setState(s);
    if ((s.status === "won" || s.status === "lost") && !scoredRef.current) {
      scoredRef.current = true;
      setScreen("result");
      if (s.status === "won") {
        setCampaignScore((n) => n + matchScore(s));
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

  if (screen === "menu") {
    return (
      <div>
        <p className="text-xs tracking-[0.2em] text-gold uppercase">The game</p>
        <h1 className="mt-4 max-w-3xl text-4xl leading-tight sm:text-6xl">
          Break the Slot
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted">
          Five walls. One moving slot on each. Stamp it with the instrument.
          Housing targets, waste lumps, and extra appointments bounce and fill
          the queue. Throughput only moves when the slot cracks.
        </p>
        <button
          type="button"
          onClick={() => {
            setCampaignScore(0);
            begin(0);
          }}
          className="mt-8 rounded-full bg-ink px-6 py-3 text-paper"
        >
          Play the five
        </button>
        <ul className="mt-12 divide-y divide-line border-y border-line">
          {stages.map((s, i) => (
            <li key={s.slug} className="flex items-center justify-between gap-4 py-4">
              <div>
                <p className="text-xs tracking-widest text-muted uppercase">
                  {String(i + 1).padStart(2, "0")} · {s.instrumentCode}
                </p>
                <p className="mt-1 text-xl">{s.name}</p>
                <p className="mt-1 max-w-xl text-sm text-muted">{s.slot}</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setCampaignScore(0);
                  begin(i);
                }}
                className="shrink-0 text-sm text-gold underline decoration-gold underline-offset-4"
              >
                Fight
              </button>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  if (screen === "result") {
    const won = state.status === "won";
    const last = index >= stages.length - 1;
    return (
      <div className="mx-auto max-w-2xl">
        <p className="text-xs tracking-[0.2em] text-gold uppercase">
          {won ? "Slot broken" : "Queue overflow"}
        </p>
        <h1 className="mt-4 text-4xl sm:text-5xl">{state.stage.name}</h1>
        <p className="mt-6 text-lg leading-relaxed">{shareLine(state)}</p>
        <p className="mt-4 text-muted">{state.stage.story}</p>
        <p className="mt-8 font-[family-name:var(--font-source)] text-4xl">
          {matchScore(state)}
        </p>
        <p className="text-sm text-muted">
          {formatThroughput(state.throughput, state.stage.unit)} {state.stage.unitLabel}
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          {won && !last ? (
            <button
              type="button"
              onClick={() => begin(index + 1)}
              className="rounded-full bg-ink px-6 py-3 text-paper"
            >
              Next slot
            </button>
          ) : null}
          {won && last ? (
            <p className="w-full text-lg">
              Five roots cracked. Campaign {campaignScore} pts.
            </p>
          ) : null}
          <button
            type="button"
            onClick={() => begin(index)}
            className="rounded-full border border-line px-6 py-3"
          >
            Retry
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
            Map of bosses
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs tracking-[0.2em] text-gold uppercase">
            Slot {String(index + 1).padStart(2, "0")} of {String(stages.length).padStart(2, "0")}
          </p>
          <h1 className="mt-2 text-3xl">{stage.name}</h1>
        </div>
        <p className="text-sm text-muted">Campaign {campaignScore}</p>
      </div>
      <GameCanvas
        key={stage.slug + index}
        stage={stage}
        paused={paused}
        selected={selected}
        onSelected={setSelected}
        onState={onState}
        inputRef={inputRef}
      />
      <Hud
        state={state}
        selected={selected}
        onSelect={setSelected}
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
