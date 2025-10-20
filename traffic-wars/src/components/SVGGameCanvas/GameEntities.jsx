import React from 'react'
import { useGame } from '../../context/GameContext'

const GameEntities = () => {
  const { drivers, riders, rideRequests } = useGame()
  
  return (
    <g className="game-entities">
      {/* Ride Request Markers */}
      {rideRequests.map((ride) => (
        <g key={`ride-${ride.id}`}>
          {/* Pickup marker */}
          <circle
            cx={ride.pickupX}
            cy={ride.pickupY}
            r="12"
            fill="yellow"
            stroke="orange"
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
            fill="green"
            stroke="darkgreen"
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

