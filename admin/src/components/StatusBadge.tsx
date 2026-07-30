import type { BookingStatus } from "@/types";

const STYLES: Record<BookingStatus, string> = {
  pending: "bg-amber-400/15 text-amber-300 border-amber-400/30",
  accepted: "bg-cyan-400/15 text-cyan-300 border-cyan-400/30",
  in_progress: "bg-violet-400/15 text-violet-300 border-violet-400/30",
  completed: "bg-emerald-400/15 text-emerald-300 border-emerald-400/30",
  rejected: "bg-rose-400/15 text-rose-300 border-rose-400/30",
  cancelled: "bg-base-500/20 text-base-300 border-base-500/40",
};

const LABELS: Record<BookingStatus, string> = {
  pending: "Pending",
  accepted: "Accepted",
  in_progress: "In progress",
  completed: "Completed",
  rejected: "Rejected",
  cancelled: "Cancelled",
};

export default function StatusBadge({ status }: { status: BookingStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium whitespace-nowrap ${STYLES[status]}`}
    >
      {LABELS[status]}
    </span>
  );
}
