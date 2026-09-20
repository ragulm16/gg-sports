"use client";

import { FormEvent, useState } from "react";

const whatsappNumber = "918111079383";

export default function ContactForm() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const message = [
      "Hello GG Sports, I have an enquiry.",
      "",
      `Name: ${form.get("name") || "Not provided"}`,
      `Phone: ${form.get("phone") || "Not provided"}`,
      `Interested in: ${form.get("interest") || "General enquiry"}`,
      `Message: ${form.get("message") || "Not provided"}`,
    ].join("\n");

    setSubmitted(true);
    window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-3 sm:grid-cols-2">
      <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#94a3b8]">
        Name
        <input required name="name" placeholder="Your name" className="mt-2 w-full rounded-lg border border-white/10 bg-[#020617] px-4 py-3 text-sm text-white outline-none transition focus:border-[#38bdf8]" />
      </label>
      <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#94a3b8]">
        Phone
        <input name="phone" placeholder="Contact number" className="mt-2 w-full rounded-lg border border-white/10 bg-[#020617] px-4 py-3 text-sm text-white outline-none transition focus:border-[#38bdf8]" />
      </label>
      <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#94a3b8] sm:col-span-2">
        Interested in
        <select name="interest" defaultValue="Academy" className="mt-2 w-full rounded-lg border border-white/10 bg-[#020617] px-4 py-3 text-sm text-white outline-none focus:border-[#38bdf8]">
          <option>Academy</option>
          <option>Events</option>
          <option>Facilities</option>
          <option>Gear Station</option>
        </select>
      </label>
      <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#94a3b8] sm:col-span-2">
        Message
        <textarea required name="message" placeholder="Tell us what you need" rows={4} className="mt-2 w-full resize-none rounded-lg border border-white/10 bg-[#020617] px-4 py-3 text-sm text-white outline-none transition focus:border-[#38bdf8]" />
      </label>
      <button type="submit" className="rounded-lg bg-[#25d366] px-5 py-3.5 text-[10px] font-black uppercase tracking-[0.2em] text-[#020617] transition hover:bg-[#38bdf8] sm:col-span-2">
        {submitted ? "WhatsApp opened" : "Send enquiry on WhatsApp"} <span className="ml-3">→</span>
      </button>
    </form>
  );
}
