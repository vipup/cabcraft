import React, { useRef, useEffect } from 'react'
import { useGame } from '../../context/GameContext'
import CityBackground from './CityBackground'
import GameEntities from './GameEntities'
import './SVGGameCanvas.css'

const SVGGameCanvas = () => {
  const svgRef = useRef(null)
  const { worldSize, camera, updateCamera, selectedRideId, setSelectedRideId, rideRequests, drivers } = useGame()
  const [isDragging, setIsDragging] = React.useState(false)
  const [dragStart, setDragStart] = React.useState({ x: 0, y: 0 })
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
    const halfViewWidth = (window.innerWidth - 56 - 300) / (2 * camera.zoom)
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
  
  useEffect(() => {
    const svg = svgRef.current
    if (!svg) return
    
    svg.addEventListener('wheel', handleWheel, { passive: false })
    return () => svg.removeEventListener('wheel', handleWheel)
  }, [camera.zoom])
  
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
  const viewportWidth = window.innerWidth - 56 - 300 // left toolbar + right panel
  const viewportHeight = window.innerHeight - 48 - 32 // top banner + bottom bar
  
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

