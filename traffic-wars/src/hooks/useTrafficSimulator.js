import { useCallback } from 'react'
import { useGame } from '../context/GameContext'

let nextDriverId = 1
let nextRiderId = 1
let nextRideId = 1

export const useTrafficSimulator = () => {
  const {
    worldSize,
    drivers,
    riders,
    addDriver,
    addRider,
    addRideRequest,
    updateDriver,
    updateRider,
    removeDriver,
    removeRider,
    removeRideRequest,
    cleanMap: cleanMapContext,
    setBuildings,
    setRoads,
    setStreetNames,
    setLandmarks
  } = useGame()
  
  // Initialize the game world
  const initializeGame = useCallback(() => {
    console.log('🚗 Initializing Traffic Simulator...')
    
    // Create roads
    const roads = []
    // Horizontal roads
    for (let i = 0; i < 14; i++) {
      roads.push({
        x: 0,
        y: 84 + i * 100,
        width: worldSize.width,
        height: 32
      })
    }
    // Vertical roads
    for (let i = 0; i < 16; i++) {
      roads.push({
        x: 100 + i * 140,
        y: 0,
        width: 32,
        height: worldSize.height
      })
    }
    setRoads(roads)
    
    // Create buildings
    const buildings = []
    for (let row = 0; row < 13; row++) {
      for (let col = 0; col < 15; col++) {
        const blockX = 132 + col * 140
        const blockY = 116 + row * 100
        
        // Add 1-3 buildings per block
        const buildingCount = Math.floor(Math.random() * 3) + 1
        for (let b = 0; b < buildingCount; b++) {
          const width = 40 + Math.random() * 40
          const height = 30 + Math.random() * 30
          const offsetX = Math.random() * (70 - width)
          const offsetY = Math.random() * (36 - height)
          
          buildings.push({
            x: blockX + offsetX,
            y: blockY + offsetY,
            width,
            height
          })
        }
      }
    }
    setBuildings(buildings)
    
    // Create street names
    const streetNames = []
    const horizontalStreets = ['Main St', 'Broadway', 'Oak Ave', 'Pine St', 'Elm St', 'Maple Ave', 'Cedar St', 'First St', 'Second St', 'Third St', 'Fourth St', 'Fifth St', 'Park Ave', 'Central St']
    const verticalStreets = ['First Ave', 'Second Ave', 'Third Ave', 'Fourth Ave', 'Fifth Ave', 'Central Ave', 'North Ave', 'South Ave', 'East Ave', 'West Ave', 'Grand Ave', 'Union Ave', 'Liberty Ave', 'Washington Ave', 'Lincoln Ave', 'Jefferson Ave']
    
    horizontalStreets.forEach((name, i) => {
      const y = 84 + i * 100 + 16
      streetNames.push({ name, x: worldSize.width / 2, y })
    })
    
    verticalStreets.forEach((name, i) => {
      const x = 100 + i * 140 + 16
      streetNames.push({ name, x, y: worldSize.height / 2 })
    })
    
    setStreetNames(streetNames)
    
    // Create landmarks
    const landmarks = [
      { name: 'Downtown', icon: '🏢', x: 600, y: 400 },
      { name: 'Airport', icon: '✈️', x: 1800, y: 800 },
      { name: 'Mall', icon: '🛍️', x: 1200, y: 1200 },
      { name: 'Station', icon: '🚉', x: 400, y: 1000 },
      { name: 'Hospital', icon: '🏥', x: 2000, y: 400 },
      { name: 'University', icon: '🎓', x: 800, y: 1400 }
    ]
    setLandmarks(landmarks)
    
    console.log('✅ Traffic Simulator initialized!')
  }, [worldSize, setBuildings, setRoads, setStreetNames, setLandmarks])
  
  // Spawn a rider
  const spawnRider = useCallback(() => {
    const x = Math.random() * (worldSize.width - 200) + 100
    const y = Math.random() * (worldSize.height - 200) + 100
    
    const rider = {
      id: nextRiderId++,
      x,
      y,
      status: 'idle'
    }
    
    addRider(rider)
    console.log(`🏍️ Spawned rider #${rider.id} at (${Math.round(x)}, ${Math.round(y)})`)
  }, [worldSize, addRider])
  
  // Spawn a driver
  const spawnDriver = useCallback(() => {
    const x = Math.random() * (worldSize.width - 200) + 100
    const y = Math.random() * (worldSize.height - 200) + 100
    
    const driver = {
      id: nextDriverId++,
      x,
      y,
      status: 'idle',
      speed: 2
    }
    
    addDriver(driver)
    console.log(`🚗 Spawned driver #${driver.id} at (${Math.round(x)}, ${Math.round(y)})`)
  }, [worldSize, addDriver])
  
  // Create a ride request
  const createRideRequest = useCallback(() => {
    // Find an idle rider
    const idleRiders = riders.filter(r => r.status === 'idle')
    if (idleRiders.length === 0) {
      console.log('⚠️ No idle riders available!')
      return
    }
    
    const rider = idleRiders[Math.floor(Math.random() * idleRiders.length)]
    
    const pickupX = rider.x
    const pickupY = rider.y
    const dropoffX = Math.random() * (worldSize.width - 200) + 100
    const dropoffY = Math.random() * (worldSize.height - 200) + 100
    
    const distance = Math.sqrt(
      Math.pow(dropoffX - pickupX, 2) + Math.pow(dropoffY - pickupY, 2)
    )
    const fare = Math.round(distance * 0.1) || 10
    
    const ride = {
      id: nextRideId++,
      riderId: rider.id,
      pickupX,
      pickupY,
      dropoffX,
      dropoffY,
      fare,
      distance,
      assignedDriver: null,
      status: 'waiting_for_pickup',
      createdAt: Date.now()
    }
    
    // Update rider status
    updateRider(rider.id, { status: 'waiting' })
    
    // Find closest idle driver and assign
    const idleDrivers = drivers.filter(d => d.status === 'idle')
    if (idleDrivers.length > 0) {
      let closestDriver = null
      let closestDistance = Infinity
      
      idleDrivers.forEach(d => {
        const dist = Math.sqrt(
          Math.pow(d.x - pickupX, 2) + Math.pow(d.y - pickupY, 2)
        )
        if (dist < closestDistance) {
          closestDistance = dist
          closestDriver = d
        }
      })
      
      if (closestDriver) {
        ride.assignedDriver = closestDriver
        ride.status = 'going_to_rider'
        updateDriver(closestDriver.id, {
          status: 'going_to_rider',
          targetX: pickupX,
          targetY: pickupY
        })
        console.log(`🚗 Driver #${closestDriver.id} assigned to ride #${ride.id}`)
      }
    }
    
    addRideRequest(ride)
    console.log(`📱 Created ride request #${ride.id}: $${fare}`)
  }, [worldSize, addRideRequest, riders, drivers, updateRider, updateDriver])
  
  // Clean the map
  const cleanMap = useCallback(() => {
    cleanMapContext()
    nextDriverId = 1
    nextRiderId = 1
    nextRideId = 1
    console.log('🧹 Map cleaned!')
  }, [cleanMapContext])
  
  return {
    initializeGame,
    spawnRider,
    spawnDriver,
    createRideRequest,
    cleanMap
  }
}

