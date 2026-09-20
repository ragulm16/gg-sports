"use client";

import { useEffect, useState } from "react";

type RoadmapItem = {
  id?: string;
  year: number;
  title: string;
  description: string;
  position: number;
};

const fallbackRoadmap: RoadmapItem[] = [
  { year: 2024, title: "The beginning", description: "A simple belief: every player deserves a better starting point.", position: 0 },
  { year: 2025, title: "Build the base", description: "Academy coaching, player pathways and stronger daily habits.", position: 1 },
  { year: 2026, title: "The ecosystem", description: "Events, facilities and Gear Station join the player journey.", position: 2 },
  { year: 2027, title: "Grow the game", description: "More teams, more competitions and more opportunities to perform.", position: 3 },
  { year: 2028, title: "Next stage", description: "A wider cricket community built around progress and purpose.", position: 4 },
];

export default function Roadmap() {
  const [items, setItems] = useState(fallbackRoadmap);

  useEffect(() => {
    const apiBase = process.env.NEXT_PUBLIC_API_URL;
    if (!apiBase) return;
    fetch(`${apiBase}/api/v1/roadmap`)
      .then((response) => response.ok ? response.json() : Promise.reject(new Error("Roadmap request failed")))
      .then((result: { items: RoadmapItem[] }) => setItems(result.items))
      .catch(() => undefined);
  }, []);

  return (
    <section aria-label="GG Sports roadmap" className="relative z-10 -mt-10 px-4 sm:-mt-14 lg:px-10">
      <div className="mx-auto max-w-7xl overflow-hidden rounded-2xl border border-white/15 bg-[#111c36]/95 shadow-2xl shadow-black/40 backdrop-blur-xl">
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4 sm:px-7">
          <div><p className="text-[9px] font-bold uppercase tracking-[0.4em] text-[#38bdf8]">The GG Sports roadmap</p><h2 className="mt-2 text-xl font-black uppercase tracking-[-0.04em] sm:text-2xl">From first session to bigger stages.</h2></div>
          <span className="hidden text-[9px] font-bold uppercase tracking-[0.25em] text-[#94a3b8] sm:block">Our direction</span>
        </div>
        <div className="overflow-x-auto">
          <div className="flex min-w-[920px] divide-x divide-white/10">
            {items.map((item, index) => <article key={item.id ?? item.year} className={`relative min-h-[170px] flex-1 p-5 sm:p-7 ${item.year === 2026 ? "bg-[#ff6a00]/10" : ""}`}>
              {index < items.length - 1 && <span className="absolute right-[-7px] top-8 z-10 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[#ff6a00] text-[8px] text-[#020617]">→</span>}
              <p className={`text-3xl font-black tracking-[-0.07em] ${item.year === 2026 ? "text-[#ff6a00]" : "text-[#f8fafc]"}`}>{item.year}</p>
              <h3 className="mt-8 text-[11px] font-black uppercase tracking-[0.12em]">{item.title}</h3>
              <p className="mt-3 max-w-[180px] text-xs leading-5 text-[#94a3b8]">{item.description}</p>
            </article>)}
          </div>
        </div>
        <p className="border-t border-white/10 px-5 py-3 text-[9px] font-bold uppercase tracking-[0.2em] text-[#94a3b8] sm:hidden">Swipe to explore the roadmap →</p>
      </div>
    </section>
  );
}
