import React, { useEffect } from 'react'
import { useGame } from '../../context/GameContext'
import { useTrafficSimulator } from '../../hooks/useTrafficSimulator'
import TopBanner from '../TopBanner/TopBanner'
import LeftToolbar from '../LeftToolbar/LeftToolbar'
import SVGGameCanvas from '../SVGGameCanvas/SVGGameCanvas'
import BottomStatsBar from '../BottomStatsBar/BottomStatsBar'
import ActiveRidesPanel from '../ActiveRidesPanel/ActiveRidesPanel'
import './GameContainer.css'

const GameContainer = () => {
  const { ridesPanelHidden } = useGame()
  const { initializeGame } = useTrafficSimulator()
  
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

