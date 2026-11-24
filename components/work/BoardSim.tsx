"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { gsap, Draggable, Flip, isCoarsePointer, prefersReducedMotion } from "@/lib/gsap";
import s from "./BoardSim.module.css";

type Col = "synced" | "drafting" | "review" | "approved";
type Card = { id: string; num: number; title: string; area: "api" | "web"; col: Col; status?: string; version?: number; busy?: boolean };
type Log = { at: string; src: string; text: string; tone?: "err" | "ok" };

const COLUMNS: { id: Col; label: string }[] = [
  { id: "synced", label: "Synced from GitHub" },
  { id: "drafting", label: "Drafting plan" },
  { id: "review", label: "In review" },
  { id: "approved", label: "Approved" },
];

const INITIAL: Card[] = [
  { id: "c214", num: 214, title: "Rate-limit plan generation per workspace", area: "api", col: "synced" },
  { id: "c209", num: 209, title: "Show a reconnect banner when the board socket drops", area: "web", col: "synced" },
  { id: "c221", num: 221, title: "Paginate the activity feed on large boards", area: "web", col: "synced" },
  { id: "c205", num: 205, title: "Keyboard shortcuts for moving cards between columns", area: "web", col: "review", version: 1, status: "Plan v1 ready" },
  { id: "c198", num: 198, title: "Verify GitHub webhook signatures before syncing", area: "api", col: "approved", status: "Approved" },
];

export default function BoardSim() {
  const root = useRef<HTMLDivElement>(null);
  const [cards, setCards] = useState<Card[]>(INITIAL);
  const [logs, setLogs] = useState<Log[]>([{ at: "00.00", src: "sync", text: "5 issues synced from GitHub" }]);
  const [failNext, setFailNext] = useState(false);
  const failRef = useRef(false);
  failRef.current = failNext;

  const flipState = useRef<Flip.FlipState | null>(null);
  const timers = useRef<number[]>([]);
  const t0 = useRef<number | null>(null);

  const later = (ms: number, fn: () => void) => timers.current.push(window.setTimeout(fn, ms));
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const log = useCallback((src: string, text: string, tone?: Log["tone"]) => {
    if (t0.current === null) t0.current = performance.now();
    const secs = ((performance.now() - t0.current) / 1000).toFixed(2).padStart(5, "0");
    setLogs((l) => [...l.slice(-7), { at: secs, src, text, tone }]);
  }, []);

  // Capture layout before any column change so Flip can animate the remount.
  const update = useCallback((fn: (c: Card[]) => Card[]) => {
    if (root.current) flipState.current = Flip.getState(root.current.querySelectorAll("[data-flip-id]"));
    setCards(fn);
  }, []);

  useLayoutEffect(() => {
    const state = flipState.current;
    if (!state || !root.current) return;
    flipState.current = null;
    const targets = root.current.querySelectorAll<HTMLElement>("[data-flip-id]");
    gsap.set(targets, { x: 0, y: 0 });
    Flip.from(state, { targets, duration: prefersReducedMotion() ? 0 : 0.75, ease: "expo.out", nested: true, zIndex: 5 });
  }, [cards]);

  const patch = (id: string, p: Partial<Card>) => update((cs) => cs.map((c) => (c.id === id ? { ...c, ...p } : c)));

  const runJob = (card: Card, kind: "generate" | "revise") => {
    const v = (card.version ?? 0) + 1;
    log("queue", `plan.${kind} #${card.num} enqueued · attempt 1/3`);
    later(500, () => {
      setCards((cs) => cs.map((c) => (c.id === card.id ? { ...c, status: "Worker running", busy: true } : c)));
      log("worker", `retrieving context for #${card.num} · 40K-token budget`);
    });
    later(1500, () => log("worker", "TF-IDF + import graph + pgvector → RRF fused"));
    later(2700, () => log("worker", `plan v${v} drafted for #${card.num}`, "ok"));
    later(2900, () => {
      log("redis", "publish board:events → 2 instances");
      patch(card.id, { col: "review", status: `Plan v${v} ready`, version: v, busy: false });
    });
    later(3050, () => log("ws", `#${card.num} → In review (all open tabs)`));
  };

  const requestPlan = (id: string) => {
    const card = cards.find((c) => c.id === id);
    if (!card || card.col !== "synced") return;
    patch(id, { col: "drafting", status: "Saving…", busy: false });
    log("ui", `#${card.num} moved → Drafting (optimistic)`);

    if (failRef.current) {
      setFailNext(false);
      later(700, () => {
        log("api", `PATCH /cards/${card.num} → 503`, "err");
        patch(id, { col: "synced", status: undefined });
        log("ui", "optimistic move reverted", "err");
      });
      return;
    }
    later(350, () => {
      setCards((cs) => cs.map((c) => (c.id === id ? { ...c, status: "Queued" } : c)));
      runJob(card, "generate");
    });
  };

  const revise = (id: string) => {
    const card = cards.find((c) => c.id === id);
    if (!card) return;
    log("chat", `revision requested on #${card.num}`);
    patch(id, { col: "drafting", status: "Queued" });
    later(250, () => runJob(card, "revise"));
  };

  const approve = (id: string) => {
    const card = cards.find((c) => c.id === id);
    if (!card) return;
    patch(id, { col: "approved", status: "Approved" });
    log("ui", `plan v${card.version} for #${card.num} approved`, "ok");
  };

  const reset = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    t0.current = null;
    update(() => INITIAL);
    setLogs([{ at: "00.00", src: "sync", text: "5 issues synced from GitHub" }]);
  };

  // Drag: synced → drafting, review → approved. Fine pointers only; buttons cover the rest.
  // Managed by hand (not a reverting GSAP context) so rebuilding the Draggables
  // after a state change never reverts an in-flight Flip animation.
  const drags = useRef<Draggable[]>([]);
  const actions = useRef({ requestPlan, approve });
  actions.current = { requestPlan, approve };

  useLayoutEffect(() => {
    drags.current.forEach((d) => d.kill());
    drags.current = [];
    const el = root.current;
    if (!el || isCoarsePointer()) return;
    const colEl = (c: Col) => el.querySelector<HTMLElement>(`[data-col="${c}"]`)!;
    el.querySelectorAll<HTMLElement>("[data-drag]").forEach((node) => {
      const from = node.dataset.drag as Col;
      const to: Col = from === "synced" ? "drafting" : "approved";
      const [d] = Draggable.create(node, {
        type: "x,y",
        zIndexBoost: true,
        minimumMovement: 4,
        dragClickables: false,
        onPress() {
          colEl(to).dataset.target = "true";
        },
        onDrag() {
          colEl(to).dataset.hover = String(this.hitTest(colEl(to), "35%"));
        },
        onRelease() {
          delete colEl(to).dataset.target;
          delete colEl(to).dataset.hover;
          if (this.hitTest(colEl(to), "35%")) {
            const id = node.dataset.flipId!;
            if (from === "synced") actions.current.requestPlan(id);
            else actions.current.approve(id);
          } else {
            gsap.to(node, { x: 0, y: 0, duration: 0.6, ease: "expo.out" });
          }
        },
      });
      drags.current.push(d);
    });
  }, [cards]);

  useEffect(() => () => drags.current.forEach((d) => d.kill()), []);

  return (
    <div ref={root} className={s.sim}>
      <div className={s.toolbar}>
        <p className="mono">
          <span className={s.dot} aria-hidden="true" /> Simulation · runs in your browser · 30–80 s jobs compressed to ~3 s
        </p>
        <div className={s.controls}>
          <label className={`mono ${s.toggle}`}>
            <input type="checkbox" checked={failNext} onChange={(e) => setFailNext(e.target.checked)} />
            <span aria-hidden="true" className={s.switch} />
            Fail next move
          </label>
          <button className={`mono ${s.ghost}`} onClick={reset}>
            Reset board
          </button>
        </div>
      </div>

      <div className={s.board}>
        {COLUMNS.map((col) => {
          const list = cards.filter((c) => c.col === col.id);
          return (
            <section key={col.id} className={s.col} data-col={col.id} aria-label={col.label}>
              <h4 className={`mono ${s.colHead}`}>
                {col.label} <span>{String(list.length).padStart(2, "0")}</span>
              </h4>
              <ul className={s.list}>
                {list.map((c) => (
                  <li
                    key={c.id}
                    data-flip-id={c.id}
                    data-drag={c.col === "synced" || c.col === "review" ? c.col : undefined}
                    className={s.card}
                    data-state={c.col}
                  >
                    <p className={`mono ${s.cardMeta}`}>
                      <span>#{c.num}</span>
                      <span className={s.area}>{c.area}</span>
                    </p>
                    <p className={s.cardTitle}>{c.title}</p>
                    {c.status && (
                      <p className={`mono ${s.status}`}>
                        {c.busy && <span className={s.spinner} aria-hidden="true" />}
                        {c.status}
                      </p>
                    )}
                    {c.col === "drafting" && <span className={s.progress} data-busy={c.busy} aria-hidden="true" />}
                    {c.col === "synced" && (
                      <button className={`mono ${s.action}`} onClick={() => requestPlan(c.id)}>
                        Draft plan →
                      </button>
                    )}
                    {c.col === "review" && (
                      <div className={s.actions}>
                        <button className={`mono ${s.action}`} onClick={() => revise(c.id)}>
                          Revise
                        </button>
                        <button className={`mono ${s.action} ${s.primary}`} onClick={() => approve(c.id)}>
                          Approve →
                        </button>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>

      <ol className={s.log} aria-live="polite" aria-label="Event log">
        {logs.map((l, i) => (
          <li key={`${l.at}-${i}`} data-tone={l.tone}>
            <span className={s.at}>{l.at}s</span>
            <span className={s.src}>{l.src}</span>
            <span>{l.text}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
