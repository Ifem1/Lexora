/**
 * Hash a string using SHA-256 via the Web Crypto API.
 * Returns a lowercase hex string.
 */
export async function hashString(input: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Truncate a hash for display purposes.
 * @param hash - The full hash string (with or without 0x prefix).
 * @param chars - Number of characters to show on each side (default 6).
 */
export function truncateHash(hash: string, chars = 6): string {
  if (!hash) return "";
  const clean = hash.startsWith("0x") ? hash : hash;
  if (clean.length <= chars * 2 + 2) return clean;
  return `${clean.slice(0, chars + (hash.startsWith("0x") ? 2 : 0))}…${clean.slice(-chars)}`;
}

/**
 * Generate a unique case ID.
 * Uses crypto.randomUUID() with a fallback for environments that don't support it.
 */
export function generateCaseId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  // Fallback: manual UUID v4 construction
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
