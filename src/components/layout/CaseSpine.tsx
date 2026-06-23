"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Scale,
  FolderOpen,
  PlusCircle,
  FlaskConical,
  BookOpen,
  Settings,
  Wallet,
  LogOut,
  ChevronRight,
  ChevronLeft,
  Activity,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { motion, AnimatePresence } from "framer-motion";

interface CaseSpineProps {
  walletAddress?: string;
  onDisconnect?: () => void;
  caseStatus?: string;
}

const navItems = [
  { href: "/app/cases", icon: FolderOpen, label: "Cases" },
  { href: "/app/cases/new", icon: PlusCircle, label: "New Case" },
  { href: "/app/playground", icon: FlaskConical, label: "Playground" },
  { href: "/app/frameworks", icon: BookOpen, label: "Frameworks" },
  { href: "/app/audit", icon: Activity, label: "Activity" },
  { href: "/app/settings", icon: Settings, label: "Settings" },
];

function truncateAddress(addr: string) {
  return addr.length > 10 ? `${addr.slice(0, 6)}…${addr.slice(-4)}` : addr;
}

export default function CaseSpine({
  walletAddress,
  onDisconnect,
  caseStatus,
}: CaseSpineProps) {
  const [expanded, setExpanded] = useState(false);
  const pathname = usePathname();

  return (
    <motion.aside
      animate={{ width: expanded ? 220 : 64 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="relative flex flex-col h-screen shrink-0 z-30 overflow-visible"
      style={{
        backgroundColor: "#0B0D10",
        borderRight: "1px solid rgba(241,232,210,0.10)",
      }}
    >
      {/* Logo */}
      <Link href="/" className="flex items-center h-14 px-4 shrink-0 gap-3" style={{ textDecoration: "none" }}>
        <div
          className="w-8 h-8 rounded flex items-center justify-center shrink-0"
          style={{ backgroundColor: "#C69C5D" }}
        >
          <Scale size={16} color="#0B0D10" />
        </div>
        <AnimatePresence>
          {expanded && (
            <motion.span
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              className="text-lg font-bold tracking-wider whitespace-nowrap overflow-hidden"
              style={{ color: "#C69C5D", fontFamily: "Cinzel Decorative, Cinzel, serif" }}
            >
              Lexora
            </motion.span>
          )}
        </AnimatePresence>
      </Link>

      {/* Toggle */}
      <button
        onClick={() => setExpanded((e) => !e)}
        className="absolute top-4 -right-3 w-6 h-6 rounded-full flex items-center justify-center z-40 transition-colors"
        style={{
          backgroundColor: "#171B20",
          border: "1px solid rgba(241,232,210,0.16)",
          color: "rgba(241,232,210,0.5)",
        }}
      >
        {expanded ? <ChevronLeft size={12} /> : <ChevronRight size={12} />}
      </button>

      {/* Nav */}
      <nav className="flex flex-col gap-0.5 mt-2 flex-1 px-2">
        {navItems.map(({ href, icon: Icon, label }) => {
          const isActive = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-md transition-all duration-150 relative group",
                expanded ? "px-3 py-2" : "px-2 py-2 justify-center"
              )}
              style={{
                color: isActive ? "#C69C5D" : "rgba(241,232,210,0.5)",
                backgroundColor: isActive ? "rgba(198,156,93,0.08)" : "transparent",
              }}
            >
              {isActive && (
                <span
                  className="absolute left-0 top-1 bottom-1 w-0.5 rounded-r"
                  style={{ backgroundColor: "#C69C5D" }}
                />
              )}
              <Icon size={18} className="shrink-0" />
              <AnimatePresence>
                {expanded && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-sm font-medium whitespace-nowrap overflow-hidden"
                    style={{ fontFamily: "Space Grotesk, sans-serif" }}
                  >
                    {label}
                  </motion.span>
                )}
              </AnimatePresence>
              {!expanded && (
                <span
                  className="absolute left-full ml-2 px-2 py-1 text-xs rounded pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50"
                  style={{
                    backgroundColor: "#171B20",
                    color: "#F1E8D2",
                    border: "1px solid rgba(241,232,210,0.16)",
                  }}
                >
                  {label}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Case status pill */}
      {caseStatus && (
        <div className="px-3 mb-2">
          <AnimatePresence>
            {expanded ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-[10px] font-semibold uppercase tracking-widest px-2 py-1 rounded text-center truncate"
                style={{
                  backgroundColor: "rgba(198,156,93,0.12)",
                  color: "#C69C5D",
                  border: "1px solid rgba(198,156,93,0.25)",
                }}
              >
                {caseStatus}
              </motion.div>
            ) : (
              <motion.div
                className="w-2 h-2 rounded-full mx-auto"
                style={{ backgroundColor: "#C69C5D" }}
              />
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Wallet */}
      {walletAddress && (
        <div
          className="flex items-center gap-2 px-3 py-3 shrink-0"
          style={{ borderTop: "1px solid rgba(241,232,210,0.10)" }}
        >
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
            style={{ backgroundColor: "rgba(198,156,93,0.15)" }}
          >
            <Wallet size={13} style={{ color: "#C69C5D" }} />
          </div>
          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 flex items-center justify-between overflow-hidden"
              >
                <span
                  className="text-xs truncate"
                  style={{ color: "rgba(241,232,210,0.6)", fontFamily: "IBM Plex Mono, monospace" }}
                >
                  {truncateAddress(walletAddress)}
                </span>
                {onDisconnect && (
                  <button
                    onClick={onDisconnect}
                    className="ml-2 shrink-0 transition-opacity hover:opacity-80"
                    style={{ color: "#A94343" }}
                  >
                    <LogOut size={13} />
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </motion.aside>
  );
}
