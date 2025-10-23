import { useEffect, useRef } from 'react'
import { useGame } from '../context/GameContext'
import { useMobileOptimization } from './useMobileOptimization'
import { findPath } from '../utils/pathfinding'
import { debug, info, warn, error, logger } from '../utils/logger'

export const useGameLoop = () => {
  const {
    drivers,
    riders,
    rideRequests,
    simulationSpeed,
    logLevel,
    updateDriver,
    updateRider,
    updateRideRequest,
    removeRideRequest,
    addEarnings,
    setActiveRides,
    addCompletedRide,
    addDriverDistance
  } = useGame()
  
  const { optimalFrameRate, isMobile } = useMobileOptimization()
  
  const animationFrameRef = useRef(null)
  const gameStateRef = useRef({ drivers: [], riders: [], rideRequests: [] })
  const updatersRef = useRef({})
  const simulationSpeedRef = useRef(1.0)
  const lastFrameTimeRef = useRef(0)
  const frameIntervalRef = useRef(1000 / 60) // Default 60 FPS
  
  // Keep refs up to date with latest state
  gameStateRef.current = { drivers, riders, rideRequests }
  simulationSpeedRef.current = simulationSpeed
  updatersRef.current = {
    updateDriver,
    updateRider,
    updateRideRequest,
    removeRideRequest,
    addEarnings,
    setActiveRides,
    addCompletedRide,
    addDriverDistance
  }

  // Update logger level when it changes
  useEffect(() => {
    logger.setLevel(logLevel)
  }, [logLevel])
  
  // Update frame rate when optimal frame rate changes
  useEffect(() => {
    frameIntervalRef.current = 1000 / optimalFrameRate
    info(`🎮 Game loop frame rate set to ${optimalFrameRate} FPS (Mobile: ${isMobile})`)
  }, [optimalFrameRate, isMobile])
  
  // Helper function to assign idle drivers to waiting rides
  const assignDriverToWaitingRides = (drivers, rideRequests, updateDriver, updateRideRequest) => {
    // Find all unassigned rides
    const waitingRides = rideRequests.filter(r => !r.assignedDriver && r.status === 'waiting_for_pickup')
    
    // Track which drivers have been assigned in this iteration
    const assignedDriverIds = new Set()
    
    waitingRides.forEach(ride => {
      // Find idle drivers of the same type that haven't been assigned yet
      const idleDrivers = drivers.filter(d => 
        d.status === 'idle' && 
        d.type === ride.type && 
        !assignedDriverIds.has(d.id)
      )
      
      if (idleDrivers.length > 0) {
        // Find closest driver
        let closestDriver = null
        let closestDistance = Infinity
        
        idleDrivers.forEach(driver => {
          const dist = Math.sqrt(
            Math.pow(driver.x - ride.pickupX, 2) + Math.pow(driver.y - ride.pickupY, 2)
          )
          if (dist < closestDistance) {
            closestDistance = dist
            closestDriver = driver
          }
        })
        
        if (closestDriver) {
          // Mark this driver as assigned
          assignedDriverIds.add(closestDriver.id)
          
          // Assign driver to ride
          updateRideRequest(ride.id, {
            assignedDriver: closestDriver,
            status: 'going_to_rider'
          })
          
          updateDriver(closestDriver.id, {
            status: 'going_to_rider',
            targetX: ride.pickupX,
            targetY: ride.pickupY,
            path: undefined,
            pathIndex: undefined
          })
          
                 const emoji = ride.type === 'air' ? '✈️' : '🚗'
                 const unitName = ride.type === 'air' ? 'Pilot' : 'Driver'
                 info(`${emoji} Auto-assigned ${unitName} #${closestDriver.id} to waiting ${ride.type} ride #${ride.id}`)
        }
      }
    })
  }
  
  useEffect(() => {
    info('🎮 Game Loop STARTED')
    let lastTime = Date.now()
    let frameCount = 0
    
    const gameLoop = (currentTime) => {
      // Frame rate throttling for mobile optimization
      if (currentTime - lastFrameTimeRef.current < frameIntervalRef.current) {
        animationFrameRef.current = requestAnimationFrame(gameLoop)
        return
      }
      lastFrameTimeRef.current = currentTime
      
      const now = Date.now()
      const deltaTime = ((now - lastTime) / 1000) * simulationSpeedRef.current // Apply simulation speed
      lastTime = now
      
      frameCount++
      if (frameCount % 60 === 0) {
        debug(`🎮 Game Loop running... Frame ${frameCount}, Drivers: ${gameStateRef.current.drivers.length}, Speed: ${simulationSpeedRef.current.toFixed(2)}x`)
      }
      
      const { drivers, riders, rideRequests } = gameStateRef.current
      const { updateDriver, updateRider, updateRideRequest, removeRideRequest, addEarnings, setActiveRides, addCompletedRide, addDriverDistance } = updatersRef.current
      
      // Update all drivers
      drivers.forEach(driver => {
        if (driver.status === 'going_to_rider' && driver.targetX !== undefined) {
          // Ground drivers use pathfinding, air drivers fly directly
          if (driver.type === 'ground') {
            // Initialize path if not exists
            if (!driver.path || driver.path.length === 0 || driver.pathIndex === undefined) {
              try {
                const path = findPath(
                  { x: driver.x, y: driver.y },
                  { x: driver.targetX, y: driver.targetY }
                )
                if (path && path.length > 0) {
                  debug(`🗺️ Ground Driver #${driver.id}: Initializing path to pickup with ${path.length} waypoints`)
                  updateDriver(driver.id, { path, pathIndex: 0 })
                } else {
                  warn(`⚠️ Ground Driver #${driver.id}: Failed to find path to pickup, switching to direct movement`)
                  updateDriver(driver.id, { 
                    path: [{ x: driver.targetX, y: driver.targetY }], 
                    pathIndex: 0 
                  })
                }
              } catch (error) {
                error(`❌ Ground Driver #${driver.id}: Pathfinding error: ${error.message}`)
                updateDriver(driver.id, { 
                  path: [{ x: driver.targetX, y: driver.targetY }], 
                  pathIndex: 0 
                })
              }
              return
            }
            
            // Follow waypoints
            const currentWaypoint = driver.path[driver.pathIndex]
            if (!currentWaypoint) {
              // Path completed, reached final target
              const ride = rideRequests.find(r => r.assignedDriver?.id === driver.id)
              if (ride && ride.status === 'going_to_rider') {
                info(`✅ Ground Driver #${driver.id} picked up rider for ride #${ride.id}`)
                
                // Calculate new path for dropoff
                let dropoffPath
                try {
                  dropoffPath = findPath(
                    { x: ride.pickupX, y: ride.pickupY },
                    { x: ride.dropoffX, y: ride.dropoffY }
                  )
                  if (!dropoffPath || dropoffPath.length === 0) {
                    warn(`⚠️ Ground Driver #${driver.id}: Failed to find dropoff path, using direct route`)
                    dropoffPath = [{ x: ride.dropoffX, y: ride.dropoffY }]
                  }
                } catch (error) {
                  error(`❌ Ground Driver #${driver.id}: Dropoff pathfinding error: ${error.message}`)
                  dropoffPath = [{ x: ride.dropoffX, y: ride.dropoffY }]
                }
                
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
              debug(`Air Pilot #${driver.id}: going_to_rider, distance=${distance.toFixed(0)}px`)
            }
            
            if (distance < 20) {
              // Reached pickup - pick up rider (only if still going to rider)
              const ride = rideRequests.find(r => r.assignedDriver?.id === driver.id)
              if (ride && ride.status === 'going_to_rider') {
                info(`✅ Air Pilot #${driver.id} picked up rider for ride #${ride.id}`)
                
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
              
              const newX = driver.x + dx * ratio
              const newY = driver.y + dy * ratio
              
              // Track driver distance
              const distanceMoved = Math.sqrt(
                Math.pow(newX - driver.x, 2) + Math.pow(newY - driver.y, 2)
              )
              addDriverDistance(distanceMoved)
              
              updateDriver(driver.id, {
                x: newX,
                y: newY
              })
            }
          }
        } else if (driver.status === 'on_ride' && driver.targetX !== undefined) {
          // Ground drivers use pathfinding, air drivers fly directly
          if (driver.type === 'ground') {
            // Follow waypoints for dropoff
            if (!driver.path || driver.path.length === 0 || driver.pathIndex === undefined) {
              // Path should have been set during pickup, but recalculate if missing
              const ride = rideRequests.find(r => r.assignedDriver?.id === driver.id)
              if (ride) {
                try {
                  const path = findPath(
                    { x: driver.x, y: driver.y },
                    { x: ride.dropoffX, y: ride.dropoffY }
                  )
                  if (path && path.length > 0) {
                    debug(`🗺️ Ground Driver #${driver.id}: Recalculating path to dropoff with ${path.length} waypoints`)
                    updateDriver(driver.id, { path, pathIndex: 0 })
                  } else {
                    warn(`⚠️ Ground Driver #${driver.id}: Failed to recalculate dropoff path, using direct route`)
                    updateDriver(driver.id, { 
                      path: [{ x: ride.dropoffX, y: ride.dropoffY }], 
                      pathIndex: 0 
                    })
                  }
                } catch (error) {
                  error(`❌ Ground Driver #${driver.id}: Dropoff pathfinding error: ${error.message}`)
                  updateDriver(driver.id, { 
                    path: [{ x: ride.dropoffX, y: ride.dropoffY }], 
                    pathIndex: 0 
                  })
                }
              }
              return
            }
            
            const currentWaypoint = driver.path[driver.pathIndex]
            if (!currentWaypoint) {
              // Path completed, reached dropoff
              const ride = rideRequests.find(r => r.assignedDriver?.id === driver.id)
              if (ride && ride.status === 'in_ride') {
                info(`💰 Ground Ride #${ride.id} completed! Earned $${ride.fare}`)
                
                // Track ride completion statistics
                const rideDuration = Math.round((Date.now() - ride.createdAt) / 1000) // Convert to seconds
                const rideDistance = Math.sqrt(
                  Math.pow(ride.dropoffX - ride.pickupX, 2) + 
                  Math.pow(ride.dropoffY - ride.pickupY, 2)
                )
                
                addCompletedRide({
                  id: ride.id,
                  type: ride.type,
                  duration: rideDuration,
                  distance: rideDistance,
                  fare: ride.fare
                })
                
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
                
                // Check for waiting rides and assign this now-idle driver
                assignDriverToWaitingRides(drivers, rideRequests, updateDriver, updateRideRequest)
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
              
              // Track driver distance
              const distanceMoved = Math.sqrt(
                Math.pow(newX - driver.x, 2) + Math.pow(newY - driver.y, 2)
              )
              addDriverDistance(distanceMoved)
              
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
              debug(`Air Pilot #${driver.id}: on_ride, distance=${distance.toFixed(0)}px to dropoff`)
            }
            
            if (distance < 20) {
              // Reached dropoff - complete ride (only if still on ride)
              const ride = rideRequests.find(r => r.assignedDriver?.id === driver.id)
              if (ride && ride.status === 'in_ride') {
                info(`💰 Air Ride #${ride.id} completed! Earned $${ride.fare}`)
                
                // Track ride completion statistics
                const rideDuration = Math.round((Date.now() - ride.createdAt) / 1000) // Convert to seconds
                const rideDistance = Math.sqrt(
                  Math.pow(ride.dropoffX - ride.pickupX, 2) + 
                  Math.pow(ride.dropoffY - ride.pickupY, 2)
                )
                
                addCompletedRide({
                  id: ride.id,
                  type: ride.type,
                  duration: rideDuration,
                  distance: rideDistance,
                  fare: ride.fare
                })
                
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
                
                // Check for waiting rides and assign this now-idle driver
                assignDriverToWaitingRides(drivers, rideRequests, updateDriver, updateRideRequest)
              }
            } else {
              // Move towards target
              const speed = driver.speed || 200
              const moveDistance = speed * deltaTime
              const ratio = Math.min(moveDistance / distance, 1)
              
              const newX = driver.x + dx * ratio
              const newY = driver.y + dy * ratio
              
              // Track driver distance
              const distanceMoved = Math.sqrt(
                Math.pow(newX - driver.x, 2) + Math.pow(newY - driver.y, 2)
              )
              addDriverDistance(distanceMoved)
              
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
      
      // Periodically check for unassigned rides (every 60 frames = ~1 second)
      if (frameCount % 60 === 0) {
        assignDriverToWaitingRides(drivers, rideRequests, updateDriver, updateRideRequest)
        
        // Check for stuck rides (rides that have been in progress for more than 30 seconds)
        const currentTime = Date.now()
        const stuckRides = rideRequests.filter(ride => {
          const rideAge = currentTime - ride.createdAt
          return rideAge > 30000 && (ride.status === 'going_to_rider' || ride.status === 'in_ride')
        })
        
        if (stuckRides.length > 0) {
          warn(`⚠️ Found ${stuckRides.length} stuck rides, cleaning them up`)
          stuckRides.forEach(ride => {
            // Reset driver to idle
            if (ride.assignedDriver) {
              updateDriver(ride.assignedDriver.id, {
                status: 'idle',
                targetX: undefined,
                targetY: undefined,
                path: undefined,
                pathIndex: undefined
              })
            }
            
            // Reset rider to idle
            const rider = riders.find(r => r.id === ride.riderId)
            if (rider) {
              updateRider(rider.id, { status: 'idle' })
            }
            
            // Remove the stuck ride
            removeRideRequest(ride.id)
            warn(`🧹 Cleaned up stuck ride #${ride.id}`)
          })
        }
      }
      
      animationFrameRef.current = requestAnimationFrame(gameLoop)
    }
    
    // Start game loop
    animationFrameRef.current = requestAnimationFrame(gameLoop)
    
    // Cleanup
    return () => {
      info('🎮 Game Loop STOPPED')
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, []) // Empty dependency - run once only!
}
