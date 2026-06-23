"use client";

import { motion } from "framer-motion";

export function Skeleton({ width = "100%", height = "1rem", borderRadius = "2px" }: { width?: string; height?: string; borderRadius?: string }) {
  return (
    <motion.div
      animate={{ opacity: [0.3, 0.6, 0.3] }}
      transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
      style={{
        width,
        height,
        borderRadius,
        background: "linear-gradient(90deg, rgba(241,232,210,0.04) 0%, rgba(241,232,210,0.08) 50%, rgba(241,232,210,0.04) 100%)",
      }}
    />
  );
}

export function CardSkeleton() {
  return (
    <div style={{ background: "#171B20", border: "1px solid rgba(241,232,210,0.08)", borderRadius: "4px", padding: "1.25rem 1.5rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", flex: 1 }}>
          <Skeleton width="60%" height="1.1rem" />
          <Skeleton width="40%" height="0.75rem" />
        </div>
        <Skeleton width="100px" height="1.5rem" borderRadius="2px" />
      </div>
    </div>
  );
}

export function StatSkeleton() {
  return (
    <div style={{ background: "#171B20", border: "1px solid rgba(241,232,210,0.08)", borderRadius: "4px", padding: "1.5rem" }}>
      <Skeleton width="80px" height="0.7rem" />
      <div style={{ marginTop: "0.75rem" }}>
        <Skeleton width="60px" height="2rem" />
      </div>
      <div style={{ marginTop: "0.5rem" }}>
        <Skeleton width="50px" height="0.65rem" />
      </div>
    </div>
  );
}
