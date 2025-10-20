import React from 'react'
import { useGame } from '../../context/GameContext'
import './TopBanner.css'

const TopBanner = () => {
  const { earnings, rating, activeRides, ridesPanelHidden, setRidesPanelHidden, selectedUnit, simulationSpeed, setSimulationSpeed } = useGame()
  
  const handleSpeedChange = (e) => {
    setSimulationSpeed(parseFloat(e.target.value))
  }
  
  return (
    <div className="top-banner">
      <div className="banner-title">🚗 Traffic Simulator</div>
      <div className="banner-achievements">
        ${earnings} • ⭐{rating.toFixed(1)} • Active {activeRides}
      </div>
      <div className="banner-speed-control">
        <label htmlFor="speed-slider">Speed: {simulationSpeed.toFixed(2)}x</label>
        <input
          id="speed-slider"
          type="range"
          min="0.25"
          max="4"
          step="0.25"
          value={simulationSpeed}
          onChange={handleSpeedChange}
          className="speed-slider"
        />
      </div>
      <div className="banner-actions">
        <button 
          className="unit-button toggle-rides-btn" 
          onClick={() => setRidesPanelHidden(!ridesPanelHidden)}
        >
          📋 {ridesPanelHidden ? 'Show' : 'Hide'} Rides
        </button>
        <div className="selected-info">
          {selectedUnit ? `Selected: ${selectedUnit.type} #${selectedUnit.id}` : 'No units selected'}
        </div>
      </div>
    </div>
  )
}

export default TopBanner

