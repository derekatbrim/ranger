// components/app/score-flap.tsx
"use client"

import { motion } from "framer-motion"
import { useState, useEffect, useRef } from "react"

interface ScoreFlapProps {
  score: number
  className?: string
}

const DIGITS = "0123456789".split("")

export function ScoreFlap({ score, className = "" }: ScoreFlapProps) {
  const digits = score.toString().padStart(2, "0").split("")

  return (
    <div
      className={`inline-flex gap-1 items-center ${className}`}
      aria-label={score.toString()}
      style={{ perspective: "1000px" }}
    >
      {digits.map((digit, index) => (
        <FlapDigit
          key={index}
          digit={digit}
          index={index}
        />
      ))}
    </div>
  )
}

interface FlapDigitProps {
  digit: string
  index: number
}

function FlapDigit({ digit, index }: FlapDigitProps) {
  const [currentDigit, setCurrentDigit] = useState("0")
  const [isSettled, setIsSettled] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const tileDelay = 0.1 * index

  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    if (timeoutRef.current) clearTimeout(timeoutRef.current)

    setIsSettled(false)
    setCurrentDigit(DIGITS[Math.floor(Math.random() * DIGITS.length)])

    const baseFlips = 6
    const startDelay = tileDelay * 600
    let flipIndex = 0

    timeoutRef.current = setTimeout(() => {
      intervalRef.current = setInterval(() => {
        const settleThreshold = baseFlips + index * 2

        if (flipIndex >= settleThreshold) {
          if (intervalRef.current) clearInterval(intervalRef.current)
          setCurrentDigit(digit)
          setIsSettled(true)
          return
        }
        setCurrentDigit(DIGITS[Math.floor(Math.random() * DIGITS.length)])
        flipIndex++
      }, 60)
    }, startDelay)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [digit, tileDelay, index])

  // Light mode colors
  const bgColor = isSettled ? "rgb(15, 23, 42)" : "rgb(241, 245, 249)" // slate-900 : slate-100
  const textColor = isSettled ? "#ffffff" : "rgb(100, 116, 139)" // white : slate-500

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: tileDelay, duration: 0.2, ease: "easeOut" }}
      className="relative overflow-hidden flex items-center justify-center font-mono font-bold"
      style={{
        fontSize: "4rem",
        width: "3rem",
        height: "4.5rem",
        backgroundColor: bgColor,
        borderRadius: "0.375rem",
        transformStyle: "preserve-3d",
        transition: "background-color 0.15s ease",
      }}
    >
      {/* Center line */}
      <div className="absolute inset-x-0 top-1/2 h-[1px] bg-black/10 pointer-events-none z-10" />

      {/* Top half */}
      <div className="absolute inset-x-0 top-0 bottom-1/2 flex items-end justify-center overflow-hidden">
        <span
          className="block translate-y-[0.52em] leading-none transition-colors duration-150"
          style={{ color: textColor }}
        >
          {currentDigit}
        </span>
      </div>

      {/* Bottom half */}
      <div className="absolute inset-x-0 top-1/2 bottom-0 flex items-start justify-center overflow-hidden">
        <span
          className="-translate-y-[0.52em] leading-none transition-colors duration-150"
          style={{ color: textColor }}
        >
          {currentDigit}
        </span>
      </div>

      {/* Flipping top half */}
      <motion.div
        key={isSettled ? "settled" : "flipping"}
        initial={{ rotateX: -90 }}
        animate={{ rotateX: 0 }}
        transition={{
          delay: tileDelay + 0.1,
          duration: 0.2,
          ease: [0.22, 0.61, 0.36, 1],
        }}
        className="absolute inset-x-0 top-0 bottom-1/2 origin-bottom overflow-hidden rounded-t-md"
        style={{
          backgroundColor: bgColor,
          transformStyle: "preserve-3d",
          backfaceVisibility: "hidden",
          transition: "background-color 0.15s ease",
        }}
      >
        <div className="flex h-full items-end justify-center">
          <span
            className="translate-y-[0.52em] leading-none transition-colors duration-150"
            style={{ color: textColor }}
          >
            {currentDigit}
          </span>
        </div>
      </motion.div>
    </motion.div>
  )
}
