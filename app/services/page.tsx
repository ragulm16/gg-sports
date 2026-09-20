import Image from "next/image";
import Link from "next/link";
import Chatbot from "@/components/chatbot/chatbot";

export const dynamic = "force-dynamic";

type Section = { title: string; eyebrow: string; description: string; meta?: string };

const fallbackServices: Section[] = [
  { title: "Academy coaching", eyebrow: "Build your game", description: "Age-wise programs from U11 to Seniors, combining technique, game IQ, fitness, reaction and performance tracking." },
  { title: "Tournament events", eyebrow: "Test your limits", description: "Corporate leagues, auction tournaments, open championship cups and complete event coordination." },
  { title: "Ground & net booking", eyebrow: "Own your session", description: "Flexible practice nets, cricket grounds, mobile net installations and pitch setups for teams and individuals." },
  { title: "Gear station", eyebrow: "Equip your ambition", description: "Quality bats, protection, training equipment, team jerseys, custom apparel and expert cricket guidance." },
  { title: "Bat care", eyebrow: "Maintain performance", description: "Professional knocking, threading, binding, toe guards, crack repairs and complete bat maintenance." },
  { title: "Corporate cricket", eyebrow: "Bring teams together", description: "A complete mobile sporting experience for company leagues, team days and custom cricket events." },
];

const fallbackEvents: Section[] = [
  { title: "GG Open Championship Cup", eyebrow: "Open registration", description: "Open registration tournament for developing and competitive players.", meta: "Tournament" },
];

const fallbackProducts: Section[] = [
  { title: "Custom team kits", eyebrow: "Full team look", description: "Custom apparel for teams, academies and corporate leagues.", meta: "Apparel" },
];

const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

function eyebrowOf(item: { metadata?: string | null }): string {
  try {
    const parsed = JSON.parse(item.metadata || "");
    return typeof parsed?.eyebrow === "string" ? parsed.eyebrow : "";
  } catch {
    return "";
  }
}

async function fetchSections(type: "SERVICE" | "EVENT" | "PRODUCT", fallback: Section[]): Promise<Section[]> {
  try {
    const response = await fetch(`${apiBase}/api/v1/content?type=${type}`, { cache: "no-store" });
    if (!response.ok) return fallback;
    const data = (await response.json()) as {
      items: Array<{ title: string; description: string; metadata: string | null; startsAt: string | null }>;
    };
    const items = data.items || [];
    if (items.length === 0) return fallback;
    return items.map((item) => ({
      title: item.title,
      eyebrow: eyebrowOf(item),
      description: item.description,
      meta: item.startsAt
        ? new Date(item.startsAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
        : "",
    }));
  } catch {
    return fallback;
  }
}

export const metadata = {
  title: "Services | GG Sports",
  description: "Cricket coaching, events, facilities, gear and bat care from GG Sports.",
};

export default async function ServicesPage() {
  const services = await fetchSections("SERVICE", fallbackServices);
  const events = await fetchSections("EVENT", fallbackEvents);
  const products = await fetchSections("PRODUCT", fallbackProducts);

  return (
    <main className="min-h-screen bg-[#f5f8f2] text-[#071a3a]">
      <header className="sticky top-0 z-50 border-b border-[#071a3a]/10 bg-[#f5f8f2]/90 px-5 py-4 backdrop-blur-xl lg:px-10">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <Link href="/" className="flex items-center gap-2"><Image src="/brand/gg-sports-logo.png" alt="GG Sports logo" width={44} height={44} className="h-10 w-10 object-contain" /><span className="text-xs font-black tracking-[0.18em]">GG SPORTS</span></Link>
          <nav className="hidden gap-7 text-[11px] font-bold md:flex"><Link href="/">Home</Link><Link href="/#about">About</Link><Link className="text-[#ec4899]" href="/services">Services</Link><Link href="/#contact">Contact</Link></nav>
          <Link href="/#contact" className="rounded-full bg-gradient-to-r from-[#38bdf8] to-[#ec4899] px-5 py-3 text-[10px] font-black uppercase tracking-[0.15em] text-white">Enquire now</Link>
        </div>
      </header>
      <section className="relative overflow-hidden px-6 py-24 lg:px-10 lg:py-32">
        <div className="absolute right-[-10%] top-[-25%] h-[500px] w-[500px] rounded-full bg-[#38bdf8]/20 blur-3xl" />
        <div className="relative mx-auto max-w-7xl"><p className="text-[10px] font-black uppercase tracking-[0.4em] text-[#ec4899]">GG Sports / What we do</p><h1 className="mt-6 max-w-5xl text-6xl font-black uppercase leading-[0.84] tracking-[-0.07em] sm:text-8xl">Everything<br />for the<br /><span className="text-[#ec4899]">next level.</span></h1><p className="mt-8 max-w-xl text-lg leading-7 text-[#071a3a]/65">One complete cricket ecosystem for players, parents, teams and corporate clients.</p></div>
      </section>
      <section className="bg-[#071a3a] px-6 py-20 text-[#f8fafc] lg:px-10 lg:py-28"><div className="mx-auto max-w-7xl"><div className="mb-12 flex items-end justify-between gap-5"><div><p className="text-[10px] font-bold uppercase tracking-[0.4em] text-[#38bdf8]">Our services</p><h2 className="mt-4 text-4xl font-black uppercase tracking-[-0.06em] lg:text-6xl">Play. Learn.<br /><span className="text-[#38bdf8]">Compete. Grow.</span></h2></div><p className="hidden max-w-xs text-sm leading-6 text-[#94a3b8] md:block">Choose a service and let the GG Sports team help you get started.</p></div><div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{services.map((service, index) => <article key={service.title} className="group min-h-[300px] rounded-2xl border border-white/10 bg-[#0b1120] p-7 transition duration-300 hover:-translate-y-2 hover:border-[#38bdf8]/70"><div className="flex justify-between text-xs font-black text-[#ff6a00]"><span>0{index + 1}</span><span className="text-[#38bdf8]">↗</span></div><div className="mt-20"><p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#38bdf8]">{service.eyebrow || "GG Sports"}</p><h3 className="mt-3 text-2xl font-black uppercase tracking-[-0.04em]">{service.title}</h3><p className="mt-4 text-sm leading-6 text-[#94a3b8]">{service.description}</p></div></article>)}</div></div></section>
      <section className="px-6 py-20 lg:px-10 lg:py-24"><div className="mx-auto max-w-7xl"><div className="mb-12 flex items-end justify-between gap-5"><div><p className="text-[10px] font-bold uppercase tracking-[0.4em] text-[#ec4899]">Tournaments & leagues</p><h2 className="mt-4 text-4xl font-black uppercase tracking-[-0.06em] lg:text-6xl">Upcoming<br /><span className="text-[#ec4899]">events.</span></h2></div><p className="hidden max-w-xs text-sm leading-6 text-[#071a3a]/60 md:block">New tournaments added from Mission Control appear here.</p></div><div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{events.map((event, index) => <article key={event.title} className="min-h-[220px] rounded-2xl border border-[#071a3a]/15 bg-white p-7 transition duration-300 hover:-translate-y-2 hover:border-[#ec4899]"><div className="flex justify-between text-xs font-black text-[#ec4899]"><span>0{index + 1}</span>{event.meta && <span className="uppercase tracking-[0.1em]">{event.meta}</span>}</div><div className="mt-12"><p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#ec4899]">{event.eyebrow || "GG Sports event"}</p><h3 className="mt-3 text-2xl font-black uppercase tracking-[-0.04em]">{event.title}</h3><p className="mt-4 text-sm leading-6 text-[#071a3a]/70">{event.description}</p></div></article>)}</div></div></section>
      <section className="bg-[#0b1120] px-6 py-20 text-[#f8fafc] lg:px-10 lg:py-24"><div className="mx-auto max-w-7xl"><div className="mb-12 flex items-end justify-between gap-5"><div><p className="text-[10px] font-bold uppercase tracking-[0.4em] text-[#38bdf8]">Gear station</p><h2 className="mt-4 text-4xl font-black uppercase tracking-[-0.06em] lg:text-6xl">Equip your<br /><span className="text-[#38bdf8]">ambition.</span></h2></div><p className="hidden max-w-xs text-sm leading-6 text-[#94a3b8] md:block">Products added from Mission Control appear here.</p></div><div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{products.map((product) => <article key={product.title} className="rounded-2xl border border-white/10 bg-[#0b1120]/60 p-6 transition duration-300 hover:-translate-y-2 hover:border-[#38bdf8]/70"><p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#38bdf8]">{product.eyebrow || "GG Sports gear"}</p><h3 className="mt-3 text-xl font-black uppercase tracking-[-0.04em]">{product.title}</h3><p className="mt-3 text-sm leading-6 text-[#94a3b8]">{product.description}</p></article>)}</div></div></section>
      <section className="px-6 py-24 lg:px-10 lg:py-32"><div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-8 rounded-3xl bg-[#ec4899] p-8 text-white md:flex-row md:items-end lg:p-14"><div><p className="text-[10px] font-black uppercase tracking-[0.35em]">Ready when you are</p><h2 className="mt-5 text-5xl font-black uppercase leading-[0.88] tracking-[-0.06em] lg:text-7xl">Your game<br />starts here.</h2></div><Link href="/#contact" className="rounded-full bg-white px-6 py-3.5 text-[10px] font-black uppercase tracking-[0.2em] text-[#071a3a]">Send an enquiry →</Link></div></section>
      <footer className="border-t border-[#071a3a]/10 px-6 py-8 lg:px-10"><div className="mx-auto flex max-w-7xl justify-between text-[10px] font-bold uppercase tracking-[0.18em] text-[#071a3a]/50"><span>© 2026 GG Sports</span><Link href="/">Back home</Link></div></footer>
      <Chatbot />
    </main>
  );
}