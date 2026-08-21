import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import PhoneFrame from '../PhoneFrame'
import { CheckIcon } from '../Icons'

export default function FeatureRow({ reverse, tag, ethTag, title, text, points, img, alt }) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], [40, -40])

  return (
    <div ref={ref} className={`grid md:grid-cols-2 gap-10 md:gap-14 items-center py-11 border-t border-line first:border-t-0 first:pt-0`}>
      <div className={`flex justify-center ${reverse ? 'md:order-2' : ''}`}>
        <motion.div style={{ y }}>
          <PhoneFrame src={img} alt={alt} size={220} tilt initialRotate={0} />
        </motion.div>
      </div>
      <div className={reverse ? 'md:order-1' : ''}>
        <span className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.06em] text-orange mb-3.5">
          {tag} <span className="font-eth normal-case tracking-normal text-muted2">· {ethTag}</span>
        </span>
        <h3 className="font-disp font-semibold text-2xl mb-3">{title}</h3>
        <p className="text-muted text-[15px] max-w-[46ch]">{text}</p>
        <ul className="mt-4 flex flex-col gap-2.5">
          {points.map((p) => (
            <li key={p} className="text-sm flex gap-2.5 items-start">
              <CheckIcon className="w-4 h-4 mt-0.5 text-teal shrink-0" />
              <span>{p}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
