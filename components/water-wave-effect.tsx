"use client"

import { motion, AnimatePresence } from "framer-motion"
import { useEffect, useState } from "react"

interface WaterWaveEffectProps {
  isActive: boolean
  className?: string
}

export function WaterWaveEffect({ isActive, className = "" }: WaterWaveEffectProps) {
  const [showWaves, setShowWaves] = useState(false)

  useEffect(() => {
    if (isActive) {
      // Start waves after water rises
      const timer = setTimeout(() => setShowWaves(true), 1800)
      return () => clearTimeout(timer)
    } else {
      setShowWaves(false)
    }
  }, [isActive])

  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          className={`water-wave-container ${className}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Clean Water Base */}
          <motion.div
            className="water-base"
            initial={{ y: "100%" }}
            animate={{ y: "0%" }}
            exit={{ y: "100%" }}
            transition={{ 
              duration: 2.5, 
              ease: "easeOut",
              delay: 0.2 
            }}
          >
            {/* Water Glow */}
            <div className="water-glow" />
          </motion.div>
          
          {/* Flowing Wave Layers */}
          <AnimatePresence>
            {showWaves && (
              <>
                {/* Primary Flowing Wave */}
                <motion.div
                  className="flowing-wave"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                />
                
                {/* Secondary Flowing Wave */}
                <motion.div
                  className="flowing-wave"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 0.8, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
                />
                
                {/* Tertiary Flowing Wave */}
                <motion.div
                  className="flowing-wave"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 0.6, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
                />

                {/* Surface Waves */}
                <motion.div
                  className="wave-surface"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.6, delay: 0.9 }}
                />
                <motion.div
                  className="wave-surface"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.7 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.6, delay: 1.2 }}
                />
              </>
            )}
          </AnimatePresence>

          {/* Bigger Floating Bubbles */}
          {showWaves && (
            <>
              <motion.div
                className="simple-bubble bubble-1"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0 }}
                transition={{ duration: 0.4, delay: 1.5 }}
              />
              <motion.div
                className="simple-bubble bubble-2"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0 }}
                transition={{ duration: 0.4, delay: 1.8 }}
              />
              <motion.div
                className="simple-bubble bubble-3"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0 }}
                transition={{ duration: 0.4, delay: 2.1 }}
              />
              <motion.div
                className="simple-bubble bubble-4"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0 }}
                transition={{ duration: 0.4, delay: 2.4 }}
              />
              <motion.div
                className="simple-bubble bubble-5"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0 }}
                transition={{ duration: 0.4, delay: 2.7 }}
              />
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}