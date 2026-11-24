"use client";

import { useRef } from "react";
import { person } from "@/lib/content";
import { useReveal } from "@/lib/useReveal";
import { useLenis } from "./SmoothScroll";
import LocalTime from "./LocalTime";
import s from "./Contact.module.css";

export default function Contact() {
  const root = useRef<HTMLElement>(null);
  const { scrollTo } = useLenis();
  useReveal(root);

  return (
    <footer id="contact" ref={root} className={s.contact} aria-labelledby="contact-title">
      <div className="wrap">
        <p className={`mono ${s.index}`} data-fade>
          <span>§04</span>
          <span className={s.bar} />
          <span>Contact</span>
        </p>

        <h2 id="contact-title" className={s.title}>
          <a href={`mailto:${person.email}`} className={s.mail}>
            <span className="mask" data-reveal>
              <span>
                Write
                <span className={s.serif}> to </span>
                me
              </span>
            </span>
            <span className={s.fill} aria-hidden="true">
              Write<span className={s.serif}> to </span>me
            </span>
          </a>
        </h2>

        <div className={s.row} data-reveal-group>
          <a href={`mailto:${person.email}`} className={`ulink ${s.addr}`} data-fade>
            {person.email}
          </a>
          <ul className={s.links}>
            <li data-fade>
              <a href={person.links.linkedin} target="_blank" rel="noreferrer" className="mono">
                <span className="ulink">LinkedIn</span> ↗<span className="sr-only"> (opens in a new tab)</span>
              </a>
            </li>
            <li data-fade>
              <a href={person.links.leetcode} target="_blank" rel="noreferrer" className="mono">
                <span className="ulink">LeetCode</span> ↗<span className="sr-only"> (opens in a new tab)</span>
              </a>
            </li>
          </ul>
        </div>

        <div className={`mono ${s.base}`}>
          <p suppressHydrationWarning>© {new Date().getFullYear()} {person.name}</p>
          <p>
            {person.city} <LocalTime seconds={false} /> IST
          </p>
          <p className={s.colophon}>Set in Archivo, Newsreader &amp; JetBrains Mono. Built with Next.js, GSAP and Lenis.</p>
          <p className={s.top}>
            <a
              href="#top"
              className="ulink"
              onClick={(e) => {
                e.preventDefault();
                scrollTo(0);
              }}
            >
              Back to top ↑
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
