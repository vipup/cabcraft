import { useEffect, useRef, useCallback } from 'react'
import { useGame } from '../context/GameContext'
import { useTrafficSimulator } from './useTrafficSimulator'
import { info, warn } from '../utils/logger'

export const useAutonomousSimulation = () => {
  const {
    isAutonomousMode,
    autoSimulationConfig,
    drivers,
    riders,
    rideRequests,
    simulationSpeed
  } = useGame()
  
  const { spawnRider, spawnDriver, createRideRequest } = useTrafficSimulator()
  
  // Refs to store interval IDs
  const intervalsRef = useRef({
    spawnRiders: null,
    spawnDrivers: null,
    createRides: null
  })
  
  // Clear all intervals
  const clearAllIntervals = useCallback(() => {
    Object.values(intervalsRef.current).forEach(interval => {
      if (interval) {
        clearInterval(interval)
      }
    })
    intervalsRef.current = {
      spawnRiders: null,
      spawnDrivers: null,
      createRides: null
    }
  }, [])
  
  // Start autonomous simulation
  const startAutonomousSimulation = useCallback(() => {
    if (isAutonomousMode) {
      info('🤖 Starting autonomous simulation...')
      
      // Clear any existing intervals
      clearAllIntervals()
      
      // Spawn riders automatically
      intervalsRef.current.spawnRiders = setInterval(() => {
        if (riders.length < autoSimulationConfig.maxRiders) {
          spawnRider()
        }
      }, autoSimulationConfig.spawnRidersInterval / simulationSpeed)
      
      // Spawn drivers automatically
      intervalsRef.current.spawnDrivers = setInterval(() => {
        if (drivers.length < autoSimulationConfig.maxDrivers) {
          spawnDriver()
        }
      }, autoSimulationConfig.spawnDriversInterval / simulationSpeed)
      
      // Create ride requests automatically
      intervalsRef.current.createRides = setInterval(() => {
        const activeRides = rideRequests.filter(r => 
          r.status === 'waiting_for_pickup' || 
          r.status === 'going_to_rider' || 
          r.status === 'in_progress'
        )
        
        if (activeRides.length < autoSimulationConfig.maxActiveRides && riders.length > 0) {
          createRideRequest()
        }
      }, autoSimulationConfig.createRidesInterval / simulationSpeed)
      
      info(`✅ Autonomous simulation started with intervals: ${autoSimulationConfig.spawnRidersInterval}ms riders, ${autoSimulationConfig.spawnDriversInterval}ms drivers, ${autoSimulationConfig.createRidesInterval}ms rides`)
    }
  }, [
    isAutonomousMode,
    autoSimulationConfig,
    drivers.length,
    riders.length,
    rideRequests,
    simulationSpeed,
    spawnRider,
    spawnDriver,
    createRideRequest,
    clearAllIntervals
  ])
  
  // Stop autonomous simulation
  const stopAutonomousSimulation = useCallback(() => {
    clearAllIntervals()
    info('🛑 Autonomous simulation stopped')
  }, [clearAllIntervals])
  
  // Effect to manage autonomous simulation
  useEffect(() => {
    if (isAutonomousMode) {
      startAutonomousSimulation()
    } else {
      stopAutonomousSimulation()
    }
    
    // Cleanup on unmount
    return () => {
      clearAllIntervals()
    }
  }, [isAutonomousMode, startAutonomousSimulation, stopAutonomousSimulation, clearAllIntervals])
  
  // Effect to restart intervals when simulation speed changes
  useEffect(() => {
    if (isAutonomousMode) {
      // Restart with new speed
      startAutonomousSimulation()
    }
  }, [simulationSpeed, isAutonomousMode, startAutonomousSimulation])
  
  // Effect to restart intervals when config changes
  useEffect(() => {
    if (isAutonomousMode) {
      // Restart with new config
      startAutonomousSimulation()
    }
  }, [autoSimulationConfig, isAutonomousMode, startAutonomousSimulation])
  
  return {
    startAutonomousSimulation,
    stopAutonomousSimulation,
    clearAllIntervals
  }
}
