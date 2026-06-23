"use client";

import React from "react";
import { cn } from "@/lib/utils/cn";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export default function Input({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  className,
  id,
  ...props
}: InputProps) {
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
      <div className="relative flex items-center">
        {leftIcon && (
          <span
            className="absolute left-3 flex items-center pointer-events-none"
            style={{ color: "rgba(241,232,210,0.4)" }}
          >
            {leftIcon}
          </span>
        )}
        <input
          id={inputId}
          className={cn(
            "w-full rounded-md text-sm outline-none transition-all duration-200",
            "py-2.5",
            leftIcon ? "pl-9" : "pl-3",
            rightIcon ? "pr-9" : "pr-3",
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
            // @ts-expect-error css var
            "--tw-ring-color": "#C69C5D",
          }}
          {...props}
        />
        {rightIcon && (
          <span
            className="absolute right-3 flex items-center pointer-events-none"
            style={{ color: "rgba(241,232,210,0.4)" }}
          >
            {rightIcon}
          </span>
        )}
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
