import { useMemo } from 'react'
import { useGame } from '../context/GameContext'

/**
 * Viewport Culling Hook - Only render objects within viewport + padding
 * This provides significant performance improvements by reducing DOM nodes
 */
export const useViewportCulling = () => {
  const { camera, worldSize } = useGame()
  
  // Calculate viewport bounds with padding
  const viewportBounds = useMemo(() => {
    const viewportWidth = window.innerWidth - 56 - 300 // left toolbar + right panel
    const viewportHeight = window.innerHeight - 48 - 32 // top banner + bottom bar
    
    const safeViewportWidth = Math.max(100, viewportWidth)
    const safeViewportHeight = Math.max(100, viewportHeight)
    
    const halfViewWidth = (safeViewportWidth / camera.zoom) / 2
    const halfViewHeight = (safeViewportHeight / camera.zoom) / 2
    
    const clampedCameraX = Math.max(halfViewWidth, Math.min(worldSize.width - halfViewWidth, camera.x))
    const clampedCameraY = Math.max(halfViewHeight, Math.min(worldSize.height - halfViewHeight, camera.y))
    
    // Add padding for smooth scrolling (100px)
    const padding = 100
    
    return {
      minX: Math.max(0, clampedCameraX - halfViewWidth - padding),
      maxX: Math.min(worldSize.width, clampedCameraX + halfViewWidth + padding),
      minY: Math.max(0, clampedCameraY - halfViewHeight - padding),
      maxY: Math.min(worldSize.height, clampedCameraY + halfViewHeight + padding)
    }
  }, [camera, worldSize])
  
  // Check if object is in viewport
  const isInViewport = useMemo(() => {
    return (x, y, objectWidth = 0, objectHeight = 0) => {
      return x + objectWidth >= viewportBounds.minX &&
             x <= viewportBounds.maxX &&
             y + objectHeight >= viewportBounds.minY &&
             y <= viewportBounds.maxY
    }
  }, [viewportBounds])
  
  // Filter objects by viewport
  const filterByViewport = useMemo(() => {
    return (objects, getPosition = (obj) => ({ x: obj.x, y: obj.y, width: obj.width || 0, height: obj.height || 0 })) => {
      return objects.filter(obj => {
        const pos = getPosition(obj)
        return isInViewport(pos.x, pos.y, pos.width, pos.height)
      })
    }
  }, [isInViewport])
  
  return {
    viewportBounds,
    isInViewport,
    filterByViewport
  }
}
