import React, { useState, useEffect } from 'react'
import { useGame } from '../../context/GameContext'

const GameEntities = () => {
  const { drivers, riders, rideRequests } = useGame()
  
  // Force re-render every frame using requestAnimationFrame
  const [, forceUpdate] = useState(0)
  
  useEffect(() => {
    let frameId
    const animate = () => {
      forceUpdate(n => n + 1)
      frameId = requestAnimationFrame(animate)
    }
    frameId = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(frameId)
  }, [])
  
  return (
    <g className="game-entities">
      {/* Path Lines */}
      {rideRequests.map((ride) => {
        if (!ride.assignedDriver) return null
        
        const driver = drivers.find(d => d.id === ride.assignedDriver.id)
        if (!driver) return null
        
        // Draw path from driver to current target
        const targetX = driver.status === 'going_to_rider' ? ride.pickupX : ride.dropoffX
        const targetY = driver.status === 'going_to_rider' ? ride.pickupY : ride.dropoffY
        const pathColor = driver.status === 'going_to_rider' ? '#3498db' : '#2ecc71' // Blue for pickup, Green for delivery
        
        return (
          <line
            key={`path-${ride.id}`}
            x1={driver.x}
            y1={driver.y}
            x2={targetX}
            y2={targetY}
            stroke={pathColor}
            strokeWidth="3"
            strokeDasharray="10,5"
            opacity="0.6"
          />
        )
      })}
      
      {/* Ride Request Markers */}
      {rideRequests.map((ride) => (
        <g key={`ride-${ride.id}`}>
          {/* Pickup marker */}
          <circle
            cx={ride.pickupX}
            cy={ride.pickupY}
            r="12"
            fill="#f1c40f"
            stroke="#e67e22"
            strokeWidth="2"
            opacity="0.8"
          />
          <text
            x={ride.pickupX}
            y={ride.pickupY + 20}
            fill="white"
            fontSize="10"
            textAnchor="middle"
            fontWeight="bold"
          >
            ${ride.fare}
          </text>
          
          {/* Dropoff marker */}
          <circle
            cx={ride.dropoffX}
            cy={ride.dropoffY}
            r="10"
            fill="#2ecc71"
            stroke="#27ae60"
            strokeWidth="2"
            opacity="0.6"
          />
        </g>
      ))}
      
      {/* Riders */}
      {riders.map((rider) => (
        <g key={`rider-${rider.id}`}>
          <circle
            cx={rider.x}
            cy={rider.y}
            r="9"
            fill="#2ecc71"
            stroke="#27ae60"
            strokeWidth="2"
          />
          <text
            x={rider.x}
            y={rider.y + 4}
            fill="white"
            fontSize="12"
            textAnchor="middle"
          >
            🏍️
          </text>
        </g>
      ))}
      
      {/* Drivers */}
      {drivers.map((driver) => (
        <g key={`driver-${driver.id}`}>
          <rect
            x={driver.x - 12}
            y={driver.y - 12}
            width="24"
            height="24"
            fill="#3498db"
            stroke="#2980b9"
            strokeWidth="2"
            rx="4"
          />
          <text
            x={driver.x}
            y={driver.y + 5}
            fill="white"
            fontSize="14"
            textAnchor="middle"
          >
            🚗
          </text>
        </g>
      ))}
    </g>
  )
}

export default GameEntities

