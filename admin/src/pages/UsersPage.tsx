import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Search, Ban, Users } from "lucide-react";
import { api } from "@/api/client";
import type { Role, User } from "@/types";
import Pagination from "@/components/Pagination";

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [q, setQ] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const [role, setRole] = useState<Role | "">("customer");
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const limit = 15;

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(q), 350);
    return () => clearTimeout(t);
  }, [q]);

  useEffect(() => {
    setPage(1);
  }, [debouncedQ, role]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    api
      .get("/admin/users", {
        params: { role: role || undefined, q: debouncedQ || undefined, page, limit },
      })
      .then((res) => {
        if (cancelled) return;
        setUsers(res.data.users || []);
        setTotal(res.data.total || 0);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [role, debouncedQ, page, refreshKey]);

  async function toggleSuspended(u: User) {
    setBusyId(u.id);
    try {
      await api.patch(`/admin/users/${u.id}/suspend`, {
        isSuspended: !u.isSuspended,
      });
      setRefreshKey((k) => k + 1);
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className='space-y-5'>
      <div>
        <h1 className='text-base-100 text-2xl font-semibold'>Users</h1>
        <p className='text-base-400 mt-1 text-sm'>
          Everyone with an account — customers and providers.
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
            placeholder='Search by name or phone…'
            className='border-base-600 bg-base-900/60 text-base-100 placeholder:text-base-400 focus:border-violet-400/60 focus:ring-1 focus:ring-violet-400/40 w-full rounded-xl border py-2.5 pr-3 pl-9 text-sm outline-none transition-colors'
          />
        </div>
        <select
          value={role}
          onChange={(e) => setRole(e.target.value as Role | "")}
          className='border-base-600 bg-base-900/60 text-base-100 focus:border-violet-400/60 rounded-xl border px-3 py-2.5 text-sm outline-none'
        >
          <option value='' className='bg-base-900'>
            All roles
          </option>
          <option value='customer' className='bg-base-900'>
            Customers
          </option>
          <option value='provider' className='bg-base-900'>
            Providers
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
                <th className='px-5 py-3 font-medium'>Name</th>
                <th className='px-5 py-3 font-medium'>Phone</th>
                <th className='px-5 py-3 font-medium'>Role</th>
                <th className='px-5 py-3 font-medium'>City</th>
                <th className='px-5 py-3 font-medium'>Joined</th>
                <th className='px-5 py-3 font-medium'>Status</th>
                <th className='px-5 py-3 font-medium'>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={7} className='px-5 py-10 text-center'>
                    <div className='text-base-400 text-sm'>Loading…</div>
                  </td>
                </tr>
              )}
              {!loading && users.length === 0 && (
                <tr>
                  <td colSpan={7} className='px-5 py-14 text-center'>
                    <div className='text-base-400 flex flex-col items-center gap-2 text-sm'>
                      <Users size={22} className='text-base-500' />
                      No users match these filters
                    </div>
                  </td>
                </tr>
              )}
              {!loading &&
                users.map((u) => (
                  <tr
                    key={u.id}
                    className='border-base-700/40 hover:bg-white/[0.03] border-b last:border-0'
                  >
                    <td className='px-5 py-3.5'>
                      <p className='text-base-100 font-medium'>{u.fullName}</p>
                    </td>
                    <td className='px-5 py-3.5'>
                      <p className='text-base-300'>{u.phone}</p>
                    </td>
                    <td className='px-5 py-3.5'>
                      <span className='border-base-600 bg-base-800/60 text-base-200 rounded-full border px-2 py-0.5 text-xs capitalize'>
                        {u.role}
                      </span>
                    </td>
                    <td className='px-5 py-3.5'>
                      <p className='text-base-300'>{u.city}</p>
                    </td>
                    <td className='px-5 py-3.5'>
                      <p className='text-base-400 text-xs'>
                        {new Date(u.createdAt).toLocaleDateString()}
                      </p>
                    </td>
                    <td className='px-5 py-3.5'>
                      {u.isSuspended ? (
                        <span className='rounded-full border border-rose-400/30 bg-rose-400/15 px-2 py-0.5 text-[11px] font-medium text-rose-300'>
                          Suspended
                        </span>
                      ) : (
                        <span className='border-emerald-400/30 bg-emerald-400/15 text-emerald-300 rounded-full border px-2 py-0.5 text-[11px] font-medium'>
                          Active
                        </span>
                      )}
                    </td>
                    <td className='px-5 py-3.5'>
                      <button
                        disabled={busyId === u.id}
                        onClick={() => toggleSuspended(u)}
                        title={u.isSuspended ? "Restore access" : "Suspend account"}
                        className='text-base-300 hover:bg-white/5 disabled:opacity-40 rounded-lg border border-white/10 p-1.5 transition-colors hover:text-rose-300'
                      >
                        <Ban size={15} />
                      </button>
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
