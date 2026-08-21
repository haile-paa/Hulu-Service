import { motion } from 'framer-motion'
import Reveal from '../Reveal'

const cards = [
  { letter: 'A', tone: 'bg-teal/15 text-teal', title: 'Admin Console', text: 'A React web dashboard with live stats on users, bookings, providers and revenue — plus provider verification.' },
  { letter: 'M', tone: 'bg-orange/15 text-orange', title: 'Mobile App', text: 'React Native + Expo app for customers and providers, distributed as a direct APK, in Amharic and English.' },
  { letter: 'T', tone: 'bg-[#349ef6]/15 text-[#5db8ff]', title: 'Telegram Mini App', text: "Book a provider straight from Telegram — zero install, works for anyone with the app already on their phone." },
]

export default function Surfaces() {
  return (
    <section id="surfaces" className="py-20 border-t border-line">
      <div className="wrap">
        <Reveal className="max-w-xl mb-12">
          <span className="stop">one backend, three front doors</span>
          <h2 className="font-disp font-semibold text-3xl md:text-4xl">Built as one connected system</h2>
          <p className="text-muted mt-3.5 text-[1.02rem]">
            A single Go + MongoDB backend over WebSockets powers everything below — so a booking made in the app
            shows up instantly on the admin console, and a provider's availability updates live everywhere.
          </p>
        </Reveal>

        <div className="grid md:grid-cols-3 gap-5">
          {cards.map((c, i) => (
            <Reveal key={c.title} delay={i * 0.12} className="card p-7">
              <div className={`w-[42px] h-[42px] rounded-[11px] flex items-center justify-center font-disp font-bold mb-4.5 ${c.tone}`}>
                {c.letter}
              </div>
              <h3 className="font-disp font-semibold text-xl">{c.title}</h3>
              <p className="text-muted text-[14.5px] mt-2.5">{c.text}</p>
            </Reveal>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.7 }}
          className="mt-12 rounded-[18px] border border-line overflow-hidden bg-black"
        >
          <img src="/screens/admin-dashboard.png" alt="Hulu Service admin console dashboard showing users, bookings, providers and revenue" className="w-full" loading="lazy" />
        </motion.div>
      </div>
    </section>
  )
}
