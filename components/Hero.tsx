"use client";

import { useRef } from "react";
import { person } from "@/lib/content";
import { gsap, ScrollTrigger, useGSAP, prefersReducedMotion, isCoarsePointer } from "@/lib/gsap";
import { useLenis } from "./SmoothScroll";
import s from "./Hero.module.css";

// Axis ranges for the variable-type field.
const W_REST = 280;
const W_PEAK = 860;
const D_REST = 88;
const D_PEAK = 125;

type Glyph = { el: HTMLSpanElement; cx: number; cy: number; w: number; d: number };

function Word({ text, line }: { text: string; line: number }) {
  return (
    <span className={s.line} data-line={line} aria-hidden="true">
      {text.split("").map((c, i) => (
        <span key={i} className={s.char} data-char={c === " " ? "space" : c}>
          {c === " " ? " " : c}
        </span>
      ))}
    </span>
  );
}

export default function Hero() {
  const root = useRef<HTMLElement>(null);
  const readout = useRef<HTMLSpanElement>(null);
  const measure = useRef<HTMLSpanElement>(null);
  const { scrollTo } = useLenis();

  useGSAP(
    () => {
      const el = root.current!;
      const reduce = prefersReducedMotion();
      const chars = gsap.utils.toArray<HTMLSpanElement>(`.${s.char}`, el).filter((c) => c.dataset.char !== "space");
      const nameLine = el.querySelector<HTMLElement>(`[data-line="0"]`)!;

      // ---------- live width measurement of the first line ----------
      let lastMeasure = 0;
      const writeMeasure = (now: number) => {
        if (now - lastMeasure < 90 || !measure.current) return;
        lastMeasure = now;
        measure.current.textContent = `${Math.round(nameLine.getBoundingClientRect().width)} px`;
      };

      // ---------- entrance choreography ----------
      const tl = gsap.timeline({ defaults: { ease: "expo.out" } });
      if (reduce) {
        gsap.set(chars, { fontVariationSettings: `"wght" 380, "wdth" 100` });
        gsap.set(el.querySelectorAll("[data-hero]"), { clearProps: "all" });
        writeMeasure(1e9);
        return;
      }

      // Normalise the CSS pre-states into GSAP's own transform model.
      gsap.set([...el.querySelectorAll(`.${s.char}`), ...el.querySelectorAll("[data-hero='lede'] > span > span")], { y: 0, yPercent: 110 });
      gsap.set(el.querySelectorAll("[data-hero='fade']"), { y: 10, opacity: 0 });

      tl.fromTo(el.querySelectorAll("[data-rule]"), { scaleX: 0 }, { scaleX: 1, duration: 1.6, ease: "expo.inOut", stagger: 0.08 }, 0)
        .to(el.querySelectorAll(`[data-line="0"] .${s.char}`), { yPercent: 0, duration: 1.5, stagger: 0.055 }, 0.25)
        .to(el.querySelectorAll(`[data-line="1"] .${s.char}`), { yPercent: 0, duration: 1.5, stagger: 0.07 }, 0.55)
        .to(el.querySelectorAll("[data-hero='lede'] > span > span"), { yPercent: 0, duration: 1.3, stagger: 0.08 }, 0.8)
        .to(el.querySelectorAll("[data-hero='fade']"), { opacity: 1, y: 0, duration: 1.2, stagger: 0.06 }, 1.0);

      // ---------- variable type field ----------
      const glyphs: Glyph[] = chars.map((c) => ({ el: c, cx: 0, cy: 0, w: 160, d: D_REST }));
      const measureGlyphs = () => {
        // measure at rest so the field doesn't chase its own reflow
        glyphs.forEach((g) => (g.el.style.fontVariationSettings = `"wght" ${W_REST}, "wdth" ${D_REST}`));
        glyphs.forEach((g) => {
          const r = g.el.getBoundingClientRect();
          g.cx = r.left + r.width / 2;
          g.cy = r.top + r.height / 2 + window.scrollY;
        });
      };

      const pointer = { x: -9999, y: -9999, active: false, last: 0 };
      const coarse = isCoarsePointer();
      const onMove = (e: PointerEvent) => {
        if (e.pointerType !== "mouse") return;
        pointer.x = e.clientX;
        pointer.y = e.clientY + window.scrollY;
        pointer.active = true;
        pointer.last = performance.now();
      };
      const onLeave = () => (pointer.active = false);

      let running = true;
      let t0 = performance.now();
      const radius = () => Math.max(160, window.innerWidth * 0.16);

      const tick = () => {
        if (!running) return;
        const now = performance.now();
        if (now - pointer.last > 2600) pointer.active = false;
        const r = radius();
        let best: Glyph | null = null;
        let bestInf = -1;

        glyphs.forEach((g, i) => {
          let inf: number;
          if (pointer.active && !coarse) {
            const dx = (pointer.x - g.cx) / r;
            const dy = (pointer.y - g.cy) / (r * 1.6);
            inf = Math.exp(-(dx * dx + dy * dy));
          } else {
            // idle / touch: a slow travelling wave across the name
            const t = (now - t0) / 1000;
            inf = Math.pow((Math.sin(t * 0.9 - i * 0.55) + 1) / 2, 3) * 0.75;
          }
          const tw = W_REST + (W_PEAK - W_REST) * inf;
          const td = D_REST + (D_PEAK - D_REST) * inf;
          g.w += (tw - g.w) * 0.12;
          g.d += (td - g.d) * 0.12;
          g.el.style.fontVariationSettings = `"wght" ${g.w.toFixed(1)}, "wdth" ${g.d.toFixed(1)}`;
          if (inf > bestInf) {
            bestInf = inf;
            best = g;
          }
        });

        if (best && readout.current) {
          const b = best as Glyph;
          readout.current.textContent = `${b.el.dataset.char} — wght ${Math.round(b.w)} · wdth ${Math.round(b.d)}`;
        }
        writeMeasure(now);
      };

      // Glyph weight eases in from hairline as the letters land.
      const start = () => {
        measureGlyphs();
        t0 = performance.now();
        gsap.ticker.add(tick);
      };
      gsap.set(chars, { fontVariationSettings: `"wght" 100, "wdth" ${D_REST}` });
      tl.call(start, [], 1.1);

      const onResize = () => measureGlyphs();
      window.addEventListener("pointermove", onMove, { passive: true });
      document.documentElement.addEventListener("pointerleave", onLeave);
      window.addEventListener("resize", onResize);
      document.fonts?.ready.then(() => {
        measureGlyphs();
        ScrollTrigger.refresh();
      });

      // Only run the field while the hero is on screen.
      const vis = ScrollTrigger.create({
        trigger: el,
        start: "top bottom",
        end: "bottom top",
        onToggle: (self) => {
          running = self.isActive;
          if (running) gsap.ticker.add(tick);
          else gsap.ticker.remove(tick);
        },
      });

      // Restrained exit: the name drifts up slightly slower than the page.
      gsap.to(el.querySelector(`.${s.name}`), {
        yPercent: -14,
        ease: "none",
        scrollTrigger: { trigger: el, start: "top top", end: "bottom top", scrub: true },
      });

      return () => {
        gsap.ticker.remove(tick);
        vis.kill();
        window.removeEventListener("pointermove", onMove);
        document.documentElement.removeEventListener("pointerleave", onLeave);
        window.removeEventListener("resize", onResize);
      };
    },
    { scope: root }
  );

  return (
    <section id="top" ref={root} className={s.hero} aria-labelledby="hero-name">
      <div className={s.topMeta}>
        <p className="mono" data-hero="fade">
          <span className={s.k}>Index</span> Portfolio, selected work 2024 — 2026
        </p>
        <p className={`mono ${s.topRight}`} data-hero="fade">
          <span className={s.k}>Discipline</span> Full-stack, frontend first
        </p>
      </div>

      <div className={s.name}>
        <h1 id="hero-name" className={s.h1} aria-label={person.name}>
          <span className={s.first}>
            <span className={s.dimension} aria-hidden="true">
              <span className={s.dimRule} data-rule />
              <span className={`mono ${s.dimLabel}`} data-hero="fade">
                <span ref={measure}>— px</span>
              </span>
            </span>
            <Word text={person.first} line={0} />
          </span>
          <Word text={person.initials} line={1} />
        </h1>
        <p className={s.lede} data-hero="lede">
          <span className="mask">
            <span>I build the interface,</span>
          </span>
          <span className="mask">
            <span>the queue behind it, and</span>
          </span>
          <span className="mask">
            <span>the query behind that.</span>
          </span>
        </p>
      </div>

      <p className={`mono ${s.fig}`} data-hero="fade" aria-hidden="true">
        <span className={s.k}>Fig. 0</span> Archivo variable — <span ref={readout}>R — wght 280 · wdth 88</span>
      </p>

      <span className={s.rule} data-rule aria-hidden="true" />

      <dl className={s.meta}>
        <div data-hero="fade">
          <dt className="mono">Currently</dt>
          <dd>
            {person.role}, {person.company}
          </dd>
        </div>
        <div data-hero="fade">
          <dt className="mono">Based in</dt>
          <dd>
            {person.city}, {person.region} <span className={`mono ${s.coord}`}>{person.coords}</span>
          </dd>
        </div>
        <div data-hero="fade">
          <dt className="mono">Building</dt>
          <dd>Realtime interfaces, async backends, AI tooling</dd>
        </div>
        <div data-hero="fade" className={s.cue}>
          <dt className="mono">Next</dt>
          <dd>
            <a
              href="#work"
              className="ulink"
              onClick={(e) => {
                e.preventDefault();
                scrollTo("#work");
              }}
            >
              Selected work <span aria-hidden="true">↓</span>
            </a>
          </dd>
        </div>
      </dl>
    </section>
  );
}
