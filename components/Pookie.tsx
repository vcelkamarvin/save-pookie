"use client";

import Image from "next/image";
import { motion, AnimatePresence, type TargetAndTransition, type Transition } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import type { PookieMood } from "@/lib/pookie";

export type { PookieMood };

const BODY_ANIM: Record<PookieMood, { animate: TargetAndTransition; transition: Transition }> = {
  sleeping: {
    animate: { scaleX: [1, 1.018, 1], scaleY: [1, 1.028, 1], y: [0, 3, 0] },
    transition: { duration: 3.5, repeat: Infinity, ease: "easeInOut" },
  },
  happy: {
    animate: { y: [0, -7, 0] },
    transition: { duration: 2.2, repeat: Infinity, ease: "easeInOut" },
  },
  proud: {
    animate: { y: [0, -10, 0], rotate: [-0.8, 0.8, -0.8] },
    transition: { duration: 1.8, repeat: Infinity, ease: "easeInOut" },
  },
  hungry: {
    animate: { y: [0, -3, 0], scale: [1, 0.985, 1] },
    transition: { duration: 4.5, repeat: Infinity, ease: "easeInOut" },
  },
  sad: {
    animate: { y: [0, 2, 0], scaleX: [1, 0.992, 1] },
    transition: { duration: 5, repeat: Infinity, ease: "easeInOut" },
  },
  celebrate: {
    animate: { y: [0, -48, -8, 0], rotate: [0, -6, 6, 0] },
    transition: { type: "spring", stiffness: 260, damping: 11 },
  },
};

interface PookieProps {
  mood: PookieMood;
  size?: number;
  wakeUp?: boolean;
}

export function PookieChar({ mood, size = 160, wakeUp = false }: PookieProps) {
  const [blinking, setBlinking] = useState(false);
  const [zzzVisible, setZzzVisible] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wakeUpDone = useRef(false);

  // schedule random blinks for idle moods
  useEffect(() => {
    if (mood !== "happy" && mood !== "proud") return;
    let mounted = true;

    const schedule = () => {
      const delay = 3200 + Math.random() * 3000;
      timerRef.current = setTimeout(() => {
        if (!mounted) return;
        setBlinking(true);
        setTimeout(() => {
          if (!mounted) return;
          setBlinking(false);
          schedule();
        }, 130);
      }, delay);
    };

    schedule();
    return () => {
      mounted = false;
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [mood]);

  // zzz breathing for sleeping
  useEffect(() => {
    if (mood !== "sleeping") { setZzzVisible(false); return; }
    setZzzVisible(true);
    const interval = setInterval(() => {
      setZzzVisible(true);
      setTimeout(() => setZzzVisible(false), 2600);
    }, 4200);
    return () => clearInterval(interval);
  }, [mood]);

  const v = BODY_ANIM[mood];

  // Wake-up: only runs once on first mount with wakeUp=true
  const shouldWakeUp = wakeUp && !wakeUpDone.current;
  if (shouldWakeUp) wakeUpDone.current = true;

  return (
    <div className="relative select-none" style={{ width: size, height: size }}>
      <motion.div
        initial={shouldWakeUp ? { y: size * 0.35, opacity: 0, scale: 0.82 } : false}
        animate={shouldWakeUp ? { y: 0, opacity: 1, scale: 1 } : v.animate}
        transition={shouldWakeUp ? { duration: 1.15, type: "spring", stiffness: 200, damping: 22 } : v.transition}
        style={{ width: size, height: size, originX: "50%", originY: "80%" }}
      >
        <Image
          src="/assets/pookie.svg"
          alt="Pookie"
          width={size}
          height={size}
          className="object-contain pointer-events-none"
          style={{
            filter:
              mood === "sad" || mood === "hungry"
                ? "brightness(0.9) saturate(0.72)"
                : undefined,
          }}
          priority
          draggable={false}
        />

        {/* Subtle blink: brief overall scaleY squeeze */}
        <AnimatePresence>
          {blinking && (
            <motion.div
              key="blink"
              className="absolute inset-0 pointer-events-none"
              initial={{ scaleY: 1 }}
              animate={{ scaleY: 0.955 }}
              exit={{ scaleY: 1 }}
              transition={{ duration: 0.065, ease: "easeInOut" }}
              style={{ originY: "45%" }}
            />
          )}
        </AnimatePresence>
      </motion.div>

      {/* Zzz for sleeping */}
      <AnimatePresence>
        {zzzVisible && mood === "sleeping" && (
          <motion.span
            key="zzz"
            className="absolute font-black pointer-events-none"
            style={{
              color: "#C9A8FF",
              fontSize: size * 0.14,
              top: size * 0.12,
              right: size * 0.04,
            }}
            initial={{ opacity: 0, y: 0, x: 0 }}
            animate={{ opacity: [0, 1, 1, 0], y: -(size * 0.22), x: size * 0.1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2.8, ease: "easeOut" }}
          >
            zzz
          </motion.span>
        )}
      </AnimatePresence>

      {/* Celebration burst */}
      <AnimatePresence>
        {mood === "celebrate" && <CelebrationBurst key="burst" size={size} />}
      </AnimatePresence>
    </div>
  );
}

function CelebrationBurst({ size }: { size: number }) {
  const pieces = ["🩷", "✨", "🌸", "⭐", "💗", "🎉", "🪄", "💖"];
  return (
    <>
      {Array.from({ length: 10 }).map((_, i) => {
        const angle = (i / 10) * Math.PI * 2;
        const dist = 55 + (i % 3) * 20;
        return (
          <motion.span
            key={i}
            className="absolute pointer-events-none"
            style={{
              top: "50%",
              left: "50%",
              fontSize: size * 0.11,
              lineHeight: 1,
            }}
            initial={{ opacity: 1, x: 0, y: 0, scale: 0.4 }}
            animate={{
              opacity: 0,
              x: Math.cos(angle) * dist,
              y: Math.sin(angle) * dist - 15,
              scale: 1.4,
            }}
            transition={{ duration: 0.72, delay: i * 0.04, ease: "easeOut" }}
          >
            {pieces[i % pieces.length]}
          </motion.span>
        );
      })}
    </>
  );
}
