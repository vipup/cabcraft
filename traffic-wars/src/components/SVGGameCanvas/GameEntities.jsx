import React from 'react'
import { useGame } from '../../context/GameContext'
import { useViewportCulling } from '../../hooks/useViewportCulling'

const GameEntities = () => {
  const { drivers, riders, rideRequests } = useGame()
  const { filterByViewport } = useViewportCulling()
  
  // Apply viewport culling to game entities
  const visibleDrivers = filterByViewport(drivers, (driver) => ({ 
    x: driver.x - 12, 
    y: driver.y - 12, 
    width: 24, 
    height: 24 
  }))
  const visibleRiders = filterByViewport(riders, (rider) => ({ 
    x: rider.x - 9, 
    y: rider.y - 9, 
    width: 18, 
    height: 18 
  }))
  
  return (
    <g className="game-entities">
      {/* Path Lines */}
      {rideRequests.map((ride) => {
        if (!ride.assignedDriver) return null
        
        const driver = drivers.find(d => d.id === ride.assignedDriver.id)
        if (!driver) return null
        
        const pathColor = driver.status === 'going_to_rider' ? '#3498db' : '#2ecc71' // Blue for pickup, Green for delivery
        
        // Ground drivers show waypoint path, air drivers show direct line
        if (driver.type === 'ground' && driver.path && driver.path.length > 0) {
          // Draw path along waypoints
          const pathSegments = []
          
          // Line from driver to first waypoint
          if (driver.pathIndex < driver.path.length) {
            const firstWaypoint = driver.path[driver.pathIndex]
            pathSegments.push(
              <line
                key={`path-${ride.id}-start`}
                x1={driver.x}
                y1={driver.y}
                x2={firstWaypoint.x}
                y2={firstWaypoint.y}
                stroke={pathColor}
                strokeWidth="3"
                strokeDasharray="10,5"
                opacity="0.6"
              />
            )
          }
          
          // Lines between waypoints
          for (let i = driver.pathIndex; i < driver.path.length - 1; i++) {
            const wp1 = driver.path[i]
            const wp2 = driver.path[i + 1]
            pathSegments.push(
              <line
                key={`path-${ride.id}-${i}`}
                x1={wp1.x}
                y1={wp1.y}
                x2={wp2.x}
                y2={wp2.y}
                stroke={pathColor}
                strokeWidth="3"
                strokeDasharray="10,5"
                opacity="0.6"
              />
            )
          }
          
          return <g key={`path-group-${ride.id}`}>{pathSegments}</g>
        } else {
          // Air driver or no path - draw direct line
          const targetX = driver.status === 'going_to_rider' ? ride.pickupX : ride.dropoffX
          const targetY = driver.status === 'going_to_rider' ? ride.pickupY : ride.dropoffY
          
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
        }
      })}
      
      {/* Ride Request Markers */}
      {rideRequests.map((ride) => {
        const rideTypeEmoji = ride.type === 'air' ? '✈️' : '🚗'
        const pickupColor = ride.type === 'air' ? '#9b59b6' : '#f1c40f'
        const pickupStroke = ride.type === 'air' ? '#8e44ad' : '#e67e22'
        
        return (
          <g key={`ride-${ride.id}`}>
            {/* Pickup marker */}
            <circle
              cx={ride.pickupX}
              cy={ride.pickupY}
              r="12"
              fill={pickupColor}
              stroke={pickupStroke}
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
              {rideTypeEmoji} ${ride.fare}
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
        )
      })}
      
      {/* Riders - Only render visible ones */}
      {visibleRiders.map((rider) => (
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
            👤
          </text>
        </g>
      ))}
      
      {/* Drivers - Only render visible ones */}
      {visibleDrivers.map((driver) => {
        const isAir = driver.type === 'air'
        const driverIcon = isAir ? '✈️' : '🚗'
        const bgColor = isAir ? '#9b59b6' : '#3498db'
        const strokeColor = isAir ? '#8e44ad' : '#2980b9'
        
        return (
          <g key={`driver-${driver.id}`}>
            <rect
              x={driver.x - 12}
              y={driver.y - 12}
              width="24"
              height="24"
              fill={bgColor}
              stroke={strokeColor}
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
              {driverIcon}
            </text>
          </g>
        )
      })}
    </g>
  )
}

export default GameEntities

