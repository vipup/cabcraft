import React from 'react'
import { useGame } from '../../context/GameContext'
import { useViewportCulling } from '../../hooks/useViewportCulling'

const CityBackground = () => {
  const { roads, buildings, streetNames, landmarks } = useGame()
  const { filterByViewport } = useViewportCulling()
  
  // Apply viewport culling to reduce DOM nodes
  const visibleBuildings = filterByViewport(buildings)
  const visibleStreetNames = filterByViewport(streetNames, (street) => ({ 
    x: street.x - 50, 
    y: street.y - 10, 
    width: 100, 
    height: 20 
  }))
  
  return (
    <g className="city-background">
      {/* Roads - Always render all roads as they're part of the grid */}
      {roads.map((road, index) => (
        <rect
          key={`road-${index}`}
          x={road.x}
          y={road.y}
          width={road.width}
          height={road.height}
          fill="#4a5a6a"
        />
      ))}
      
      {/* Buildings - Only render visible ones */}
      {visibleBuildings.map((building, index) => (
        <rect
          key={`building-${building.x}-${building.y}`}
          x={building.x}
          y={building.y}
          width={building.width}
          height={building.height}
          fill="#8f9ca3"
          stroke="#6d7d8e"
          strokeWidth="2"
        />
      ))}
      
      {/* Street Names - Only render visible ones */}
      {visibleStreetNames.map((street, index) => (
        <text
          key={`street-${street.x}-${street.y}`}
          x={street.x}
          y={street.y}
          fill="white"
          fontSize="12"
          fontWeight="bold"
          textAnchor="middle"
          style={{ pointerEvents: 'none' }}
        >
          {street.name}
        </text>
      ))}
      
      {/* Landmarks */}
      {landmarks.map((landmark, index) => (
        <g key={`landmark-${index}`}>
          <text
            x={landmark.x}
            y={landmark.y}
            fill="yellow"
            fontSize="20"
            textAnchor="middle"
          >
            {landmark.icon}
          </text>
          <text
            x={landmark.x}
            y={landmark.y + 20}
            fill="white"
            fontSize="12"
            textAnchor="middle"
            fontWeight="bold"
          >
            {landmark.name}
          </text>
        </g>
      ))}
    </g>
  )
}

export default CityBackground

