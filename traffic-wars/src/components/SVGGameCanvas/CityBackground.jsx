import React from 'react'
import { useGame } from '../../context/GameContext'

const CityBackground = () => {
  const { roads, buildings, streetNames, landmarks } = useGame()
  
  return (
    <g className="city-background">
      {/* Roads */}
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
      
      {/* Buildings */}
      {buildings.map((building, index) => (
        <rect
          key={`building-${index}`}
          x={building.x}
          y={building.y}
          width={building.width}
          height={building.height}
          fill="#8f9ca3"
          stroke="#6d7d8e"
          strokeWidth="2"
        />
      ))}
      
      {/* Street Names */}
      {streetNames.map((street, index) => (
        <text
          key={`street-${index}`}
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

