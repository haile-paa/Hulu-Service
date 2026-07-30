import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Search, ShieldCheck, ShieldOff, Ban, HardHat, Star } from "lucide-react";
import { api } from "@/api/client";
import type { Provider } from "@/types";
import Pagination from "@/components/Pagination";
import { formatCategoryPrice } from "@/lib/pricing";

type Filter = "all" | "true" | "false";

export default function ProvidersPage() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [q, setQ] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const [verifiedFilter, setVerifiedFilter] = useState<Filter>("all");
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const limit = 12;

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(q), 350);
    return () => clearTimeout(t);
  }, [q]);

  useEffect(() => {
    setPage(1);
  }, [debouncedQ, verifiedFilter]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    api
      .get("/admin/providers", {
        params: {
          q: debouncedQ || undefined,
          verified: verifiedFilter === "all" ? undefined : verifiedFilter,
          page,
          limit,
        },
      })
      .then((res) => {
        if (cancelled) return;
        setProviders(res.data.providers || []);
        setTotal(res.data.total || 0);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [debouncedQ, verifiedFilter, page, refreshKey]);

  async function toggleVerified(p: Provider) {
    setBusyId(p.id);
    try {
      await api.patch(`/admin/providers/${p.id}/verify`, {
        isVerified: !p.isVerified,
      });
      setRefreshKey((k) => k + 1);
    } finally {
      setBusyId(null);
    }
  }

  async function toggleSuspended(p: Provider) {
    setBusyId(p.id);
    try {
      await api.patch(`/admin/users/${p.id}/suspend`, {
        isSuspended: !p.isSuspended,
      });
      setRefreshKey((k) => k + 1);
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className='space-y-5'>
      <div>
        <h1 className='text-base-100 text-2xl font-semibold'>Providers</h1>
        <p className='text-base-400 mt-1 text-sm'>
          Everyone registered to do work through the app.
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
            placeholder='Search by name…'
            className='border-base-600 bg-base-900/60 text-base-100 placeholder:text-base-400 focus:border-violet-400/60 focus:ring-1 focus:ring-violet-400/40 w-full rounded-xl border py-2.5 pr-3 pl-9 text-sm outline-none transition-colors'
          />
        </div>
        <select
          value={verifiedFilter}
          onChange={(e) => setVerifiedFilter(e.target.value as Filter)}
          className='border-base-600 bg-base-900/60 text-base-100 focus:border-violet-400/60 rounded-xl border px-3 py-2.5 text-sm outline-none'
        >
          <option value='all' className='bg-base-900'>
            All providers
          </option>
          <option value='true' className='bg-base-900'>
            Verified only
          </option>
          <option value='false' className='bg-base-900'>
            Unverified only
          </option>
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
                <th className='px-5 py-3 font-medium'>Provider</th>
                <th className='px-5 py-3 font-medium'>Services &amp; price</th>
                <th className='px-5 py-3 font-medium'>Rating</th>
                <th className='px-5 py-3 font-medium'>Status</th>
                <th className='px-5 py-3 font-medium'>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={5} className='px-5 py-10 text-center'>
                    <div className='text-base-400 text-sm'>Loading…</div>
                  </td>
                </tr>
              )}
              {!loading && providers.length === 0 && (
                <tr>
                  <td colSpan={5} className='px-5 py-14 text-center'>
                    <div className='text-base-400 flex flex-col items-center gap-2 text-sm'>
                      <HardHat size={22} className='text-base-500' />
                      No providers match these filters
                    </div>
                  </td>
                </tr>
              )}
              {!loading &&
                providers.map((p) => (
                  <tr
                    key={p.id}
                    className='border-base-700/40 hover:bg-white/[0.03] border-b last:border-0'
                  >
                    <td className='px-5 py-3.5'>
                      <p className='text-base-100 font-medium'>{p.fullName}</p>
                      <p className='text-base-400 text-xs'>{p.phone}</p>
                    </td>
                    <td className='px-5 py-3.5'>
                      <div className='flex flex-wrap gap-1.5'>
                        {p.categories?.length ? (
                          p.categories.map((cat) => (
                            <span
                              key={cat.id}
                              className='border-base-600 bg-base-800/60 text-base-200 rounded-lg border px-2 py-1 text-xs'
                            >
                              {cat.nameEn}{" "}
                              <span className='text-accent-violet font-medium'>
                                · {formatCategoryPrice(cat)}
                              </span>
                            </span>
                          ))
                        ) : (
                          <span className='text-base-500 text-xs'>
                            No services listed
                          </span>
                        )}
                      </div>
                    </td>
                    <td className='px-5 py-3.5'>
                      <div className='text-base-200 flex items-center gap-1'>
                        <Star size={13} className='fill-amber-400 text-amber-400' />
                        {(p.ratingAvg || 0).toFixed(1)}
                        <span className='text-base-400'>
                          ({p.ratingCount || 0})
                        </span>
                      </div>
                    </td>
                    <td className='px-5 py-3.5'>
                      <div className='flex flex-col gap-1'>
                        <span
                          className={`w-fit rounded-full border px-2 py-0.5 text-[11px] font-medium ${
                            p.isVerified
                              ? "border-emerald-400/30 bg-emerald-400/15 text-emerald-300"
                              : "border-base-500/40 bg-base-500/10 text-base-300"
                          }`}
                        >
                          {p.isVerified ? "Verified" : "Unverified"}
                        </span>
                        <span
                          className={`w-fit rounded-full border px-2 py-0.5 text-[11px] font-medium ${
                            p.isAvailable
                              ? "border-cyan-400/30 bg-cyan-400/15 text-cyan-300"
                              : "border-base-500/40 bg-base-500/10 text-base-300"
                          }`}
                        >
                          {p.isAvailable ? "Available" : "Offline"}
                        </span>
                        {p.isSuspended && (
                          <span className='w-fit rounded-full border border-rose-400/30 bg-rose-400/15 px-2 py-0.5 text-[11px] font-medium text-rose-300'>
                            Suspended
                          </span>
                        )}
                      </div>
                    </td>
                    <td className='px-5 py-3.5'>
                      <div className='flex items-center gap-2'>
                        <button
                          disabled={busyId === p.id}
                          onClick={() => toggleVerified(p)}
                          title={p.isVerified ? "Remove verification" : "Verify provider"}
                          className='text-base-300 hover:bg-white/5 disabled:opacity-40 rounded-lg border border-white/10 p-1.5 transition-colors hover:text-emerald-300'
                        >
                          {p.isVerified ? (
                            <ShieldOff size={15} />
                          ) : (
                            <ShieldCheck size={15} />
                          )}
                        </button>
                        <button
                          disabled={busyId === p.id}
                          onClick={() => toggleSuspended(p)}
                          title={p.isSuspended ? "Restore access" : "Suspend account"}
                          className='text-base-300 hover:bg-white/5 disabled:opacity-40 rounded-lg border border-white/10 p-1.5 transition-colors hover:text-rose-300'
                        >
                          <Ban size={15} />
                        </button>
                      </div>
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
