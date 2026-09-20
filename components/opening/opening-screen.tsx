"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

export default function OpeningScreen() {
  const [isVisible, setIsVisible] = useState(true);
  const [isExiting, setIsExiting] = useState(false);

  const finishIntro = () => {
    if (isExiting) return;

    setIsExiting(true);

    setTimeout(() => {
      setIsVisible(false);
    }, 900);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      finishIntro();
    }, 9000);

    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  return (
    <section
      className={`fixed inset-0 z-[9999] overflow-hidden bg-black transition-opacity duration-1000 ${
        isExiting ? "opacity-0" : "opacity-100"
      }`}
    >
      {/* Background video */}
      <video
        className="absolute inset-0 h-full w-full object-cover"
        src="/opening/gg-sports-intro.mp4"
        autoPlay
        muted
        playsInline
        preload="auto"
        onEnded={finishIntro}
      />

      {/* Cinematic dark overlay */}
      <div className="absolute inset-0 bg-black/35" />

      {/* Gradient for readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />

      {/* Brand content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
        <div
          className={`transition-all duration-1000 ${
            isExiting
              ? "translate-y-[-20px] opacity-0"
              : "translate-y-0 opacity-100"
          }`}
        >
          <Image
            src="/brand/gg-sports-logo.png"
            alt="GG Sports"
            width={240}
            height={240}
            priority
            className="mx-auto mb-8 h-auto w-40 object-contain md:w-52"
          />

          <p className="text-xs font-medium tracking-[0.5em] text-white/90 md:text-sm">
            EVENTS • ACADEMY • SHOP
          </p>
        </div>
      </div>

      {/* Skip button */}
      <button
        type="button"
        onClick={finishIntro}
        className="absolute bottom-8 right-8 z-20 border border-white/30 px-5 py-2.5 text-[10px] font-medium tracking-[0.3em] text-white/80 uppercase backdrop-blur-md transition-all duration-300 hover:border-white hover:bg-white hover:text-black"
      >
        Skip Intro
      </button>
    </section>
  );
}
