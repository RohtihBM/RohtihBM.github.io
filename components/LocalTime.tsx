"use client";

import { useEffect, useState } from "react";

const fmt = () =>
  new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(new Date());

/** Live Bengaluru time. Renders a stable placeholder on the server to avoid hydration mismatch. */
export default function LocalTime({ seconds = true }: { seconds?: boolean }) {
  const [time, setTime] = useState<string | null>(null);

  useEffect(() => {
    setTime(fmt());
    const id = window.setInterval(() => setTime(fmt()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const value = time ?? "--:--:--";
  return (
    <time suppressHydrationWarning aria-label="Local time in Bengaluru" style={{ fontVariantNumeric: "tabular-nums" }}>
      {seconds ? value : value.slice(0, 5)}
    </time>
  );
}
