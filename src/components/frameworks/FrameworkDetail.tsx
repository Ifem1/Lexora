"use client";

import React, { useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  BookOpen,
  Scale,
  Lightbulb,
  FileCheck,
  Award,
  Shield,
  XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { motion, AnimatePresence } from "framer-motion";
import type { ArbitrationFramework } from "@/lib/genlayer/types";
import Badge from "@/components/ui/Badge";

interface FrameworkDetailProps {
  framework: ArbitrationFramework;
  className?: string;
}

interface AccordionSectionProps {
  title: string;
  icon: React.ElementType;
  iconColor: string;
  items: string[];
  defaultOpen?: boolean;
}

function AccordionSection({ title, icon: Icon, iconColor, items, defaultOpen = false }: AccordionSectionProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div style={{ borderBottom: "1px solid rgba(241,232,210,0.08)" }}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-3 py-3 px-4 text-left transition-opacity hover:opacity-80"
      >
        <Icon size={14} style={{ color: iconColor }} />
        <span className="flex-1 text-sm font-semibold" style={{ color: "#F1E8D2", fontFamily: "Space Grotesk, sans-serif" }}>
          {title}
        </span>
        <span className="text-[10px] mr-2" style={{ color: "rgba(241,232,210,0.3)" }}>
          {items.length}
        </span>
        {open ? (
          <ChevronDown size={14} style={{ color: "rgba(241,232,210,0.35)" }} />
        ) : (
          <ChevronRight size={14} style={{ color: "rgba(241,232,210,0.35)" }} />
        )}
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 flex flex-col gap-2">
              {items.map((item, i) => (
                <div key={i} className="flex items-start gap-2">
                  <div
                    className="w-1 h-1 rounded-full shrink-0 mt-1.5"
                    style={{ backgroundColor: iconColor + "80" }}
                  />
                  <p className="text-xs" style={{ color: "rgba(241,232,210,0.55)" }}>
                    {item}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function FrameworkDetail({ framework, className }: FrameworkDetailProps) {
  return (
    <div className={cn("flex flex-col gap-0 rounded-lg overflow-hidden", className)} style={{ backgroundColor: "#171B20", border: "1px solid rgba(241,232,210,0.14)" }}>
      {/* Header */}
      <div className="p-5 flex items-start gap-4" style={{ borderBottom: "1px solid rgba(241,232,210,0.1)" }}>
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0"
          style={{ backgroundColor: "rgba(198,156,93,0.1)" }}
        >
          {framework.icon || <Scale size={20} style={{ color: "#C69C5D" }} />}
        </div>
        <div className="flex flex-col gap-1.5">
          <h2 className="text-lg font-bold" style={{ color: "#F1E8D2", fontFamily: "Cinzel, serif" }}>
            {framework.title}
          </h2>
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="framework">{framework.category}</Badge>
            <span className="text-xs" style={{ color: "rgba(241,232,210,0.35)" }}>
              Burden: <strong style={{ color: "#C69C5D" }}>{framework.burdenOfProof}</strong>
            </span>
          </div>
          <p className="text-xs" style={{ color: "rgba(241,232,210,0.5)" }}>
            {framework.description}
          </p>
        </div>
      </div>

      {/* Accordion sections */}
      <AccordionSection
        title="Principles"
        icon={BookOpen}
        iconColor="#C69C5D"
        items={framework.principles}
        defaultOpen
      />
      <AccordionSection
        title="Decision Factors"
        icon={Lightbulb}
        iconColor="#6B8FB3"
        items={framework.decisionFactors}
      />
      <AccordionSection
        title="Remedy Options"
        icon={Award}
        iconColor="#648F70"
        items={framework.remedyOptions}
      />
      <AccordionSection
        title="Evidence Rules"
        icon={FileCheck}
        iconColor="#C58B3B"
        items={framework.evidenceRules}
      />
      <AccordionSection
        title="Excluded Matters"
        icon={XCircle}
        iconColor="#A94343"
        items={framework.excludedMatters}
      />
    </div>
  );
}
