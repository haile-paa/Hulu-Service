import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import PhoneFrame from '../PhoneFrame'
import HeroScene from '../HeroScene'
import { DownloadIcon, TelegramIcon } from '../Icons'

const word = {
  hidden: { opacity: 0, y: 24, rotateX: -40 },
  show: (i) => ({
    opacity: 1, y: 0, rotateX: 0,
    transition: { delay: 0.06 * i, duration: 0.7, ease: [0.22, 1, 0.36, 1] },
  }),
}

const line1 = ['Find', 'a', 'trusted']
const line3 = ['for', 'anything,']

export default function Hero() {
  return (
    <section className="relative pt-16 md:pt-20 pb-10 overflow-hidden">
      <HeroScene className="absolute -right-24 top-0 w-[560px] h-[560px] opacity-70 pointer-events-none hidden lg:block" />

      <div className="wrap grid lg:grid-cols-[1.05fr_0.95fr] gap-14 items-center">
        <div>
          <div className="flex flex-wrap gap-2 mb-6">
            <span className="pill">Built in <b className="text-teal">Addis Ababa</b></span>
            <span className="pill">Amharic <b className="text-teal">&amp;</b> English</span>
            <span className="pill">Not on Play Store — <b className="text-teal">direct APK</b></span>
          </div>

          <h1 className="font-disp font-semibold text-[2.4rem] leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl mb-5 [perspective:600px]">
            <span className="block overflow-hidden">
              {line1.map((w, i) => (
                <motion.span key={w} custom={i} variants={word} initial="hidden" animate="show" className="inline-block mr-3">
                  {w}
                </motion.span>
              ))}
            </span>
            <span className="block overflow-hidden">
              <motion.span
                custom={3}
                variants={word}
                initial="hidden"
                animate="show"
                className="inline-block bg-cta bg-clip-text text-transparent"
              >
                ባለሙያ
              </motion.span>
            </span>
            <span className="block overflow-hidden">
              {line3.map((w, i) => (
                <motion.span key={w} custom={i + 4} variants={word} initial="hidden" animate="show" className="inline-block mr-3">
                  {w}
                </motion.span>
              ))}
              <motion.span custom={6} variants={word} initial="hidden" animate="show" className="inline-block">
                anywhere in Addis.
              </motion.span>
            </span>
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="text-muted text-lg max-w-[52ch] mb-8"
          >
            Hulu Service is a local service marketplace built for how Ethiopians actually search for help — electricians, plumbers, cleaners, tutors and more, booked in Amharic or English, in real time.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.75, duration: 0.6 }}
            className="flex flex-wrap gap-3.5 mb-6"
          >
            <Link className="btn btn-primary" to="/download">
              <DownloadIcon /> Download the APK
            </Link>
            <a className="btn btn-ghost" href="https://t.me/Hulu_service_bot" target="_blank" rel="noopener noreferrer">
              <TelegramIcon /> Open in Telegram
            </a>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9, duration: 0.6 }}
            className="text-[13px] text-muted2"
          >
            No install needed? Try the Telegram Mini App — search{' '}
            <a className="text-teal border-b border-dotted border-teal" href="https://t.me/Hulu_service_bot" target="_blank" rel="noopener noreferrer">
              @Hulu_service_bot
            </a>.
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9, rotate: 8 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ delay: 0.3, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="relative flex justify-center"
        >
          <PhoneFrame src="/screens/home-categories.jpg" alt="Hulu Service home screen with 15 service categories in Amharic" size={260} initialRotate={3} />
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -left-5 bottom-6 card p-3.5 flex items-center gap-2.5 shadow-2xl border-line2"
          >
            <div className="w-[34px] h-[34px] rounded-[9px] bg-orange flex items-center justify-center font-disp font-bold text-[#1c1005]">P</div>
            <div>
              <div className="text-[13px] font-semibold">Provider · የተረጋገጠ</div>
              <div className="text-[11.5px] text-muted">★ Verified · 500 ብር / hour</div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
