"use client";

import { useRef } from "react";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap";
import { useReveal } from "@/lib/useReveal";
import SectionHead from "../SectionHead";
import BoardSim from "./BoardSim";
import Pipeline from "./Pipeline";
import CanvasSim from "./CanvasSim";
import VoiceSim from "./VoiceSim";
import s from "./Work.module.css";

function Spec({ rows }: { rows: [string, React.ReactNode][] }) {
  return (
    <dl className={s.spec} data-fade>
      {rows.map(([k, v]) => (
        <div key={k}>
          <dt className="mono">{k}</dt>
          <dd>{v}</dd>
        </div>
      ))}
    </dl>
  );
}

function Ext({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noreferrer" className={`mono ${s.ext}`}>
      <span className="ulink">{children}</span>
      <span aria-hidden="true" className={s.arrow}>
        ↗
      </span>
      <span className="sr-only">(opens in a new tab)</span>
    </a>
  );
}

export default function Work() {
  const root = useRef<HTMLElement>(null);
  useReveal(root);

  // One horizontal drift for the section title — the only lateral motion on the page.
  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      gsap.fromTo(
        root.current!.querySelector("[data-drift]"),
        { xPercent: 9 },
        { xPercent: 0, ease: "none", scrollTrigger: { trigger: root.current, start: "top bottom", end: "top 20%", scrub: true } }
      );
    },
    { scope: root }
  );

  return (
    <section id="work" ref={root} className={s.work} aria-labelledby="work-title">
      <div className="wrap">
        <SectionHead
          id="work-title"
          index="01"
          title="Selected Work"
          tone="night"
          note={
            <>
              Three systems, each shown as a working miniature rather than a screenshot. Everything below runs in your browser — drag, click, break it.
            </>
          }
        />
      </div>

      {/* ---------------- 01 · AI project management ---------------- */}
      <article className={`${s.plate} ${s.p1}`} aria-labelledby="p1-title" data-reveal-group>
        <header className={`wrap ${s.plateHead}`}>
          <p className={`mono ${s.num}`} data-fade>
            1.0 — Personal project · Live
          </p>
          <h3 id="p1-title" className={s.t1}>
            <span className="mask" data-reveal>
              <span>AI-Powered Project</span>
            </span>
            <span className="mask" data-reveal>
              <span>Management Platform</span>
            </span>
          </h3>
          <p className={s.tag} data-fade>
            GitHub issues land on a live Kanban board. An LLM reads the repository and drafts an implementation plan. Teammates review it, chat to revise, and approve.
          </p>
          <div className={s.links} data-fade>
            <Ext href="https://trello-school-github-sync.vercel.app/">Live demo</Ext>
          </div>
        </header>

        <div className={`wrap ${s.p1Grid}`}>
          <aside className={s.p1Side}>
            <Spec
              rows={[
                ["Interface", "React, TypeScript (Vite), dnd-kit, React Flow + dagre, Radix UI, Tailwind CSS"],
                ["Server", "Node.js, BullMQ workers, Redis pub/sub, WebSockets"],
                ["Data", "PostgreSQL + pgvector (Neon), Redis (Upstash)"],
                ["Ship", "Docker Compose on AWS EC2 behind Caddy HTTPS, frontend on Vercel, GitHub Actions"],
              ]}
            />
          </aside>
          <div className={s.p1Main} data-fade>
            <p className={`mono ${s.figCap}`}>Fig. 1.1 — The board and its async backbone. Drag a ticket into “Drafting plan”.</p>
            <BoardSim />
          </div>
        </div>

        <div className={`wrap ${s.p1Notes}`}>
          <ul className={s.notes}>
            <li data-fade>
              <span className="mono">Async</span>
              LLM jobs take 30–80 s, so they never sit on the request path. BullMQ workers run them with bounded retries — 3 attempts, exponential backoff.
            </li>
            <li data-fade>
              <span className="mono">Realtime</span>
              Redis pub/sub fans updates out over WebSockets to every open tab across 2 server instances. Clients auto-reconnect with backoff and resync the board.
            </li>
            <li data-fade>
              <span className="mono">Optimistic</span>
              Card moves apply instantly and revert on failure. Flip “Fail next move” above to see the revert.
            </li>
            <li data-fade>
              <span className="mono">Incremental</span>
              The embedding model runs on EC2 for the memory it needs. A GitHub Actions job re-embeds only the code chunks that changed.
            </li>
          </ul>
        </div>

        <div className={`wrap ${s.p1Pipe}`} data-fade>
          <Pipeline />
        </div>

        <div className={`wrap ${s.figures}`}>
          <div data-fade>
            <p className={s.big}>
              <span className={s.was}>$0.25</span> → $0.065
            </p>
            <p className="mono">Cost per plan · ~74% lower</p>
          </div>
          <div data-fade>
            <p className={s.big}>
              <span className={s.was}>23–25</span> → 1
            </p>
            <p className="mono">Agent turns per plan · small samples</p>
          </div>
          <p className={s.figNote} data-fade>
            Both came from replacing open-ended agent exploration with bounded retrieval: the model gets the right 40K tokens up front instead of searching for them.
          </p>
        </div>
      </article>

      {/* ---------------- 02 · WebDes ---------------- */}
      <article className={`${s.plate} ${s.p2}`} aria-labelledby="p2-title" data-reveal-group>
        <div className={`wrap ${s.p2Grid}`}>
          <div className={s.p2Text}>
            <p className={`mono ${s.num}`} data-fade>
              2.0 — Personal project
            </p>
            <h3 id="p2-title" className={s.t2}>
              <span className="mask" data-reveal>
                <span>WebDes</span>
              </span>
            </h3>
            <p className={s.tag} data-fade>
              A collaborative design editor in the spirit of Figma. A Fabric.js canvas inside a responsive React / Next.js interface, with every edit synced to everyone in the room through Liveblocks.
            </p>
            <Spec
              rows={[
                ["Stack", "React, Next.js, Tailwind CSS, Fabric.js, Liveblocks"],
                ["Canvas", "Create, select, modify and manage elements — synced to all collaborators"],
                ["Realtime", "Canvas updates and user interactions shared live across a session"],
              ]}
            />
            <div className={s.links} data-fade>
              <Ext href="https://www.youtube.com/watch?v=HqseBHjf04s">Watch demo</Ext>
            </div>
          </div>
          <div className={s.p2Visual} data-fade>
            <p className={`mono ${s.figCap}`}>Fig. 2.1 — Two sessions, one room. Move a shape on either side and raise the latency to watch it travel.</p>
            <CanvasSim />
          </div>
        </div>
      </article>

      {/* ---------------- 03 · Telenok ---------------- */}
      <article className={`${s.plate} ${s.p3}`} aria-labelledby="p3-title" data-reveal-group>
        <div className={`wrap ${s.p3Grid}`}>
          <div className={s.p3Head}>
            <p className={`mono ${s.num}`} data-fade>
              3.0 — Professional work · Flatworld AI
            </p>
            <h3 id="p3-title" className={s.t3}>
              <span className="mask" data-reveal>
                <span>Telenok</span>
              </span>
            </h3>
            <p className={s.tag} data-fade>
              An AI customer-support platform — chat, voice, email, CRM and a knowledge base across 8 services in TypeScript and Python. I work on the chat and voice widget.
            </p>
          </div>

          <div className={s.p3Visual} data-fade>
            <p className={`mono ${s.figCap}`}>Fig. 3.0 — The voice widget’s state machine, before and after the fix.</p>
            <VoiceSim />
          </div>

          <ol className={s.p3List}>
            <li data-fade>
              <p className={s.mid}>
                <span className={s.was}>13</span> → 0
              </p>
              <p>
                Widget warnings after fixing the state bug that left the UI stuck in “speaking”. I also added a save-time check that rejects voice languages the speech model doesn’t support.
              </p>
            </li>
            <li data-fade>
              <p className={s.mid}>~25K</p>
              <p>
                Lines in Demo Links, which I led end to end. Sales share time-limited public demo pages with “Call me” voice calls. Built to a WCAG 2.2 AA target with 44 px touch targets, inside the widget’s bundle-size budget. Rate limits, hashed link codes and tenant-isolated row-level security protect it.
              </p>
            </li>
            <li data-fade>
              <p className={s.mid}>
                <span className={s.was}>46%</span> → ~13%
              </p>
              <p>Voice turns missing the knowledge-base search deadline — projected from 14 days of UAT telemetry.</p>
            </li>
            <li data-fade>
              <p className={s.mid}>90.9%</p>
              <p>Agreement between the new AI ticket pipeline and the legacy system, against a 90% release gate.</p>
            </li>
          </ol>
        </div>
      </article>
    </section>
  );
}
