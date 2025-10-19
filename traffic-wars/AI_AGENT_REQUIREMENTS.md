# 🚗 Traffic Simulator - AI Agent Requirements Summary

## 📋 PROJECT OVERVIEW
**Project Name**: Traffic Simulator - Ride Sharing Game  
**Type**: Web-based RTS-style ride-sharing simulation  
**Technology Stack**: Phaser.js 3.70.0 + HTML5 Canvas + Python HTTP Server  
**Status**: ✅ COMPLETE & PRODUCTION READY  
**Last Updated**: October 20, 2025  

## 🎯 CORE CONCEPT
A **ride-sharing simulator** in the style of classic Warcraft RTS games where:
- **Riders** (customers) request rides and wait for pickup
- **Drivers** (service providers) compete to complete rides
- **City battlefield** serves as the game world with streets and buildings
- **Real-time simulation** with automatic ride generation and completion

## 🎮 GAME MECHANICS

### Core Gameplay Loop
1. **Spawn Units**: Create riders and drivers using UI buttons
2. **Request Rides**: Generate pickup/dropoff points automatically or manually
3. **Driver Assignment**: AI assigns nearest available driver to each ride
4. **Pickup Phase**: Driver navigates to rider location
5. **Transport Phase**: Driver moves rider to dropoff location
6. **Completion**: Earn money, update rating, reset driver status

### Unit Types
- **🏍️ Riders**: Green, 18px, static units that request rides
- **🚗 Drivers**: Blue, 24px, mobile units that complete rides
- **Status Tracking**: idle, going_to_rider, on_ride, waiting, in_ride

### Scoring System
- **Earnings**: Money earned from completed rides (distance-based fare)
- **Rating**: Performance rating 0.0-5.0 based on completion time
- **Active Rides**: Current number of rides in progress

## 🗺️ WORLD SPECIFICATIONS

### World Layout
- **World Size**: 2400x1600 pixels
- **Camera Viewport**: Dynamic (typically 767x586)
- **Grid System**: 14 horizontal roads × 16 vertical roads
- **Road Width**: 32 pixels, color #4a5a6a
- **Building Count**: 1020+ procedurally generated buildings

### Street System
- **Street Names**: 90 total labels (3 per road/avenue)
- **Horizontal Streets**: Main St, Broadway, Oak Ave, Pine St, etc.
- **Vertical Avenues**: First Ave, Central Ave, North Ave, etc.
- **Positioning**: Left edge + Right edge + Center for visibility

### Landmarks
- **Points of Interest**: Downtown, Airport, Mall, Station, Hospital, University
- **Visual Markers**: Distinctive icons with labels
- **Strategic Locations**: Scattered throughout the world

## 🎮 USER INTERFACE (Warcraft-Style)

### Layout Structure
```
┌─────────────────────────────────────────────────────────────────┐
│                    🚗 TRAFFIC SIMULATOR                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                MAIN BATTLEFIELD (767x586)              │   │
│  │  Streets with names, buildings, drivers, riders        │   │
│  │  Left-click drag to pan, mouse wheel to zoom          │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  BOTTOM HUD PANEL (140px height)                       │   │
│  │  [MINI-MAP] [STATS] [CONTROLS] [MAP INFO] [SELECTED]   │   │
│  │  [240x160]  [$earnings] [🏍️ Spawn] [Time: 0:00] [None] │   │
│  │  [Red □]    [⭐rating]  [🚗 Spawn] [Agents: 4]         │   │
│  │  [Streets]  [🚗 rides] [📱 Ride]  [Avg: 0s]           │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### Controls
- **Left-Click + Drag**: Pan camera around world
- **Mouse Wheel**: Zoom in/out (0.5x to 3.0x)
- **Right-Click**: Spawn driver at clicked location
- **Mini-Map Click**: Jump camera to clicked location
- **UI Buttons**: Spawn riders, drivers, request rides

### Visual Elements
- **Viewport Indicator**: Red square on mini-map showing current camera view
- **Street Names**: White text with black background on main battlefield
- **Real-time Stats**: Earnings, rating, active rides, game time
- **Cursor Feedback**: Grabbing cursor during drag operations

## 🔧 TECHNICAL IMPLEMENTATION

### File Structure
```
traffic-wars/
├── index.html              # Main HTML with Warcraft-style layout
├── game.js                 # Core Phaser.js game logic (1200+ lines)
├── package.json            # Project configuration
├── README.md               # User documentation
├── REQUIREMENTS.md         # Detailed requirements
├── GAME_DOCUMENTATION.md   # Complete technical documentation
└── AI_AGENT_REQUIREMENTS.md # This summary file
```

### Key Phaser.js Classes
- **TrafficSimulator**: Main game scene class
- **Game Configuration**: Phaser.Scale.RESIZE with autoCenter
- **Canvas Sizing**: Dynamic sizing with window resize handling
- **Physics**: Arcade physics with gravity disabled

### Core Functions
- `createCityBackground()`: Generates roads and buildings
- `createStreetNames()`: Creates 90 street name labels
- `spawnRider()` / `spawnDriver()`: Unit creation
- `createRideRequest()`: Ride request system
- `moveDriverToPickup()` / `moveToDropoff()`: Movement logic
- `completeRide()`: Ride completion and rewards
- `renderMiniMap()`: Mini-map rendering with street names
- `updateObjectVisibility()`: Viewport culling system
- `drawViewportIndicator()`: Red square on mini-map

### Performance Optimizations
- **Viewport Culling**: Only visible objects rendered
- **Object Arrays**: Efficient tracking (drivers[], riders[], etc.)
- **Padding System**: 50px viewport padding for smooth experience
- **Depth Management**: Street names on top (depth 1000)

## 📊 CURRENT STATE (Live Metrics)

### Game Statistics
- **Earnings**: $0-22,810 (varies with gameplay)
- **Rating**: 5.0/5.0 (perfect performance)
- **Active Rides**: 0-2 (dynamic)
- **Total Agents**: 4 (2 drivers + 2 riders)
- **Game Time**: Real-time counter
- **Camera Position**: Dynamic (typically 384, 387)

### Object Counts
- **Street Name Objects**: 90 total, 18+ visible
- **Building Objects**: 1020+ total, 192+ visible
- **Road Objects**: 30 total, all visible
- **Landmark Objects**: 5 total
- **Visible Objects**: Dynamic (viewport culling active)

## ✅ SUCCESS CRITERIA (ALL MET)

### Core Features ✅
- [x] Ride-sharing simulation gameplay
- [x] Driver and rider spawning
- [x] Automatic ride assignment
- [x] Money earning system
- [x] Rating system
- [x] Warcraft-style UI layout
- [x] Mini-map with viewport indicator
- [x] Street names on battlefield
- [x] Viewport dragging and zooming
- [x] Real-time statistics display

### Technical Achievements ✅
- [x] Phaser.js game engine integration
- [x] HTML5 Canvas rendering
- [x] Viewport culling optimization
- [x] Modular code architecture
- [x] Responsive UI design
- [x] Performance optimization
- [x] Cross-browser compatibility

### Layout Requirements ✅
- [x] Main battlefield takes full area above HUD
- [x] Mini-map in bottom-left corner
- [x] Bottom HUD with stats and controls
- [x] Street names visible on main battlefield
- [x] Red viewport indicator on mini-map
- [x] Drag functionality working properly

## 🚀 DEPLOYMENT

### Running the Game
```bash
cd /home/i1/git/cabcraft/traffic-wars
python3 -m http.server 8000
# Open browser to http://localhost:8000
```

### Browser Requirements
- Modern browser with HTML5 Canvas support
- JavaScript enabled
- Recommended: Chrome, Firefox, Safari, Edge

## 🎯 AI AGENT RECOGNITION KEYS

### Project Identification
- **Keywords**: Traffic Simulator, Ride Sharing, Warcraft-style, Phaser.js
- **File Pattern**: `traffic-wars/` directory with `game.js` and `index.html`
- **Technology**: Phaser.js 3.70.0, HTML5 Canvas, Python HTTP Server
- **Status**: Production ready, fully functional

### Key Implementation Details
- **Canvas Size**: 767x586 (dynamic, window.innerWidth × window.innerHeight - 140)
- **World Size**: 2400x1600 pixels
- **Street Names**: 90 objects with center positioning for visibility
- **Viewport Culling**: Active with 50px padding
- **Camera Controls**: Left-click drag, mouse wheel zoom, mini-map click

### Current Issues Status
- ✅ **Street names on main battlefield**: FIXED (90 total, 18+ visible)
- ✅ **Drag-frame functionality**: WORKING (red square indicator)
- ✅ **Main battlefield content**: FIXED (roads, buildings, street names visible)

## 📝 DEVELOPMENT NOTES

### Recent Fixes (October 20, 2025)
1. **Layout Issue**: Fixed canvas sizing from 300x150 to full area (767x586)
2. **Street Names**: Added center positioning for better visibility
3. **Viewport Culling**: Implemented proper object visibility management
4. **Camera Controls**: Enhanced drag functionality with proper bounds

### Code Quality
- **Modular Structure**: Clear separation of concerns
- **Error Handling**: Proper bounds checking and validation
- **Performance**: Optimized rendering with viewport culling
- **Documentation**: Comprehensive inline comments and documentation

---

**🏆 PROJECT STATUS: COMPLETE & PRODUCTION READY**

This Traffic Simulator successfully implements all requirements as a fully functional ride-sharing game with Warcraft-style interface, complete gameplay loop, and advanced features including street names, viewport dragging, and mini-map navigation.

**Ready for**: Further development, feature expansion, or deployment as a complete game.
