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
        onClick={() => spawnDriver('ground')}
        title="Spawn Ground Driver (Car)"
      >
        🚗
      </button>
      <button 
        className="unit-button toolbar-btn" 
        onClick={() => spawnDriver('air')}
        title="Spawn Air Driver (Pilot)"
      >
        ✈️
      </button>
      <button 
        className="unit-button toolbar-btn" 
        onClick={() => createRideRequest('ground')}
        title="Request Ground Ride (Car)"
      >
        🚗📱
      </button>
      <button 
        className="unit-button toolbar-btn" 
        onClick={() => createRideRequest('air')}
        title="Request Air Ride (Flying)"
      >
        ✈️📱
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

