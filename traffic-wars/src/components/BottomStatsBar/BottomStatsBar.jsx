import React from 'react'
import { useGame } from '../../context/GameContext'
import './BottomStatsBar.css'

const BottomStatsBar = () => {
  const { gameTime, drivers, riders, camera, earnings, rating, activeRides, completedRides, totalDriverDistance } = useGame()
  
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }
  
  const totalAgents = drivers.length + riders.length
  const groundDrivers = drivers.filter(d => d.type === 'ground').length
  const airDrivers = drivers.filter(d => d.type === 'air').length
  
  // Calculate average ride time
  const avgRideTime = completedRides.length > 0 
    ? Math.round(completedRides.reduce((sum, ride) => sum + ride.duration, 0) / completedRides.length)
    : 0
  
  // Calculate average driver distance (convert pixels to km, assuming 1px = 1m)
  const avgDriverDistance = drivers.length > 0 
    ? Math.round((totalDriverDistance / drivers.length) / 1000 * 10) / 10 // Convert to km with 1 decimal
    : 0
  
  return (
    <div className="bottom-stats-bar">
      <div className="stat-item">Time: {formatTime(gameTime)}</div>
      <div className="stat-item">Agents: {totalAgents} (🚗 {groundDrivers} • ✈️ {airDrivers} • 🏍️ {riders.length})</div>
      <div className="stat-item">Avg Ride: {avgRideTime}s</div>
      <div className="stat-item">Avg Driver Dist: {avgDriverDistance}km</div>
      <div className="stat-item">Zoom: {camera.zoom.toFixed(1)}x</div>
      <div className="stat-item">Camera: {Math.round(camera.x)}, {Math.round(camera.y)}</div>
      <div className="stat-item main-stats">
        💰 {earnings} • ⭐ {rating.toFixed(1)} • 🚗 Active {activeRides}
      </div>
    </div>
  )
}

export default BottomStatsBar

