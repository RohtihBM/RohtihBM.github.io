"use client";

import { useEffect, useRef, useState } from "react";
import s from "./VoiceSim.module.css";

type State = "idle" | "listening" | "thinking" | "speaking";
type Mode = "before" | "after";

const STATES: State[] = ["idle", "listening", "thinking", "speaking"];
// Transcript-delay ranges from the resume (seconds).
const RANGE: Record<Mode, [number, number]> = { before: [2.2, 3.1], after: [0.2, 1.8] };
const AXIS_MAX = 3.5;

export default function VoiceSim() {
  const [mode, setMode] = useState<Mode>("after");
  const [state, setState] = useState<State>("idle");
  const [stuck, setStuck] = useState(false);
  const [running, setRunning] = useState(false);
  const [transcript, setTranscript] = useState<{ who: string; text: string; delay?: number }[]>([]);
  const [elapsed, setElapsed] = useState<number | null>(null);
  const timers = useRef<number[]>([]);
  const raf = useRef<number | null>(null);

  const clear = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    if (raf.current) cancelAnimationFrame(raf.current);
  };
  useEffect(() => clear, []);
  const at = (ms: number, fn: () => void) => timers.current.push(window.setTimeout(fn, ms));

  const run = () => {
    clear();
    setRunning(true);
    setStuck(false);
    setTranscript([]);
    setElapsed(null);
    const [lo, hi] = RANGE[mode];
    const delay = lo + Math.random() * (hi - lo);

    setState("listening");
    at(1500, () => {
      // caller stops speaking — start the transcript clock
      setState("thinking");
      const start = performance.now();
      const loop = () => {
        const e = (performance.now() - start) / 1000;
        if (e >= delay) {
          setElapsed(delay);
          setTranscript((t) => [{ who: "Caller", text: "Can I move my demo call to Thursday afternoon?", delay }, ...t.filter((x) => x.who !== "Caller")]);
          return;
        }
        setElapsed(e);
        raf.current = requestAnimationFrame(loop);
      };
      raf.current = requestAnimationFrame(loop);
    });
    at(2300, () => setState("speaking"));
    at(2400, () => setTranscript((t) => [...t, { who: "Agent", text: "Sure — Thursday has 2:30 and 4:00 open. Which works?" }]));
    at(4300, () => {
      if (mode === "before") {
        setStuck(true); // audio ended, the UI never left "speaking"
      } else {
        setState("listening");
      }
      setRunning(false);
    });
  };

  const switchMode = (m: Mode) => {
    clear();
    setMode(m);
    setState("idle");
    setStuck(false);
    setRunning(false);
    setTranscript([]);
    setElapsed(null);
  };

  return (
    <div className={s.sim}>
      <div className={s.head}>
        <div className={s.seg} role="group" aria-label="Widget build">
          {(["before", "after"] as Mode[]).map((m) => (
            <button key={m} className="mono" aria-pressed={mode === m} onClick={() => switchMode(m)}>
              {m === "before" ? "Before fix" : "After fix"}
            </button>
          ))}
        </div>
        <button className={`mono ${s.run}`} onClick={run} disabled={running}>
          {running ? "Turn in progress…" : "Run a voice turn →"}
        </button>
      </div>

      <ol className={s.machine} aria-label="Widget state">
        {STATES.map((st, i) => (
          <li key={st} data-on={state === st} data-stuck={stuck && st === "speaking"} aria-current={state === st ? "step" : undefined}>
            <span className="mono">{String(i).padStart(2, "0")}</span>
            {st}
          </li>
        ))}
      </ol>

      <div className={s.stage}>
        <div className={s.wave} data-state={state} data-stuck={stuck} aria-hidden="true">
          {Array.from({ length: 28 }, (_, i) => (
            <span key={i} style={{ animationDelay: `${(i % 7) * -0.13 - i * 0.021}s` }} />
          ))}
        </div>
        <p className={`mono ${s.note}`} aria-live="polite">
          {stuck
            ? "Audio ended · UI still says speaking"
            : state === "idle"
              ? "Press run to start a turn"
              : state === "listening" && !running
                ? "Audio ended · back to listening"
                : `Widget: ${state}`}
        </p>
      </div>

      <div className={s.transcript}>
        <p className={`mono ${s.tHead}`}>
          <span>Transcript</span>
          <span className={s.clock}>{elapsed === null ? "delay —" : `delay ${elapsed.toFixed(2)} s`}</span>
        </p>
        <ul>
          {transcript.map((l) => (
            <li key={l.who}>
              <span className="mono">{l.who}</span>
              {l.text}
            </li>
          ))}
          {transcript.length === 0 && <li className={s.empty}>—</li>}
        </ul>
      </div>

      {/* Range chart: transcript delay, before vs after. One axis, direct labels. */}
      <figure className={s.chart}>
        <figcaption className="mono">Fig. 3.1 — Transcript delay, seconds</figcaption>
        <div className={s.rows}>
          {(["before", "after"] as Mode[]).map((m) => {
            const [lo, hi] = RANGE[m];
            return (
              <div key={m} className={s.row} data-mode={m}>
                <span className={`mono ${s.rowLabel}`}>{m === "before" ? "Before" : "After"}</span>
                <div className={s.plot}>
                  <span
                    className={s.bar}
                    tabIndex={0}
                    role="img"
                    aria-label={`${m === "before" ? "Before fix" : "After fix"}: ${lo} to ${hi} seconds`}
                    style={{ left: `${(lo / AXIS_MAX) * 100}%`, width: `${((hi - lo) / AXIS_MAX) * 100}%` }}
                  >
                    <span className={`mono ${s.tip}`}>
                      {lo}–{hi} s
                    </span>
                  </span>
                </div>
              </div>
            );
          })}
          <div className={s.axis} aria-hidden="true">
            {[0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5].map((t) => (
              <span key={t} className="mono" style={{ left: `${(t / AXIS_MAX) * 100}%` }}>
                {t}
              </span>
            ))}
          </div>
        </div>
        <table className="sr-only">
          <caption>Transcript delay range</caption>
          <thead>
            <tr>
              <th>Build</th>
              <th>Min (s)</th>
              <th>Max (s)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Before fix</td>
              <td>2.2</td>
              <td>3.1</td>
            </tr>
            <tr>
              <td>After fix</td>
              <td>0.2</td>
              <td>1.8</td>
            </tr>
          </tbody>
        </table>
      </figure>
    </div>
  );
}
