"use client";

import React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "children"> {
  label?: string;
  error?: string;
  helperText?: string;
  options: SelectOption[];
  placeholder?: string;
}

export default function Select({
  label,
  error,
  helperText,
  options,
  placeholder,
  className,
  id,
  ...props
}: SelectProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

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
      <div className="relative">
        <select
          id={inputId}
          className={cn(
            "w-full rounded-md text-sm outline-none transition-all duration-200",
            "px-3 py-2.5 pr-9 appearance-none cursor-pointer",
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
          }}
          {...props}
        >
          {placeholder && (
            <option value="" disabled style={{ backgroundColor: "#171B20" }}>
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option
              key={opt.value}
              value={opt.value}
              style={{ backgroundColor: "#171B20", color: "#F1E8D2" }}
            >
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown
          size={14}
          className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
          style={{ color: "rgba(241,232,210,0.4)" }}
        />
      </div>
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
  );
}
