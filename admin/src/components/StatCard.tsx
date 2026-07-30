import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
  icon: LucideIcon;
  accent: string; // tailwind gradient classes, e.g. "from-violet-500 to-fuchsia-500"
  delay?: number;
}

/** Counts up from 0 to `value` over ~800ms whenever value changes. */
function useCountUp(value: number, duration = 800) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    let start: number | null = null;
    let frame: number;

    function step(timestamp: number) {
      if (start === null) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(eased * value));
      if (progress < 1) frame = requestAnimationFrame(step);
    }
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [value, duration]);

  return display;
}

export default function StatCard({
  label,
  value,
  prefix = "",
  suffix = "",
  icon: Icon,
  accent,
  delay = 0,
}: StatCardProps) {
  const display = useCountUp(value);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: -4 }}
      className='glass-panel relative overflow-hidden rounded-2xl p-5'
    >
      <div
        className={`absolute -top-8 -right-8 h-24 w-24 rounded-full bg-gradient-to-br ${accent} opacity-20 blur-2xl`}
      />
      <div className='relative flex items-start justify-between'>
        <div>
          <p className='text-base-300 text-xs font-medium tracking-wide uppercase'>
            {label}
          </p>
          <p className='text-base-100 mt-2 text-2xl font-semibold tabular-nums'>
            {prefix}
            {display.toLocaleString()}
            {suffix}
          </p>
        </div>
        <div
          className={`rounded-xl bg-gradient-to-br ${accent} p-2.5 shadow-lg`}
        >
          <Icon size={18} className='text-white' strokeWidth={2.25} />
        </div>
      </div>
    </motion.div>
  );
}
