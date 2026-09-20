import Image from "next/image";
import Link from "next/link";
import Chatbot from "@/components/chatbot/chatbot";
import ContactForm from "@/components/contact/contact-form";

export const dynamic = "force-dynamic";

type HomeSection = {
  title: string;
  eyebrow: string;
  description: string;
  imageUrl: string | null;
};

const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

const fallbackSections: HomeSection[] = [
  {
    title: "Academy",
    eyebrow: "Build the player",
    description: "Structured training that builds technique, discipline and confidence — from first practice to the biggest stage.",
    imageUrl: null,
  },
  {
    title: "Events",
    eyebrow: "Test the player",
    description: "Competition creates the experience that training alone cannot — tournaments, leagues, auction cups and corporate days.",
    imageUrl: null,
  },
  {
    title: "Gear Station",
    eyebrow: "Equip the player",
    description: "Everything a player needs to prepare, perform and maintain their game — bats, protection, custom kits and bat care.",
    imageUrl: null,
  },
];

function eyebrowOf(metadata: string | null | undefined): string {
  try {
    const parsed = JSON.parse(metadata || "");
    return typeof parsed?.eyebrow === "string" ? parsed.eyebrow : "";
  } catch {
    return "";
  }
}

async function fetchSections(): Promise<HomeSection[]> {
  try {
    const response = await fetch(`${apiBase}/api/v1/content?type=SECTION`, { cache: "no-store" });
    if (!response.ok) return fallbackSections;
    const data = (await response.json()) as {
      items: Array<{ title: string; description: string; metadata: string | null; imageUrl: string | null }>;
    };
    const items = data.items || [];
    if (items.length === 0) return fallbackSections;
    return items.map((item) => ({
      title: item.title,
      eyebrow: eyebrowOf(item.metadata),
      description: item.description,
      imageUrl: item.imageUrl || null,
    }));
  } catch {
    return fallbackSections;
  }
}

export default async function Home() {
  const sections = await fetchSections();

  return (
    <main className="overflow-hidden bg-[#020617] text-[#f8fafc]">
      <header className="fixed left-0 right-0 top-0 z-50 px-4 py-4 lg:px-8 lg:py-5">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <Link href="#top" className="flex shrink-0 items-center gap-2 rounded-full bg-white/95 px-3 py-2 text-[#071a3a] shadow-xl shadow-black/10" aria-label="GG Sports home">
            <Image src="/brand/gg-sports-logo.png" alt="GG Sports logo" width={48} height={48} className="h-10 w-10 object-contain" />
            <span className="text-xs font-black tracking-[0.16em]">GG SPORTS</span>
          </Link>
          <nav className="hidden items-center gap-1 rounded-full bg-white/95 p-2 text-[11px] font-bold text-[#071a3a] shadow-xl shadow-black/10 md:flex">
            <Link className="rounded-full bg-gradient-to-r from-[#38bdf8] to-[#ec4899] px-5 py-3 text-white" href="#top">Home</Link>
            <Link className="rounded-full px-5 py-3 transition hover:bg-[#e0f2fe]" href="#sections">Sections</Link>
            <Link className="rounded-full px-5 py-3 transition hover:bg-[#e0f2fe]" href="/services">Services</Link>
            <Link className="rounded-full px-5 py-3 transition hover:bg-[#e0f2fe]" href="#contact">Contact</Link>
          </nav>
          <Link href="#contact" className="hidden rounded-full bg-[#ff6a00] px-5 py-3 text-[10px] font-black uppercase tracking-[0.14em] text-white transition hover:bg-[#38bdf8] sm:block">Start training</Link>
        </div>
      </header>

      <section id="top" className="relative flex min-h-[760px] items-center px-6 pb-16 pt-32 lg:min-h-screen lg:px-10 lg:pt-36">
        <video
          className="absolute inset-0 h-full w-full object-cover opacity-25"
          src="/opening/gg-sports-intro.mp4"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-[#020617]/70" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_28%,rgba(56,189,248,0.2),transparent_24%),radial-gradient(circle_at_20%_80%,rgba(37,99,235,0.22),transparent_32%)]" />
        <div className="stars absolute inset-0 opacity-60" />
        <div className="absolute right-[-14%] top-[-18%] h-[760px] w-[760px] rounded-full border border-[#38bdf8]/15 shadow-[0_0_100px_rgba(56,189,248,0.08)]" />
        <div className="absolute right-[10%] top-[22%] hidden h-72 w-72 rounded-full border border-[#ff6a00]/30 lg:block" />
        <div className="relative mx-auto w-full max-w-7xl">
          <div className="relative mb-10 hidden justify-between border-b border-white/15 pb-4 text-[9px] font-bold uppercase tracking-[0.3em] text-[#94a3b8] sm:flex">
            <span>Play · Learn · Compete · Grow</span><span className="hidden sm:block">A complete cricket ecosystem</span>
          </div>
          <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
            <div className="relative max-w-3xl">
              <div className="mb-7 flex items-center gap-3"><Image src="/brand/gg-sports-logo.png" alt="" width={72} height={72} className="h-12 w-12 object-contain" /><span className="text-[9px] font-bold uppercase tracking-[0.35em] text-[#f8fafc]/75">Cricket beyond limits</span></div>
              <p className="text-[10px] font-bold uppercase tracking-[0.45em] text-[#38bdf8]">Events · Academy · Shop</p>
              <h1 className="mt-6 max-w-3xl text-6xl font-black uppercase leading-[0.84] tracking-[-0.08em] sm:text-8xl lg:text-[7.4rem]">Build your<br /><span className="text-[#ff6a00]">next level.</span></h1>
              <p className="mt-7 max-w-xl text-base leading-7 text-[#f8fafc]/75 lg:text-lg">Structured coaching, real competition and the right equipment for every stage of your cricket journey.</p>
              <div className="mt-9 flex flex-wrap gap-3"><Link href="#sections" className="rounded-full bg-gradient-to-r from-[#38bdf8] to-[#ec4899] px-7 py-3.5 text-[10px] font-black uppercase tracking-[0.2em] text-white transition hover:scale-105">Explore programs <span className="ml-3">→</span></Link><Link href="#contact" className="rounded-full border border-white/45 bg-black/15 px-7 py-3.5 text-[10px] font-black uppercase tracking-[0.2em] transition hover:border-white hover:bg-white hover:text-[#071a3a]">Start a conversation</Link></div>
              <div className="mt-12 flex flex-wrap gap-8 border-t border-white/15 pt-5 text-[10px] font-bold uppercase tracking-[0.18em] text-[#94a3b8]"><span><strong className="mr-2 text-xl text-[#ff6a00]">05</strong> Player stages</span><span><strong className="mr-2 text-xl text-[#ff6a00]">03</strong> Core worlds</span><span><strong className="mr-2 text-xl text-[#ff6a00]">01</strong> Shared purpose</span></div>
            </div>
            <div className="relative mx-auto w-full max-w-[520px] lg:ml-auto">
              <div className="absolute -inset-5 rounded-[2rem] border border-[#38bdf8]/20" />
              <div className="relative aspect-[4/5] overflow-hidden rounded-[1.5rem] border border-white/15 bg-[#0b1120] shadow-2xl shadow-black/40">
                <video className="h-full w-full object-cover opacity-70" src="/opening/gg-sports-intro.mp4" autoPlay muted loop playsInline preload="metadata" aria-hidden="true" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-[#020617]/15" />
                <div className="absolute inset-x-5 bottom-5 flex items-end justify-between border-t border-white/20 pt-4"><div><p className="text-[9px] font-bold uppercase tracking-[0.3em] text-[#38bdf8]">The GG Sports orbit</p><p className="mt-2 text-2xl font-black uppercase leading-none">Play with<br /><span className="text-[#ff6a00]">purpose.</span></p></div><span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#ff6a00] text-xl text-[#020617]">↗</span></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="sections" className="border-y border-white/10 bg-[#071a3a] px-6 py-24 lg:px-10 lg:py-32">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-[#38bdf8]">GG Sports / What we offer</p>
              <h2 className="mt-5 text-5xl font-black uppercase leading-[0.88] tracking-[-0.06em] lg:text-8xl">One ecosystem.<br /><span className="text-[#ff6a00]">Every step.</span></h2>
            </div>
            <p className="max-w-sm text-sm leading-6 text-[#94a3b8]">Every section here is added and published straight from Mission Control — the admin dashboard.</p>
          </div>
          <div className="mt-14 grid gap-4 lg:grid-cols-3">
            {sections.map((section, index) => (
              <article key={section.title} className="group flex min-h-[400px] flex-col rounded-2xl border border-white/10 bg-[#0b1120] p-7 transition duration-300 hover:-translate-y-2 hover:border-[#38bdf8]/60">
                {section.imageUrl ? (
                  <div className="relative -mx-5 -mt-5 mb-6 aspect-[16/9] w-[calc(100%+2.5rem)] overflow-hidden rounded-t-2xl">
                    <Image src={section.imageUrl} alt={section.title} fill unoptimized className="object-cover transition duration-500 group-hover:scale-105" />
                  </div>
                ) : (
                  <div className="flex justify-between"><span className="text-sm font-black text-[#ff6a00]">0{index + 1}</span><span className="text-[#38bdf8]">↗</span></div>
                )}
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#38bdf8]">{section.eyebrow || "GG Sports"}</p>
                <h3 className="mt-4 text-3xl font-black uppercase tracking-[-0.04em]">{section.title}</h3>
                <p className="mt-4 text-sm leading-6 text-[#94a3b8]">{section.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
<section id="contact" className="px-6 py-24 lg:px-10 lg:py-32"><div className="mx-auto max-w-7xl rounded-3xl border border-white/10 bg-[#0b1120] p-8 lg:p-16"><div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:items-start"><div><p className="text-[10px] font-bold uppercase tracking-[0.4em] text-[#38bdf8]">10 / Start your journey</p><h2 className="mt-5 text-5xl font-black uppercase leading-[0.85] tracking-[-0.07em] lg:text-8xl">Your next<br /><span className="text-[#ff6a00]">level awaits.</span></h2><p className="mt-8 max-w-sm text-sm leading-6 text-[#94a3b8]">Ask about Academy programs, Events, Facilities or Gear Station services.</p><a href="https://wa.me/918111079383" target="_blank" rel="noreferrer" className="mt-8 inline-flex border-b border-white/20 pb-3 text-sm font-bold transition hover:border-[#25d366] hover:text-[#25d366]">WhatsApp GG Sports <span className="ml-8">→</span></a></div><ContactForm /></div></div></section>

      <footer className="border-t border-white/10 px-6 py-8 lg:px-10"><div className="mx-auto flex max-w-7xl flex-col justify-between gap-4 text-[10px] font-bold uppercase tracking-[0.2em] text-[#94a3b8] sm:flex-row"><span>© 2026 GG Sports</span><span>Play · Learn · Compete · Grow</span><span>Cricket beyond limits</span></div></footer>
      <Chatbot />
    </main>
  );
}