"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ChevronRight, ChevronLeft, Check, FileText, BookOpen, Paperclip } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { motion, AnimatePresence } from "framer-motion";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";

const CATEGORIES = [
  { value: "SERVICE_DISPUTE", label: "Service Dispute" },
  { value: "PAYMENT_DISPUTE", label: "Payment Dispute" },
  { value: "DELIVERY_DISPUTE", label: "Delivery Dispute" },
  { value: "BREACH_OF_CONTRACT", label: "Breach of Contract" },
  { value: "IP_DISPUTE", label: "IP Dispute" },
  { value: "OTHER", label: "Other" },
];

const step1Schema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  category: z.string().min(1, "Category is required"),
  respondent: z.string().min(42, "Enter a valid Ethereum address").max(42),
  responseDeadlineDays: z.number().min(1).max(30),
});

const step2Schema = z.object({
  frameworkId: z.string().min(1, "Select a framework"),
  claimSummary: z.string().min(20, "Provide at least 20 characters for your claim"),
  requestedRemedy: z.string().min(5, "Describe the remedy you seek"),
});

const step3Schema = z.object({
  evidenceTitle: z.string().optional(),
  evidenceSummary: z.string().optional(),
  evidenceUrl: z.string().url().optional().or(z.literal("")),
});

type Step1Data = z.infer<typeof step1Schema>;
type Step2Data = z.infer<typeof step2Schema>;
type Step3Data = z.infer<typeof step3Schema>;

type AllData = Step1Data & Step2Data & Step3Data;

const STEPS = [
  { label: "Case Details", icon: FileText },
  { label: "Framework & Claim", icon: BookOpen },
  { label: "Evidence", icon: Paperclip },
];

interface CaseCreateFormProps {
  onSubmit?: (data: AllData) => void | Promise<void>;
  frameworks?: { value: string; label: string }[];
  submitting?: boolean;
}

export default function CaseCreateForm({
  onSubmit,
  frameworks = [],
  submitting = false,
}: CaseCreateFormProps) {
  const [step, setStep] = useState(0);
  const [accumulated, setAccumulated] = useState<Partial<AllData>>({});

  const schemas = [step1Schema, step2Schema, step3Schema];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const form = useForm<AllData>({
    resolver: zodResolver(schemas[step]) as any,
    defaultValues: { responseDeadlineDays: 7, ...accumulated } as AllData,
    mode: "onTouched",
  });

  const { register, handleSubmit, formState: { errors }, getValues } = form;

  const handleNext = handleSubmit((data) => {
    const merged = { ...accumulated, ...data };
    setAccumulated(merged);
    if (step < 2) {
      setStep((s) => s + 1);
    } else {
      onSubmit?.(merged as AllData);
    }
  });

  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto py-6 px-4">
      {/* Step indicators */}
      <div className="flex items-center gap-0">
        {STEPS.map((s, i) => {
          const done = i < step;
          const active = i === step;
          return (
            <React.Fragment key={i}>
              <div className="flex items-center gap-2">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold transition-all"
                  style={{
                    backgroundColor: done
                      ? "#648F70"
                      : active
                      ? "#C69C5D"
                      : "rgba(241,232,210,0.08)",
                    color: done || active ? "#0B0D10" : "rgba(241,232,210,0.3)",
                    border: active ? "2px solid #C69C5D" : "2px solid transparent",
                    boxShadow: active ? "0 0 12px rgba(198,156,93,0.4)" : "none",
                  }}
                >
                  {done ? <Check size={14} /> : i + 1}
                </div>
                <span
                  className="text-xs font-semibold uppercase tracking-wider hidden sm:block"
                  style={{ color: active ? "#C69C5D" : done ? "#648F70" : "rgba(241,232,210,0.3)" }}
                >
                  {s.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className="flex-1 h-px mx-3"
                  style={{
                    backgroundColor: done
                      ? "rgba(100,143,112,0.5)"
                      : "rgba(241,232,210,0.12)",
                  }}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Form body */}
      <form onSubmit={handleNext} className="flex flex-col gap-5">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col gap-5"
          >
            {step === 0 && (
              <>
                <Input
                  label="Case Title"
                  placeholder="Brief description of the dispute"
                  error={errors.title?.message}
                  {...register("title")}
                />
                <Select
                  label="Category"
                  options={CATEGORIES}
                  placeholder="Select category"
                  error={errors.category?.message}
                  {...register("category")}
                />
                <Input
                  label="Respondent Wallet Address"
                  placeholder="0x..."
                  error={errors.respondent?.message}
                  {...register("respondent")}
                />
                <Input
                  label="Response Deadline (days)"
                  type="number"
                  min={1}
                  max={30}
                  error={errors.responseDeadlineDays?.message}
                  {...register("responseDeadlineDays", { valueAsNumber: true })}
                />
              </>
            )}

            {step === 1 && (
              <>
                <Select
                  label="Arbitration Framework"
                  options={frameworks.length > 0 ? frameworks : [{ value: "general", label: "General Commercial Disputes" }]}
                  placeholder="Select framework"
                  error={errors.frameworkId?.message}
                  {...register("frameworkId")}
                />
                <Textarea
                  label="Claim Summary"
                  placeholder="Describe your claim in detail..."
                  rows={5}
                  maxLength={2000}
                  error={errors.claimSummary?.message}
                  {...register("claimSummary")}
                />
                <Textarea
                  label="Requested Remedy"
                  placeholder="What outcome are you seeking?"
                  rows={3}
                  maxLength={500}
                  error={errors.requestedRemedy?.message}
                  {...register("requestedRemedy")}
                />
              </>
            )}

            {step === 2 && (
              <>
                <p className="text-sm" style={{ color: "rgba(241,232,210,0.5)" }}>
                  Optionally add an initial evidence item. You can add more after case creation.
                </p>
                <Input
                  label="Evidence Title (optional)"
                  placeholder="E.g. Original Contract"
                  error={errors.evidenceTitle?.message}
                  {...register("evidenceTitle")}
                />
                <Textarea
                  label="Evidence Summary (optional)"
                  placeholder="Brief description of this evidence item..."
                  rows={3}
                  maxLength={500}
                  error={errors.evidenceSummary?.message}
                  {...register("evidenceSummary")}
                />
                <Input
                  label="Source URL (optional)"
                  placeholder="https://..."
                  error={errors.evidenceUrl?.message}
                  {...register("evidenceUrl")}
                />
              </>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="flex items-center justify-between mt-2">
          <Button
            type="button"
            variant="ghost"
            size="md"
            icon={<ChevronLeft size={15} />}
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0}
          >
            Back
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="md"
            loading={step === 2 && submitting}
            icon={step < 2 ? <ChevronRight size={15} /> : <Check size={15} />}
            iconPosition="right"
          >
            {step < 2 ? "Continue" : "Create Case"}
          </Button>
        </div>
      </form>
    </div>
  );
}
