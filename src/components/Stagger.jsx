import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

export default function Stagger({ as = 'div', children, delay = 0, stagger = 0.08, distance = 16, className }) {
  const reduce = useReducedMotion();
  const Tag = motion[as] || motion.div;

  if (reduce) return <Tag className={className}>{children}</Tag>;

  const parent = { show: { transition: { staggerChildren: stagger, delayChildren: delay } } };
  const child = { hidden: { opacity: 0, y: distance }, show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' } } };

  return (
    <Tag className={className} variants={parent} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }}>
      {React.Children.toArray(children).map((c, i) => (
        <motion.div key={i} variants={child} style={{ willChange: 'transform' }}>
          {c}
        </motion.div>
      ))}
    </Tag>
  );
}