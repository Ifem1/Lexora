"use client";

import CaseSpine from "@/components/layout/CaseSpine";
import ProceduralTopStrip from "@/components/layout/ProceduralTopStrip";
import DossierShell from "@/components/layout/DossierShell";
import RulingInspector from "@/components/layout/RulingInspector";
import ArbitrationConsole from "@/components/layout/ArbitrationConsole";
import { useState } from "react";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [consoleOpen, setConsoleOpen] = useState(false);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden", background: "#0B0D10" }}>
      {/* Top Strip */}
      <ProceduralTopStrip />

      {/* Main area */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* Left Spine */}
        <CaseSpine />

        {/* Center Dossier */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <DossierShell>{children}</DossierShell>

          {/* Bottom Console */}
          {consoleOpen && (
            <div style={{ flexShrink: 0 }}>
              <ArbitrationConsole defaultOpen={true} />
            </div>
          )}
        </div>

        {/* Right Inspector */}
        <RulingInspector />
      </div>
    </div>
  );
}
