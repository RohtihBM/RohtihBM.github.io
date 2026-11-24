"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { gsap, Draggable, useGSAP } from "@/lib/gsap";
import s from "./CanvasSim.module.css";

type Kind = "rect" | "ellipse" | "text";
type Shape = { id: string; kind: Kind; w: number; h: number };
type PaneId = "a" | "b";
type Pos = { x: number; y: number };

const INITIAL: Shape[] = [
  { id: "s1", kind: "rect", w: 0.34, h: 0.26 },
  { id: "s2", kind: "ellipse", w: 0.2, h: 0.2 * (4 / 3) },
  { id: "s3", kind: "text", w: 0.3, h: 0.12 },
];
const INITIAL_POS: Record<string, Pos> = {
  s1: { x: 0.1, y: 0.16 },
  s2: { x: 0.6, y: 0.5 },
  s3: { x: 0.14, y: 0.66 },
};
const LATENCIES = [40, 120, 300];
const PANES: { id: PaneId; label: string; peer: string }[] = [
  { id: "a", label: "Session A", peer: "B" },
  { id: "b", label: "Session B", peer: "A" },
];
const other = (p: PaneId): PaneId => (p === "a" ? "b" : "a");
const clamp01 = (v: number, max: number) => Math.min(Math.max(v, 0), max);

export default function CanvasSim() {
  const root = useRef<HTMLDivElement>(null);
  const [shapes, setShapes] = useState<Shape[]>(INITIAL);
  const [selected, setSelected] = useState<Record<PaneId, string | null>>({ a: "s1", b: null });
  const [latency, setLatency] = useState(120);
  const latencyRef = useRef(latency);
  latencyRef.current = latency;
  const pos = useRef<Record<string, Pos>>({ ...INITIAL_POS });
  const counter = useRef(4);
  const timers = useRef<number[]>([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const pane = (p: PaneId) => root.current!.querySelector<HTMLElement>(`[data-pane="${p}"]`)!;
  const shapeEl = (p: PaneId, id: string) => root.current?.querySelector<HTMLElement>(`[data-pane="${p}"] [data-shape="${id}"]`) ?? null;

  /** Deliver a change to the peer session after the simulated network delay. */
  const send = useCallback((to: PaneId, fn: () => void) => {
    timers.current.push(window.setTimeout(fn, latencyRef.current));
  }, []);

  const place = (p: PaneId, id: string, animate: boolean) => {
    const el = shapeEl(p, id);
    const pr = pos.current[id];
    if (!el || !pr) return;
    const box = pane(p).getBoundingClientRect();
    const v = { x: pr.x * box.width, y: pr.y * box.height };
    if (animate) gsap.to(el, { ...v, duration: 0.22, ease: "power2.out", overwrite: true });
    else gsap.set(el, v);
  };

  useGSAP(
    () => {
      const layout = () => shapes.forEach((sh) => PANES.forEach((p) => place(p.id, sh.id, false)));
      layout();
      window.addEventListener("resize", layout);
      const unbind: (() => void)[] = [];

      PANES.forEach(({ id: p }) => {
        root.current!.querySelectorAll<HTMLElement>(`[data-pane="${p}"] [data-shape]`).forEach((el) => {
          const id = el.dataset.shape!;
          Draggable.create(el, {
            type: "x,y",
            bounds: pane(p),
            minimumMovement: 2,
            onPress() {
              setSelected((sel) => ({ ...sel, [p]: id }));
            },
            onDrag() {
              const box = pane(p).getBoundingClientRect();
              pos.current[id] = { x: this.x / box.width, y: this.y / box.height };
              send(other(p), () => place(other(p), id, true));
            },
          });
        });

        // Presence: the peer sees this pane's cursor.
        const area = pane(p);
        const cursor = root.current!.querySelector<HTMLElement>(`[data-pane="${other(p)}"] [data-cursor]`)!;
        const move = (e: PointerEvent) => {
          const r = area.getBoundingClientRect();
          const nx = (e.clientX - r.left) / r.width;
          const ny = (e.clientY - r.top) / r.height;
          send(other(p), () => {
            const r2 = pane(other(p)).getBoundingClientRect();
            gsap.to(cursor, { x: nx * r2.width, y: ny * r2.height, autoAlpha: 1, duration: 0.2, ease: "power2.out", overwrite: true });
          });
        };
        const leave = () => send(other(p), () => gsap.to(cursor, { autoAlpha: 0, duration: 0.3 }));
        area.addEventListener("pointermove", move);
        area.addEventListener("pointerleave", leave);
        unbind.push(() => {
          area.removeEventListener("pointermove", move);
          area.removeEventListener("pointerleave", leave);
        });
      });

      return () => {
        window.removeEventListener("resize", layout);
        unbind.forEach((u) => u());
      };
    },
    { scope: root, dependencies: [shapes], revertOnUpdate: true }
  );

  const add = (kind: Kind) => {
    const id = `s${counter.current++}`;
    const dims: Record<Kind, Pick<Shape, "w" | "h">> = {
      rect: { w: 0.26, h: 0.2 },
      ellipse: { w: 0.16, h: 0.16 * (4 / 3) },
      text: { w: 0.3, h: 0.12 },
    };
    const n = counter.current % 4;
    pos.current[id] = { x: 0.32 + n * 0.04, y: 0.3 + n * 0.04 };
    setShapes((sh) => [...sh, { id, kind, ...dims[kind] }]);
    setSelected((sel) => ({ ...sel, a: id }));
  };

  const remove = (p: PaneId) => {
    const id = selected[p];
    if (!id) return;
    setShapes((sh) => sh.filter((x) => x.id !== id));
    setSelected({ a: null, b: null });
  };

  const nudge = (p: PaneId, id: string, e: React.KeyboardEvent) => {
    const step = e.shiftKey ? 0.05 : 0.01;
    const d: Record<string, [number, number]> = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] };
    if (e.key === "Delete" || e.key === "Backspace") {
      e.preventDefault();
      remove(p);
      return;
    }
    if (!d[e.key]) return;
    e.preventDefault();
    const sh = shapes.find((x) => x.id === id)!;
    const cur = pos.current[id];
    pos.current[id] = { x: clamp01(cur.x + d[e.key][0], 1 - sh.w), y: clamp01(cur.y + d[e.key][1], 1 - sh.h) };
    place(p, id, true);
    send(other(p), () => place(other(p), id, true));
  };

  const reset = () => {
    timers.current.forEach(clearTimeout);
    pos.current = { ...INITIAL_POS };
    counter.current = 4;
    setShapes([...INITIAL]);
    setSelected({ a: "s1", b: null });
  };

  return (
    <div ref={root} className={s.sim}>
      <div className={s.toolbar}>
        <div className={s.tools} role="group" aria-label="Add a shape">
          <button className="mono" onClick={() => add("rect")}>
            <span className={s.iRect} aria-hidden="true" /> Rect
          </button>
          <button className="mono" onClick={() => add("ellipse")}>
            <span className={s.iEllipse} aria-hidden="true" /> Ellipse
          </button>
          <button className="mono" onClick={() => add("text")}>
            <span className={s.iText} aria-hidden="true">
              T
            </span>{" "}
            Text
          </button>
          <button className="mono" onClick={() => remove(selected.a ? "a" : "b")} disabled={!selected.a && !selected.b}>
            Delete
          </button>
        </div>
        <div className={s.tools} role="group" aria-label="Simulated network latency">
          <span className="mono">Latency</span>
          {LATENCIES.map((l) => (
            <button key={l} className="mono" aria-pressed={latency === l} onClick={() => setLatency(l)}>
              {l}ms
            </button>
          ))}
          <button className="mono" onClick={reset}>
            Reset
          </button>
        </div>
      </div>

      <div className={s.panes}>
        {PANES.map(({ id: p, label, peer }) => {
          const peerSel = selected[other(p)];
          return (
            <figure key={p} className={s.paneWrap}>
              <figcaption className={`mono ${s.paneHead}`}>
                <span>
                  <span className={s.swatch} data-who={p} aria-hidden="true" />
                  {label}
                </span>
                <span>{shapes.length} objects</span>
              </figcaption>
              <div className={s.pane} data-pane={p}>
                <span className={s.grid} aria-hidden="true" />
                {shapes.map((sh) => (
                  <div
                    key={sh.id}
                    data-shape={sh.id}
                    data-kind={sh.kind}
                    role="button"
                    tabIndex={0}
                    aria-label={`${sh.kind} — arrow keys to move, delete to remove`}
                    className={s.shape}
                    data-selected={selected[p] === sh.id}
                    data-peer-selected={peerSel === sh.id}
                    style={{ width: `${sh.w * 100}%`, height: `${sh.h * 100}%` }}
                    onFocus={() => setSelected((sel) => ({ ...sel, [p]: sh.id }))}
                    onKeyDown={(e) => nudge(p, sh.id, e)}
                  >
                    {sh.kind === "text" && <span className={s.textBody}>Heading</span>}
                    <span className={s.handles} aria-hidden="true">
                      <i />
                      <i />
                      <i />
                      <i />
                    </span>
                    <span className={`mono ${s.peerTag}`} data-who={other(p)} aria-hidden="true">
                      {peer}
                    </span>
                  </div>
                ))}
                <span className={s.cursor} data-cursor data-who={other(p)} aria-hidden="true">
                  <svg width="14" height="16" viewBox="0 0 14 16">
                    <path d="M1 1 L13 8.5 L7.2 9.6 L4.4 15 Z" />
                  </svg>
                  <span className="mono">{peer === "B" ? "Session B" : "Session A"}</span>
                </span>
              </div>
            </figure>
          );
        })}
      </div>
    </div>
  );
}
