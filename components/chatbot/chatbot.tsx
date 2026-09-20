"use client";

import { FormEvent, useState } from "react";

type Message = {
  from: "bot" | "user";
  text: string;
};

const answers = {
  events:
    "We organize corporate leagues, auction-style tournaments, open championship cups, ground bookings, net bookings, and mobile cricket setups.",
  academy:
    "Our Academy has U11, U13, U15, U17, and senior programs with batting, bowling, fitness, mobility, and visual reaction training.",
  shop:
    "The Shop offers quality cricket gear, protective equipment, training accessories, bat threading, binding, crack repairs, toe guards, knocking, and custom team kits.",
  contact:
    "You can reach the GG Sports team at hello@ggsports.in. Tell us what you need and we will help you get started.",
  default:
    "I can help with GG Sports Events, Academy programs, and Shop services. What would you like to explore?",
};

const whatsappNumber = "918111079383";

function getAnswer(question: string) {
  const normalizedQuestion = question.toLowerCase();

  if (/event|tournament|league|booking|venue|ground|net/.test(normalizedQuestion)) {
    return answers.events;
  }

  if (/academy|coach|coaching|training|u11|u13|u15|u17|senior|fitness|batting|bowling/.test(normalizedQuestion)) {
    return answers.academy;
  }

  if (/shop|gear|equipment|bat|repair|apparel|jersey|kit|accessor/.test(normalizedQuestion)) {
    return answers.shop;
  }

  if (/contact|email|reach|talk|hello/.test(normalizedQuestion)) {
    return answers.contact;
  }

  return answers.default;
}

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      from: "bot",
      text: "Hey! I’m the GG Sports assistant. Ask me about Events, Academy, or Shop.",
    },
  ]);

  const sendMessage = (question: string) => {
    const trimmedQuestion = question.trim();
    if (!trimmedQuestion) return;

    setMessages((currentMessages) => [
      ...currentMessages,
      { from: "user", text: trimmedQuestion },
      { from: "bot", text: getAnswer(trimmedQuestion) },
    ]);
    setInput("");
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    sendMessage(input);
  };

  const sendToWhatsApp = () => {
    const latestUserMessage = [...messages].reverse().find((message) => message.from === "user");
    const message = [
      "Hello GG Sports, I need help.",
      "",
      latestUserMessage ? `My enquiry: ${latestUserMessage.text}` : "I would like to know more about GG Sports.",
      "",
      "Sent from the GGSPORTS assistant.",
    ].join("\n");

    window.open(
      `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`,
      "_blank",
      "noopener,noreferrer",
    );
  };

  return (
    <div className="fixed bottom-5 right-5 z-[60] sm:bottom-7 sm:right-7">
      {isOpen && (
        <div className="mb-4 flex w-[calc(100vw-2.5rem)] max-w-[370px] flex-col overflow-hidden rounded-2xl border border-white/15 bg-[#191c16] shadow-2xl shadow-black/40">
          <div className="flex items-center justify-between border-b border-white/10 bg-[#ff6b2c] px-5 py-4 text-[#11130f]">
            <div>
              <p className="text-sm font-black">GGSPORTS</p>
              <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.15em] text-black/55">Here to help you play bigger</p>
            </div>
            <button type="button" onClick={() => setIsOpen(false)} aria-label="Close chat" className="text-xl leading-none transition hover:scale-110">×</button>
          </div>

          <div className="flex max-h-[360px] min-h-[250px] flex-col gap-3 overflow-y-auto p-4">
            {messages.map((message, index) => (
              <div key={`${message.from}-${index}`} className={`max-w-[88%] rounded-xl px-3.5 py-3 text-xs leading-5 ${message.from === "user" ? "self-end bg-[#ff6b2c] text-[#11130f]" : "self-start bg-white/8 text-white/75"}`}>
                {message.text}
              </div>
            ))}
          </div>

          <div className="flex gap-2 overflow-x-auto border-t border-white/10 px-4 py-3">
            {["Events", "Academy", "Shop"].map((topic) => (
              <button key={topic} type="button" onClick={() => sendMessage(topic)} className="shrink-0 rounded-full border border-white/15 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.1em] text-white/65 transition hover:border-[#ff6b2c] hover:text-[#ff6b2c]">
                {topic}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={sendToWhatsApp}
            className="mx-4 mb-3 rounded-lg border border-[#25d366]/40 bg-[#25d366]/10 px-3 py-2.5 text-[10px] font-black uppercase tracking-[0.12em] text-[#25d366] transition hover:bg-[#25d366] hover:text-[#020617]"
          >
            WhatsApp GGSPORTS
          </button>

          <form onSubmit={handleSubmit} className="flex gap-2 border-t border-white/10 p-3">
            <input value={input} onChange={(event) => setInput(event.target.value)} placeholder="Ask GG Sports..." aria-label="Ask GG Sports a question" className="min-w-0 flex-1 rounded-lg bg-white/8 px-3 py-2.5 text-xs text-white outline-none placeholder:text-white/35 focus:ring-1 focus:ring-[#ff6b2c]" />
            <button type="submit" aria-label="Send message" className="rounded-lg bg-[#ff6b2c] px-3.5 text-lg font-bold text-[#11130f] transition hover:bg-[#f5f1e8]">↑</button>
          </form>
        </div>
      )}

      <button type="button" onClick={() => setIsOpen((open) => !open)} aria-label={isOpen ? "Close GG Sports chat" : "Open GG Sports chat"} className="ml-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#ff6b2c] text-[#11130f] shadow-lg shadow-[#ff6b2c]/20 transition hover:scale-105 hover:bg-[#f5f1e8]">
        {isOpen ? <span className="text-2xl leading-none">×</span> : <span className="text-xl">✦</span>}
      </button>
    </div>
  );
}
