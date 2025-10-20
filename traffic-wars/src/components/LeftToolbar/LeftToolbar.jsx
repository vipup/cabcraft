import React from 'react'
import { useTrafficSimulator } from '../../hooks/useTrafficSimulator'
import './LeftToolbar.css'

const LeftToolbar = () => {
  const { spawnRider, spawnDriver, createRideRequest, cleanMap } = useTrafficSimulator()
  
  return (
    <div className="left-toolbar">
      <button 
        className="unit-button toolbar-btn" 
        onClick={spawnRider}
        title="Spawn Rider"
      >
        🏍️
      </button>
      <button 
        className="unit-button toolbar-btn" 
        onClick={spawnDriver}
        title="Spawn Driver"
      >
        🚗
      </button>
      <button 
        className="unit-button toolbar-btn" 
        onClick={createRideRequest}
        title="Request Ride"
      >
        📱
      </button>
      <button 
        className="unit-button toolbar-btn clean-btn" 
        onClick={cleanMap}
        title="Clean Map"
      >
        🧹
      </button>
    </div>
  )
}

export default LeftToolbar

