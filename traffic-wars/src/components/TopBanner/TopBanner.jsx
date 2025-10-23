import React from 'react'
import { useGame } from '../../context/GameContext'
import { useAutonomousSimulation } from '../../hooks/useAutonomousSimulation'
import { LOG_LEVELS, LOG_LEVEL_NAMES, LOG_LEVEL_COLORS } from '../../utils/logger'
import './TopBanner.css'

const TopBanner = () => {
  const { 
    earnings, 
    rating, 
    activeRides, 
    ridesPanelHidden, 
    setRidesPanelHidden, 
    selectedUnit, 
    simulationSpeed, 
    setSimulationSpeed, 
    logLevel, 
    setLogLevel,
    isAutonomousMode,
    setIsAutonomousMode,
    autoSimulationConfig,
    setAutoSimulationConfig,
    drivers,
    riders,
    rideRequests
  } = useGame()
  
  const { startAutonomousSimulation, stopAutonomousSimulation } = useAutonomousSimulation()
  
  const handleSpeedChange = (e) => {
    setSimulationSpeed(parseFloat(e.target.value))
  }

  const handleLogLevelChange = (e) => {
    setLogLevel(parseInt(e.target.value))
  }
  
  const handleAutonomousToggle = () => {
    setIsAutonomousMode(!isAutonomousMode)
  }
  
  const handleConfigChange = (key, value) => {
    setAutoSimulationConfig(prev => ({
      ...prev,
      [key]: parseInt(value)
    }))
  }
  
  return (
    <div className="top-banner">
      <div className="banner-title">🚗 Traffic Simulator</div>
      <div className="banner-achievements">
        ${earnings} • ⭐{rating.toFixed(1)} • Active {activeRides} • 🚗{drivers.length} • 🏍️{riders.length} • 📱{rideRequests.length}
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
          className={`unit-button autonomous-btn ${isAutonomousMode ? 'active' : ''}`}
          onClick={handleAutonomousToggle}
          title={isAutonomousMode ? 'Stop autonomous simulation' : 'Start autonomous simulation'}
        >
          🤖 {isAutonomousMode ? 'Auto ON' : 'Auto OFF'}
        </button>
        <button 
          className="unit-button toggle-rides-btn" 
          onClick={() => setRidesPanelHidden(!ridesPanelHidden)}
        >
          📋 {ridesPanelHidden ? 'Show' : 'Hide'} Rides
        </button>
        <div className="log-level-selector">
          <label htmlFor="log-level-select">Log Level:</label>
          <select
            id="log-level-select"
            value={logLevel}
            onChange={handleLogLevelChange}
            className="log-level-select"
            style={{ color: LOG_LEVEL_COLORS[logLevel] }}
          >
            <option value={LOG_LEVELS.DEBUG} style={{ color: LOG_LEVEL_COLORS[LOG_LEVELS.DEBUG] }}>
              DEBUG
            </option>
            <option value={LOG_LEVELS.INFO} style={{ color: LOG_LEVEL_COLORS[LOG_LEVELS.INFO] }}>
              INFO
            </option>
            <option value={LOG_LEVELS.WARNING} style={{ color: LOG_LEVEL_COLORS[LOG_LEVELS.WARNING] }}>
              WARNING
            </option>
            <option value={LOG_LEVELS.ERROR} style={{ color: LOG_LEVEL_COLORS[LOG_LEVELS.ERROR] }}>
              ERROR
            </option>
          </select>
        </div>
        {isAutonomousMode && (
          <div className="autonomous-config">
            <div className="config-item">
              <label>Riders:</label>
              <input
                type="number"
                min="1"
                max="50"
                value={autoSimulationConfig.maxRiders}
                onChange={(e) => handleConfigChange('maxRiders', e.target.value)}
                className="config-input"
              />
            </div>
            <div className="config-item">
              <label>Drivers:</label>
              <input
                type="number"
                min="1"
                max="30"
                value={autoSimulationConfig.maxDrivers}
                onChange={(e) => handleConfigChange('maxDrivers', e.target.value)}
                className="config-input"
              />
            </div>
            <div className="config-item">
              <label>Rides:</label>
              <input
                type="number"
                min="1"
                max="20"
                value={autoSimulationConfig.maxActiveRides}
                onChange={(e) => handleConfigChange('maxActiveRides', e.target.value)}
                className="config-input"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default TopBanner

