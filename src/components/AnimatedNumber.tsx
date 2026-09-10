import { useEffect, useRef } from 'react';
import { animate, useMotionValue, useTransform, motion, useReducedMotion } from 'motion/react';

interface Props {
  value: number;
  decimals?: number;
  suffix?: string;
  className?: string;
}

export function AnimatedNumber({ value, decimals = 0, suffix = '', className }: Props) {
  const reduceMotion = useReducedMotion();
  const motionValue = useMotionValue(value);
  const rounded = useTransform(motionValue, (v) => v.toFixed(decimals) + suffix);
  const first = useRef(true);

  useEffect(() => {
    if (first.current || reduceMotion) {
      motionValue.set(value);
      first.current = false;
      return;
    }
    const controls = animate(motionValue, value, { duration: 0.6, ease: [0.16, 1, 0.3, 1] });
    return () => controls.stop();
  }, [value, motionValue, reduceMotion]);

  return <motion.span className={className}>{rounded}</motion.span>;
}
