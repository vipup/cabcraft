import React, { useRef, useEffect } from 'react'
import { useGame } from '../../context/GameContext'
import { useMobileOptimization } from '../../hooks/useMobileOptimization'
import CityBackground from './CityBackground'
import GameEntities from './GameEntities'
import './SVGGameCanvas.css'

const SVGGameCanvas = () => {
  const svgRef = useRef(null)
  const { worldSize, camera, updateCamera, selectedRideId, setSelectedRideId, rideRequests, drivers } = useGame()
  const { isMobile } = useMobileOptimization()
  const [isDragging, setIsDragging] = React.useState(false)
  const [dragStart, setDragStart] = React.useState({ x: 0, y: 0 })
  const [lastTouchDistance, setLastTouchDistance] = React.useState(0)
  const trackingIntervalRef = useRef(null)
  
  const handleMouseDown = (e) => {
    // Clear ride selection when manually dragging
    if (selectedRideId) {
      setSelectedRideId(null)
    }
    setIsDragging(true)
    setDragStart({ x: e.clientX, y: e.clientY })
  }
  
  const handleMouseMove = (e) => {
    if (!isDragging) return
    
    const dx = (e.clientX - dragStart.x) / camera.zoom
    const dy = (e.clientY - dragStart.y) / camera.zoom
    
    // Calculate proper bounds based on viewport and zoom
    const leftPanelWidth = isMobile ? 56 : 56
    const rightPanelWidth = isMobile ? 0 : 300
    const halfViewWidth = (window.innerWidth - leftPanelWidth - rightPanelWidth) / (2 * camera.zoom)
    const halfViewHeight = (window.innerHeight - 48 - 32) / (2 * camera.zoom)
    
    updateCamera({
      x: Math.max(halfViewWidth, Math.min(worldSize.width - halfViewWidth, camera.x - dx)),
      y: Math.max(halfViewHeight, Math.min(worldSize.height - halfViewHeight, camera.y - dy))
    })
    
    setDragStart({ x: e.clientX, y: e.clientY })
  }
  
  const handleMouseUp = () => {
    setIsDragging(false)
  }
  
  const handleWheel = (e) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? 0.9 : 1.1
    const newZoom = Math.max(0.5, Math.min(3.0, camera.zoom * delta))
    updateCamera({ zoom: newZoom })
  }
  
  // Touch event handlers for mobile
  const handleTouchStart = (e) => {
    e.preventDefault()
    if (e.touches.length === 1) {
      // Single touch - start dragging
      if (selectedRideId) {
        setSelectedRideId(null)
      }
      setIsDragging(true)
      setDragStart({ x: e.touches[0].clientX, y: e.touches[0].clientY })
    } else if (e.touches.length === 2) {
      // Two touches - prepare for pinch zoom
      const touch1 = e.touches[0]
      const touch2 = e.touches[1]
      const distance = Math.sqrt(
        Math.pow(touch2.clientX - touch1.clientX, 2) + 
        Math.pow(touch2.clientY - touch1.clientY, 2)
      )
      setLastTouchDistance(distance)
      setIsDragging(false)
    }
  }
  
  const handleTouchMove = (e) => {
    e.preventDefault()
    
    if (e.touches.length === 2) {
      // Pinch zoom
      const touch1 = e.touches[0]
      const touch2 = e.touches[1]
      const distance = Math.sqrt(
        Math.pow(touch2.clientX - touch1.clientX, 2) + 
        Math.pow(touch2.clientY - touch1.clientY, 2)
      )
      
      if (lastTouchDistance > 0) {
        const scale = distance / lastTouchDistance
        const newZoom = Math.max(0.5, Math.min(3.0, camera.zoom * scale))
        updateCamera({ zoom: newZoom })
      }
      setLastTouchDistance(distance)
      return
    }
    
    if (!isDragging || e.touches.length !== 1) return
    
    const touch = e.touches[0]
    const dx = (touch.clientX - dragStart.x) / camera.zoom
    const dy = (touch.clientY - dragStart.y) / camera.zoom
    
    // Calculate proper bounds based on viewport and zoom
    const leftPanelWidth = isMobile ? 56 : 56
    const rightPanelWidth = isMobile ? 0 : 300
    const halfViewWidth = (window.innerWidth - leftPanelWidth - rightPanelWidth) / (2 * camera.zoom)
    const halfViewHeight = (window.innerHeight - 48 - 32) / (2 * camera.zoom)
    
    updateCamera({
      x: Math.max(halfViewWidth, Math.min(worldSize.width - halfViewWidth, camera.x - dx)),
      y: Math.max(halfViewHeight, Math.min(worldSize.height - halfViewHeight, camera.y - dy))
    })
    
    setDragStart({ x: touch.clientX, y: touch.clientY })
  }
  
  const handleTouchEnd = (e) => {
    e.preventDefault()
    setIsDragging(false)
    setLastTouchDistance(0)
  }
  
  useEffect(() => {
    const svg = svgRef.current
    if (!svg) return
    
    svg.addEventListener('wheel', handleWheel, { passive: false })
    
    // Always add touch event listeners for better mobile support
    svg.addEventListener('touchstart', handleTouchStart, { passive: false })
    svg.addEventListener('touchmove', handleTouchMove, { passive: false })
    svg.addEventListener('touchend', handleTouchEnd, { passive: false })
    
    return () => {
      svg.removeEventListener('wheel', handleWheel)
      svg.removeEventListener('touchstart', handleTouchStart)
      svg.removeEventListener('touchmove', handleTouchMove)
      svg.removeEventListener('touchend', handleTouchEnd)
    }
  }, [camera.zoom, isMobile])
  
  // Camera tracking for selected ride
  useEffect(() => {
    if (!selectedRideId) {
      if (trackingIntervalRef.current) {
        clearInterval(trackingIntervalRef.current)
        trackingIntervalRef.current = null
      }
      return
    }
    
    // Track the driver of the selected ride
    const trackDriver = () => {
      const ride = rideRequests.find(r => r.id === selectedRideId)
      if (!ride || !ride.assignedDriver) return
      
      const driver = drivers.find(d => d.id === ride.assignedDriver.id)
      if (!driver) return
      
      // Update camera to center on driver, but respect world bounds
      const halfViewWidth = (window.innerWidth - 56 - 300) / (2 * camera.zoom)
      const halfViewHeight = (window.innerHeight - 48 - 32) / (2 * camera.zoom)
      
      const clampedX = Math.max(halfViewWidth, Math.min(worldSize.width - halfViewWidth, driver.x))
      const clampedY = Math.max(halfViewHeight, Math.min(worldSize.height - halfViewHeight, driver.y))
      
      updateCamera({
        x: clampedX,
        y: clampedY
      })
    }
    
    // Track immediately
    trackDriver()
    
    // Then track every frame (60 FPS)
    trackingIntervalRef.current = setInterval(trackDriver, 16)
    
    return () => {
      if (trackingIntervalRef.current) {
        clearInterval(trackingIntervalRef.current)
        trackingIntervalRef.current = null
      }
    }
  }, [selectedRideId, rideRequests, drivers, updateCamera])
  
  // Calculate viewBox based on camera
  const leftPanelWidth = isMobile ? 56 : 56 // left toolbar
  const rightPanelWidth = isMobile ? 0 : 300 // right panel (hidden on mobile)
  const topBannerHeight = 48
  const bottomBarHeight = 32
  
  const viewportWidth = window.innerWidth - leftPanelWidth - rightPanelWidth
  const viewportHeight = window.innerHeight - topBannerHeight - bottomBarHeight
  
  // Ensure viewport dimensions are positive
  const safeViewportWidth = Math.max(100, viewportWidth)
  const safeViewportHeight = Math.max(100, viewportHeight)
  
  // Calculate viewBox with bounds checking
  const halfViewWidth = safeViewportWidth / (2 * camera.zoom)
  const halfViewHeight = safeViewportHeight / (2 * camera.zoom)
  
  // Clamp camera position to world bounds
  const clampedCameraX = Math.max(halfViewWidth, Math.min(worldSize.width - halfViewWidth, camera.x))
  const clampedCameraY = Math.max(halfViewHeight, Math.min(worldSize.height - halfViewHeight, camera.y))
  
  const viewBoxX = Math.max(0, clampedCameraX - halfViewWidth)
  const viewBoxY = Math.max(0, clampedCameraY - halfViewHeight)
  const viewBoxWidth = Math.max(1, safeViewportWidth / camera.zoom)
  const viewBoxHeight = Math.max(1, safeViewportHeight / camera.zoom)
  
  return (
    <svg
      ref={svgRef}
      className={`game-svg ${isDragging ? 'dragging' : ''}`}
      viewBox={`${viewBoxX} ${viewBoxY} ${viewBoxWidth} ${viewBoxHeight}`}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <CityBackground />
      <GameEntities />
    </svg>
  )
}

export default SVGGameCanvas

