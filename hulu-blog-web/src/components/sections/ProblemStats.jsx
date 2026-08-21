import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Reveal from "../Reveal";
import CountUp from "../CountUp";
import { PinIcon, GridIcon, GlobeIcon, RouteIcon } from "../Icons";

function LanguageFlip() {
  const [i, setI] = useState(0);
  const words = ["አማርኛ", "English"];
  useEffect(() => {
    const id = setInterval(() => setI((v) => (v + 1) % words.length), 1800);
    return () => clearInterval(id);
  }, []);
  return (
    <span className='relative inline-grid h-[1.15em] overflow-hidden align-bottom'>
      {words.map((w, idx) => (
        <motion.span
          key={w}
          className={`[grid-area:1/1] whitespace-nowrap ${idx === 0 ? "font-eth" : ""}`}
          animate={{
            y: idx === i ? 0 : idx < i ? "-100%" : "100%",
            opacity: idx === i ? 1 : 0,
          }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          {w}
        </motion.span>
      ))}
    </span>
  );
}

const stats = [
  {
    icon: GridIcon,
    tone: "text-teal bg-teal/10",
    glow: "bg-teal/20",
    render: () => <CountUp value={15} suffix='+' />,
    label: "service categories, from electricians to tutors",
  },
  {
    icon: GlobeIcon,
    tone: "text-orange bg-orange/10",
    glow: "bg-orange/20",
    render: () => <LanguageFlip />,
    label: "fully bilingual, switch anytime",
  },
  {
    icon: RouteIcon,
    tone: "text-[#5db8ff] bg-[#349ef6]/10",
    glow: "bg-[#349ef6]/20",
    render: () => <CountUp value={3} />,
    label: "ways in: app, admin console, Telegram",
  },
];

export default function ProblemStats() {
  return (
    <section className='relative py-20 border-t border-line overflow-hidden'>
      <div className='wrap'>
        <Reveal>
          <span className='stop'>
            <PinIcon /> the problem
          </span>
          <h2 className='font-disp font-semibold text-3xl md:text-4xl max-w-[22ch] leading-tight'>
            Finding a plumber shouldn't mean 20 phone calls and a stranger's
            cousin.
          </h2>
          <p className='text-muted max-w-[60ch] mt-4.5 text-[1.02rem]'>
            Most service-finding in Addis still runs on word of mouth and
            Telegram groups. Hulu Service replaces that with one bilingual app:
            browse verified providers by category and neighborhood, see their
            rate and rating up front, and message or call directly — no
            middleman, no guesswork.
          </p>
        </Reveal>

        <div className='grid sm:grid-cols-3 gap-5 mt-12'>
          {stats.map((s, i) => {
            const Icon = s.icon;
            return (
              <Reveal key={s.label} delay={i * 0.12} y={28}>
                <motion.div
                  whileHover={{ y: -5 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className='group relative overflow-hidden rounded-2xl border border-line hover:border-line2 bg-bg1 p-7 h-full'
                >
                  <div
                    className={`pointer-events-none absolute -top-10 -right-10 w-32 h-32 rounded-full blur-2xl opacity-70 group-hover:opacity-100 transition-opacity ${s.glow}`}
                  />
                  <div
                    className={`relative w-11 h-11 rounded-xl flex items-center justify-center mb-6 ${s.tone}`}
                  >
                    <Icon className='w-5 h-5' />
                  </div>
                  <div className='relative font-mono text-4xl md:text-[2.75rem] leading-none text-cream mb-3'>
                    {s.render()}
                  </div>
                  <p className='relative text-[13.5px] text-muted max-w-[26ch]'>
                    {s.label}
                  </p>
                </motion.div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
