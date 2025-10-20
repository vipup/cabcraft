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
    
    updateCamera({
      x: Math.max(0, Math.min(worldSize.width, camera.x - dx)),
      y: Math.max(0, Math.min(worldSize.height, camera.y - dy))
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
      
      // Update camera to center on driver
      updateCamera({
        x: driver.x,
        y: driver.y
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
  
  const viewBoxX = camera.x - (viewportWidth / (2 * camera.zoom))
  const viewBoxY = camera.y - (viewportHeight / (2 * camera.zoom))
  const viewBoxWidth = viewportWidth / camera.zoom
  const viewBoxHeight = viewportHeight / camera.zoom
  
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

