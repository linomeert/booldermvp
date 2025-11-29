import { useState, useEffect } from "react";

// Returns seconds since startedAt (ISO string)
export function useSessionTimer(startedAt?: string | Date, endedAt?: string | Date) {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    if (!startedAt || endedAt) return;
    const start = new Date(startedAt).getTime();
    const update = () => {
      setSeconds(Math.floor((Date.now() - start) / 1000));
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [startedAt, endedAt]);

  return seconds;
}

export function formatDuration(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}:${m.toString().padStart(2,"0")}:${s.toString().padStart(2,"0")}`;
  return `${m}:${s.toString().padStart(2,"0")}`;
}
