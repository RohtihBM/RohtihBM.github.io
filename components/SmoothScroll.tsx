"use client";

import Lenis from "lenis";
import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { gsap, ScrollTrigger, prefersReducedMotion } from "@/lib/gsap";

type Ctx = { lenis: Lenis | null; scrollTo: (target: string | number) => void };

const LenisContext = createContext<Ctx>({ lenis: null, scrollTo: () => {} });
export const useLenis = () => useContext(LenisContext);

/**
 * Lenis is driven by GSAP's ticker (not its own rAF) so ScrollTrigger and the
 * smoothed scroll position are always computed in the same frame.
 * With reduced motion we skip Lenis entirely and fall back to native scrolling.
 */
export default function SmoothScroll({ children }: { children: ReactNode }) {
  const [lenis, setLenis] = useState<Lenis | null>(null);
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    if (prefersReducedMotion()) return;

    const instance = new Lenis({ duration: 1.15, easing: (t) => 1 - Math.pow(1 - t, 4), touchMultiplier: 1.4 });
    lenisRef.current = instance;
    setLenis(instance);

    instance.on("scroll", ScrollTrigger.update);
    const tick = (time: number) => instance.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(tick);
      instance.destroy();
      lenisRef.current = null;
      setLenis(null);
    };
  }, []);

  const scrollTo = (target: string | number) => {
    const reduce = prefersReducedMotion();
    if (lenisRef.current) {
      lenisRef.current.scrollTo(target, { offset: 0, duration: 1.6, easing: (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2) });
      return;
    }
    if (typeof target === "number") window.scrollTo({ top: target, behavior: reduce ? "auto" : "smooth" });
    else document.querySelector(target)?.scrollIntoView({ behavior: reduce ? "auto" : "smooth" });
  };

  return <LenisContext.Provider value={{ lenis, scrollTo }}>{children}</LenisContext.Provider>;
}
