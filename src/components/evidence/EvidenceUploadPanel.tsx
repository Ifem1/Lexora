"use client";

import React, { useState, useRef } from "react";
import { Upload, Link, Hash } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { motion } from "framer-motion";
import type { EvidenceType } from "@/lib/genlayer/types";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";

const EVIDENCE_TYPE_OPTIONS: { value: EvidenceType; label: string }[] = [
  { value: "CONTRACT", label: "Contract / Agreement" },
  { value: "MESSAGE", label: "Message / Communication" },
  { value: "SCREENSHOT", label: "Screenshot" },
  { value: "INVOICE", label: "Invoice" },
  { value: "DELIVERY_FILE", label: "Delivery File" },
  { value: "PAYMENT_PROOF", label: "Payment Proof" },
  { value: "TIMELINE", label: "Timeline" },
  { value: "WITNESS_STATEMENT", label: "Witness Statement" },
  { value: "OTHER", label: "Other" },
];

interface EvidenceUploadPanelProps {
  onSubmit?: (data: {
    evidenceType: EvidenceType;
    title: string;
    summary: string;
    fileHash?: string;
    sourceUrl?: string;
    relevanceTag?: string;
  }) => void | Promise<void>;
  submitting?: boolean;
  className?: string;
}

async function hashFile(file: File): Promise<string> {
  const buf = await file.arrayBuffer();
  const digest = await crypto.subtle.digest("SHA-256", buf);
  return "0x" + Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

export default function EvidenceUploadPanel({ onSubmit, submitting, className }: EvidenceUploadPanelProps) {
  const [evidenceType, setEvidenceType] = useState<EvidenceType>("CONTRACT");
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [relevanceTag, setRelevanceTag] = useState("");
  const [fileHash, setFileHash] = useState<string | undefined>();
  const [fileName, setFileName] = useState<string | undefined>();
  const [hashing, setHashing] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setHashing(true);
    try {
      const hash = await hashFile(file);
      setFileHash(hash);
      setFileName(file.name);
    } finally {
      setHashing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit?.({
      evidenceType,
      title,
      summary,
      fileHash,
      sourceUrl: sourceUrl || undefined,
      relevanceTag: relevanceTag || undefined,
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={cn("flex flex-col gap-4 rounded-lg p-5", className)}
      style={{
        backgroundColor: "#171B20",
        border: "1px solid rgba(241,232,210,0.16)",
      }}
    >
      <p
        className="text-xs font-semibold uppercase tracking-widest"
        style={{ color: "rgba(241,232,210,0.5)", fontFamily: "Space Grotesk, sans-serif" }}
      >
        Add Evidence
      </p>

      <Select
        label="Evidence Type"
        options={EVIDENCE_TYPE_OPTIONS}
        value={evidenceType}
        onChange={(e) => setEvidenceType(e.target.value as EvidenceType)}
      />

      <Input
        label="Title"
        placeholder="E.g. Original Service Agreement"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />

      <Textarea
        label="Summary"
        placeholder="Brief description of this evidence and its relevance..."
        rows={3}
        maxLength={600}
        value={summary}
        onChange={(e) => setSummary(e.target.value)}
        required
      />

      <Input
        label="Relevance Tag (optional)"
        placeholder="E.g. Supports non-delivery claim"
        value={relevanceTag}
        onChange={(e) => setRelevanceTag(e.target.value)}
      />

      {/* File upload */}
      <div className="flex flex-col gap-1.5">
        <span
          className="text-xs font-semibold uppercase tracking-widest"
          style={{ color: "rgba(241,232,210,0.6)", fontFamily: "Space Grotesk, sans-serif" }}
        >
          File (optional — hashed locally)
        </span>
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="flex items-center gap-3 rounded-md px-3 py-3 text-sm transition-colors"
          style={{
            backgroundColor: "rgba(241,232,210,0.04)",
            border: "1px dashed rgba(241,232,210,0.18)",
            color: "rgba(241,232,210,0.45)",
          }}
        >
          <Upload size={15} />
          {hashing ? "Hashing..." : fileName ?? "Choose file to hash"}
        </button>
        <input ref={fileRef} type="file" className="hidden" onChange={handleFile} />
        {fileHash && (
          <div className="flex items-center gap-2 px-2 py-1.5 rounded" style={{ backgroundColor: "rgba(100,143,112,0.08)" }}>
            <Hash size={11} style={{ color: "#648F70" }} />
            <span className="text-[10px] font-mono truncate" style={{ color: "#648F70", fontFamily: "IBM Plex Mono, monospace" }}>
              {fileHash}
            </span>
          </div>
        )}
      </div>

      <Input
        label="Source URL (optional)"
        placeholder="https://..."
        value={sourceUrl}
        onChange={(e) => setSourceUrl(e.target.value)}
        leftIcon={<Link size={13} />}
      />

      <Button
        type="submit"
        variant="primary"
        size="md"
        loading={submitting || hashing}
        className="mt-1"
        disabled={!title || !summary}
      >
        Submit Evidence
      </Button>
    </form>
  );
}
