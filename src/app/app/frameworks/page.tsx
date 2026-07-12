"use client";

import { useState } from "react";
import FrameworkSelector from "@/components/frameworks/FrameworkSelector";
import FrameworkDetail from "@/components/frameworks/FrameworkDetail";
import { FRAMEWORKS } from "@/lib/arbitration/frameworks";
import { motion, AnimatePresence } from "framer-motion";
import type { ArbitrationFramework } from "@/lib/genlayer/types";

export default function FrameworksPage() {
  const [selected, setSelected] = useState<ArbitrationFramework | null>(null);

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "2rem" }}>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ marginBottom: "2.5rem" }}
      >
        <h1 style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "1.75rem", color: "#C69C5D", letterSpacing: "0.08em", marginBottom: "0.5rem" }}>
          Arbitration Framework Library
        </h1>
        <p style={{ fontSize: "0.9rem", color: "rgba(241,232,210,0.55)", maxWidth: "700px", lineHeight: 1.7 }}>
          Each framework encodes domain-specific principles, evidence rules, decision factors, and remedy options. GenLayer validators apply the selected framework when reviewing your case — the framework defines what can be adjudicated, how evidence is weighted, and what outcomes are possible.
        </p>
      </motion.div>

      {/* Info Banner */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5 }}
        whileHover={{ borderColor: "rgba(14,76,79,0.6)" }}
        style={{ background: "rgba(14,76,79,0.12)", border: "1px solid rgba(14,76,79,0.35)", borderRadius: "4px", padding: "1.25rem 1.5rem", marginBottom: "2.5rem", display: "flex", gap: "1rem", alignItems: "flex-start", transition: "border-color 0.3s" }}
      >
        <div style={{ fontSize: "1.25rem", flexShrink: 0 }}>📋</div>
        <div>
          <div style={{ fontFamily: "var(--font-space-grotesk), sans-serif", fontWeight: 600, marginBottom: "0.25rem", fontSize: "0.9rem" }}>
            How Framework Selection Works
          </div>
          <div style={{ fontSize: "0.8rem", color: "rgba(241,232,210,0.55)", lineHeight: 1.6 }}>
            Frameworks are selected when creating a case and cannot be changed after both parties have submitted. The framework determines which rules apply, which party bears the burden of proof, what evidence is admissible, and what remedies are available. Select the framework that most closely matches your dispute type.
          </div>
        </div>
      </motion.div>

      {/* Framework Grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <FrameworkSelector frameworks={FRAMEWORKS} selectedId={selected?.frameworkId} onSelect={setSelected} />
      </motion.div>

      {/* Framework Detail */}
      <AnimatePresence mode="wait">
        {selected && (
          <motion.div
            key={selected.frameworkId}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4 }}
            style={{ marginTop: "2.5rem" }}
          >
            <div style={{ height: "1px", background: "rgba(198,156,93,0.2)", marginBottom: "2.5rem" }} />
            <FrameworkDetail framework={selected} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
