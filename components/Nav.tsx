"use client";

import { useEffect, useRef, useState } from "react";
import { nav, person } from "@/lib/content";
import { gsap, ScrollTrigger, useGSAP, prefersReducedMotion } from "@/lib/gsap";
import { useLenis } from "./SmoothScroll";
import LocalTime from "./LocalTime";
import s from "./Nav.module.css";

export default function Nav() {
  const root = useRef<HTMLElement>(null);
  const overlay = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const { scrollTo, lenis } = useLenis();

  // Section tracking + reveal of the compact name mark once the hero name scrolls away.
  useGSAP(
    () => {
      const triggers = nav.map((item) =>
        ScrollTrigger.create({
          trigger: document.getElementById(item.id),
          start: "top 50%",
          end: "bottom 50%",
          onToggle: (self) => self.isActive && setActive(item.id),
          onLeaveBack: () => item.id === "work" && setActive(null),
        })
      );
      const mark = gsap.fromTo(
        `.${s.mark}`,
        { yPercent: 110 },
        {
          yPercent: 0,
          duration: 0.8,
          ease: "expo.out",
          paused: true,
        }
      );
      const markTrigger = ScrollTrigger.create({
        trigger: document.getElementById("hero-name"),
        start: "bottom top+=80",
        onEnter: () => mark.play(),
        onLeaveBack: () => mark.reverse(),
      });
      return () => {
        triggers.forEach((t) => t.kill());
        markTrigger.kill();
      };
    },
    { scope: root }
  );

  // Mobile overlay choreography.
  useEffect(() => {
    const el = overlay.current;
    if (!el) return;
    const links = el.querySelectorAll("[data-ov-link]");
    const reduce = prefersReducedMotion();
    if (open) {
      lenis?.stop();
      document.body.style.overflow = "hidden";
      gsap.set(el, { display: "flex" });
      gsap.fromTo(el, { clipPath: "inset(0 0 100% 0)" }, { clipPath: "inset(0 0 0% 0)", duration: reduce ? 0 : 0.9, ease: "expo.inOut" });
      gsap.fromTo(links, { yPercent: 110 }, { yPercent: 0, stagger: 0.06, delay: reduce ? 0 : 0.35, duration: reduce ? 0 : 1 });
      (el.querySelector("a") as HTMLElement | null)?.focus({ preventScroll: true });
    } else {
      lenis?.start();
      document.body.style.overflow = "";
      gsap.to(el, {
        clipPath: "inset(0 0 100% 0)",
        duration: reduce ? 0 : 0.7,
        ease: "expo.inOut",
        onComplete: () => {
          gsap.set(el, { display: "none" });
        },
      });
    }
  }, [open, lenis]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const go = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    setOpen(false);
    // Wait a beat for the overlay to start closing on mobile.
    window.setTimeout(() => scrollTo(`#${id}`), open ? 250 : 0);
    history.replaceState(null, "", `#${id}`);
  };

  return (
    <>
      <header ref={root} className={s.bar}>
        <a href="#top" className={s.markWrap} onClick={(e) => go(e, "top")} aria-label="Back to top">
          <span className={s.mark}>{person.name}</span>
        </a>

        <nav aria-label="Primary" className={s.links}>
          <ul>
            {nav.map((item) => (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  onClick={(e) => go(e, item.id)}
                  className={s.link}
                  aria-current={active === item.id ? "location" : undefined}
                >
                  <span className={s.idx}>{item.index}</span>
                  <span className="ulink">{item.label}</span>
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <p className={s.clock}>
          <span>BLR</span> <LocalTime /> <span>IST</span>
        </p>

        <button
          className={s.menuBtn}
          aria-expanded={open}
          aria-controls="nav-overlay"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? "Close" : "Index"}
        </button>
      </header>

      <div id="nav-overlay" ref={overlay} className={s.overlay} aria-hidden={!open} inert={!open}>
        <ul>
          {nav.map((item) => (
            <li key={item.id} className="mask">
              <a data-ov-link href={`#${item.id}`} onClick={(e) => go(e, item.id)}>
                <span className={s.ovIdx}>{item.index}</span>
                {item.label}
              </a>
            </li>
          ))}
        </ul>
        <div className={s.ovFoot}>
          <a href={`mailto:${person.email}`}>{person.email}</a>
          <span>
            BLR <LocalTime seconds={false} /> IST
          </span>
        </div>
      </div>
    </>
  );
}
