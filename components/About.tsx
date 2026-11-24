"use client";

import { useRef } from "react";
import { stack } from "@/lib/content";
import { useReveal } from "@/lib/useReveal";
import SectionHead from "./SectionHead";
import s from "./About.module.css";

export default function About() {
  const root = useRef<HTMLElement>(null);
  useReveal(root);

  return (
    <section id="about" ref={root} className={`wrap ${s.about}`} aria-labelledby="about-title">
      <SectionHead id="about-title" index="03" title="About" />

      <div className={s.grid}>
        <div className={s.copy} data-reveal-group>
          <p className={s.lead} data-fade>
            I’m Rohith, a software developer in Bengaluru. The part of the job I like most is where the interface and the system behind it have to agree.
          </p>
          <div className={s.body}>
            <p data-fade>
              I studied Information Science at S J B Institute of Technology and graduated in 2025. Since then I’ve been at Flatworld AI. I started as an intern on Angular and .NET, and now work on the widget customers actually talk to. It has to feel instant even with a speech model, a knowledge base and eight services sitting behind it.
            </p>
            <p data-fade>
              On my own time I build the systems I want to understand properly: a Kanban board that drafts its own implementation plans, and a design editor where several people edit one canvas at once. Along the way I’ve solved 400+ data-structures and algorithms problems.
            </p>
          </div>
        </div>

        <aside className={s.stack} aria-label="Tools I work with" data-reveal-group>
          <p className={`mono ${s.stackHead}`} data-fade>
            Working set
          </p>
          <dl>
            {stack.map((g) => (
              <div key={g.label} data-fade>
                <dt className="mono">{g.label}</dt>
                <dd>{g.items.join(", ")}</dd>
              </div>
            ))}
          </dl>
        </aside>
      </div>
    </section>
  );
}
