import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Users,
  HardHat,
  CalendarCheck,
  Wallet,
  ShieldCheck,
  Radar,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts";
import { api } from "@/api/client";
import StatCard from "@/components/StatCard";
import type { AdminStats, BookingStatus } from "@/types";
import { formatBirr } from "@/lib/pricing";

const STATUS_COLORS: Record<BookingStatus, string> = {
  pending: "#fbbf24",
  accepted: "#22d3ee",
  in_progress: "#8b5cf6",
  completed: "#34d399",
  rejected: "#fb7185",
  cancelled: "#6b7299",
};

const STATUS_LABELS: Record<BookingStatus, string> = {
  pending: "Pending",
  accepted: "Accepted",
  in_progress: "In progress",
  completed: "Completed",
  rejected: "Rejected",
  cancelled: "Cancelled",
};

function ChartCard({
  title,
  subtitle,
  children,
  delay = 0,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className='glass-panel rounded-2xl p-5'
    >
      <p className='text-base-100 text-sm font-semibold'>{title}</p>
      {subtitle && <p className='text-base-400 mb-3 text-xs'>{subtitle}</p>}
      {!subtitle && <div className='mb-3' />}
      {children}
    </motion.div>
  );
}

export default function DashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    api
      .get<AdminStats>("/admin/stats")
      .then((res) => {
        if (!cancelled) setStats(res.data);
      })
      .catch(() => {
        if (!cancelled) setError("Could not load dashboard data.");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (error) {
    return <p className='text-rose-300'>{error}</p>;
  }

  if (!stats) {
    return (
      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className='shimmer-bg animate-shimmer glass-panel h-24 rounded-2xl'
          />
        ))}
      </div>
    );
  }

  const pieData = (
    Object.entries(stats.statusCounts) as [BookingStatus, number][]
  )
    .filter(([, count]) => count > 0)
    .map(([status, count]) => ({
      name: STATUS_LABELS[status],
      value: count,
      color: STATUS_COLORS[status],
    }));

  const categoryData = stats.categoryBookings
    .slice()
    .sort((a, b) => b.count - a.count)
    .slice(0, 8)
    .map((c) => ({ name: c.nameEn, count: c.count }));

  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-base-100 text-2xl font-semibold'>Dashboard</h1>
        <p className='text-base-400 mt-1 text-sm'>
          A live look at everyone using Hulu Service right now.
        </p>
      </div>

      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
        <StatCard
          label='Total Users'
          value={stats.totalUsers}
          icon={Users}
          accent='from-violet-500 to-fuchsia-500'
          delay={0}
        />
        <StatCard
          label='Customers'
          value={stats.totalCustomers}
          icon={Users}
          accent='from-fuchsia-500 to-rose-500'
          delay={0.05}
        />
        <StatCard
          label='Providers'
          value={stats.totalProviders}
          icon={HardHat}
          accent='from-cyan-500 to-blue-500'
          delay={0.1}
        />
        <StatCard
          label='Available Now'
          value={stats.availableProviders}
          icon={Radar}
          accent='from-emerald-500 to-cyan-500'
          delay={0.15}
        />
        <StatCard
          label='Verified Providers'
          value={stats.verifiedProviders}
          icon={ShieldCheck}
          accent='from-amber-500 to-orange-500'
          delay={0.2}
        />
        <StatCard
          label='Total Bookings'
          value={stats.totalBookings}
          icon={CalendarCheck}
          accent='from-violet-500 to-indigo-500'
          delay={0.25}
        />
        <StatCard
          label='Completed Jobs'
          value={stats.statusCounts.completed || 0}
          icon={ShieldCheck}
          accent='from-emerald-500 to-teal-500'
          delay={0.3}
        />
        <StatCard
          label='Revenue (Birr)'
          value={Math.round(stats.totalRevenue)}
          icon={Wallet}
          accent='from-fuchsia-500 to-pink-500'
          delay={0.35}
        />
      </div>

      <div className='grid grid-cols-1 gap-5 lg:grid-cols-3'>
        <ChartCard
          title='Last 7 days'
          subtitle='New bookings and new signups'
          delay={0.15}
        >
          <div className='h-64 lg:col-span-2'>
            <ResponsiveContainer width='100%' height='100%'>
              <AreaChart data={stats.trend}>
                <defs>
                  <linearGradient id='bookingsGrad' x1='0' y1='0' x2='0' y2='1'>
                    <stop offset='0%' stopColor='#8b5cf6' stopOpacity={0.5} />
                    <stop offset='100%' stopColor='#8b5cf6' stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id='usersGrad' x1='0' y1='0' x2='0' y2='1'>
                    <stop offset='0%' stopColor='#22d3ee' stopOpacity={0.4} />
                    <stop offset='100%' stopColor='#22d3ee' stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray='3 3'
                  stroke='rgba(255,255,255,0.06)'
                  vertical={false}
                />
                <XAxis
                  dataKey='date'
                  tickFormatter={(d: string) => d.slice(5)}
                  tick={{ fill: "#9aa0c4", fontSize: 11 }}
                  axisLine={{ stroke: "rgba(255,255,255,0.08)" }}
                  tickLine={false}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fill: "#9aa0c4", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  width={28}
                />
                <Tooltip
                  contentStyle={{
                    background: "#101226",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: 10,
                    fontSize: 12,
                  }}
                  labelStyle={{ color: "#e6e8f5" }}
                />
                <Area
                  type='monotone'
                  dataKey='bookings'
                  name='Bookings'
                  stroke='#8b5cf6'
                  fill='url(#bookingsGrad)'
                  strokeWidth={2}
                />
                <Area
                  type='monotone'
                  dataKey='newUsers'
                  name='New users'
                  stroke='#22d3ee'
                  fill='url(#usersGrad)'
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard
          title='Booking status'
          subtitle='Where every request stands'
          delay={0.2}
        >
          <div className='h-64'>
            {pieData.length === 0 ? (
              <div className='text-base-400 flex h-full items-center justify-center text-sm'>
                No bookings yet
              </div>
            ) : (
              <ResponsiveContainer width='100%' height='100%'>
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey='value'
                    nameKey='name'
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={3}
                  >
                    {pieData.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "#101226",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: 10,
                      fontSize: 12,
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
          <div className='mt-2 flex flex-wrap gap-x-4 gap-y-1.5'>
            {pieData.map((entry) => (
              <div
                key={entry.name}
                className='text-base-300 flex items-center gap-1.5 text-xs'
              >
                <span
                  className='h-2 w-2 rounded-full'
                  style={{ background: entry.color }}
                />
                {entry.name} ({entry.value})
              </div>
            ))}
          </div>
        </ChartCard>
      </div>

      <ChartCard
        title='Most requested work types'
        subtitle='Bookings per category'
        delay={0.25}
      >
        <div className='h-64'>
          {categoryData.length === 0 ? (
            <div className='text-base-400 flex h-full items-center justify-center text-sm'>
              No bookings yet
            </div>
          ) : (
            <ResponsiveContainer width='100%' height='100%'>
              <BarChart data={categoryData} layout='vertical' margin={{ left: 8 }}>
                <CartesianGrid
                  strokeDasharray='3 3'
                  stroke='rgba(255,255,255,0.06)'
                  horizontal={false}
                />
                <XAxis
                  type='number'
                  allowDecimals={false}
                  tick={{ fill: "#9aa0c4", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  type='category'
                  dataKey='name'
                  width={140}
                  tick={{ fill: "#c4c8e2", fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    background: "#101226",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: 10,
                    fontSize: 12,
                  }}
                  cursor={{ fill: "rgba(255,255,255,0.04)" }}
                />
                <Bar dataKey='count' fill='#8b5cf6' radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </ChartCard>

      <p className='text-base-500 text-right text-xs'>
        Total lifetime revenue tracked: {formatBirr(stats.totalRevenue)} Birr
        from completed jobs
      </p>
    </div>
  );
}
