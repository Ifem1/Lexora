import { z } from "zod";

// ─── Evidence Schema ──────────────────────────────────────────────────────────

export const evidenceSchema = z.object({
  evidenceType: z.enum([
    "CONTRACT",
    "MESSAGE",
    "SCREENSHOT",
    "INVOICE",
    "DELIVERY_FILE",
    "PAYMENT_PROOF",
    "TIMELINE",
    "WITNESS_STATEMENT",
    "OTHER",
  ]),
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(120, "Title must be under 120 characters"),
  summary: z
    .string()
    .min(10, "Summary must be at least 10 characters")
    .max(2000, "Summary must be under 2000 characters"),
  fileHash: z.string().optional(),
  storageUri: z.string().url("Storage URI must be a valid URL").optional(),
  sourceUrl: z.string().url("Source URL must be a valid URL").optional(),
  relevanceTag: z.string().max(60).optional(),
});

export type EvidenceFormValues = z.infer<typeof evidenceSchema>;

// ─── Create Case Schema ───────────────────────────────────────────────────────

export const createCaseSchema = z.object({
  title: z
    .string()
    .min(5, "Case title must be at least 5 characters")
    .max(160, "Case title must be under 160 characters"),
  category: z
    .string()
    .min(2, "Category is required"),
  frameworkId: z
    .string()
    .min(1, "You must select an arbitration framework"),
  respondent: z
    .string()
    .regex(/^0x[a-fA-F0-9]{40}$/, "Respondent must be a valid Ethereum address"),
  claimSummary: z
    .string()
    .min(50, "Claim summary must be at least 50 characters")
    .max(5000, "Claim summary must be under 5000 characters"),
  relief: z
    .string()
    .min(10, "Please describe the relief you are seeking")
    .max(1000),
  agreeToDisclaimer: z
    .boolean()
    .refine((val) => val === true, {
      message: "You must agree to the disclaimer to proceed",
    }),
});

export type CreateCaseFormValues = z.infer<typeof createCaseSchema>;

// ─── Submit Claim Schema ──────────────────────────────────────────────────────

export const submitClaimSchema = z.object({
  caseId: z.string().uuid("Invalid case ID"),
  claimStatement: z
    .string()
    .min(100, "Claim statement must be at least 100 characters")
    .max(10000, "Claim statement must be under 10,000 characters"),
  requestedRemedy: z.enum([
    "PAY",
    "REFUND",
    "RELEASE_ESCROW",
    "REWORK",
    "CANCEL",
    "NO_ACTION",
    "NEGOTIATE",
  ]),
  requestedAmount: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^\d+(\.\d{1,6})?$/.test(val),
      "Amount must be a valid number"
    ),
  evidence: z.array(evidenceSchema).max(20, "You may submit up to 20 evidence items"),
  confirmAccuracy: z
    .boolean()
    .refine((val) => val === true, {
      message: "You must confirm the accuracy of your submission",
    }),
});

export type SubmitClaimFormValues = z.infer<typeof submitClaimSchema>;

// ─── Appeal Schema ────────────────────────────────────────────────────────────

export const appealSchema = z.object({
  caseId: z.string().uuid("Invalid case ID"),
  rulingId: z.string().min(1, "Ruling ID is required"),
  appealGround: z.enum([
    "NEW_EVIDENCE",
    "MATERIAL_ERROR",
    "FRAMEWORK_MISAPPLIED",
    "PROCEDURAL_UNFAIRNESS",
    "EVIDENCE_MISUNDERSTOOD",
    "REMEDY_DISPROPORTIONATE",
  ]),
  appealStatement: z
    .string()
    .min(100, "Appeal statement must be at least 100 characters")
    .max(5000, "Appeal statement must be under 5,000 characters"),
  newEvidence: z.array(evidenceSchema).max(5, "You may submit up to 5 new evidence items on appeal").optional(),
  confirmGrounds: z
    .boolean()
    .refine((val) => val === true, {
      message: "You must confirm the appeal grounds are genuine",
    }),
});

export type AppealFormValues = z.infer<typeof appealSchema>;
