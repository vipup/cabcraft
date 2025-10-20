import React from 'react'
import { GameProvider } from './context/GameContext'
import GameContainer from './components/GameContainer/GameContainer'
import './App.css'

function App() {
  return (
    <GameProvider>
      <GameContainer />
    </GameProvider>
  )
}

export default App

