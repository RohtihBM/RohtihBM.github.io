"use client";

import { useRef } from "react";
import { gsap, ScrollTrigger, useGSAP, prefersReducedMotion } from "@/lib/gsap";
import s from "./Pipeline.module.css";

const STAGES = [
  { k: "Repo", v: "Code chunking" },
  { k: "Lexical", v: "TF-IDF" },
  { k: "Structure", v: "Import-graph expansion" },
  { k: "Semantic", v: "pgvector embeddings" },
  { k: "Fuse", v: "Reciprocal rank fusion" },
  { k: "Bound", v: "40K-token budget" },
  { k: "Draft", v: "LLM plan, rate-limited" },
];

/** Bounded retrieval, drawn as the reader scrolls past it. */
export default function Pipeline() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = root.current!;
      const nodes = el.querySelectorAll<HTMLElement>(`.${s.stage}`);
      if (prefersReducedMotion()) {
        nodes.forEach((n) => (n.dataset.on = "true"));
        gsap.set(el.querySelector(`.${s.progress}`), { scale: 1 });
        return;
      }
      const vertical = () => window.matchMedia("(max-width: 900px)").matches;
      const bar = el.querySelector(`.${s.progress}`);
      ScrollTrigger.create({
        trigger: el,
        start: "top 78%",
        end: () => (vertical() ? "bottom 55%" : "top 25%"),
        scrub: true,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          const p = self.progress;
          gsap.set(bar, vertical() ? { scaleY: p, scaleX: 1 } : { scaleX: p, scaleY: 1 });
          nodes.forEach((n, i) => (n.dataset.on = String(p >= i / (nodes.length - 1) - 0.001)));
        },
      });
    },
    { scope: root }
  );

  return (
    <div ref={root} className={s.wrap}>
      <p className={`mono ${s.caption}`}>Fig. 1.2 — Bounded retrieval, from repository to plan</p>
      <div className={s.track}>
        <span className={s.rail} aria-hidden="true" />
        <span className={s.progress} aria-hidden="true" />
        <ol className={s.stages}>
          {STAGES.map((st, i) => (
            <li key={st.k} className={s.stage}>
              <span className={s.node} aria-hidden="true" />
              <span className={`mono ${s.k}`}>
                {String(i + 1).padStart(2, "0")} {st.k}
              </span>
              <span className={s.v}>{st.v}</span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
