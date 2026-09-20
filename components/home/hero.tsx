import Image from "next/image";
import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative min-h-screen overflow-hidden bg-black text-white">
      {/* HERO IMAGE */}
      <div className="absolute inset-0">
        <Image
          src="/hero/gg-sports-hero.jpg"
          alt="GG Sports cricket training"
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />

        {/* Dark cinematic overlay */}
        <div className="absolute inset-0 bg-black/55" />

        {/* Bottom gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-black/40" />

        {/* Orange atmosphere */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_60%,rgba(255,106,0,0.16),transparent_35%)]" />
      </div>

      {/* TOP BAR */}
      <div className="absolute left-0 right-0 top-0 z-20 px-5 pt-5 md:px-10">
        <div className="flex items-center justify-between border-b border-white/25 pb-4">
          {/* Social */}
          <div className="flex items-center gap-5 text-xs text-white/70">
            <span className="cursor-pointer transition hover:text-[#FF6A00]">
              Instagram
            </span>

            <span className="cursor-pointer transition hover:text-[#FF6A00]">
              YouTube
            </span>

            <span className="cursor-pointer transition hover:text-[#FF6A00]">
              Facebook
            </span>
          </div>

          {/* Brand philosophy */}
          <div className="hidden text-[9px] font-medium tracking-[0.4em] text-white/70 sm:block">
            PLAY&nbsp;&nbsp;|&nbsp;&nbsp;LEARN&nbsp;&nbsp;|&nbsp;&nbsp;COMPETE&nbsp;&nbsp;|&nbsp;&nbsp;GROW
          </div>
        </div>
      </div>

      {/* LOGO */}
      <div className="absolute left-1/2 top-[12%] z-20 -translate-x-1/2 text-center">
        <Link href="/" aria-label="GG Sports Home">
          <Image
            src="/brand/gg-sports-logo.png"
            alt="GG Sports"
            width={220}
            height={210}
            priority
            className="mx-auto h-auto w-36 md:w-48"
          />
        </Link>

        <p className="-mt-3 text-[8px] font-medium tracking-[0.45em] text-white/80 md:text-[10px]">
          CRICKET BEYOND LIMITS
        </p>
      </div>

      {/* MAIN NAVIGATION */}
      <nav className="absolute left-1/2 top-[29%] z-20 flex w-full max-w-3xl -translate-x-1/2 items-center justify-center px-6">
        <div className="hidden h-px flex-1 bg-white/30 md:block" />

        <div className="flex items-center gap-4 px-6 text-sm md:gap-7">
          <Link
            href="/"
            className="font-semibold text-[#FF6A00] transition hover:text-white"
          >
            Home
          </Link>

          <span className="text-white/50">|</span>

          <Link
            href="/about"
            className="text-white/85 transition hover:text-[#FF6A00]"
          >
            About
          </Link>

          <span className="text-white/50">|</span>

          <Link
            href="/services"
            className="text-white/85 transition hover:text-[#FF6A00]"
          >
            Services
          </Link>

          <span className="text-white/50">|</span>

          <Link
            href="/contact"
            className="text-white/85 transition hover:text-[#FF6A00]"
          >
            Contact
          </Link>
        </div>

        <div className="hidden h-px flex-1 bg-white/30 md:block" />
      </nav>

      {/* HERO CONTENT */}
      <div className="relative z-10 flex min-h-screen items-center justify-center px-6 pt-32 text-center">
        <div className="max-w-5xl">
          <p className="mb-5 text-[10px] font-semibold tracking-[0.45em] text-white/75 md:text-xs">
            EVENTS&nbsp;&nbsp;•&nbsp;&nbsp;ACADEMY&nbsp;&nbsp;•&nbsp;&nbsp;SHOP
          </p>

          <h1 className="text-5xl font-black uppercase leading-[0.9] tracking-[-0.05em] sm:text-6xl md:text-7xl lg:text-8xl">
            WHERE CRICKET
            <br />
            MEETS{" "}
            <span className="text-[#FF6A00]">AMBITION</span>
          </h1>

          <p className="mx-auto mt-7 max-w-2xl text-sm leading-7 text-white/80 md:text-base">
            Build the player. Test the player. Equip the player.
            <br className="hidden md:block" />
            One complete cricket ecosystem.
          </p>

          {/* CTA */}
          <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/academy"
              className="border border-[#FF6A00] bg-[#FF6A00] px-8 py-3.5 text-[10px] font-bold tracking-[0.25em] text-black transition-all duration-300 hover:bg-white"
            >
              JOIN ACADEMY
              <span className="ml-3">→</span>
            </Link>

            <Link
              href="/events"
              className="border border-white/50 bg-black/20 px-8 py-3.5 text-[10px] font-bold tracking-[0.25em] text-white backdrop-blur-sm transition-all duration-300 hover:border-white hover:bg-white hover:text-black"
            >
              EXPLORE EVENTS
              <span className="ml-3">→</span>
            </Link>
          </div>
        </div>
      </div>

      {/* SCROLL INDICATOR */}
      <div className="absolute bottom-7 left-1/2 z-20 -translate-x-1/2">
        <div className="flex flex-col items-center">
          <div className="mb-3 h-8 w-px bg-gradient-to-b from-[#FF6A00] to-transparent" />

          <span className="text-[8px] tracking-[0.45em] text-white/60">
            SCROLL DOWN
          </span>
        </div>
      </div>
    </section>
  );
}
