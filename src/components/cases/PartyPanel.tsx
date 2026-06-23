"use client";

import React from "react";
import { User, CheckCircle2, Clock, Shield } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { ArbitrationCase } from "@/lib/genlayer/types";
import Badge from "@/components/ui/Badge";

interface PartyPanelProps {
  caseData: ArbitrationCase;
  connectedAddress?: string;
  className?: string;
  claimantEns?: string;
  respondentEns?: string;
}

function truncate(addr: string) {
  return addr.length > 12 ? `${addr.slice(0, 6)}…${addr.slice(-4)}` : addr;
}

interface PartyCardProps {
  role: "Claimant" | "Respondent";
  address: string;
  ens?: string;
  isConnected: boolean;
  submitted: boolean;
  accentColor: string;
}

function PartyCard({ role, address, ens, isConnected, submitted, accentColor }: PartyCardProps) {
  return (
    <div
      className="flex-1 rounded-lg p-4 flex flex-col gap-3"
      style={{
        backgroundColor: "#171B20",
        border: `1px solid ${accentColor}30`,
      }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center"
            style={{ backgroundColor: `${accentColor}18` }}
          >
            <User size={13} style={{ color: accentColor }} />
          </div>
          <span
            className="text-xs font-semibold uppercase tracking-widest"
            style={{ color: accentColor, fontFamily: "Space Grotesk, sans-serif" }}
          >
            {role}
          </span>
        </div>
        {isConnected && (
          <div className="flex items-center gap-1">
            <Shield size={10} style={{ color: "#648F70" }} />
            <span className="text-[10px]" style={{ color: "#648F70" }}>You</span>
          </div>
        )}
      </div>

      <div>
        {ens && (
          <p className="text-sm font-semibold" style={{ color: "#F1E8D2" }}>
            {ens}
          </p>
        )}
        <p
          className="text-xs"
          style={{
            color: "rgba(241,232,210,0.5)",
            fontFamily: "IBM Plex Mono, monospace",
          }}
        >
          {truncate(address)}
        </p>
      </div>

      <div className="flex items-center gap-1.5">
        {submitted ? (
          <>
            <CheckCircle2 size={12} style={{ color: "#648F70" }} />
            <span className="text-xs" style={{ color: "#648F70" }}>Submitted</span>
          </>
        ) : (
          <>
            <Clock size={12} style={{ color: "rgba(241,232,210,0.3)" }} />
            <span className="text-xs" style={{ color: "rgba(241,232,210,0.3)" }}>Pending</span>
          </>
        )}
      </div>
    </div>
  );
}

export default function PartyPanel({
  caseData,
  connectedAddress,
  className,
  claimantEns,
  respondentEns,
}: PartyPanelProps) {
  const isClaimant = connectedAddress?.toLowerCase() === caseData.claimant?.toLowerCase();
  const isRespondent = connectedAddress?.toLowerCase() === caseData.respondent?.toLowerCase();

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <p
        className="text-xs font-semibold uppercase tracking-widest"
        style={{ color: "rgba(241,232,210,0.4)", fontFamily: "Space Grotesk, sans-serif" }}
      >
        Parties
      </p>
      <div className="flex gap-3 flex-wrap sm:flex-nowrap">
        <PartyCard
          role="Claimant"
          address={caseData.claimant}
          ens={claimantEns}
          isConnected={isClaimant}
          submitted={!!caseData.claimHash}
          accentColor="#6B8FB3"
        />
        <PartyCard
          role="Respondent"
          address={caseData.respondent}
          ens={respondentEns}
          isConnected={isRespondent}
          submitted={!!caseData.responseHash}
          accentColor="#A94343"
        />
      </div>
    </div>
  );
}
