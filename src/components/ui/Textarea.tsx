"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils/cn";

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  maxLength?: number;
  showCount?: boolean;
  rows?: number;
}

export default function Textarea({
  label,
  error,
  helperText,
  maxLength,
  showCount = true,
  rows = 4,
  className,
  id,
  value,
  defaultValue,
  onChange,
  ...props
}: TextareaProps) {
  const [charCount, setCharCount] = useState(
    typeof value === "string"
      ? value.length
      : typeof defaultValue === "string"
      ? defaultValue.length
      : 0
  );

  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCharCount(e.target.value.length);
    onChange?.(e);
  };

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="text-xs font-semibold uppercase tracking-widest"
          style={{ color: "rgba(241,232,210,0.6)", fontFamily: "Space Grotesk, sans-serif" }}
        >
          {label}
        </label>
      )}
      <textarea
        id={inputId}
        rows={rows}
        maxLength={maxLength}
        value={value}
        defaultValue={defaultValue}
        onChange={handleChange}
        className={cn(
          "w-full rounded-md text-sm outline-none transition-all duration-200",
          "px-3 py-2.5 resize-y",
          "placeholder:opacity-40",
          "focus:ring-1",
          className
        )}
        style={{
          backgroundColor: "#0B0D10",
          color: "#F1E8D2",
          border: error
            ? "1px solid #A94343"
            : "1px solid rgba(241,232,210,0.16)",
          fontFamily: "IBM Plex Sans, sans-serif",
          minHeight: `${rows * 24}px`,
        }}
        {...props}
      />
      <div className="flex items-start justify-between gap-2">
        <div>
          {error && (
            <p className="text-xs" style={{ color: "#A94343" }}>
              {error}
            </p>
          )}
          {helperText && !error && (
            <p className="text-xs" style={{ color: "rgba(241,232,210,0.4)" }}>
              {helperText}
            </p>
          )}
        </div>
        {showCount && maxLength && (
          <p
            className="text-xs shrink-0 ml-auto"
            style={{
              color:
                charCount > maxLength * 0.9
                  ? "#C58B3B"
                  : "rgba(241,232,210,0.35)",
            }}
          >
            {charCount}/{maxLength}
          </p>
        )}
      </div>
    </div>
  );
}
