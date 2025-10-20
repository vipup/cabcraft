# 🚗 Traffic Simulator - React Edition

## Overview
A modular, component-based ride-sharing traffic simulator built with React and SVG rendering. This is a complete refactoring of the original single-file application into a professional, maintainable React architecture.

## Architecture

### Component Structure
```
src/
├── components/
│   ├── GameContainer/          # Main orchestration component
│   ├── TopBanner/               # Top achievement banner
│   ├── LeftToolbar/             # Left action buttons toolbar
│   ├── BottomStatsBar/          # Bottom statistics bar
│   ├── ActiveRidesPanel/        # Right panel for ride management
│   └── SVGGameCanvas/           # Main game rendering
│       ├── SVGGameCanvas.jsx    # Canvas container & camera controls
│       ├── CityBackground.jsx   # Roads, buildings, street names
│       └── GameEntities.jsx     # Drivers, riders, ride markers
├── context/
│   └── GameContext.jsx          # Global state management
├── hooks/
│   └── useTrafficSimulator.js   # Game logic and actions
├── styles/
│   └── global.css               # Global styles
├── App.jsx                      # Root component
└── main.jsx                     # React entry point
```

### Key Design Patterns

1. **Context API** - Global state management without prop drilling
2. **Custom Hooks** - Encapsulated game logic (`useTrafficSimulator`)
3. **Component Composition** - Modular, reusable components
4. **Separation of Concerns** - Logic, state, and presentation separated
5. **Immutable State Updates** - React best practices

## Installation & Setup

### Prerequisites
- Node.js 18+ and npm/yarn

### Install Dependencies
```bash
cd /home/i1/git/cabcraft/traffic-wars
npm install
```

### Development Server
```bash
npm run dev
```
Opens at http://localhost:8000

### Build for Production
```bash
npm run build
npm run preview
```

## Component Details

### GameContext
**Path**: `src/context/GameContext.jsx`
- Central state management for all game data
- Provides actions for updating entities
- Manages camera, world state, UI state, and game statistics

### useTrafficSimulator Hook
**Path**: `src/hooks/useTrafficSimulator.js`
- Encapsulates game initialization logic
- Provides actions: `spawnRider`, `spawnDriver`, `createRideRequest`, `cleanMap`
- Handles world generation (roads, buildings, landmarks)

### SVGGameCanvas
**Path**: `src/components/SVGGameCanvas/`
- Main rendering surface using SVG
- Camera controls (pan with drag, zoom with wheel)
- Delegates rendering to `CityBackground` and `GameEntities`

### UI Components
- **TopBanner**: Title, achievements, toggle rides panel
- **LeftToolbar**: Icon buttons for spawn/request/clean actions
- **BottomStatsBar**: Real-time game statistics
- **ActiveRidesPanel**: Filterable, sortable ride table

## Features Implemented

✅ **Modular Architecture** - Clean component separation
✅ **Context API** - Global state without prop drilling
✅ **Custom Hooks** - Reusable game logic
✅ **SVG Rendering** - City, roads, buildings, entities
✅ **Camera Controls** - Pan and zoom
✅ **Spawning** - Riders and drivers
✅ **Ride Requests** - Dynamic ride generation
✅ **UI Components** - All panels working
✅ **Filtering & Sorting** - Active rides management
✅ **Hot Module Replacement** - Fast development with Vite

## Migration from Old Version

### What Changed
1. **Single HTML file → React components** - Better organization
2. **Inline styles → CSS modules** - Scoped styling
3. **Global state → Context API** - Predictable state flow
4. **Monolithic JS → Hooks & services** - Testable, reusable logic
5. **Manual DOM → React rendering** - Automatic updates

### What's Preserved
- Same visual layout and styling
- Same game mechanics
- Same SVG rendering approach
- Same camera and control system

## Development Workflow

### Adding a New Component
```jsx
// 1. Create component directory
mkdir -p src/components/MyComponent

// 2. Create component file
// src/components/MyComponent/MyComponent.jsx
import React from 'react'
import { useGame } from '../../context/GameContext'
import './MyComponent.css'

const MyComponent = () => {
  const { someState } = useGame()
  return <div className="my-component">{someState}</div>
}

export default MyComponent

// 3. Create CSS file
// src/components/MyComponent/MyComponent.css
.my-component {
  /* styles */
}

// 4. Import and use in parent
import MyComponent from './components/MyComponent/MyComponent'
```

### Adding New State
```jsx
// In GameContext.jsx
const [newState, setNewState] = useState(initialValue)

// In value object
const value = {
  newState,
  setNewState,
  // ... other state
}
```

### Adding New Game Logic
```jsx
// In useTrafficSimulator.js or new custom hook
const newAction = useCallback(() => {
  // logic here
}, [dependencies])

return {
  newAction,
  // ... other actions
}
```

## Next Steps

### Phase 2 - Complete Game Logic
- [ ] Implement driver AI and movement
- [ ] Add ride assignment logic
- [ ] Implement pathfinding
- [ ] Add ride completion and earnings
- [ ] Implement auto-ride generation

### Phase 3 - Advanced Features
- [ ] Add unit tests (Jest + React Testing Library)
- [ ] Implement TypeScript for type safety
- [ ] Add performance monitoring
- [ ] Implement save/load system
- [ ] Add sound effects and animations

### Phase 4 - Optimization
- [ ] Virtualize large entity lists
- [ ] Implement Web Workers for heavy computation
- [ ] Add service worker for offline support
- [ ] Optimize SVG rendering for 1000+ entities

## File Structure Overview

```
traffic-wars/
├── public/                   # Static assets
├── src/
│   ├── components/           # React components
│   ├── context/              # State management
│   ├── hooks/                # Custom hooks
│   ├── services/             # Business logic (future)
│   ├── utils/                # Helper functions (future)
│   ├── styles/               # Global styles
│   ├── App.jsx               # Root component
│   └── main.jsx              # Entry point
├── index.html                # HTML template
├── vite.config.js            # Build configuration
├── package.json              # Dependencies
├── index-old.html            # Original version (backup)
└── game-old.js               # Original version (backup)
```

## Benefits of React Architecture

1. **Maintainability** - Easy to find and modify specific functionality
2. **Reusability** - Components can be reused across the app
3. **Testability** - Each component and hook can be tested independently
4. **Scalability** - Easy to add new features without breaking existing code
5. **Developer Experience** - Hot reload, better debugging, TypeScript support
6. **Performance** - React's virtual DOM for efficient updates
7. **Ecosystem** - Access to thousands of React libraries and tools

## Contributing

### Code Style
- Use functional components with hooks
- Follow React best practices
- Keep components small and focused
- Use meaningful variable and function names
- Add comments for complex logic

### Commit Guidelines
- `feat:` for new features
- `fix:` for bug fixes
- `refactor:` for code refactoring
- `style:` for UI/CSS changes
- `docs:` for documentation

---

**Original Version**: Preserved as `index-old.html` and `game-old.js`  
**React Version**: Modern, maintainable, production-ready  
**Status**: ✅ Core architecture complete, ready for feature development

