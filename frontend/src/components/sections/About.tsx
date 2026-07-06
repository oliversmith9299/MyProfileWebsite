"use client";

import { useEffect, useState } from "react";

import { Section } from "@/components/ui/Section";
import { person } from "@/lib/content";

const TERMINAL_LINES = [
  { prompt: "$", cmd: "whoami", out: "afnan: ai engineer, cairo, egypt" },
  { prompt: "$", cmd: "ls ~/shipped", out: "bizify/  fentech/  exo-scan-ai/" },
  { prompt: "$", cmd: "grep -r 'production' ~/experience", out: "ibm: llm chatbots, bilingual OCR, MCP pipelines" },
  { prompt: "$", cmd: "python -c \"print(gpa)\"", out: "3.79  # Excellent, Top 4 graduation project" },
];

/** Terminal simulator that types itself when scrolled into view. */
function Terminal() {
  const [visible, setVisible] = useState(0);

  useEffect(() => {
    const t = setInterval(() => {
      setVisible((v) => (v >= TERMINAL_LINES.length ? v : v + 1));
    }, 900);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="card overflow-hidden font-[family-name:var(--font-mono)] text-[13px]">
      <div className="flex items-center gap-1.5 border-b border-(--color-line) px-4 py-3">
        <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
        <span className="ml-3 text-xs text-(--color-ink-faint)">afnan@ai: zsh</span>
      </div>
      <div className="space-y-3 p-5">
        {TERMINAL_LINES.slice(0, visible).map((l) => (
          <div key={l.cmd}>
            <p>
              <span className="text-(--color-cyan)">{l.prompt}</span>{" "}
              <span className="text-(--color-ink)">{l.cmd}</span>
            </p>
            <p className="text-(--color-ink-dim)">{l.out}</p>
          </div>
        ))}
        <p>
          <span className="text-(--color-cyan)">$</span>
          <span className="caret ml-1 inline-block h-3.5 w-2 translate-y-0.5 bg-(--color-ink-dim)" />
        </p>
      </div>
    </div>
  );
}

export function About() {
  return (
    <Section id="about" eyebrow="01 · About" title={<>AI as a product discipline,<br />not a demo.</>}>
      <div className="grid gap-10 md:grid-cols-2 md:gap-14">
        <div className="space-y-5 text-[15px] leading-relaxed text-(--color-ink-dim)">
          {person.about.map((p) => (
            <p key={p.slice(0, 24)}>{p}</p>
          ))}
        </div>
        <Terminal />
      </div>
    </Section>
  );
}
