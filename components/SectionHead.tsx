import type { ReactNode } from "react";
import s from "./SectionHead.module.css";

type Props = {
  index: string;
  title: string;
  note?: ReactNode;
  id: string;
  tone?: "paper" | "night";
};

/** "§01 — Title" header. Title lines are masked and revealed by useReveal(). */
export default function SectionHead({ index, title, note, id, tone = "paper" }: Props) {
  return (
    <header className={`${s.head} ${tone === "night" ? s.night : ""}`} data-reveal-group>
      <p className={`mono ${s.index}`} data-fade>
        <span>§{index}</span>
        <span className={s.bar} />
      </p>
      <h2 id={id} className={s.title} data-drift>
        <span className="mask" data-reveal>
          <span>{title}</span>
        </span>
      </h2>
      {note && (
        <div className={s.note} data-fade>
          {note}
        </div>
      )}
    </header>
  );
}
