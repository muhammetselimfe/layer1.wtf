import React, { useState, useEffect, useRef } from 'react'

interface AnimatedCounterProps {
  value: number
  duration?: number
  decimals?: number
  suffix?: string
  className?: string
}

export function AnimatedCounter({ 
  value, 
  duration = 1000, 
  decimals = 0, 
  suffix = '', 
  className = '' 
}: AnimatedCounterProps) {
  const [displayValue, setDisplayValue] = useState(value)
  const [isAnimating, setIsAnimating] = useState(false)
  const animationRef = useRef<number>()
  const startTimeRef = useRef<number>()
  const startValueRef = useRef<number>(value)

  useEffect(() => {
    // Don't animate if the value hasn't changed
    if (value === displayValue) return

    setIsAnimating(true)
    startValueRef.current = displayValue
    startTimeRef.current = Date.now()

    const animate = () => {
      const now = Date.now()
      const elapsed = now - (startTimeRef.current || now)
      const progress = Math.min(elapsed / duration, 1)

      // Use easeOutCubic for smooth deceleration
      const easeOutCubic = 1 - Math.pow(1 - progress, 3)
      
      const currentValue = startValueRef.current + (value - startValueRef.current) * easeOutCubic
      setDisplayValue(currentValue)

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate)
      } else {
        setDisplayValue(value)
        setIsAnimating(false)
      }
    }

    animationRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [value, duration, displayValue])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [])

  const formatValue = (val: number) => {
    return val.toFixed(decimals)
  }

  return (
    <span className={`animated-counter ${isAnimating ? 'animating' : ''} ${className}`}>
      {formatValue(displayValue)}{suffix}
    </span>
  )
}