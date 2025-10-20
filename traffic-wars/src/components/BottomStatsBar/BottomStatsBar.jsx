import React from 'react'
import { useGame } from '../../context/GameContext'
import './BottomStatsBar.css'

const BottomStatsBar = () => {
  const { gameTime, drivers, riders, camera, earnings, rating, activeRides } = useGame()
  
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }
  
  const totalAgents = drivers.length + riders.length
  const groundDrivers = drivers.filter(d => d.type === 'ground').length
  const airDrivers = drivers.filter(d => d.type === 'air').length
  
  return (
    <div className="bottom-stats-bar">
      <div className="stat-item">Time: {formatTime(gameTime)}</div>
      <div className="stat-item">Agents: {totalAgents} (🚗 {groundDrivers} • ✈️ {airDrivers} • 🏍️ {riders.length})</div>
      <div className="stat-item">Avg Ride: 0s</div>
      <div className="stat-item">Avg Driver Dist: 0km</div>
      <div className="stat-item">Zoom: {camera.zoom.toFixed(1)}x</div>
      <div className="stat-item">Camera: {Math.round(camera.x)}, {Math.round(camera.y)}</div>
      <div className="stat-item main-stats">
        💰 {earnings} • ⭐ {rating.toFixed(1)} • 🚗 Active {activeRides}
      </div>
    </div>
  )
}

export default BottomStatsBar

