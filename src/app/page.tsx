"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, useMotionValue, useTransform, AnimatePresence } from "framer-motion";
import { FRAMEWORKS } from "@/lib/arbitration/frameworks";
import { useEffect, useRef, useState } from "react";

// ─── Animations ──────────────────────────────────────────────────────────────

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: (i: number = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.7, delay: i * 0.12, ease: [0.25, 0.4, 0.25, 1] as const } }),
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: (i: number = 0) => ({ opacity: 1, scale: 1, transition: { duration: 0.6, delay: i * 0.1, ease: [0.25, 0.4, 0.25, 1] as const } }),
};

const slideInLeft = {
  hidden: { opacity: 0, x: -40 },
  visible: (i: number = 0) => ({ opacity: 1, x: 0, transition: { duration: 0.6, delay: i * 0.1 } }),
};

// ─── Unsplash Images ─────────────────────────────────────────────────────────

const HERO_IMAGE = "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=1920&q=80";
const SECTION_IMAGES = {
  howItWorks: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=1200&q=80",
  whyGenLayer: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=1200&q=80",
  frameworks: "https://images.unsplash.com/photo-1521791055366-0d553872125f?w=1200&q=80",
};

const FRAMEWORK_IMAGES = [
  "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600&q=80",
  "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=600&q=80",
  "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=600&q=80",
];

// ─── Particle Background ────────────────────────────────────────────────────

function ParticleField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    const particles: { x: number; y: number; vx: number; vy: number; size: number; alpha: number }[] = [];
    const count = 60;

    function resize() {
      canvas!.width = canvas!.offsetWidth;
      canvas!.height = canvas!.offsetHeight;
    }
    resize();
    window.addEventListener("resize", resize);

    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        size: Math.random() * 2 + 0.5,
        alpha: Math.random() * 0.4 + 0.1,
      });
    }

    function draw() {
      ctx!.clearRect(0, 0, canvas!.width, canvas!.height);
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = canvas!.width;
        if (p.x > canvas!.width) p.x = 0;
        if (p.y < 0) p.y = canvas!.height;
        if (p.y > canvas!.height) p.y = 0;

        ctx!.beginPath();
        ctx!.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(198, 156, 93, ${p.alpha})`;
        ctx!.fill();
      }

      // Draw connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx!.beginPath();
            ctx!.moveTo(particles[i].x, particles[i].y);
            ctx!.lineTo(particles[j].x, particles[j].y);
            ctx!.strokeStyle = `rgba(198, 156, 93, ${0.06 * (1 - dist / 120)})`;
            ctx!.stroke();
          }
        }
      }
      animId = requestAnimationFrame(draw);
    }
    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 1 }}
    />
  );
}

// ─── Animated Counter ────────────────────────────────────────────────────────

function AnimatedCounter({ value, suffix = "" }: { value: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    if (hasAnimated) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasAnimated(true);
          const duration = 2000;
          const start = Date.now();
          const tick = () => {
            const elapsed = Date.now() - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.round(eased * value));
            if (progress < 1) requestAnimationFrame(tick);
          };
          tick();
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [value, hasAnimated]);

  return <span ref={ref}>{count}{suffix}</span>;
}

// ─── Glowing Button ──────────────────────────────────────────────────────────

function GlowButton({ href, children, variant = "primary" }: { href: string; children: React.ReactNode; variant?: "primary" | "secondary" | "ghost" }) {
  const styles = {
    primary: {
      background: "#C69C5D",
      color: "#0B0D10",
      border: "none",
      boxShadow: "0 0 20px rgba(198,156,93,0.3), 0 0 60px rgba(198,156,93,0.1)",
    },
    secondary: {
      background: "transparent",
      color: "#C69C5D",
      border: "1px solid #C69C5D",
      boxShadow: "0 0 15px rgba(198,156,93,0.15)",
    },
    ghost: {
      background: "transparent",
      color: "rgba(241,232,210,0.68)",
      border: "1px solid rgba(241,232,210,0.2)",
      boxShadow: "none",
    },
  };

  return (
    <motion.div whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.97 }} transition={{ type: "spring", stiffness: 400, damping: 17 }}>
      <Link href={href} style={{
        ...styles[variant],
        padding: "0.875rem 2rem",
        borderRadius: "2px",
        fontWeight: 700,
        textDecoration: "none",
        fontSize: "0.9rem",
        letterSpacing: "0.05em",
        display: "inline-block",
        transition: "box-shadow 0.3s ease",
      }}>
        {children}
      </Link>
    </motion.div>
  );
}

// ─── Data ────────────────────────────────────────────────────────────────────

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

const STATS = [
  { label: "Frameworks", value: 7, suffix: "" },
  { label: "Appeal Grounds", value: 6, suffix: "" },
  { label: "Validator Consensus", value: 100, suffix: "%" },
  { label: "On-Chain Rulings", value: 100, suffix: "%" },
];

// ─── Page ────────────────────────────────────────────────────────────────────

export default function Home() {
  const sampleFrameworks = FRAMEWORKS.slice(0, 3);

  return (
    <div style={{ background: "#0B0D10", color: "#F1E8D2", minHeight: "100vh", overflowX: "hidden" }}>
      {/* Nav */}
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        style={{ borderBottom: "1px solid rgba(241,232,210,0.1)", padding: "1rem 2rem", display: "flex", justifyContent: "space-between", alignItems: "center", position: "relative", zIndex: 20, backdropFilter: "blur(12px)", background: "rgba(11,13,16,0.8)" }}
      >
        <span style={{ fontFamily: "var(--font-cinzel-decorative), serif", fontSize: "1.25rem", color: "#C69C5D", letterSpacing: "0.1em" }}>LEXORA</span>
        <div style={{ display: "flex", gap: "2rem", alignItems: "center" }}>
          {[
            { href: "/app/frameworks", label: "Frameworks" },
            { href: "/app/audit", label: "Transparency" },
          ].map(link => (
            <motion.div key={link.href} whileHover={{ y: -1 }} transition={{ type: "spring", stiffness: 300 }}>
              <Link href={link.href} style={{ color: "rgba(241,232,210,0.68)", fontSize: "0.875rem", textDecoration: "none", transition: "color 0.2s" }}>
                {link.label}
              </Link>
            </motion.div>
          ))}
          <GlowButton href="/app" variant="primary">Open Console</GlowButton>
        </div>
      </motion.nav>

      {/* Hero */}
      <section style={{ position: "relative", overflow: "hidden", minHeight: "90vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        {/* Background Image */}
        <div style={{ position: "absolute", inset: 0, zIndex: 0 }}>
          <Image
            src={HERO_IMAGE}
            alt="Scales of justice"
            fill
            style={{ objectFit: "cover", objectPosition: "center 30%", opacity: 0.12 }}
            priority
            unoptimized
          />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(11,13,16,0.3) 0%, rgba(11,13,16,0.95) 80%, #0B0D10 100%)" }} />
        </div>

        {/* Particles */}
        <ParticleField />

        {/* Glow orbs */}
        <div style={{ position: "absolute", top: "20%", left: "15%", width: "300px", height: "300px", borderRadius: "50%", background: "radial-gradient(circle, rgba(198,156,93,0.08) 0%, transparent 70%)", filter: "blur(60px)", zIndex: 1 }} />
        <div style={{ position: "absolute", bottom: "20%", right: "10%", width: "400px", height: "400px", borderRadius: "50%", background: "radial-gradient(circle, rgba(14,76,79,0.1) 0%, transparent 70%)", filter: "blur(80px)", zIndex: 1 }} />

        <div style={{ maxWidth: "900px", margin: "0 auto", padding: "8rem 2rem 6rem", textAlign: "center", position: "relative", zIndex: 10 }}>
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}>
            <div style={{
              fontFamily: "var(--font-cinzel-decorative), serif",
              fontSize: "clamp(3.5rem, 9vw, 7rem)",
              fontWeight: 900,
              color: "#C69C5D",
              letterSpacing: "0.08em",
              lineHeight: 1.05,
              marginBottom: "1.5rem",
              textShadow: "0 0 80px rgba(198,156,93,0.3), 0 0 160px rgba(198,156,93,0.1)",
            }}>
              LEXORA
            </div>
          </motion.div>

          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0.5}
            style={{ display: "flex", justifyContent: "center", marginBottom: "1.5rem" }}>
            <div style={{ height: "1px", width: "120px", background: "linear-gradient(90deg, transparent, #C69C5D, transparent)" }} />
          </motion.div>

          <motion.p initial="hidden" animate="visible" variants={fadeUp} custom={1}
            style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "clamp(1rem, 2.5vw, 1.4rem)", color: "rgba(241,232,210,0.9)", marginBottom: "1rem", letterSpacing: "0.04em" }}>
            Framework-bound AI arbitration, powered by GenLayer consensus.
          </motion.p>
          <motion.p initial="hidden" animate="visible" variants={fadeUp} custom={2}
            style={{ fontSize: "1rem", color: "rgba(241,232,210,0.55)", maxWidth: "600px", margin: "0 auto 3rem", lineHeight: 1.7 }}>
            GenLayer validators independently review each case packet and produce structured, reasoned rulings — with evidence mapping, rule citations, and proportionate remedies. No single arbiter. No black box.
          </motion.p>
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={3} style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
            <GlowButton href="/app" variant="primary">OPEN CASE CONSOLE</GlowButton>
            <GlowButton href="/app/cases/new" variant="secondary">CREATE CASE</GlowButton>
            <GlowButton href="/app/playground" variant="ghost">Try Playground</GlowButton>
          </motion.div>
        </div>
      </section>

      {/* Stats Bar */}
      <section style={{ borderTop: "1px solid rgba(198,156,93,0.15)", borderBottom: "1px solid rgba(198,156,93,0.15)", background: "rgba(23,27,32,0.6)", backdropFilter: "blur(12px)" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "3rem 2rem", display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "2rem", textAlign: "center" }}>
          {STATS.map((stat, i) => (
            <motion.div key={stat.label} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={scaleIn} custom={i}>
              <div style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "2.5rem", color: "#C69C5D", lineHeight: 1, marginBottom: "0.5rem" }}>
                <AnimatedCounter value={stat.value} suffix={stat.suffix} />
              </div>
              <div style={{ fontSize: "0.8rem", color: "rgba(241,232,210,0.5)", letterSpacing: "0.08em", textTransform: "uppercase" }}>{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section style={{ maxWidth: "1100px", margin: "0 auto", padding: "7rem 2rem" }}>
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
            <motion.div
              key={step.step}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              custom={i * 0.08}
              whileHover={{ y: -6, borderColor: "rgba(198,156,93,0.3)", boxShadow: "0 8px 30px rgba(198,156,93,0.08)" }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              style={{ background: "#171B20", border: "1px solid rgba(241,232,210,0.08)", borderRadius: "4px", padding: "1.75rem", cursor: "default", transition: "border-color 0.3s, box-shadow 0.3s" }}
            >
              <div style={{ fontSize: "2rem", marginBottom: "0.75rem" }}>{step.icon}</div>
              <div style={{ fontFamily: "var(--font-ibm-plex-mono), monospace", fontSize: "0.7rem", color: "#C69C5D", marginBottom: "0.5rem", letterSpacing: "0.1em" }}>STEP {step.step}</div>
              <div style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "1rem", color: "#F1E8D2", marginBottom: "0.5rem" }}>{step.title}</div>
              <div style={{ fontSize: "0.875rem", color: "rgba(241,232,210,0.55)", lineHeight: 1.6 }}>{step.desc}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Visual Divider with Image */}
      <section style={{ position: "relative", height: "300px", overflow: "hidden" }}>
        <Image
          src={SECTION_IMAGES.howItWorks}
          alt="Legal documentation"
          fill
          style={{ objectFit: "cover", opacity: 0.15 }}
          unoptimized
        />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, #0B0D10 0%, transparent 30%, transparent 70%, #0E1418 100%)" }} />
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2 }}>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={scaleIn}
            style={{ textAlign: "center" }}>
            <div style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "1.5rem", color: "#C69C5D", marginBottom: "0.5rem" }}>
              Built on GenLayer
            </div>
            <div style={{ fontSize: "0.9rem", color: "rgba(241,232,210,0.5)" }}>
              AI-powered validator consensus for subjective dispute resolution
            </div>
          </motion.div>
        </div>
      </section>

      {/* Why GenLayer */}
      <section style={{ background: "#0E1418", padding: "7rem 2rem" }}>
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
              <motion.div
                key={item.title}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={slideInLeft}
                custom={i * 0.08}
                whileHover={{ x: 8, borderLeftColor: "#C69C5D" }}
                transition={{ type: "spring", stiffness: 300 }}
                style={{ borderLeft: "3px solid rgba(198,156,93,0.4)", paddingLeft: "1.25rem", cursor: "default", transition: "border-left-color 0.3s" }}
              >
                <div style={{ fontFamily: "var(--font-space-grotesk), sans-serif", fontWeight: 600, color: "#F1E8D2", marginBottom: "0.5rem" }}>{item.title}</div>
                <div style={{ fontSize: "0.875rem", color: "rgba(241,232,210,0.55)", lineHeight: 1.7 }}>{item.desc}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Framework Preview */}
      <section style={{ maxWidth: "1100px", margin: "0 auto", padding: "7rem 2rem" }}>
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
            <motion.div
              key={fw.frameworkId}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={scaleIn}
              custom={i * 0.12}
              whileHover={{ y: -8, boxShadow: "0 12px 40px rgba(198,156,93,0.12)" }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              style={{ background: "#171B20", border: "1px solid rgba(241,232,210,0.08)", borderRadius: "4px", overflow: "hidden", cursor: "default" }}
            >
              <div style={{ position: "relative", height: "140px", overflow: "hidden" }}>
                <Image
                  src={FRAMEWORK_IMAGES[i]}
                  alt={fw.title}
                  fill
                  style={{ objectFit: "cover", opacity: 0.25 }}
                  unoptimized
                />
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, transparent 0%, #171B20 90%)" }} />
                <div style={{ position: "absolute", bottom: "1rem", left: "1.5rem", fontSize: "2.5rem", zIndex: 2 }}>{fw.icon}</div>
              </div>
              <div style={{ padding: "1.25rem 1.5rem 1.5rem" }}>
                <div style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "1rem", color: "#C69C5D", marginBottom: "0.5rem" }}>{fw.title}</div>
                <div style={{ fontSize: "0.75rem", color: "rgba(241,232,210,0.4)", marginBottom: "1rem", letterSpacing: "0.05em" }}>{fw.category}</div>
                <div style={{ fontSize: "0.875rem", color: "rgba(241,232,210,0.68)", lineHeight: 1.6 }}>{fw.description.slice(0, 120)}...</div>
              </div>
            </motion.div>
          ))}
        </div>
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} style={{ textAlign: "center" }}>
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
            <Link href="/app/frameworks" style={{ border: "1px solid rgba(198,156,93,0.4)", color: "#C69C5D", padding: "0.75rem 2rem", borderRadius: "2px", textDecoration: "none", fontSize: "0.875rem", display: "inline-block", transition: "all 0.3s" }}>
              View All Frameworks →
            </Link>
          </motion.div>
        </motion.div>
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
      <footer style={{ borderTop: "1px solid rgba(241,232,210,0.08)", padding: "3rem 2rem", background: "rgba(23,27,32,0.4)" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "2rem" }}>
          <div>
            <div style={{ fontFamily: "var(--font-cinzel-decorative), serif", fontSize: "1rem", color: "#C69C5D", marginBottom: "0.5rem" }}>LEXORA</div>
            <div style={{ fontSize: "0.8rem", color: "rgba(241,232,210,0.4)" }}>Framework-bound AI arbitration on GenLayer.</div>
          </div>
          <div style={{ display: "flex", gap: "2rem" }}>
            {[
              { href: "/app", label: "Console" },
              { href: "/app/frameworks", label: "Frameworks" },
              { href: "/app/audit", label: "Transparency" },
              { href: "/app/playground", label: "Playground" },
            ].map(link => (
              <motion.div key={link.href} whileHover={{ y: -1, color: "#C69C5D" }}>
                <Link href={link.href} style={{ fontSize: "0.85rem", color: "rgba(241,232,210,0.5)", textDecoration: "none", transition: "color 0.2s" }}>
                  {link.label}
                </Link>
              </motion.div>
            ))}
          </div>
          <div style={{ fontSize: "0.75rem", color: "rgba(241,232,210,0.3)" }}>Advisory only. Not legal advice. © 2025 Lexora.</div>
        </div>
      </footer>
    </div>
  );
}
