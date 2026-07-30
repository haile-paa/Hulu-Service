import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Search, CalendarCheck } from "lucide-react";
import { api } from "@/api/client";
import type { Booking, BookingStatus } from "@/types";
import StatusBadge from "@/components/StatusBadge";
import Pagination from "@/components/Pagination";
import { formatCategoryPrice } from "@/lib/pricing";

const STATUS_OPTIONS: { value: BookingStatus | ""; label: string }[] = [
  { value: "", label: "All statuses" },
  { value: "pending", label: "Pending" },
  { value: "accepted", label: "Accepted" },
  { value: "in_progress", label: "In progress" },
  { value: "completed", label: "Completed" },
  { value: "rejected", label: "Rejected" },
  { value: "cancelled", label: "Cancelled" },
];

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<BookingStatus | "">("");
  const [q, setQ] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const [loading, setLoading] = useState(true);
  const limit = 15;

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(q), 350);
    return () => clearTimeout(t);
  }, [q]);

  useEffect(() => {
    setPage(1);
  }, [status, debouncedQ]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    api
      .get("/admin/bookings", {
        params: { status: status || undefined, q: debouncedQ || undefined, page, limit },
      })
      .then((res) => {
        if (cancelled) return;
        setBookings(res.data.bookings || []);
        setTotal(res.data.total || 0);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [status, debouncedQ, page]);

  return (
    <div className='space-y-5'>
      <div>
        <h1 className='text-base-100 text-2xl font-semibold'>Bookings</h1>
        <p className='text-base-400 mt-1 text-sm'>
          Every job requested through the app, newest first.
        </p>
      </div>

      <div className='flex flex-col gap-3 sm:flex-row sm:items-center'>
        <div className='relative flex-1'>
          <Search
            size={16}
            className='text-base-400 absolute top-1/2 left-3 -translate-y-1/2'
          />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder='Search by customer or provider name…'
            className='border-base-600 bg-base-900/60 text-base-100 placeholder:text-base-400 focus:border-violet-400/60 focus:ring-1 focus:ring-violet-400/40 w-full rounded-xl border py-2.5 pr-3 pl-9 text-sm outline-none transition-colors'
          />
        </div>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as BookingStatus | "")}
          className='border-base-600 bg-base-900/60 text-base-100 focus:border-violet-400/60 rounded-xl border px-3 py-2.5 text-sm outline-none'
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value} className='bg-base-900'>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className='glass-panel overflow-hidden rounded-2xl'
      >
        <div className='overflow-x-auto'>
          <table className='w-full text-left text-sm'>
            <thead>
              <tr className='border-base-700/60 text-base-400 border-b text-xs tracking-wide uppercase'>
                <th className='px-5 py-3 font-medium'>Customer</th>
                <th className='px-5 py-3 font-medium'>Provider</th>
                <th className='px-5 py-3 font-medium'>Work type</th>
                <th className='px-5 py-3 font-medium'>Price</th>
                <th className='px-5 py-3 font-medium'>Status</th>
                <th className='px-5 py-3 font-medium'>Requested</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={6} className='px-5 py-10 text-center'>
                    <div className='text-base-400 text-sm'>Loading…</div>
                  </td>
                </tr>
              )}
              {!loading && bookings.length === 0 && (
                <tr>
                  <td colSpan={6} className='px-5 py-14 text-center'>
                    <div className='text-base-400 flex flex-col items-center gap-2 text-sm'>
                      <CalendarCheck size={22} className='text-base-500' />
                      No bookings match these filters
                    </div>
                  </td>
                </tr>
              )}
              {!loading &&
                bookings.map((b) => (
                  <tr
                    key={b.id}
                    className='border-base-700/40 hover:bg-white/[0.03] border-b last:border-0'
                  >
                    <td className='px-5 py-3.5'>
                      <p className='text-base-100 font-medium'>
                        {b.customer?.fullName || "—"}
                      </p>
                      <p className='text-base-400 text-xs'>
                        {b.customer?.phone}
                      </p>
                    </td>
                    <td className='px-5 py-3.5'>
                      <p className='text-base-100 font-medium'>
                        {b.provider?.fullName || "—"}
                      </p>
                      <p className='text-base-400 text-xs'>
                        {b.provider?.phone}
                      </p>
                    </td>
                    <td className='px-5 py-3.5'>
                      <p className='text-base-200'>
                        {b.category?.nameEn || "—"}
                      </p>
                    </td>
                    <td className='px-5 py-3.5'>
                      <p className='text-accent-violet font-medium'>
                        {b.priceQuote
                          ? formatCategoryPrice({
                              priceType: b.category?.priceType,
                              price: b.priceQuote,
                            })
                          : formatCategoryPrice(b.category)}
                      </p>
                    </td>
                    <td className='px-5 py-3.5'>
                      <StatusBadge status={b.status} />
                    </td>
                    <td className='px-5 py-3.5'>
                      <p className='text-base-300 text-xs'>
                        {new Date(b.createdAt).toLocaleDateString()}
                      </p>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
        <div className='px-5 pb-4'>
          <Pagination page={page} limit={limit} total={total} onChange={setPage} />
        </div>
      </motion.div>
    </div>
  );
}
