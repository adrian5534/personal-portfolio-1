import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

const variantsMap = (distance = 24) => ({
  fadeUp:    { hidden: { opacity: 0, y: distance }, show: { opacity: 1, y: 0 } },
  fade:      { hidden: { opacity: 0 },              show: { opacity: 1 } },
  slideLeft: { hidden: { opacity: 0, x: distance }, show: { opacity: 1, x: 0 } },
  slideRight:{ hidden: { opacity: 0, x: -distance}, show: { opacity: 1, x: 0 } },
  scaleIn:   { hidden: { opacity: 0, scale: 0.96 }, show: { opacity: 1, scale: 1 } },
  rotateIn:  { hidden: { opacity: 0, rotate: -2, y: distance }, show: { opacity: 1, rotate: 0, y: 0 } },
});

export default function AnimatedSection({
  as = 'section',
  id,
  className,
  style,
  children,
  variant = 'fadeUp',
  distance = 24,
  delay = 0,
  duration = 0.6,
  ease = 'easeOut',
  once = true,
  amount = 0.2,
  stagger = 0,            // >0 wraps children and reveals them in sequence
}) {
  const reduce = useReducedMotion();
  const MotionTag = motion[as] || motion.section;

  const v = variantsMap(distance)[variant] || variantsMap(distance).fadeUp;
  const transition = reduce ? { duration: 0 } : { duration, ease, delay };
  const parent = {
    hidden: v.hidden,
    show: { ...v.show, transition: { ...transition, staggerChildren: stagger || undefined, delayChildren: delay } },
  };
  const child = { hidden: { opacity: 0, y: distance * 0.5 }, show: { opacity: 1, y: 0, transition: { duration: duration * 0.8, ease } } };

  const content = stagger > 0
    ? React.Children.toArray(children).map((c, i) => (
        <motion.div key={i} variants={child} style={{ willChange: 'transform' }}>
          {c}
        </motion.div>
      ))
    : children;

  if (reduce) {
    return (
      <MotionTag id={id} className={className} style={style}>
        {children}
      </MotionTag>
    );
  }

  return (
    <MotionTag
      id={id}
      className={className}
      style={{ willChange: 'transform', ...style }}
      variants={parent}
      initial="hidden"
      whileInView="show"
      viewport={{ once, amount }}
      transition={transition}
    >
      {content}
    </MotionTag>
  );
}