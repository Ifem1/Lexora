"use client";

import React, { useState } from "react";
import { CheckCircle2, AlertOctagon, Clock, X } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { motion, AnimatePresence } from "framer-motion";
import Button from "@/components/ui/Button";

interface AppealActionsProps {
  onAccept?: () => void | Promise<void>;
  onAppeal?: () => void | Promise<void>;
  deadlineAt?: number;
  acceptLoading?: boolean;
  appealLoading?: boolean;
  className?: string;
}

function formatDeadline(ts: number) {
  return new Date(ts).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AppealActions({
  onAccept,
  onAppeal,
  deadlineAt,
  acceptLoading,
  appealLoading,
  className,
}: AppealActionsProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleConfirmAccept = async () => {
    await onAccept?.();
    setConfirmOpen(false);
  };

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      {deadlineAt && (
        <div className="flex items-center gap-2">
          <Clock size={12} style={{ color: "rgba(241,232,210,0.35)" }} />
          <span className="text-xs" style={{ color: "rgba(241,232,210,0.4)" }}>
            Action deadline: <strong style={{ color: "#C58B3B" }}>{formatDeadline(deadlineAt)}</strong>
          </span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          variant="success"
          size="md"
          icon={<CheckCircle2 size={15} />}
          loading={acceptLoading}
          onClick={() => setConfirmOpen(true)}
          className="flex-1"
        >
          Accept Ruling
        </Button>
        <Button
          variant="danger"
          size="md"
          icon={<AlertOctagon size={15} />}
          loading={appealLoading}
          onClick={onAppeal}
          className="flex-1"
        >
          Appeal Ruling
        </Button>
      </div>

      {/* Confirmation modal */}
      <AnimatePresence>
        {confirmOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ backgroundColor: "rgba(0,0,0,0.7)" }}
          >
            <motion.div
              initial={{ scale: 0.94, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.94, opacity: 0 }}
              className="rounded-xl p-6 flex flex-col gap-5 w-full max-w-sm relative"
              style={{
                backgroundColor: "#171B20",
                border: "1px solid rgba(100,143,112,0.3)",
                boxShadow: "0 24px 64px rgba(0,0,0,0.6)",
              }}
            >
              <button
                onClick={() => setConfirmOpen(false)}
                className="absolute top-4 right-4"
                style={{ color: "rgba(241,232,210,0.3)" }}
              >
                <X size={16} />
              </button>
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: "rgba(100,143,112,0.15)" }}
                >
                  <CheckCircle2 size={20} style={{ color: "#648F70" }} />
                </div>
                <div>
                  <h3 className="text-base font-semibold" style={{ color: "#F1E8D2", fontFamily: "Cinzel, serif" }}>
                    Accept Ruling?
                  </h3>
                  <p className="text-xs" style={{ color: "rgba(241,232,210,0.45)" }}>
                    This action is final and cannot be undone.
                  </p>
                </div>
              </div>
              <p className="text-sm" style={{ color: "rgba(241,232,210,0.6)" }}>
                By accepting, you agree to abide by the ruling and waive your right to appeal.
              </p>
              <div className="flex gap-3">
                <Button variant="ghost" size="md" className="flex-1" onClick={() => setConfirmOpen(false)}>
                  Cancel
                </Button>
                <Button
                  variant="success"
                  size="md"
                  className="flex-1"
                  loading={acceptLoading}
                  onClick={handleConfirmAccept}
                >
                  Confirm Accept
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
