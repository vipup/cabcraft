import { useEffect, useRef } from 'react'
import { useGame } from '../context/GameContext'
import { findPath } from '../utils/pathfinding'

export const useGameLoop = () => {
  const {
    drivers,
    riders,
    rideRequests,
    simulationSpeed,
    updateDriver,
    updateRider,
    updateRideRequest,
    removeRideRequest,
    addEarnings,
    setActiveRides
  } = useGame()
  
  const animationFrameRef = useRef(null)
  const gameStateRef = useRef({ drivers: [], riders: [], rideRequests: [] })
  const updatersRef = useRef({})
  const simulationSpeedRef = useRef(1.0)
  
  // Keep refs up to date with latest state
  gameStateRef.current = { drivers, riders, rideRequests }
  simulationSpeedRef.current = simulationSpeed
  updatersRef.current = {
    updateDriver,
    updateRider,
    updateRideRequest,
    removeRideRequest,
    addEarnings,
    setActiveRides
  }
  
  useEffect(() => {
    console.log('🎮 Game Loop STARTED')
    let lastTime = Date.now()
    let frameCount = 0
    
    const gameLoop = () => {
      const now = Date.now()
      const deltaTime = ((now - lastTime) / 1000) * simulationSpeedRef.current // Apply simulation speed
      lastTime = now
      
      frameCount++
      if (frameCount % 60 === 0) {
        console.log(`🎮 Game Loop running... Frame ${frameCount}, Drivers: ${gameStateRef.current.drivers.length}, Speed: ${simulationSpeedRef.current.toFixed(2)}x`)
      }
      
      const { drivers, riders, rideRequests } = gameStateRef.current
      const { updateDriver, updateRider, updateRideRequest, removeRideRequest, addEarnings, setActiveRides } = updatersRef.current
      
      // Update all drivers
      drivers.forEach(driver => {
        if (driver.status === 'going_to_rider' && driver.targetX !== undefined) {
          // Ground drivers use pathfinding, air drivers fly directly
          if (driver.type === 'ground') {
            // Initialize path if not exists
            if (!driver.path || driver.path.length === 0) {
              const path = findPath(
                { x: driver.x, y: driver.y },
                { x: driver.targetX, y: driver.targetY }
              )
              updateDriver(driver.id, { path, pathIndex: 0 })
              return
            }
            
            // Follow waypoints
            const currentWaypoint = driver.path[driver.pathIndex]
            if (!currentWaypoint) {
              // Path completed, reached final target
              const ride = rideRequests.find(r => r.assignedDriver?.id === driver.id)
              if (ride) {
                console.log(`✅ Ground Driver #${driver.id} picked up rider for ride #${ride.id}`)
                
                // Calculate new path for dropoff
                const dropoffPath = findPath(
                  { x: ride.pickupX, y: ride.pickupY },
                  { x: ride.dropoffX, y: ride.dropoffY }
                )
                
                updateDriver(driver.id, {
                  status: 'on_ride',
                  targetX: ride.dropoffX,
                  targetY: ride.dropoffY,
                  x: ride.pickupX,
                  y: ride.pickupY,
                  path: dropoffPath,
                  pathIndex: 0
                })
                
                updateRideRequest(ride.id, {
                  status: 'in_ride'
                })
                
                const rider = riders.find(r => r.id === ride.riderId)
                if (rider) {
                  updateRider(rider.id, {
                    status: 'in_ride',
                    x: ride.pickupX,
                    y: ride.pickupY
                  })
                }
              }
              return
            }
            
            // Move towards current waypoint
            const dx = currentWaypoint.x - driver.x
            const dy = currentWaypoint.y - driver.y
            const distance = Math.sqrt(dx * dx + dy * dy)
            
            if (distance < 10) {
              // Reached waypoint, move to next
              updateDriver(driver.id, {
                pathIndex: driver.pathIndex + 1
              })
            } else {
              // Move towards waypoint
              const speed = driver.speed || 100 // Ground drivers are slower
              const moveDistance = speed * deltaTime
              const ratio = Math.min(moveDistance / distance, 1)
              
              updateDriver(driver.id, {
                x: driver.x + dx * ratio,
                y: driver.y + dy * ratio
              })
            }
          } else {
            // Air driver - fly directly (original behavior)
            const dx = driver.targetX - driver.x
            const dy = driver.targetY - driver.y
            const distance = Math.sqrt(dx * dx + dy * dy)
            
            if (frameCount % 60 === 0 && distance < 200) {
              console.log(`Air Driver #${driver.id}: going_to_rider, distance=${distance.toFixed(0)}px`)
            }
            
            if (distance < 20) {
              // Reached pickup - pick up rider
              const ride = rideRequests.find(r => r.assignedDriver?.id === driver.id)
              if (ride) {
                console.log(`✅ Air Driver #${driver.id} picked up rider for ride #${ride.id}`)
                
                updateDriver(driver.id, {
                  status: 'on_ride',
                  targetX: ride.dropoffX,
                  targetY: ride.dropoffY,
                  x: ride.pickupX,
                  y: ride.pickupY
                })
                
                updateRideRequest(ride.id, {
                  status: 'in_ride'
                })
                
                const rider = riders.find(r => r.id === ride.riderId)
                if (rider) {
                  updateRider(rider.id, {
                    status: 'in_ride',
                    x: ride.pickupX,
                    y: ride.pickupY
                  })
                }
              }
            } else {
              // Move towards target
              const speed = driver.speed || 200 // Air drivers are faster
              const moveDistance = speed * deltaTime
              const ratio = Math.min(moveDistance / distance, 1)
              
              updateDriver(driver.id, {
                x: driver.x + dx * ratio,
                y: driver.y + dy * ratio
              })
            }
          }
        } else if (driver.status === 'on_ride' && driver.targetX !== undefined) {
          // Ground drivers use pathfinding, air drivers fly directly
          if (driver.type === 'ground') {
            // Follow waypoints for dropoff
            if (!driver.path || driver.path.length === 0) {
              // Path should have been set during pickup, but recalculate if missing
              const ride = rideRequests.find(r => r.assignedDriver?.id === driver.id)
              if (ride) {
                const path = findPath(
                  { x: driver.x, y: driver.y },
                  { x: ride.dropoffX, y: ride.dropoffY }
                )
                updateDriver(driver.id, { path, pathIndex: 0 })
              }
              return
            }
            
            const currentWaypoint = driver.path[driver.pathIndex]
            if (!currentWaypoint) {
              // Path completed, reached dropoff
              const ride = rideRequests.find(r => r.assignedDriver?.id === driver.id)
              if (ride) {
                console.log(`💰 Ground Ride #${ride.id} completed! Earned $${ride.fare}`)
                
                addEarnings(ride.fare)
                
                updateDriver(driver.id, {
                  status: 'idle',
                  targetX: undefined,
                  targetY: undefined,
                  x: ride.dropoffX,
                  y: ride.dropoffY,
                  path: undefined,
                  pathIndex: undefined
                })
                
                const rider = riders.find(r => r.id === ride.riderId)
                if (rider) {
                  updateRider(rider.id, {
                    status: 'idle',
                    x: ride.dropoffX,
                    y: ride.dropoffY
                  })
                }
                
                removeRideRequest(ride.id)
              }
              return
            }
            
            // Move towards current waypoint
            const dx = currentWaypoint.x - driver.x
            const dy = currentWaypoint.y - driver.y
            const distance = Math.sqrt(dx * dx + dy * dy)
            
            if (distance < 10) {
              // Reached waypoint, move to next
              updateDriver(driver.id, {
                pathIndex: driver.pathIndex + 1
              })
            } else {
              // Move towards waypoint
              const speed = driver.speed || 100
              const moveDistance = speed * deltaTime
              const ratio = Math.min(moveDistance / distance, 1)
              
              const newX = driver.x + dx * ratio
              const newY = driver.y + dy * ratio
              
              updateDriver(driver.id, {
                x: newX,
                y: newY
              })
              
              // Move rider with driver
              const ride = rideRequests.find(r => r.assignedDriver?.id === driver.id)
              if (ride) {
                const rider = riders.find(r => r.id === ride.riderId)
                if (rider && rider.status === 'in_ride') {
                  updateRider(rider.id, {
                    x: newX,
                    y: newY
                  })
                }
              }
            }
          } else {
            // Air driver - fly directly (original behavior)
            const dx = driver.targetX - driver.x
            const dy = driver.targetY - driver.y
            const distance = Math.sqrt(dx * dx + dy * dy)
            
            if (frameCount % 60 === 0) {
              console.log(`Air Driver #${driver.id}: on_ride, distance=${distance.toFixed(0)}px to dropoff`)
            }
            
            if (distance < 20) {
              // Reached dropoff - complete ride
              const ride = rideRequests.find(r => r.assignedDriver?.id === driver.id)
              if (ride) {
                console.log(`💰 Air Ride #${ride.id} completed! Earned $${ride.fare}`)
                
                addEarnings(ride.fare)
                
                updateDriver(driver.id, {
                  status: 'idle',
                  targetX: undefined,
                  targetY: undefined,
                  x: ride.dropoffX,
                  y: ride.dropoffY
                })
                
                const rider = riders.find(r => r.id === ride.riderId)
                if (rider) {
                  updateRider(rider.id, {
                    status: 'idle',
                    x: ride.dropoffX,
                    y: ride.dropoffY
                  })
                }
                
                removeRideRequest(ride.id)
              }
            } else {
              // Move towards target
              const speed = driver.speed || 200
              const moveDistance = speed * deltaTime
              const ratio = Math.min(moveDistance / distance, 1)
              
              const newX = driver.x + dx * ratio
              const newY = driver.y + dy * ratio
              
              updateDriver(driver.id, {
                x: newX,
                y: newY
              })
              
              // Move rider with driver
              const ride = rideRequests.find(r => r.assignedDriver?.id === driver.id)
              if (ride) {
                const rider = riders.find(r => r.id === ride.riderId)
                if (rider && rider.status === 'in_ride') {
                  updateRider(rider.id, {
                    x: newX,
                    y: newY
                  })
                }
              }
            }
          }
        }
      })
      
      // Update active rides count
      const activeCount = rideRequests.filter(r => r.assignedDriver).length
      setActiveRides(activeCount)
      
      animationFrameRef.current = requestAnimationFrame(gameLoop)
    }
    
    // Start game loop
    animationFrameRef.current = requestAnimationFrame(gameLoop)
    
    // Cleanup
    return () => {
      console.log('🎮 Game Loop STOPPED')
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, []) // Empty dependency - run once only!
}
