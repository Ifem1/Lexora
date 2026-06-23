"use client";

import { useState } from "react";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { injected } from "wagmi/connectors";
import { MAIN_DISCLAIMER } from "@/lib/arbitration/disclaimers";

export default function SettingsPage() {
  const { address, isConnected, chain } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();
  const [devMode, setDevMode] = useState(true);

  return (
    <div style={{ maxWidth: "780px", margin: "0 auto", padding: "2rem" }}>
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "1.75rem", color: "#C69C5D", letterSpacing: "0.08em", marginBottom: "0.25rem" }}>
          Settings
        </h1>
        <p style={{ fontSize: "0.875rem", color: "rgba(241,232,210,0.5)" }}>Configure wallet, GenLayer connection, and dev tools.</p>
      </div>

      {/* Wallet Section */}
      <section style={{ background: "#171B20", border: "1px solid rgba(241,232,210,0.08)", borderRadius: "4px", padding: "1.5rem", marginBottom: "1.5rem" }}>
        <div style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "0.9rem", color: "#F1E8D2", marginBottom: "1.25rem", letterSpacing: "0.04em" }}>Wallet</div>

        {isConnected ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <SettingRow label="Connected Address">
                <span style={{ fontFamily: "var(--font-ibm-plex-mono), monospace", fontSize: "0.8rem", color: "#648F70" }}>{address}</span>
              </SettingRow>
              <SettingRow label="Network">
                <span style={{ fontFamily: "var(--font-ibm-plex-mono), monospace", fontSize: "0.8rem", color: "#C69C5D" }}>{chain?.name ?? "Unknown"} (Chain ID: {chain?.id})</span>
              </SettingRow>
            </div>
            <div>
              <button onClick={() => disconnect()}
                style={{ background: "rgba(169,67,67,0.15)", border: "1px solid rgba(169,67,67,0.4)", color: "#A94343", padding: "0.5rem 1.25rem", borderRadius: "2px", cursor: "pointer", fontSize: "0.875rem" }}>
                Disconnect Wallet
              </button>
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ fontSize: "0.875rem", color: "rgba(241,232,210,0.55)" }}>No wallet connected. Connect to interact with GenLayer.</div>
            <button onClick={() => connect({ connector: injected() })}
              style={{ background: "#C69C5D", color: "#0B0D10", padding: "0.5rem 1.25rem", borderRadius: "2px", border: "none", fontWeight: 700, cursor: "pointer", fontSize: "0.875rem" }}>
              Connect Wallet
            </button>
          </div>
        )}
      </section>

      {/* GenLayer Section */}
      <section style={{ background: "#171B20", border: "1px solid rgba(241,232,210,0.08)", borderRadius: "4px", padding: "1.5rem", marginBottom: "1.5rem" }}>
        <div style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "0.9rem", color: "#F1E8D2", marginBottom: "1.25rem", letterSpacing: "0.04em" }}>GenLayer</div>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <SettingRow label="Contract Address">
            <span style={{ fontFamily: "var(--font-ibm-plex-mono), monospace", fontSize: "0.8rem", color: "rgba(241,232,210,0.4)" }}>
              {process.env.NEXT_PUBLIC_CONTRACT_ADDRESS ?? "Not configured (dev mode active)"}
            </span>
          </SettingRow>
          <SettingRow label="Network Mode">
            <span style={{ fontFamily: "var(--font-ibm-plex-mono), monospace", fontSize: "0.8rem", color: "#C69C5D" }}>GenLayer Testnet</span>
          </SettingRow>
          <SettingRow label="RPC Endpoint">
            <span style={{ fontFamily: "var(--font-ibm-plex-mono), monospace", fontSize: "0.75rem", color: "rgba(241,232,210,0.4)" }}>https://rpc.testnet.genlayer.com</span>
          </SettingRow>
          <SettingRow label="Status">
            <span style={{ fontSize: "0.75rem", background: "rgba(198,156,93,0.15)", color: "#C69C5D", border: "1px solid rgba(198,156,93,0.3)", padding: "0.15rem 0.6rem", borderRadius: "2px", fontFamily: "var(--font-ibm-plex-mono), monospace" }}>TESTNET</span>
          </SettingRow>
        </div>
      </section>

      {/* Dev Tools */}
      <section style={{ background: "#171B20", border: "1px solid rgba(241,232,210,0.08)", borderRadius: "4px", padding: "1.5rem", marginBottom: "1.5rem" }}>
        <div style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "0.9rem", color: "#F1E8D2", marginBottom: "1.25rem", letterSpacing: "0.04em" }}>Dev Tools</div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: "0.875rem", color: "#F1E8D2", marginBottom: "0.25rem" }}>Dev Fallback Mode</div>
            <div style={{ fontSize: "0.8rem", color: "rgba(241,232,210,0.45)" }}>Use mock data instead of live GenLayer contract. Required when no contract is deployed.</div>
          </div>
          <button
            onClick={() => setDevMode(prev => !prev)}
            style={{ width: "48px", height: "26px", borderRadius: "13px", border: "none", cursor: "pointer", background: devMode ? "#C69C5D" : "rgba(241,232,210,0.15)", position: "relative", transition: "background 0.2s", flexShrink: 0 }}
          >
            <div style={{ position: "absolute", top: "3px", left: devMode ? "25px" : "3px", width: "20px", height: "20px", borderRadius: "50%", background: devMode ? "#0B0D10" : "rgba(241,232,210,0.5)", transition: "left 0.2s" }} />
          </button>
        </div>
        <div style={{ marginTop: "0.75rem", fontFamily: "var(--font-ibm-plex-mono), monospace", fontSize: "0.75rem", color: devMode ? "#C69C5D" : "rgba(241,232,210,0.35)" }}>
          Dev mode: {devMode ? "ENABLED" : "DISABLED"}
        </div>
      </section>

      {/* About */}
      <section style={{ background: "#171B20", border: "1px solid rgba(241,232,210,0.08)", borderRadius: "4px", padding: "1.5rem", marginBottom: "1.5rem" }}>
        <div style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "0.9rem", color: "#F1E8D2", marginBottom: "1.25rem", letterSpacing: "0.04em" }}>About</div>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <SettingRow label="Version"><span style={{ fontFamily: "var(--font-ibm-plex-mono), monospace", fontSize: "0.8rem", color: "rgba(241,232,210,0.55)" }}>0.1.0-alpha</span></SettingRow>
          <SettingRow label="Build"><span style={{ fontFamily: "var(--font-ibm-plex-mono), monospace", fontSize: "0.8rem", color: "rgba(241,232,210,0.55)" }}>Next.js 15 + GenLayer + Wagmi</span></SettingRow>
          <SettingRow label="Environment"><span style={{ fontFamily: "var(--font-ibm-plex-mono), monospace", fontSize: "0.8rem", color: "rgba(241,232,210,0.55)" }}>{process.env.NODE_ENV}</span></SettingRow>
        </div>
      </section>

      {/* Disclaimer */}
      <div style={{ background: "rgba(125,31,42,0.08)", border: "1px solid rgba(125,31,42,0.2)", borderRadius: "4px", padding: "1.25rem" }}>
        <div style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "0.65rem", color: "#7D1F2A", letterSpacing: "0.1em", marginBottom: "0.75rem" }}>DISCLAIMER</div>
        <div style={{ fontSize: "0.75rem", color: "rgba(241,232,210,0.4)", lineHeight: 1.8 }}>{MAIN_DISCLAIMER}</div>
      </div>
    </div>
  );
}

function SettingRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem", paddingBottom: "0.5rem", borderBottom: "1px solid rgba(241,232,210,0.05)" }}>
      <div style={{ fontSize: "0.75rem", color: "rgba(241,232,210,0.45)", flexShrink: 0, minWidth: "140px", fontFamily: "var(--font-ibm-plex-mono), monospace", letterSpacing: "0.04em" }}>{label}</div>
      <div style={{ flex: 1, textAlign: "right" }}>{children}</div>
    </div>
  );
}
