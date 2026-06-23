"use client";

import React, { useState, useMemo } from "react";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { ArbitrationFramework } from "@/lib/genlayer/types";
import FrameworkCard from "./FrameworkCard";
import Input from "@/components/ui/Input";
import EmptyState from "@/components/ui/EmptyState";

interface FrameworkSelectorProps {
  frameworks: ArbitrationFramework[];
  selectedId?: string;
  onSelect?: (framework: ArbitrationFramework) => void;
  onViewDetail?: (framework: ArbitrationFramework) => void;
  className?: string;
}

export default function FrameworkSelector({
  frameworks,
  selectedId,
  onSelect,
  onViewDetail,
  className,
}: FrameworkSelectorProps) {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");

  const categories = useMemo(
    () => ["ALL", ...Array.from(new Set(frameworks.map((f) => f.category)))],
    [frameworks]
  );

  const filtered = useMemo(
    () =>
      frameworks.filter((f) => {
        const matchSearch =
          !search ||
          f.title.toLowerCase().includes(search.toLowerCase()) ||
          f.description.toLowerCase().includes(search.toLowerCase()) ||
          f.category.toLowerCase().includes(search.toLowerCase());
        const matchCategory =
          categoryFilter === "ALL" || f.category === categoryFilter;
        return matchSearch && matchCategory;
      }),
    [frameworks, search, categoryFilter]
  );

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      {/* Search + filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex-1">
          <Input
            placeholder="Search frameworks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Search size={13} />}
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className="px-2.5 py-1 rounded text-xs font-medium transition-all"
              style={{
                backgroundColor:
                  categoryFilter === cat
                    ? "rgba(198,156,93,0.15)"
                    : "rgba(241,232,210,0.05)",
                color:
                  categoryFilter === cat ? "#C69C5D" : "rgba(241,232,210,0.4)",
                border:
                  categoryFilter === cat
                    ? "1px solid rgba(198,156,93,0.3)"
                    : "1px solid transparent",
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <EmptyState
          title="No Frameworks Found"
          description="Try a different search or category filter."
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((fw) => (
            <FrameworkCard
              key={fw.frameworkId}
              framework={fw}
              selected={fw.frameworkId === selectedId}
              onSelect={onSelect}
              onViewDetail={onViewDetail}
            />
          ))}
        </div>
      )}
    </div>
  );
}
