"use client";

import React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils/cn";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "success";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
}

const variantStyles: Record<ButtonVariant, React.CSSProperties & { className: string }> = {
  primary: {
    className: "font-semibold border transition-all duration-200 hover:opacity-90 active:scale-95",
    backgroundColor: "#C69C5D",
    color: "#0B0D10",
    borderColor: "#C69C5D",
  },
  secondary: {
    className: "font-semibold border transition-all duration-200 hover:opacity-80 active:scale-95",
    backgroundColor: "transparent",
    color: "#F1E8D2",
    borderColor: "rgba(241,232,210,0.4)",
  },
  ghost: {
    className: "font-semibold border border-transparent transition-all duration-200 active:scale-95",
    backgroundColor: "transparent",
    color: "#F1E8D2",
  },
  danger: {
    className: "font-semibold border transition-all duration-200 hover:opacity-90 active:scale-95",
    backgroundColor: "#7D1F2A",
    color: "#F1E8D2",
    borderColor: "#A94343",
  },
  success: {
    className: "font-semibold border transition-all duration-200 hover:opacity-90 active:scale-95",
    backgroundColor: "#0E4C4F",
    color: "#F1E8D2",
    borderColor: "#648F70",
  },
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-xs rounded",
  md: "px-4 py-2 text-sm rounded-md",
  lg: "px-6 py-3 text-base rounded-lg",
};

export default function Button({
  variant = "primary",
  size = "md",
  loading = false,
  icon,
  iconPosition = "left",
  children,
  className,
  disabled,
  style,
  ...props
}: ButtonProps) {
  const { className: variantClassName, ...variantStyle } = variantStyles[variant];

  return (
    <button
      disabled={disabled || loading}
      className={cn(
        "inline-flex items-center justify-center gap-2 select-none cursor-pointer",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        variantClassName,
        sizeStyles[size],
        className
      )}
      style={{ ...variantStyle, ...style }}
      {...props}
    >
      {loading ? (
        <Loader2 size={14} className="animate-spin" />
      ) : (
        icon && iconPosition === "left" && <span className="shrink-0">{icon}</span>
      )}
      {children}
      {!loading && icon && iconPosition === "right" && (
        <span className="shrink-0">{icon}</span>
      )}
    </button>
  );
}
