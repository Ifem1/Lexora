"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { FRAMEWORKS } from "@/lib/arbitration/frameworks";

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: (i: number = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.6, delay: i * 0.1 } }),
};

const HOW_IT_WORKS = [
  { step: "01", title: "Create Case", desc: "Define the dispute, select a framework, and identify both parties.", icon: "⚖️" },
  { step: "02", title: "Select Framework", desc: "Choose the legal framework that governs your type of dispute.", icon: "📋" },
  { step: "03", title: "Submit Evidence", desc: "Upload documents, messages, contracts, and all supporting materials.", icon: "📎" },
  { step: "04", title: "GenLayer Reviews", desc: "AI validators on GenLayer independently analyse the case packet.", icon: "🔍" },
  { step: "05", title: "Structured Ruling", desc: "Validators reach consensus and produce a reasoned ruling.", icon: "🏛️" },
  { step: "06", title: "Accept or Appeal", desc: "Accept the ruling or file a reasoned appeal on defined grounds.", icon: "✅" },
];

const WHY_GENLAYER = [
  { title: "Subjective Judgment", desc: "Normal smart contracts cannot weigh 'was this work good enough?'. GenLayer validators can." },
  { title: "Evidence Weighing", desc: "AI validators read documents, messages, and media — not just on-chain data." },
  { title: "Proportionate Remedies", desc: "Rulings can split payments, order partial refunds, or prescribe rework — not just binary outcomes." },
  { title: "Framework Fidelity", desc: "Each ruling cites which rule was applied and why, creating an auditable reasoning chain." },
  { title: "Decentralised Consensus", desc: "Multiple independent validators must agree — no single point of manipulation." },
  { title: "Appeal Pathway", desc: "Structured appeals on 6 defined grounds ensure procedural fairness." },
];

export default function Home() {
  const sampleFrameworks = FRAMEWORKS.slice(0, 3);

  return (
    <div style={{ background: "#0B0D10", color: "#F1E8D2", minHeight: "100vh" }}>
      {/* Nav */}
      <nav style={{ borderBottom: "1px solid rgba(241,232,210,0.1)", padding: "1rem 2rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontFamily: "var(--font-cinzel-decorative), serif", fontSize: "1.25rem", color: "#C69C5D", letterSpacing: "0.1em" }}>LEXORA</span>
        <div style={{ display: "flex", gap: "2rem", alignItems: "center" }}>
          <Link href="/app/frameworks" style={{ color: "rgba(241,232,210,0.68)", fontSize: "0.875rem", textDecoration: "none" }}>Frameworks</Link>
          <Link href="/app/audit" style={{ color: "rgba(241,232,210,0.68)", fontSize: "0.875rem", textDecoration: "none" }}>Transparency</Link>
          <Link href="/app" style={{ background: "#C69C5D", color: "#0B0D10", padding: "0.5rem 1.25rem", borderRadius: "2px", fontSize: "0.875rem", textDecoration: "none", fontWeight: 600 }}>Open Console</Link>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ maxWidth: "900px", margin: "0 auto", padding: "8rem 2rem 6rem", textAlign: "center" }}>
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}>
          <div style={{ fontFamily: "var(--font-cinzel-decorative), serif", fontSize: "clamp(3rem, 8vw, 6rem)", fontWeight: 900, color: "#C69C5D", letterSpacing: "0.05em", lineHeight: 1.1, marginBottom: "1.5rem" }}>
            LEXORA
          </div>
        </motion.div>
        <motion.p initial="hidden" animate="visible" variants={fadeUp} custom={1}
          style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "clamp(1rem, 2.5vw, 1.4rem)", color: "rgba(241,232,210,0.85)", marginBottom: "1rem", letterSpacing: "0.04em" }}>
          Framework-bound AI arbitration, powered by GenLayer consensus.
        </motion.p>
        <motion.p initial="hidden" animate="visible" variants={fadeUp} custom={2}
          style={{ fontSize: "1rem", color: "rgba(241,232,210,0.55)", maxWidth: "600px", margin: "0 auto 3rem", lineHeight: 1.7 }}>
          GenLayer validators independently review each case packet and produce structured, reasoned rulings — with evidence mapping, rule citations, and proportionate remedies. No single arbiter. No black box.
        </motion.p>
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={3} style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/app" style={{ background: "#C69C5D", color: "#0B0D10", padding: "0.875rem 2rem", borderRadius: "2px", fontWeight: 700, textDecoration: "none", fontSize: "0.9rem", letterSpacing: "0.05em" }}>
            OPEN CASE CONSOLE
          </Link>
          <Link href="/app/cases/new" style={{ border: "1px solid #C69C5D", color: "#C69C5D", padding: "0.875rem 2rem", borderRadius: "2px", fontWeight: 600, textDecoration: "none", fontSize: "0.9rem", letterSpacing: "0.05em" }}>
            CREATE CASE
          </Link>
          <Link href="/app/playground" style={{ border: "1px solid rgba(241,232,210,0.2)", color: "rgba(241,232,210,0.68)", padding: "0.875rem 2rem", borderRadius: "2px", fontWeight: 500, textDecoration: "none", fontSize: "0.9rem" }}>
            Try Playground
          </Link>
        </motion.div>
      </section>

      <div style={{ height: "1px", background: "linear-gradient(90deg, transparent, rgba(198,156,93,0.4), transparent)", margin: "0 2rem" }} />

      {/* How It Works */}
      <section style={{ maxWidth: "1100px", margin: "0 auto", padding: "6rem 2rem" }}>
        <motion.h2 initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
          style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "1.75rem", color: "#C69C5D", textAlign: "center", marginBottom: "0.5rem", letterSpacing: "0.08em" }}>
          How It Works
        </motion.h2>
        <motion.p initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={1}
          style={{ textAlign: "center", color: "rgba(241,232,210,0.55)", marginBottom: "4rem", fontSize: "0.95rem" }}>
          Six procedural steps. One structured ruling.
        </motion.p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.5rem" }}>
          {HOW_IT_WORKS.map((step, i) => (
            <motion.div key={step.step} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i * 0.08}
              style={{ background: "#171B20", border: "1px solid rgba(241,232,210,0.08)", borderRadius: "4px", padding: "1.75rem" }}>
              <div style={{ fontSize: "2rem", marginBottom: "0.75rem" }}>{step.icon}</div>
              <div style={{ fontFamily: "var(--font-ibm-plex-mono), monospace", fontSize: "0.7rem", color: "#C69C5D", marginBottom: "0.5rem", letterSpacing: "0.1em" }}>STEP {step.step}</div>
              <div style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "1rem", color: "#F1E8D2", marginBottom: "0.5rem" }}>{step.title}</div>
              <div style={{ fontSize: "0.875rem", color: "rgba(241,232,210,0.55)", lineHeight: 1.6 }}>{step.desc}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Why GenLayer */}
      <section style={{ background: "#0E1418", padding: "6rem 2rem" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <motion.h2 initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
            style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "1.75rem", color: "#C69C5D", textAlign: "center", marginBottom: "0.5rem", letterSpacing: "0.08em" }}>
            Why GenLayer?
          </motion.h2>
          <motion.p initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={1}
            style={{ textAlign: "center", color: "rgba(241,232,210,0.55)", marginBottom: "4rem", fontSize: "0.95rem" }}>
            What AI arbitration can adjudicate that normal smart contracts cannot.
          </motion.p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "2rem" }}>
            {WHY_GENLAYER.map((item, i) => (
              <motion.div key={item.title} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i * 0.08}
                style={{ borderLeft: "3px solid #C69C5D", paddingLeft: "1.25rem" }}>
                <div style={{ fontFamily: "var(--font-space-grotesk), sans-serif", fontWeight: 600, color: "#F1E8D2", marginBottom: "0.5rem" }}>{item.title}</div>
                <div style={{ fontSize: "0.875rem", color: "rgba(241,232,210,0.55)", lineHeight: 1.7 }}>{item.desc}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Framework Preview */}
      <section style={{ maxWidth: "1100px", margin: "0 auto", padding: "6rem 2rem" }}>
        <motion.h2 initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
          style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "1.75rem", color: "#C69C5D", textAlign: "center", marginBottom: "0.5rem", letterSpacing: "0.08em" }}>
          Arbitration Frameworks
        </motion.h2>
        <motion.p initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={1}
          style={{ textAlign: "center", color: "rgba(241,232,210,0.55)", marginBottom: "4rem", fontSize: "0.95rem" }}>
          Each framework encodes domain-specific principles, evidence rules, and remedy options.
        </motion.p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1.5rem", marginBottom: "2rem" }}>
          {sampleFrameworks.map((fw, i) => (
            <motion.div key={fw.frameworkId} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i * 0.1}
              style={{ background: "#171B20", border: "1px solid rgba(241,232,210,0.08)", borderRadius: "4px", padding: "2rem" }}>
              <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>{fw.icon}</div>
              <div style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "1rem", color: "#C69C5D", marginBottom: "0.5rem" }}>{fw.title}</div>
              <div style={{ fontSize: "0.75rem", color: "rgba(241,232,210,0.4)", marginBottom: "1rem", letterSpacing: "0.05em" }}>{fw.category}</div>
              <div style={{ fontSize: "0.875rem", color: "rgba(241,232,210,0.68)", lineHeight: 1.6, marginBottom: "1.25rem" }}>{fw.description.slice(0, 120)}...</div>
            </motion.div>
          ))}
        </div>
        <div style={{ textAlign: "center" }}>
          <Link href="/app/frameworks" style={{ border: "1px solid rgba(198,156,93,0.4)", color: "#C69C5D", padding: "0.75rem 2rem", borderRadius: "2px", textDecoration: "none", fontSize: "0.875rem" }}>
            View All Frameworks →
          </Link>
        </div>
      </section>

      {/* Disclaimer */}
      <section style={{ maxWidth: "900px", margin: "0 auto", padding: "0 2rem 6rem" }}>
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
          style={{ background: "rgba(125,31,42,0.1)", border: "1px solid rgba(125,31,42,0.3)", borderRadius: "4px", padding: "2rem" }}>
          <div style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "0.8rem", color: "#7D1F2A", marginBottom: "1rem", letterSpacing: "0.1em" }}>IMPORTANT DISCLAIMER</div>
          <div style={{ fontSize: "0.8rem", color: "rgba(241,232,210,0.55)", lineHeight: 1.8 }}>
            Lexora provides AI-assisted arbitration as a non-binding, voluntary dispute resolution service. Outcomes produced are not legally enforceable judgments and do not constitute legal advice. Lexora is not a law firm, arbitral institution, or regulated dispute resolution body. For legally binding arbitration, consult a qualified legal professional in your jurisdiction.
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: "1px solid rgba(241,232,210,0.08)", padding: "3rem 2rem" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "2rem" }}>
          <div>
            <div style={{ fontFamily: "var(--font-cinzel-decorative), serif", fontSize: "1rem", color: "#C69C5D", marginBottom: "0.5rem" }}>LEXORA</div>
            <div style={{ fontSize: "0.8rem", color: "rgba(241,232,210,0.4)" }}>Framework-bound AI arbitration on GenLayer.</div>
          </div>
          <div style={{ display: "flex", gap: "2rem" }}>
            <Link href="/app" style={{ fontSize: "0.85rem", color: "rgba(241,232,210,0.5)", textDecoration: "none" }}>Console</Link>
            <Link href="/app/frameworks" style={{ fontSize: "0.85rem", color: "rgba(241,232,210,0.5)", textDecoration: "none" }}>Frameworks</Link>
            <Link href="/app/audit" style={{ fontSize: "0.85rem", color: "rgba(241,232,210,0.5)", textDecoration: "none" }}>Transparency</Link>
            <Link href="/app/playground" style={{ fontSize: "0.85rem", color: "rgba(241,232,210,0.5)", textDecoration: "none" }}>Playground</Link>
          </div>
          <div style={{ fontSize: "0.75rem", color: "rgba(241,232,210,0.3)" }}>Advisory only. Not legal advice. © 2025 Lexora.</div>
        </div>
      </footer>
    </div>
  );
}
