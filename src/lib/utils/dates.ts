import {
  format,
  formatDistanceToNow,
  isPast,
  differenceInDays,
  differenceInHours,
} from "date-fns";

/**
 * Format a Unix timestamp (seconds) as a human-readable date string.
 * Example: "Jun 20, 2026"
 */
export function formatDate(ts: number): string {
  return format(new Date(ts * 1000), "MMM d, yyyy");
}

/**
 * Format a Unix timestamp as a relative time string.
 * Example: "3 days ago", "in 2 hours"
 */
export function formatRelative(ts: number): string {
  return formatDistanceToNow(new Date(ts * 1000), { addSuffix: true });
}

/**
 * Format a deadline timestamp with contextual urgency.
 * Shows relative time when close, absolute date when far.
 */
export function formatDeadline(ts: number): string {
  const date = new Date(ts * 1000);
  if (isPast(date)) {
    return `Expired ${formatDistanceToNow(date, { addSuffix: true })}`;
  }
  const hoursLeft = differenceInHours(date, new Date());
  const daysLeft = differenceInDays(date, new Date());
  if (hoursLeft < 24) {
    return `Expires in ${hoursLeft}h`;
  }
  if (daysLeft < 7) {
    return `Expires in ${daysLeft}d (${format(date, "MMM d")})`;
  }
  return `Deadline: ${format(date, "MMM d, yyyy")}`;
}

/**
 * Returns true if the given Unix timestamp is in the past.
 */
export function isExpired(ts: number): boolean {
  return isPast(new Date(ts * 1000));
}
