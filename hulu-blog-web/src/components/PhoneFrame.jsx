import { useRef } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'

export default function PhoneFrame({ src, alt, size = 220, tilt = true, initialRotate = 0, className = '' }) {
  const ref = useRef(null)
  const mx = useMotionValue(0.5)
  const my = useMotionValue(0.5)
  const rX = useSpring(useTransform(my, [0, 1], [10, -10]), { stiffness: 150, damping: 18 })
  const rY = useSpring(useTransform(mx, [0, 1], [-10, 10]), { stiffness: 150, damping: 18 })

  const onMove = (e) => {
    if (!tilt || !ref.current) return
    const r = ref.current.getBoundingClientRect()
    mx.set((e.clientX - r.left) / r.width)
    my.set((e.clientY - r.top) / r.height)
  }
  const onLeave = () => { mx.set(0.5); my.set(0.5) }

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{
        width: size,
        rotateX: tilt ? rX : 0,
        rotateY: tilt ? rY : 0,
        rotate: initialRotate,
        transformPerspective: 900,
      }}
      className={`phone-frame ${className}`}
    >
      <img src={src} alt={alt} className="w-full block" loading="lazy" />
    </motion.div>
  )
}
