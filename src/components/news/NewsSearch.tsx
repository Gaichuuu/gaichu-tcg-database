import { useEffect, useState } from "react";
import { useQueryParam } from "@/hooks/useQueryParam";

export function NewsSearch({ count }: { count?: number | null }) {
  const [q, setQ] = useQueryParam("q", "");
  const [local, setLocal] = useState(q);

  useEffect(() => {
    const t = setTimeout(() => setQ(local), 300);
    return () => clearTimeout(t);
  }, [local, setQ]);

  useEffect(() => {
    setLocal(q);
  }, [q]);

  return (
    <div className="bg-insetBg border-tileBorder has-focus-visible:border-hoverBorder flex flex-1 items-center gap-2.5 border-2 px-3 py-1.75 shadow-[inset_2px_2px_0_rgba(0,0,0,0.7)]">
      <span
        className="text-accentGreen font-display font-bold select-none"
        aria-hidden
      >
        /
      </span>
      <input
        value={local}
        onChange={(e) => setLocal(e.target.value)}
        placeholder="filter posts…"
        aria-label="Filter posts"
        className="text-accentGreen placeholder:text-accentGreen/45 font-display h-5.5 min-w-0 flex-1 bg-transparent text-[15px] leading-5.5 outline-none"
      />
      {count != null && (
        <span className="text-secondaryText font-display text-[11px] whitespace-nowrap">
          {count} post{count === 1 ? "" : "s"}
        </span>
      )}
    </div>
  );
}
