"use client";

import type { RefObject } from "react";
import { gsap, ScrollTrigger, useGSAP, prefersReducedMotion } from "./gsap";

/**
 * Wires every [data-reveal] (masked lines) and [data-fade] inside `scope`
 * to a one-shot ScrollTrigger. Elements are grouped by their nearest
 * [data-reveal-group] so lines in the same block stagger together.
 */
export function useReveal(scope: RefObject<HTMLElement | null>) {
  useGSAP(
    () => {
      const root = scope.current;
      if (!root) return;
      const lines = gsap.utils.toArray<HTMLElement>("[data-reveal] > span", root);
      const fades = gsap.utils.toArray<HTMLElement>("[data-fade]", root);

      if (prefersReducedMotion()) {
        gsap.set([...lines, ...fades], { clearProps: "all", opacity: 1 });
        return;
      }

      gsap.set(lines, { y: 0, yPercent: 110 });
      gsap.set(fades, { opacity: 0, y: 14 });

      const groups = new Map<Element, { lines: HTMLElement[]; fades: HTMLElement[] }>();
      const groupOf = (el: HTMLElement) => el.closest("[data-reveal-group]") ?? el.parentElement!;
      lines.forEach((l) => {
        const g = groupOf(l);
        if (!groups.has(g)) groups.set(g, { lines: [], fades: [] });
        groups.get(g)!.lines.push(l);
      });
      fades.forEach((f) => {
        const g = groupOf(f);
        if (!groups.has(g)) groups.set(g, { lines: [], fades: [] });
        groups.get(g)!.fades.push(f);
      });

      groups.forEach((g, trigger) => {
        const tl = gsap.timeline({
          paused: true,
          defaults: { ease: "expo.out" },
        });
        if (g.lines.length) tl.to(g.lines, { yPercent: 0, duration: 1.4, stagger: 0.09 }, 0);
        if (g.fades.length) tl.to(g.fades, { opacity: 1, y: 0, duration: 1.2, stagger: 0.07 }, g.lines.length ? 0.25 : 0);
        ScrollTrigger.create({ trigger, start: "top 86%", once: true, onEnter: () => tl.play() });
      });
    },
    { scope }
  );
}
