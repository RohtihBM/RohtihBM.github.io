"use client";

import { useRef, useState } from "react";
import { experience, education } from "@/lib/content";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap";
import { useReveal } from "@/lib/useReveal";
import SectionHead from "./SectionHead";
import s from "./Experience.module.css";

// Ruler spans Feb 2025 → Nov 2026 (22 months, inclusive).
const RULER_START = { y: 2025, m: 2 };
const RULER_MONTHS = 22;
const monthIndex = (y: number, m: number) => (y - RULER_START.y) * 12 + (m - RULER_START.m);
const SPANS = [
  { from: monthIndex(2025, 8), to: RULER_MONTHS }, // Associate — present
  { from: monthIndex(2025, 2), to: monthIndex(2025, 7) + 1 }, // Intern
];

export default function Experience() {
  const root = useRef<HTMLElement>(null);
  const [open, setOpen] = useState<number | null>(0);
  const [hover, setHover] = useState<number | null>(null);
  useReveal(root);

  // Height choreography for the expanding rows.
  useGSAP(
    () => {
      const reduce = prefersReducedMotion();
      root.current!.querySelectorAll<HTMLElement>("[data-panel]").forEach((panel, i) => {
        const isOpen = open === i;
        gsap.to(panel, { height: isOpen ? "auto" : 0, duration: reduce ? 0 : isOpen ? 0.9 : 0.6, ease: "expo.inOut", overwrite: true });
        gsap.to(panel.querySelectorAll("[data-item]"), {
          opacity: isOpen ? 1 : 0,
          y: isOpen ? 0 : 8,
          duration: reduce ? 0 : 0.6,
          stagger: isOpen ? 0.035 : 0,
          delay: isOpen && !reduce ? 0.25 : 0,
          overwrite: true,
        });
      });
    },
    { scope: root, dependencies: [open] }
  );

  const lit = hover ?? open;

  return (
    <section id="experience" ref={root} className={`wrap ${s.exp}`} aria-labelledby="exp-title">
      <SectionHead
        id="exp-title"
        index="02"
        title="Experience"
        note={<>Both roles at Flatworld AI, Bengaluru — from intern to running features end to end.</>}
      />

      {/* Month ruler */}
      <div className={s.ruler} aria-hidden="true" data-fade>
        <div className={s.ticks}>
          {Array.from({ length: RULER_MONTHS }, (_, i) => {
            const m = ((RULER_START.m - 1 + i) % 12) + 1;
            const y = RULER_START.y + Math.floor((RULER_START.m - 1 + i) / 12);
            return (
              <span key={i} data-year={m === 1 || i === 0 ? y : undefined} className={m === 1 ? s.jan : undefined}>
                <i />
              </span>
            );
          })}
        </div>
        {SPANS.map((sp, i) => (
          <span
            key={i}
            className={s.span}
            data-lit={lit === i}
            style={{ left: `${(sp.from / RULER_MONTHS) * 100}%`, width: `${((sp.to - sp.from) / RULER_MONTHS) * 100}%` }}
          />
        ))}
        <span className={`mono ${s.now}`}>Now</span>
      </div>

      <ol className={s.ledger}>
        {experience.map((job, i) => {
          const isOpen = open === i;
          return (
            <li key={job.role} className={s.row} data-open={isOpen} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)} data-fade>
              <h3 className={s.rowHead}>
                <button
                  className={s.trigger}
                  aria-expanded={isOpen}
                  aria-controls={`exp-panel-${i}`}
                  id={`exp-trigger-${i}`}
                  onClick={() => setOpen(isOpen ? null : i)}
                >
                  <span className={`mono ${s.when}`}>
                    {job.start} — {job.end}
                  </span>
                  <span className={s.role}>{job.role}</span>
                  <span className={s.org}>{job.org}</span>
                  <span className={s.summary}>{job.summary}</span>
                  <span className={s.plus} aria-hidden="true" />
                </button>
              </h3>
              <div id={`exp-panel-${i}`} role="region" aria-labelledby={`exp-trigger-${i}`} className={s.panel} data-panel>
                <div className={s.panelInner}>
                  {job.groups.map((g) => (
                    <div key={g.label} className={s.group}>
                      <div className={s.groupHead} data-item>
                        <p className={s.groupLabel}>{g.label}</p>
                        {g.context && <p className={`mono ${s.context}`}>{g.context}</p>}
                      </div>
                      <ul className={s.points}>
                        {g.points.map((p, j) => (
                          <li key={j} data-item>
                            <span className="mono">{String(j + 1).padStart(2, "0")}</span>
                            {p}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </li>
          );
        })}
      </ol>

      <div className={s.edu} data-reveal-group>
        <p className={`mono ${s.eduHead}`} data-fade>
          Education
        </p>
        <ul>
          {education.map((e) => (
            <li key={e.school} data-fade>
              <span className="mono">{e.years}</span>
              <span className={s.school}>{e.school}</span>
              <span>{e.detail}</span>
              <span className={s.place}>{e.place}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
