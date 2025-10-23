import { useEffect, useState, useCallback } from 'react'

/**
 * Mobile Optimization Hook - Detects mobile devices and applies optimizations
 */
export const useMobileOptimization = () => {
  const [isMobile, setIsMobile] = useState(false)
  const [isLowEndDevice, setIsLowEndDevice] = useState(false)
  const [optimalFrameRate, setOptimalFrameRate] = useState(60)
  
  // Detect mobile device
  const detectMobile = useCallback(() => {
    const userAgent = navigator.userAgent
    const mobileRegex = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i
    return mobileRegex.test(userAgent)
  }, [])
  
  // Detect low-end device based on hardware concurrency and memory
  const detectLowEndDevice = useCallback(() => {
    const cores = navigator.hardwareConcurrency || 2
    const memory = navigator.deviceMemory || 4 // GB
    
    // Consider low-end if less than 4 cores or less than 4GB RAM
    return cores < 4 || memory < 4
  }, [])
  
  // Calculate optimal frame rate
  const calculateOptimalFrameRate = useCallback(() => {
    const mobile = detectMobile()
    const lowEnd = detectLowEndDevice()
    
    if (mobile || lowEnd) {
      return 30 // 30 FPS for mobile/low-end devices
    }
    return 60 // 60 FPS for desktop
  }, [detectMobile, detectLowEndDevice])
  
  // Initialize detection
  useEffect(() => {
    const mobile = detectMobile()
    const lowEnd = detectLowEndDevice()
    const frameRate = calculateOptimalFrameRate()
    
    setIsMobile(mobile)
    setIsLowEndDevice(lowEnd)
    setOptimalFrameRate(frameRate)
    
    console.log(`📱 Device Detection: Mobile=${mobile}, LowEnd=${lowEnd}, TargetFPS=${frameRate}`)
  }, [detectMobile, detectLowEndDevice, calculateOptimalFrameRate])
  
  // Handle orientation changes
  useEffect(() => {
    const handleOrientationChange = () => {
      // Recalculate frame rate on orientation change
      const newFrameRate = calculateOptimalFrameRate()
      setOptimalFrameRate(newFrameRate)
    }
    
    window.addEventListener('orientationchange', handleOrientationChange)
    window.addEventListener('resize', handleOrientationChange)
    
    return () => {
      window.removeEventListener('orientationchange', handleOrientationChange)
      window.removeEventListener('resize', handleOrientationChange)
    }
  }, [calculateOptimalFrameRate])
  
  return {
    isMobile,
    isLowEndDevice,
    optimalFrameRate,
    isOptimized: isMobile || isLowEndDevice
  }
}
