/**
 * A* Pathfinding for Traffic Simulator
 * Ground drivers use this to navigate along roads
 */

import { debug, info, warn, error } from './logger'

// Road grid configuration (matches useTrafficSimulator.js)
const WORLD_WIDTH = 2400
const WORLD_HEIGHT = 1600
const HORIZONTAL_ROAD_SPACING = 100
const VERTICAL_ROAD_SPACING = 140
const ROAD_WIDTH = 32

// Calculate road centers
const HORIZONTAL_ROADS = Array.from({ length: 14 }, (_, i) => 84 + i * HORIZONTAL_ROAD_SPACING + ROAD_WIDTH / 2) // Y positions
const VERTICAL_ROADS = Array.from({ length: 16 }, (_, i) => 100 + i * VERTICAL_ROAD_SPACING + ROAD_WIDTH / 2) // X positions

/**
 * Find the nearest road intersection to a given position
 */
export function findNearestIntersection(x, y) {
  let nearestX = VERTICAL_ROADS[0]
  let nearestY = HORIZONTAL_ROADS[0]
  let minDistX = Math.abs(x - nearestX)
  let minDistY = Math.abs(y - nearestY)
  
  // Find nearest vertical road
  for (const roadX of VERTICAL_ROADS) {
    const dist = Math.abs(x - roadX)
    if (dist < minDistX) {
      minDistX = dist
      nearestX = roadX
    }
  }
  
  // Find nearest horizontal road
  for (const roadY of HORIZONTAL_ROADS) {
    const dist = Math.abs(y - roadY)
    if (dist < minDistY) {
      minDistY = dist
      nearestY = roadY
    }
  }
  
  return { x: nearestX, y: nearestY }
}

/**
 * Manhattan distance heuristic for A*
 */
function manhattanDistance(x1, y1, x2, y2) {
  return Math.abs(x1 - x2) + Math.abs(y1 - y2)
}

/**
 * Get grid indices for an intersection
 */
function getGridIndices(x, y) {
  const gridX = VERTICAL_ROADS.indexOf(x)
  const gridY = HORIZONTAL_ROADS.indexOf(y)
  return { gridX, gridY }
}

/**
 * Get neighbors of an intersection in the grid
 */
function getNeighbors(x, y) {
  const neighbors = []
  const { gridX, gridY } = getGridIndices(x, y)
  
  // Up
  if (gridY > 0) {
    neighbors.push({ x, y: HORIZONTAL_ROADS[gridY - 1] })
  }
  // Down
  if (gridY < HORIZONTAL_ROADS.length - 1) {
    neighbors.push({ x, y: HORIZONTAL_ROADS[gridY + 1] })
  }
  // Left
  if (gridX > 0) {
    neighbors.push({ x: VERTICAL_ROADS[gridX - 1], y })
  }
  // Right
  if (gridX < VERTICAL_ROADS.length - 1) {
    neighbors.push({ x: VERTICAL_ROADS[gridX + 1], y })
  }
  
  return neighbors
}

/**
 * A* pathfinding algorithm to find path along roads
 * Returns array of waypoints (intersections) from start to goal
 * @param {object} start - {x, y} start position
 * @param {object} goal - {x, y} goal position
 */
export function findPath(start, goal) {
  // Snap start and goal to nearest intersections
  const startNode = findNearestIntersection(start.x, start.y)
  const goalNode = findNearestIntersection(goal.x, goal.y)
  
  debug(`🔍 Pathfinding from (${start.x.toFixed(0)}, ${start.y.toFixed(0)}) to (${goal.x.toFixed(0)}, ${goal.y.toFixed(0)})`)
  debug(`📍 Start intersection: (${startNode.x}, ${startNode.y}), Goal intersection: (${goalNode.x}, ${goalNode.y})`)
  
  // If start and goal are the same intersection, return direct path
  if (startNode.x === goalNode.x && startNode.y === goalNode.y) {
    debug('✅ Start and goal are the same intersection')
    return [startNode, goalNode]
  }
  
  // A* data structures
  const openSet = [startNode]
  const cameFrom = new Map()
  const gScore = new Map()
  const fScore = new Map()
  const closedSet = new Set() // Added closed set
  
  const key = (x, y) => `${x},${y}`
  
  gScore.set(key(startNode.x, startNode.y), 0)
  fScore.set(key(startNode.x, startNode.y), manhattanDistance(startNode.x, startNode.y, goalNode.x, goalNode.y))
  
  while (openSet.length > 0) {
    // Find node with lowest fScore
    let current = openSet[0]
    let currentIdx = 0
    for (let i = 1; i < openSet.length; i++) {
      const currentF = fScore.get(key(current.x, current.y)) || Infinity
      const candidateF = fScore.get(key(openSet[i].x, openSet[i].y)) || Infinity
      if (candidateF < currentF) {
        current = openSet[i]
        currentIdx = i
      }
    }
    
    // Goal reached - reconstruct path
    if (current.x === goalNode.x && current.y === goalNode.y) {
      const path = [current]
      let curr = current
      
      while (cameFrom.has(key(curr.x, curr.y))) {
        curr = cameFrom.get(key(curr.x, curr.y))
        path.unshift(curr)
      }
      
      return path
    }
    
    // Remove current from open set and add to closed set
    openSet.splice(currentIdx, 1)
    closedSet.add(key(current.x, current.y))
    
    // Check neighbors
    const neighbors = getNeighbors(current.x, current.y)
    debug(`🔎 Current: (${current.x}, ${current.y}), Neighbors: ${neighbors.length}, OpenSet size: ${openSet.length}`)
    
    for (const neighbor of neighbors) {
      // Skip if already evaluated
      if (closedSet.has(key(neighbor.x, neighbor.y))) {
        debug(`   ⏭️ Skipping closed neighbor: (${neighbor.x}, ${neighbor.y})`)
        continue
      }
      
      const currentG = gScore.get(key(current.x, current.y))
      if (currentG === undefined) {
        error(`❌ ERROR: No gScore for current node (${current.x}, ${current.y})!`)
        continue
      }
      
      const tentativeG = currentG + manhattanDistance(current.x, current.y, neighbor.x, neighbor.y)
      
      const currentNeighborG = gScore.get(key(neighbor.x, neighbor.y))
      debug(`   🔍 Neighbor (${neighbor.x}, ${neighbor.y}): tentativeG=${tentativeG.toFixed(0)}, currentG=${currentNeighborG || 'undefined'}`)
      
      if (tentativeG < (currentNeighborG || Infinity)) {
        cameFrom.set(key(neighbor.x, neighbor.y), current)
        gScore.set(key(neighbor.x, neighbor.y), tentativeG)
        fScore.set(key(neighbor.x, neighbor.y), tentativeG + manhattanDistance(neighbor.x, neighbor.y, goalNode.x, goalNode.y))
        
        // Add to open set if not already there
        if (!openSet.some(n => n.x === neighbor.x && n.y === neighbor.y)) {
          openSet.push(neighbor)
          debug(`   ✅ Added to openSet: (${neighbor.x}, ${neighbor.y})`)
        } else {
          debug(`   ℹ️ Already in openSet: (${neighbor.x}, ${neighbor.y})`)
        }
      }
    }
    debug(`📊 End of iteration: OpenSet size = ${openSet.length}`)
  }
  
  // No path found - return direct path as fallback
  warn('⚠️ No path found, using direct route')
  return [startNode, goalNode]
}

/**
 * Check if position is on a road
 */
export function isOnRoad(x, y) {
  const THRESHOLD = ROAD_WIDTH / 2
  
  // Check if on horizontal road
  for (const roadY of HORIZONTAL_ROADS) {
    if (Math.abs(y - roadY) < THRESHOLD) {
      return true
    }
  }
  
  // Check if on vertical road
  for (const roadX of VERTICAL_ROADS) {
    if (Math.abs(x - roadX) < THRESHOLD) {
      return true
    }
  }
  
  return false
}

