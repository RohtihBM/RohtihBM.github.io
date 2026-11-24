# Rohith B M — Portfolio

Next.js (App Router) · TypeScript · GSAP + ScrollTrigger + Draggable + Flip · Lenis. No Tailwind: the design runs on CSS custom properties + CSS modules.

```bash
npm install
npm run dev      # http://localhost:3000
npm run build && npm start
```

## Where things live

| Path | What |
|---|---|
| `lib/content.ts` | Every word on the site that comes from the resume. Edit copy here. |
| `lib/gsap.ts` | Plugin registration + motion helpers (reduced-motion, coarse pointer). |
| `lib/useReveal.ts` | The one scroll-reveal system: `[data-reveal]` masked lines, `[data-fade]` blocks, grouped by `[data-reveal-group]`. |
| `components/SmoothScroll.tsx` | Lenis driven by GSAP's ticker so ScrollTrigger and smooth scroll share a frame. Off under reduced motion. |
| `components/Hero.tsx` | Variable-font field (Archivo `wght` + `wdth`) and the live dimension line. |
| `components/work/*` | Plates: `BoardSim` (Kanban + queue lifecycle), `Pipeline` (retrieval, scroll-drawn), `CanvasSim` (two synced sessions), `VoiceSim` (state machine + latency range). |

## Design system

- **Type:** Archivo variable (display, both axes), Newsreader italic (editorial voice), JetBrains Mono (annotations).
- **Colour:** paper `#ECE9E2`, ink `#121211`, one signal vermilion (`#D93A12` on paper, `#FF5A2E` on ink).
- **Grid:** 12 columns, fluid gutter `clamp(16px, 2.6vw, 44px)`.
- **Motion:** expo easing throughout; masked line reveals; one horizontal drift (Work title); one scrubbed drawing (pipeline); About is deliberately still.

All simulations are labelled as simulations and use only numbers stated in the resume.
