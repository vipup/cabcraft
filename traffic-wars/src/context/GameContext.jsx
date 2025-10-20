import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'

const GameContext = createContext(null)

export const useGame = () => {
  const context = useContext(GameContext)
  if (!context) {
    throw new Error('useGame must be used within GameProvider')
  }
  return context
}

export const GameProvider = ({ children }) => {
  // Game world state
  const [worldSize] = useState({ width: 2400, height: 1600 })
  const [camera, setCamera] = useState({ x: 1200, y: 500, zoom: 1.0 })
  
  // Game entities
  const [drivers, setDrivers] = useState([])
  const [riders, setRiders] = useState([])
  const [rideRequests, setRideRequests] = useState([])
  const [buildings, setBuildings] = useState([])
  const [roads, setRoads] = useState([])
  const [streetNames, setStreetNames] = useState([])
  const [landmarks, setLandmarks] = useState([])
  
  // Game stats
  const [gameTime, setGameTime] = useState(0)
  const [earnings, setEarnings] = useState(0)
  const [rating, setRating] = useState(5.0)
  const [activeRides, setActiveRides] = useState(0)
  
  // UI state
  const [ridesPanelHidden, setRidesPanelHidden] = useState(false)
  const [selectedUnit, setSelectedUnit] = useState(null)
  const [simulationSpeed, setSimulationSpeed] = useState(1.0)
  const [selectedRideId, setSelectedRideId] = useState(null)
  
  // Rides filtering and sorting
  const [ridesFilter, setRidesFilter] = useState({
    search: '',
    status: {
      waiting: true,
      inProgress: true,
      completed: true
    }
  })
  const [ridesSort, setRidesSort] = useState({
    field: 'id',
    ascending: true
  })
  
  // Camera controls
  const updateCamera = useCallback((updates) => {
    setCamera(prev => ({...prev, ...updates }))
  }, [])
  
  // Entity management
  const addDriver = useCallback((driver) => {
    setDrivers(prev => [...prev, driver])
  }, [])
  
  const addRider = useCallback((rider) => {
    setRiders(prev => [...prev, rider])
  }, [])
  
  const addRideRequest = useCallback((request) => {
    setRideRequests(prev => [...prev, request])
  }, [])
  
  const updateDriver = useCallback((id, updates) => {
    setDrivers(prev => {
      const newDrivers = prev.map(d => d.id === id ? { ...d, ...updates } : d)
      return newDrivers
    })
  }, [])
  
  const updateRider = useCallback((id, updates) => {
    setRiders(prev => {
      const newRiders = prev.map(r => r.id === id ? { ...r, ...updates } : r)
      return newRiders
    })
  }, [])
  
  const updateRideRequest = useCallback((id, updates) => {
    setRideRequests(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r))
  }, [])
  
  const removeDriver = useCallback((id) => {
    setDrivers(prev => prev.filter(d => d.id !== id))
  }, [])
  
  const removeRider = useCallback((id) => {
    setRiders(prev => prev.filter(r => r.id !== id))
  }, [])
  
  const removeRideRequest = useCallback((id) => {
    setRideRequests(prev => prev.filter(r => r.id !== id))
  }, [])
  
  // Stats updates
  const addEarnings = useCallback((amount) => {
    setEarnings(prev => prev + amount)
  }, [])
  
  const updateRating = useCallback((newRating) => {
    setRating(newRating)
  }, [])
  
  // Clean map
  const cleanMap = useCallback(() => {
    setDrivers([])
    setRiders([])
    setRideRequests([])
    setEarnings(0)
    setRating(5.0)
    setActiveRides(0)
  }, [])
  
  // Game time ticker
  useEffect(() => {
    const interval = setInterval(() => {
      setGameTime(prev => prev + 1)
    }, 1000)
    return () => clearInterval(interval)
  }, [])
  
  const value = {
    // State
    worldSize,
    camera,
    drivers,
    riders,
    rideRequests,
    buildings,
    roads,
    streetNames,
    landmarks,
    gameTime,
    earnings,
    rating,
    activeRides,
    ridesPanelHidden,
    selectedUnit,
    simulationSpeed,
    ridesFilter,
    ridesSort,
    selectedRideId,
    
    // Actions
    updateCamera,
    addDriver,
    addRider,
    addRideRequest,
    updateDriver,
    updateRider,
    updateRideRequest,
    removeDriver,
    removeRider,
    removeRideRequest,
    addEarnings,
    updateRating,
    cleanMap,
    setRidesPanelHidden,
    setSelectedUnit,
    setSimulationSpeed,
    setRidesFilter,
    setRidesSort,
    setSelectedRideId,
    setBuildings,
    setRoads,
    setStreetNames,
    setLandmarks,
    setActiveRides
  }
  
  return <GameContext.Provider value={value}>{children}</GameContext.Provider>
}

