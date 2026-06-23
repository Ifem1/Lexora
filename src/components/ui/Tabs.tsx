"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils/cn";
import { motion } from "framer-motion";

interface Tab {
  id: string;
  label: string;
  icon?: React.ReactNode;
  badge?: string | number;
}

interface TabsProps {
  tabs: Tab[];
  activeTab?: string;
  onTabChange?: (tabId: string) => void;
  className?: string;
  children?: React.ReactNode;
}

export default function Tabs({
  tabs,
  activeTab: controlledActive,
  onTabChange,
  className,
  children,
}: TabsProps) {
  const [internalActive, setInternalActive] = useState(tabs[0]?.id ?? "");
  const active = controlledActive ?? internalActive;

  const handleTabChange = (id: string) => {
    setInternalActive(id);
    onTabChange?.(id);
  };

  return (
    <div className={cn("flex flex-col", className)}>
      <div
        className="flex items-end gap-0 border-b"
        style={{ borderColor: "rgba(241,232,210,0.12)" }}
      >
        {tabs.map((tab) => {
          const isActive = tab.id === active;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className="relative px-4 py-2.5 text-sm flex items-center gap-2 transition-colors duration-150 select-none"
              style={{
                color: isActive ? "#C69C5D" : "rgba(241,232,210,0.5)",
                fontFamily: "Space Grotesk, sans-serif",
                fontWeight: isActive ? 600 : 400,
              }}
            >
              {tab.icon && <span>{tab.icon}</span>}
              {tab.label}
              {tab.badge !== undefined && (
                <span
                  className="text-[10px] px-1.5 py-0.5 rounded-full font-semibold"
                  style={{
                    backgroundColor: isActive
                      ? "rgba(198,156,93,0.2)"
                      : "rgba(241,232,210,0.08)",
                    color: isActive ? "#C69C5D" : "rgba(241,232,210,0.4)",
                  }}
                >
                  {tab.badge}
                </span>
              )}
              {isActive && (
                <motion.div
                  layoutId="tab-underline"
                  className="absolute bottom-0 left-0 right-0 h-0.5 rounded-t"
                  style={{ backgroundColor: "#C69C5D" }}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
            </button>
          );
        })}
      </div>
      {children && <div className="mt-4">{children}</div>}
    </div>
  );
}
