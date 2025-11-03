import React, { useEffect } from 'react'
import { useGame } from '../../context/GameContext'
import { useTrafficSimulator } from '../../hooks/useTrafficSimulator'
import { useGameLoop } from '../../hooks/useGameLoop'
import { useAutonomousSimulation } from '../../hooks/useAutonomousSimulation'
import TopBanner from '../TopBanner/TopBanner'
import LeftToolbar from '../LeftToolbar/LeftToolbar'
import SVGGameCanvas from '../SVGGameCanvas/SVGGameCanvas'
import BottomStatsBar from '../BottomStatsBar/BottomStatsBar'
import ActiveRidesPanel from '../ActiveRidesPanel/ActiveRidesPanel'
import './GameContainer.css'

const GameContainer = () => {
  console.log('🎯 GameContainer component rendering...')
  const { ridesPanelHidden } = useGame()
  const { initializeGame } = useTrafficSimulator()
  
  // Start game loop for animations
  useGameLoop()
  
  // Initialize autonomous simulation
  useAutonomousSimulation()
  
  useEffect(() => {
    // Initialize the game world
    initializeGame()
  }, [initializeGame])
  
  return (
    <div className="game-container">
      <TopBanner />
      <LeftToolbar />
      <SVGGameCanvas />
      <BottomStatsBar />
      {!ridesPanelHidden && <ActiveRidesPanel />}
    </div>
  )
}

export default GameContainer

