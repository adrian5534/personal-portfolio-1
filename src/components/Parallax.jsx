import React, { useRef } from 'react';
import { motion as Motion, useScroll, useTransform, useReducedMotion } from 'framer-motion';

export default function Parallax({ children, amount = 40, scale = [0.98, 1], className, style }) {
  const reduce = useReducedMotion();
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [amount, -amount]);
  const s = useTransform(scrollYProgress, [0, 1], reduce ? [1, 1] : scale);

  return (
    <Motion.div ref={ref} className={className} style={{ y, scale: s, willChange: 'transform', ...style }}>
      {children}
    </Motion.div>
  );
}