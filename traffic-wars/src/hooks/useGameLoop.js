import { useEffect, useRef } from 'react'
import { useGame } from '../context/GameContext'

export const useGameLoop = () => {
  const {
    drivers,
    riders,
    rideRequests,
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
  
  // Keep refs up to date with latest state
  gameStateRef.current = { drivers, riders, rideRequests }
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
      const deltaTime = (now - lastTime) / 1000 // seconds
      lastTime = now
      
      frameCount++
      if (frameCount % 60 === 0) {
        console.log(`🎮 Game Loop running... Frame ${frameCount}, Drivers: ${gameStateRef.current.drivers.length}`)
      }
      
      const { drivers, riders, rideRequests } = gameStateRef.current
      const { updateDriver, updateRider, updateRideRequest, removeRideRequest, addEarnings, setActiveRides } = updatersRef.current
      
      // Update all drivers
      drivers.forEach(driver => {
        if (driver.status === 'going_to_rider' && driver.targetX !== undefined) {
          // Move driver towards pickup location
          const dx = driver.targetX - driver.x
          const dy = driver.targetY - driver.y
          const distance = Math.sqrt(dx * dx + dy * dy)
          
          if (frameCount % 60 === 0 && distance < 200) {
            console.log(`Driver #${driver.id}: going_to_rider, distance=${distance.toFixed(0)}px`)
          }
          
          if (distance < 20) {
            // Reached pickup - pick up rider
            const ride = rideRequests.find(r => r.assignedDriver?.id === driver.id)
            if (ride) {
              console.log(`✅ Driver #${driver.id} picked up rider for ride #${ride.id}`)
              
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
            const speed = driver.speed || 150
            const moveDistance = speed * deltaTime
            const ratio = Math.min(moveDistance / distance, 1)
            
            updateDriver(driver.id, {
              x: driver.x + dx * ratio,
              y: driver.y + dy * ratio
            })
          }
        } else if (driver.status === 'on_ride' && driver.targetX !== undefined) {
          // Move driver (with rider) towards dropoff location
          const dx = driver.targetX - driver.x
          const dy = driver.targetY - driver.y
          const distance = Math.sqrt(dx * dx + dy * dy)
          
          if (frameCount % 60 === 0) {
            console.log(`Driver #${driver.id}: on_ride, distance=${distance.toFixed(0)}px to dropoff`)
          }
          
          if (distance < 20) {
            // Reached dropoff - complete ride
            const ride = rideRequests.find(r => r.assignedDriver?.id === driver.id)
            if (ride) {
              console.log(`💰 Ride #${ride.id} completed! Earned $${ride.fare}`)
              
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
            const speed = driver.speed || 150
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
