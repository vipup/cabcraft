// 🚗 Traffic Simulator - SVG Edition
// Pure SVG implementation - no WebGL, no Canvas issues!

class TrafficSimulatorSVG {
    constructor() {
        // World specifications
        this.worldWidth = 2400;
        this.worldHeight = 1600;
        
        // Game state
        this.earnings = 0;
        this.rating = 5.0;
        this.activeRides = 0;
        this.gameTime = 0;
        this.totalAgents = 0;
        
        // Object arrays
        this.drivers = [];
        this.riders = [];
        this.rideRequests = [];
        this.streetNameObjects = [];
        this.buildingObjects = [];
        this.roadObjects = [];
        this.landmarkObjects = [];
        
        // Street names arrays
        this.streetNames = [
            'Main St', 'Broadway', 'Oak Ave', 'Pine St', 'Elm St', 'Maple Ave',
            'Cedar St', 'First St', 'Second St', 'Third St', 'Fourth St', 'Fifth St',
            'Park Ave', 'Central St'
        ];
        
        this.avenueNames = [
            'First Ave', 'Second Ave', 'Third Ave', 'Fourth Ave', 'Fifth Ave',
            'Central Ave', 'North Ave', 'South Ave', 'East Ave', 'West Ave',
            'Grand Ave', 'Union Ave', 'Liberty Ave', 'Washington Ave', 'Lincoln Ave', 'Jefferson Ave'
        ];
        
        // Landmarks
        this.landmarks = [
            { name: 'Downtown', x: 1200, y: 800, icon: '🏢' },
            { name: 'Airport', x: 200, y: 200, icon: '✈️' },
            { name: 'Mall', x: 2200, y: 200, icon: '🛍️' },
            { name: 'Station', x: 200, y: 1400, icon: '🚉' },
            { name: 'Hospital', x: 2200, y: 1400, icon: '🏥' },
            { name: 'University', x: 1200, y: 200, icon: '🎓' }
        ];
        
        // Camera/viewport
        this.cameraX = 1200;
        this.cameraY = 500; // Start at y=500 to show roads that start at y=84
        this.zoom = 1.0;
        this.viewportWidth = 0;
        this.viewportHeight = 0;
        this.ridesPanelHidden = false;
        
        // Input state
        this.isDragging = false;
        this.dragStart = { x: 0, y: 0 };
        this.cameraStart = { x: 0, y: 0 };
        
        // SVG elements
        this.gameSVG = null;
        this.worldGroup = null;
        this.uiGroup = null;
        
        // Performance monitoring
        this.performanceStats = {
            frameCount: 0,
            lastFPSUpdate: Date.now(),
            currentFPS: 0,
            miniMapUpdates: 0,
            uiUpdates: 0,
            domQueries: 0
        };
    }

    init() {
        console.log('🚗 Traffic Simulator SVG - Initializing...');
        
        // Get SVG elements
        this.gameSVG = document.getElementById('game-svg');
        
        // Calculate viewport size
        this.updateViewportSize();
        
        // Create world group
        this.worldGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        this.worldGroup.setAttribute('id', 'world-group');
        this.gameSVG.appendChild(this.worldGroup);
        
        // Create UI group (for elements that stay on screen)
        this.uiGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        this.uiGroup.setAttribute('id', 'ui-group');
        this.gameSVG.appendChild(this.uiGroup);
        
        // Create city background
        this.createCityBackground();
        
        // Create street names
        this.createStreetNames();
        
        // Create landmarks
        this.createLandmarks();
        
        // Setup input handlers
        this.setupInputHandlers();
        
        // Setup UI event handlers
        this.setupUIHandlers();
        
        // Start game loop
        this.startGameLoop();
        
        // Start auto ride generation
        this.autoRideInterval = setInterval(() => {
            this.autoGenerateRideRequest();
        }, 5000);
        
        console.log('✅ SVG Game initialized successfully!');
    }

    updateViewportSize() {
        const rect = this.gameSVG.getBoundingClientRect();
        this.viewportWidth = rect.width;
        this.viewportHeight = rect.height;
        
        // Ensure SVG has proper width (height is controlled by CSS bottom constraint)
        this.gameSVG.setAttribute('width', this.viewportWidth.toString());
        // Don't set height attribute - let CSS bottom constraint control the height
        
        // Calculate available height = window - top banner - bottom bar
        const topBanner = 48; // px
        const bottomBar = 32; // px
        const availableHeight = window.innerHeight - topBanner - bottomBar;
        
        // Update SVG viewBox to show the current camera view
        const viewBoxX = this.cameraX - this.viewportWidth / (2 * this.zoom);
        const viewBoxY = this.cameraY - availableHeight / (2 * this.zoom);
        const viewBoxWidth = this.viewportWidth / this.zoom;
        const viewBoxHeight = availableHeight / this.zoom;
        
        this.gameSVG.setAttribute('viewBox', `${viewBoxX} ${viewBoxY} ${viewBoxWidth} ${viewBoxHeight}`);
    }

    createCityBackground() {
        console.log('🏗️ Creating SVG city background...');
        
        // Create roads (14 horizontal, 16 vertical)
        this.createRoads();
        
        // Create buildings
        this.createBuildings();
        
        console.log(`✅ SVG City created: ${this.roadObjects.length} roads, ${this.buildingObjects.length} buildings`);
    }

    createRoads() {
        // Horizontal roads (14 roads)
        for (let i = 0; i < 14; i++) {
            const y = 100 + i * 100; // 100px spacing
            const road = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            road.setAttribute('x', '0');
            road.setAttribute('y', y - 16);
            road.setAttribute('width', this.worldWidth.toString());
            road.setAttribute('height', '32');
            road.setAttribute('fill', '#4a5a6a');
            road.setAttribute('id', `road-h-${i}`);
            this.worldGroup.appendChild(road);
            this.roadObjects.push(road);
        }
        
        // Vertical roads (16 roads)
        for (let i = 0; i < 16; i++) {
            const x = 100 + i * 140; // 140px spacing
            const road = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            road.setAttribute('x', x - 16);
            road.setAttribute('y', '0');
            road.setAttribute('width', '32');
            road.setAttribute('height', this.worldHeight.toString());
            road.setAttribute('fill', '#4a5a6a');
            road.setAttribute('id', `road-v-${i}`);
            this.worldGroup.appendChild(road);
            this.roadObjects.push(road);
        }
    }

    createBuildings() {
        // Create buildings in a more strategic pattern
        // Place buildings in the center of city blocks, avoiding roads
        
        // Calculate city block centers
        for (let blockX = 0; blockX < 15; blockX++) { // 15 blocks horizontally
            for (let blockY = 0; blockY < 13; blockY++) { // 13 blocks vertically
                // Calculate block center position
                const blockCenterX = 100 + blockX * 140 + 70; // Center of block
                const blockCenterY = 100 + blockY * 100 + 50; // Center of block
                
                // Skip if too close to world edges
                if (blockCenterX < 100 || blockCenterX > this.worldWidth - 100 ||
                    blockCenterY < 100 || blockCenterY > this.worldHeight - 100) {
                    continue;
                }
                
                // Create 1-3 buildings per block (random)
                const numBuildings = Math.random() < 0.7 ? 1 : (Math.random() < 0.5 ? 2 : 3);
                
                for (let i = 0; i < numBuildings; i++) {
                    // Random offset within the block
                    const offsetX = (Math.random() - 0.5) * 60; // ±30px
                    const offsetY = (Math.random() - 0.5) * 40; // ±20px
                    
                    const buildingX = blockCenterX + offsetX;
                    const buildingY = blockCenterY + offsetY;
                    
                    // Smaller, more realistic building sizes
                    const width = 30 + Math.random() * 40; // 30-70px width
                    const height = 30 + Math.random() * 40; // 30-70px height
                    
                    // Check if building intersects with roads
                    if (this.buildingIntersectsRoad(buildingX, buildingY, width, height)) continue;
                    
                    const building = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
                    building.setAttribute('x', (buildingX - width/2).toString());
                    building.setAttribute('y', (buildingY - height/2).toString());
                    building.setAttribute('width', width.toString());
                    building.setAttribute('height', height.toString());
                    building.setAttribute('fill', '#8f9ca3');
                    building.setAttribute('stroke', '#6d7d8e');
                    building.setAttribute('stroke-width', '2');
                    building.setAttribute('id', `building-${blockX}-${blockY}-${i}`);
                    this.worldGroup.appendChild(building);
                    this.buildingObjects.push(building);
                }
            }
        }
    }

    buildingIntersectsRoad(centerX, centerY, width, height) {
        // Calculate building bounds
        const buildingLeft = centerX - width / 2;
        const buildingRight = centerX + width / 2;
        const buildingTop = centerY - height / 2;
        const buildingBottom = centerY + height / 2;
        
        // Check intersection with horizontal roads
        for (let i = 0; i < 14; i++) {
            const roadY = 100 + i * 100;
            const roadTop = roadY - 16; // Road is 32px wide, so 16px on each side
            const roadBottom = roadY + 16;
            
            // Check if building overlaps with this horizontal road
            if (buildingBottom > roadTop && buildingTop < roadBottom) {
                return true; // Building intersects with horizontal road
            }
        }
        
        // Check intersection with vertical roads
        for (let i = 0; i < 16; i++) {
            const roadX = 100 + i * 140;
            const roadLeft = roadX - 16; // Road is 32px wide, so 16px on each side
            const roadRight = roadX + 16;
            
            // Check if building overlaps with this vertical road
            if (buildingRight > roadLeft && buildingLeft < roadRight) {
                return true; // Building intersects with vertical road
            }
        }
        
        return false; // No intersection found
    }

    isOnRoad(x, y) {
        // Check if position is on horizontal road
        for (let i = 0; i < 14; i++) {
            const roadY = 100 + i * 100;
            if (Math.abs(y - roadY) < 20) return true;
        }
        
        // Check if position is on vertical road
        for (let i = 0; i < 16; i++) {
            const roadX = 100 + i * 140;
            if (Math.abs(x - roadX) < 20) return true;
        }
        
        return false;
    }

    createStreetNames() {
        console.log('🏷️ Creating SVG street names...');
        
        // Horizontal street names (3 per street: left, right, center)
        for (let i = 0; i < 14; i++) {
            const y = 100 + i * 100;
            const streetName = this.streetNames[i] || `Street ${i + 1}`;
            
            // Left edge
            const leftName = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            leftName.setAttribute('x', '50');
            leftName.setAttribute('y', y.toString());
            leftName.setAttribute('fill', '#ffffff');
            leftName.setAttribute('font-size', '14');
            leftName.setAttribute('font-family', 'Arial');
            leftName.setAttribute('text-anchor', 'start');
            leftName.setAttribute('id', `street-name-h-${i}-left`);
            leftName.textContent = streetName;
            this.worldGroup.appendChild(leftName);
            this.streetNameObjects.push(leftName);
            
            // Right edge
            const rightName = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            rightName.setAttribute('x', (this.worldWidth - 50).toString());
            rightName.setAttribute('y', y.toString());
            rightName.setAttribute('fill', '#ffffff');
            rightName.setAttribute('font-size', '14');
            rightName.setAttribute('font-family', 'Arial');
            rightName.setAttribute('text-anchor', 'end');
            rightName.setAttribute('id', `street-name-h-${i}-right`);
            rightName.textContent = streetName;
            this.worldGroup.appendChild(rightName);
            this.streetNameObjects.push(rightName);
            
            // Center
            const centerName = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            centerName.setAttribute('x', (this.worldWidth / 2).toString());
            centerName.setAttribute('y', y.toString());
            centerName.setAttribute('fill', '#ffffff');
            centerName.setAttribute('font-size', '14');
            centerName.setAttribute('font-family', 'Arial');
            centerName.setAttribute('text-anchor', 'middle');
            centerName.setAttribute('id', `street-name-h-${i}-center`);
            centerName.textContent = streetName;
            this.worldGroup.appendChild(centerName);
            this.streetNameObjects.push(centerName);
        }
        
        // Vertical avenue names (3 per avenue: top, bottom, center)
        for (let i = 0; i < 16; i++) {
            const x = 100 + i * 140;
            const avenueName = this.avenueNames[i] || `Avenue ${i + 1}`;
            
            // Top edge
            const topName = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            topName.setAttribute('x', x.toString());
            topName.setAttribute('y', '50');
            topName.setAttribute('fill', '#ffffff');
            topName.setAttribute('font-size', '14');
            topName.setAttribute('font-family', 'Arial');
            topName.setAttribute('text-anchor', 'middle');
            topName.setAttribute('transform', `rotate(-90 ${x} 50)`);
            topName.setAttribute('id', `avenue-name-v-${i}-top`);
            topName.textContent = avenueName;
            this.worldGroup.appendChild(topName);
            this.streetNameObjects.push(topName);
            
            // Bottom edge
            const bottomName = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            bottomName.setAttribute('x', x.toString());
            bottomName.setAttribute('y', (this.worldHeight - 50).toString());
            bottomName.setAttribute('fill', '#ffffff');
            bottomName.setAttribute('font-size', '14');
            bottomName.setAttribute('font-family', 'Arial');
            bottomName.setAttribute('text-anchor', 'middle');
            bottomName.setAttribute('transform', `rotate(-90 ${x} ${this.worldHeight - 50})`);
            bottomName.setAttribute('id', `avenue-name-v-${i}-bottom`);
            bottomName.textContent = avenueName;
            this.worldGroup.appendChild(bottomName);
            this.streetNameObjects.push(bottomName);
            
            // Center
            const centerName = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            centerName.setAttribute('x', x.toString());
            centerName.setAttribute('y', (this.worldHeight / 2).toString());
            centerName.setAttribute('fill', '#ffffff');
            centerName.setAttribute('font-size', '14');
            centerName.setAttribute('font-family', 'Arial');
            centerName.setAttribute('text-anchor', 'middle');
            centerName.setAttribute('transform', `rotate(-90 ${x} ${this.worldHeight / 2})`);
            centerName.setAttribute('id', `avenue-name-v-${i}-center`);
            centerName.textContent = avenueName;
            this.worldGroup.appendChild(centerName);
            this.streetNameObjects.push(centerName);
        }
        
        console.log(`✅ Created ${this.streetNameObjects.length} SVG street name labels`);
    }

    createLandmarks() {
        console.log('🏛️ Creating SVG landmarks...');
        
        this.landmarks.forEach((landmark, index) => {
            const landmarkGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            landmarkGroup.setAttribute('id', `landmark-${index}`);
            
            const landmarkIcon = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            landmarkIcon.setAttribute('x', landmark.x.toString());
            landmarkIcon.setAttribute('y', landmark.y.toString());
            landmarkIcon.setAttribute('fill', '#f39c12');
            landmarkIcon.setAttribute('font-size', '24');
            landmarkIcon.setAttribute('font-family', 'Arial');
            landmarkIcon.setAttribute('text-anchor', 'middle');
            landmarkIcon.textContent = landmark.icon;
            landmarkGroup.appendChild(landmarkIcon);
            
            const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            label.setAttribute('x', landmark.x.toString());
            label.setAttribute('y', (landmark.y + 30).toString());
            label.setAttribute('fill', '#ffffff');
            label.setAttribute('font-size', '12');
            label.setAttribute('font-family', 'Arial');
            label.setAttribute('text-anchor', 'middle');
            label.textContent = landmark.name;
            landmarkGroup.appendChild(label);
            
            this.worldGroup.appendChild(landmarkGroup);
            this.landmarkObjects.push(landmarkGroup);
        });
        
        console.log(`✅ Created ${this.landmarks.length} SVG landmarks`);
    }

    setupInputHandlers() {
        // Left-click drag for camera panning
        this.gameSVG.addEventListener('mousedown', (event) => {
            if (event.button === 0) { // Left click
                this.isDragging = true;
                this.dragStart.x = event.clientX;
                this.dragStart.y = event.clientY;
                this.cameraStart.x = this.cameraX;
                this.cameraStart.y = this.cameraY;
                this.gameSVG.style.cursor = 'grabbing';
            }
        });
        
        this.gameSVG.addEventListener('mousemove', (event) => {
            if (this.isDragging) {
                const deltaX = (this.dragStart.x - event.clientX) / this.zoom;
                const deltaY = (this.dragStart.y - event.clientY) / this.zoom;
                
                this.cameraX = this.cameraStart.x + deltaX;
                this.cameraY = this.cameraStart.y + deltaY;
                
                this.updateViewportSize();
            }
        });
        
        this.gameSVG.addEventListener('mouseup', () => {
            this.isDragging = false;
            this.gameSVG.style.cursor = 'grab';
        });
        
        // Mouse wheel zoom
        this.gameSVG.addEventListener('wheel', (event) => {
            event.preventDefault();
            const zoomFactor = event.deltaY > 0 ? 0.9 : 1.1;
            this.zoom = Math.max(0.5, Math.min(3.0, this.zoom * zoomFactor));
            this.updateViewportSize();
        });
        
        // Keyboard controls
        document.addEventListener('keydown', (event) => {
            if (event.key === '+' || event.key === '=') {
                this.zoom = Math.min(3.0, this.zoom * 1.1);
                this.updateViewportSize();
            } else if (event.key === '-') {
                this.zoom = Math.max(0.5, this.zoom * 0.9);
                this.updateViewportSize();
            } else if (event.key === '0') {
                this.zoom = 1.0;
                this.updateViewportSize();
            }
        });
        
        // Right-click to spawn driver
        this.gameSVG.addEventListener('contextmenu', (event) => {
            event.preventDefault();
            const rect = this.gameSVG.getBoundingClientRect();
            const worldX = this.cameraX + (event.clientX - rect.left - rect.width/2) / this.zoom;
            const worldY = this.cameraY + (event.clientY - rect.top - rect.height/2) / this.zoom;
            this.spawnDriver(worldX, worldY);
        });
    }

    setupUIHandlers() {
        document.getElementById('spawn-rider').addEventListener('click', () => {
            this.spawnRider();
        });
        
        document.getElementById('spawn-driver').addEventListener('click', () => {
            this.spawnDriver();
        });
        
        document.getElementById('request-ride').addEventListener('click', () => {
            this.createRideRequest();
        });
        
        document.getElementById('clean-map').addEventListener('click', () => {
            this.cleanupMap();
        });

        // Toggle Active Rides panel visibility
        const ridesPanel = document.getElementById('rides-panel');
        const gameSvg = document.getElementById('game-svg');
        const toggleBtn = document.getElementById('toggle-rides');
        if (toggleBtn && ridesPanel && gameSvg) {
            toggleBtn.addEventListener('click', () => {
                this.ridesPanelHidden = !this.ridesPanelHidden;
                if (this.ridesPanelHidden) {
                    ridesPanel.style.display = 'none';
                    gameSvg.style.right = '0px';
                } else {
                    ridesPanel.style.display = 'block';
                    gameSvg.style.right = (this.panelSizes?.rightPanelWidth || 300) + 'px';
                }
                this.updateViewportSize();
            });
        }
        
        // Search input
        document.getElementById('rides-search').addEventListener('input', (event) => {
            this.ridesFilter.search = event.target.value.toLowerCase();
            this.updateRidesTable();
        });
        
        // Checkbox filters
        document.getElementById('filter-waiting').addEventListener('change', (event) => {
            this.ridesFilter.status.waiting = event.target.checked;
            this.updateRidesTable();
        });
        
        document.getElementById('filter-in-progress').addEventListener('change', (event) => {
            this.ridesFilter.status.inProgress = event.target.checked;
            this.updateRidesTable();
        });
        
        document.getElementById('filter-completed').addEventListener('change', (event) => {
            this.ridesFilter.status.completed = event.target.checked;
            this.updateRidesTable();
        });
        
        // Table header click sorting
        document.querySelectorAll('.rides-table th.sortable').forEach(th => {
            th.addEventListener('click', () => {
                const field = th.getAttribute('data-field');
                if (this.ridesSort.field === field) {
                    this.ridesSort.ascending = !this.ridesSort.ascending;
                } else {
                    this.ridesSort.field = field;
                    this.ridesSort.ascending = true;
                }
                
                // Update visual indicators on headers
                document.querySelectorAll('.rides-table th.sortable').forEach(header => {
                    header.classList.remove('sort-asc', 'sort-desc');
                    if (header.getAttribute('data-field') === field) {
                        header.classList.add(this.ridesSort.ascending ? 'sort-asc' : 'sort-desc');
                    }
                });
                
                this.updateRidesTable();
            });
        });
        
    }

    spawnRider() {
        const x = 200 + Math.random() * (this.worldWidth - 400);
        const y = 200 + Math.random() * (this.worldHeight - 400);
        
        const riderGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        riderGroup.setAttribute('id', `rider-${Date.now()}`);
        
        const riderRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        riderRect.setAttribute('x', (x - 9).toString());
        riderRect.setAttribute('y', (y - 9).toString());
        riderRect.setAttribute('width', '18');
        riderRect.setAttribute('height', '18');
        riderRect.setAttribute('fill', '#2ecc71');
        riderRect.setAttribute('stroke', '#27ae60');
        riderRect.setAttribute('stroke-width', '2');
        riderGroup.appendChild(riderRect);
        
        const riderIcon = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        riderIcon.setAttribute('x', x.toString());
        riderIcon.setAttribute('y', (y + 4).toString());
        riderIcon.setAttribute('fill', '#000000');
        riderIcon.setAttribute('font-size', '12');
        riderIcon.setAttribute('font-family', 'Arial');
        riderIcon.setAttribute('text-anchor', 'middle');
        riderIcon.textContent = '🏍️';
        riderGroup.appendChild(riderIcon);
        
        this.worldGroup.appendChild(riderGroup);
        
        const riderData = {
            x: x,
            y: y,
            status: 'idle',
            element: riderGroup
        };
        
        this.riders.push(riderData);
        this.totalAgents++;
        
        console.log(`🏍️ Spawned SVG rider at (${Math.round(x)}, ${Math.round(y)})`);
    }

    spawnDriver(x = null, y = null) {
        if (x === null) {
            x = 200 + Math.random() * (this.worldWidth - 400);
            y = 200 + Math.random() * (this.worldHeight - 400);
        }
        
        const driverGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        driverGroup.setAttribute('id', `driver-${Date.now()}`);
        
        const driverRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        driverRect.setAttribute('x', (x - 12).toString());
        driverRect.setAttribute('y', (y - 12).toString());
        driverRect.setAttribute('width', '24');
        driverRect.setAttribute('height', '24');
        driverRect.setAttribute('fill', '#3498db');
        driverRect.setAttribute('stroke', '#2980b9');
        driverRect.setAttribute('stroke-width', '2');
        driverGroup.appendChild(driverRect);
        
        const driverIcon = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        driverIcon.setAttribute('x', x.toString());
        driverIcon.setAttribute('y', (y + 4).toString());
        driverIcon.setAttribute('fill', '#000000');
        driverIcon.setAttribute('font-size', '16');
        driverIcon.setAttribute('font-family', 'Arial');
        driverIcon.setAttribute('text-anchor', 'middle');
        driverIcon.textContent = '🚗';
        driverGroup.appendChild(driverIcon);
        
        this.worldGroup.appendChild(driverGroup);
        
        const driverData = {
            x: x,
            y: y,
            status: 'idle',
            speed: 100 + Math.random() * 50, // 100-150 pixels per second
            element: driverGroup
        };
        
        this.drivers.push(driverData);
        this.totalAgents++;
        
        console.log(`🚗 Spawned SVG driver at (${Math.round(x)}, ${Math.round(y)})`);
        
        // 🐛 BUG FIX: Check for existing waiting rides when driver is spawned
        this.assignDriverToWaitingRides(driverData);
    }
    
    // 🐛 BUG FIX: Assign new driver to existing waiting rides
    assignDriverToWaitingRides(newDriver) {
        // Find the closest waiting ride
        let closestRide = null;
        let closestDistance = Infinity;
        
        for (const ride of this.rideRequests) {
            if (!ride.assignedDriver) {
                // Calculate distance from driver to pickup location
                const distance = Math.sqrt(
                    (newDriver.x - ride.pickupX) ** 2 + 
                    (newDriver.y - ride.pickupY) ** 2
                );
                
                if (distance < closestDistance) {
                    closestDistance = distance;
                    closestRide = ride;
                }
            }
        }
        
        // Assign the closest waiting ride to this driver
        if (closestRide) {
            console.log(`🔧 BUG FIX: Assigning waiting ride #${closestRide.id} to new driver at distance ${Math.round(closestDistance)}`);
            closestRide.assignedDriver = newDriver;
            newDriver.status = 'going_to_rider';
            this.moveDriverToPickup(closestRide);
        }
    }

    createRideRequest() {
        if (this.riders.length === 0) {
            console.log('No riders available - spawn some riders first');
            return;
        }
        
        // Find idle riders
        const idleRiders = this.riders.filter(rider => rider.status === 'idle');
        
        if (idleRiders.length === 0) {
            console.log('All riders are busy - no ride request created');
            return;
        }
        
        // Pick random idle rider
        const rider = idleRiders[Math.floor(Math.random() * idleRiders.length)];
        
        // Generate pickup and dropoff points
        const pickupX = rider.x;
        const pickupY = rider.y;
        
        // Validate pickup coordinates
        if (isNaN(pickupX) || isNaN(pickupY) || pickupX === undefined || pickupY === undefined) {
            console.error('Invalid rider coordinates:', { x: pickupX, y: pickupY });
            return;
        }
        
        const dropoffX = 200 + Math.random() * (this.worldWidth - 400);
        const dropoffY = 200 + Math.random() * (this.worldHeight - 400);
        
        // Validate dropoff coordinates
        if (isNaN(dropoffX) || isNaN(dropoffY)) {
            console.error('Invalid dropoff coordinates:', { x: dropoffX, y: dropoffY });
            return;
        }
        
        // Calculate fare with validation
        const distance = Math.sqrt((dropoffX - pickupX) ** 2 + (dropoffY - pickupY) ** 2);
        
        // Validate distance calculation
        if (isNaN(distance) || !isFinite(distance)) {
            console.error('Invalid distance calculation:', { pickupX, pickupY, dropoffX, dropoffY, distance });
            return;
        }
        
        const fare = Math.round(distance * 0.1) || 10; // Minimum fare of $10
        
        // Create pickup marker
        const pickupMarker = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        pickupMarker.setAttribute('cx', pickupX.toString());
        pickupMarker.setAttribute('cy', pickupY.toString());
        pickupMarker.setAttribute('r', '20');
        pickupMarker.setAttribute('fill', '#f1c40f');
        pickupMarker.setAttribute('stroke', '#e67e22');
        pickupMarker.setAttribute('stroke-width', '3');
        pickupMarker.setAttribute('id', `pickup-${Date.now()}`);
        this.worldGroup.appendChild(pickupMarker);
        
        const pickupText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        pickupText.setAttribute('x', pickupX.toString());
        pickupText.setAttribute('y', (pickupY + 4).toString());
        pickupText.setAttribute('fill', '#000000');
        pickupText.setAttribute('font-size', '12');
        pickupText.setAttribute('font-family', 'Arial');
        pickupText.setAttribute('font-weight', 'bold');
        pickupText.setAttribute('text-anchor', 'middle');
        pickupText.textContent = `$${fare}`;
        this.worldGroup.appendChild(pickupText);
        
        // Create dropoff marker
        const dropoffMarker = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        dropoffMarker.setAttribute('cx', dropoffX.toString());
        dropoffMarker.setAttribute('cy', dropoffY.toString());
        dropoffMarker.setAttribute('r', '15');
        dropoffMarker.setAttribute('fill', '#2ecc71');
        dropoffMarker.setAttribute('stroke', '#27ae60');
        dropoffMarker.setAttribute('stroke-width', '3');
        dropoffMarker.setAttribute('id', `dropoff-${Date.now()}`);
        this.worldGroup.appendChild(dropoffMarker);
        
        const dropoffText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        dropoffText.setAttribute('x', dropoffX.toString());
        dropoffText.setAttribute('y', (dropoffY + 4).toString());
        dropoffText.setAttribute('fill', '#000000');
        dropoffText.setAttribute('font-size', '12');
        dropoffText.setAttribute('font-family', 'Arial');
        dropoffText.setAttribute('text-anchor', 'middle');
        dropoffText.textContent = '🎯';
        this.worldGroup.appendChild(dropoffText);
        
        // Create ride request
        const rideRequest = {
            id: Date.now(),
            rider: rider,
            pickupX: pickupX,
            pickupY: pickupY,
            dropoffX: dropoffX,
            dropoffY: dropoffY,
            fare: fare,
            pickupMarker: pickupMarker,
            pickupText: pickupText,
            dropoffMarker: dropoffMarker,
            dropoffText: dropoffText,
            assignedDriver: null,
            startTime: Date.now()
        };
        
        this.rideRequests.push(rideRequest);
        this.activeRides++;
        
        // Update rider status
        rider.status = 'waiting_for_pickup';
        
        // Assign driver
        this.assignDriverToRide(rideRequest);
        
        console.log(`📱 Created SVG ride request: $${fare} fare, distance: ${Math.round(distance)}px`);
    }

    assignDriverToRide(rideRequest) {
        // Find idle drivers
        const idleDrivers = this.drivers.filter(driver => driver.status === 'idle');
        
        if (idleDrivers.length === 0) {
            console.log('No available drivers for ride request');
            return;
        }
        
        // Find closest driver
        let closestDriver = null;
        let closestDistance = Infinity;
        
        idleDrivers.forEach(driver => {
            const distance = Math.sqrt((driver.x - rideRequest.pickupX) ** 2 + (driver.y - rideRequest.pickupY) ** 2);
            
            if (distance < closestDistance) {
                closestDistance = distance;
                closestDriver = driver;
            }
        });
        
        if (closestDriver) {
            rideRequest.assignedDriver = closestDriver;
            closestDriver.status = 'going_to_rider';
            
            // Move driver to pickup
            this.moveDriverToPickup(rideRequest);
            
            console.log(`🚗 Assigned SVG driver to ride request ${rideRequest.id}`);
        }
    }

    moveDriverToPickup(rideRequest) {
        const driver = rideRequest.assignedDriver;
        
        // Calculate road-based path
        const path = this.calculateRoadPath(driver.x, driver.y, rideRequest.pickupX, rideRequest.pickupY);
        
        if (path.length === 0) {
            console.log('❌ No valid path found to pickup location - using direct movement');
            // Fallback: move directly to pickup location
            this.moveDriverDirectly(driver, rideRequest.pickupX, rideRequest.pickupY, () => {
                this.pickupRider(rideRequest);
            });
            return;
        }
        
        // Show path on main battlefield
        this.showPathOnBattlefield(path, '#f1c40f', rideRequest.id); // Yellow path for pickup
        
        // Move driver along the path
        this.moveDriverAlongPath(driver, path, () => {
            this.pickupRider(rideRequest);
        });
    }

    pickupRider(rideRequest) {
        const driver = rideRequest.assignedDriver;
        const rider = rideRequest.rider;
        
        // 🐛 BUG FIX: Update rider position to match driver position
        rider.x = driver.x;
        rider.y = driver.y;
        
        // Update rider element position
        if (rider.element) {
            rider.element.setAttribute('x', (rider.x - 9).toString());
            rider.element.setAttribute('y', (rider.y - 9).toString());
        }
        
        // Update statuses
        driver.status = 'on_ride';
        rider.status = 'in_ride';
        
        // Hide pickup marker
        rideRequest.pickupMarker.remove();
        rideRequest.pickupText.remove();
        
        // Move to dropoff
        this.moveToDropoff(rideRequest);
        
        console.log(`🚗 SVG Driver picked up rider for ride ${rideRequest.id}`);
    }

    moveToDropoff(rideRequest) {
        const driver = rideRequest.assignedDriver;
        const rider = rideRequest.rider;
        
        // Calculate road-based path
        const path = this.calculateRoadPath(driver.x, driver.y, rideRequest.dropoffX, rideRequest.dropoffY);
        
        if (path.length === 0) {
            console.log('❌ No valid path found to dropoff location - using direct movement');
            // Fallback: move directly to dropoff location
            this.moveDriverDirectly(driver, rideRequest.dropoffX, rideRequest.dropoffY, () => {
                this.completeRide(rideRequest);
            });
            this.moveDriverDirectly(rider, rideRequest.dropoffX, rideRequest.dropoffY, () => {});
            return;
        }
        
        // Show path on main battlefield
        this.showPathOnBattlefield(path, '#2ecc71', rideRequest.id); // Green path for dropoff
        
        // Move driver along the path
        this.moveDriverAlongPath(driver, path, () => {
            this.completeRide(rideRequest);
        });
        
        // 🐛 BUG FIX: Move rider with driver during the ride
        this.moveRiderWithDriver(rider, driver, path);
    }

    // Road-based pathfinding system
    calculateRoadPath(startX, startY, endX, endY) {
        console.log(`🗺️ Calculating path from (${startX}, ${startY}) to (${endX}, ${endY})`);
        
        // Convert world coordinates to grid coordinates
        const startGrid = this.worldToGrid(startX, startY);
        const endGrid = this.worldToGrid(endX, endY);
        
        console.log(`📍 Grid coordinates: start(${startGrid.x}, ${startGrid.y}) to end(${endGrid.x}, ${endGrid.y})`);
        
        // Simple A* pathfinding on road grid
        const path = this.findPathOnGrid(startGrid, endGrid);
        
        console.log(`🛣️ Grid path:`, path);
        
        // Convert grid path back to world coordinates
        const worldPath = path.map(gridPos => {
            const worldPos = this.gridToWorld(gridPos.x, gridPos.y);
            console.log(`🔄 Grid(${gridPos.x}, ${gridPos.y}) -> World(${worldPos.x}, ${worldPos.y})`);
            return worldPos;
        });
        
        console.log(`✅ Final world path:`, worldPath);
        return worldPath;
    }
    
    worldToGrid(x, y) {
        // Convert world coordinates to road grid coordinates
        // Vertical roads: x = 100 + i * 140, so i = (x - 100) / 140
        // Horizontal roads: y = 100 + i * 100, so i = (y - 100) / 100
        const gridX = Math.round((x - 100) / 140);
        const gridY = Math.round((y - 100) / 100);
        
        // Clamp to valid grid bounds
        return {
            x: Math.max(0, Math.min(15, gridX)), // 16 vertical roads (0-15)
            y: Math.max(0, Math.min(13, gridY))  // 14 horizontal roads (0-13)
        };
    }
    
    gridToWorld(gridX, gridY) {
        // Convert grid coordinates to world coordinates (center of road intersection)
        // Vertical roads: x = 100 + i * 140, center = x + 16 (half road width)
        // Horizontal roads: y = 100 + i * 100, center = y + 16 (half road width)
        return {
            x: 100 + gridX * 140 + 16, // Center of vertical road
            y: 100 + gridY * 100 + 16  // Center of horizontal road
        };
    }
    
    findPathOnGrid(start, end) {
        // Improved pathfinding: move horizontally first, then vertically
        const path = [];
        
        // Add start position
        path.push({x: start.x, y: start.y});
        
        // Move horizontally to target X
        let currentX = start.x;
        while (currentX !== end.x) {
            if (currentX < end.x) {
                currentX++;
            } else {
                currentX--;
            }
            path.push({x: currentX, y: start.y});
        }
        
        // Move vertically to target Y
        let currentY = start.y;
        while (currentY !== end.y) {
            if (currentY < end.y) {
                currentY++;
            } else {
                currentY--;
            }
            path.push({x: currentX, y: currentY});
        }
        
        console.log(`🛣️ Generated path with ${path.length} waypoints:`, path);
        return path;
    }
    
    showPathOnBattlefield(path, color, rideId = null) {
        // Create unique path ID for each ride
        const pathId = rideId ? `path-${rideId}` : `path-${Date.now()}`;
        
        // Remove any existing path for this specific ride
        this.clearPath(pathId);
        
        // Create path visualization
        const pathGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        pathGroup.setAttribute('id', pathId);
        pathGroup.setAttribute('stroke', color);
        pathGroup.setAttribute('stroke-width', '4');
        pathGroup.setAttribute('fill', 'none');
        pathGroup.setAttribute('stroke-dasharray', '8,4');
        pathGroup.setAttribute('opacity', '0.8');
        
        // Create path line
        if (path.length > 1) {
            const pathLine = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
            const points = path.map(point => `${point.x},${point.y}`).join(' ');
            pathLine.setAttribute('points', points);
            pathGroup.appendChild(pathLine);
        }
        
        // Add path markers at intersections
        path.forEach((point, index) => {
            const marker = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            marker.setAttribute('cx', point.x);
            marker.setAttribute('cy', point.y);
            marker.setAttribute('r', '3');
            marker.setAttribute('fill', color);
            marker.setAttribute('opacity', '0.6');
            pathGroup.appendChild(marker);
        });
        
        this.gameSVG.appendChild(pathGroup);
        
        console.log(`🛣️ Path visualized with ${path.length} waypoints (ID: ${pathId})`);
        
        // Auto-remove path after 25 seconds (longer for better visibility)
        setTimeout(() => {
            this.clearPath(pathId);
        }, 25000);
        
        return pathId; // Return path ID for potential manual clearing
    }
    
    clearPath(pathId = null) {
        if (pathId) {
            // Clear specific path
            const specificPath = document.getElementById(pathId);
            if (specificPath) {
                specificPath.remove();
                console.log(`🗑️ Cleared path: ${pathId}`);
            }
        } else {
            // Clear all paths (legacy support)
            const allPaths = document.querySelectorAll('[id^="path-"]');
            allPaths.forEach(path => {
                path.remove();
            });
            console.log(`🗑️ Cleared ${allPaths.length} paths`);
        }
    }
    
    moveDriverAlongPath(driver, path, onComplete) {
        if (path.length === 0) {
            if (onComplete) onComplete();
            return;
        }
        
        let currentPathIndex = 0;
        
        const moveToNextPoint = () => {
            if (currentPathIndex >= path.length) {
                if (onComplete) onComplete();
                return;
            }
            
            const targetPoint = path[currentPathIndex];
            const distance = Math.sqrt((driver.x - targetPoint.x) ** 2 + (driver.y - targetPoint.y) ** 2);
            const duration = (distance / driver.speed) * 1000;
            
            // Animate to next point
            this.animateElement(driver.element, targetPoint.x, targetPoint.y, duration, () => {
                currentPathIndex++;
                moveToNextPoint();
            });
        };
        
        moveToNextPoint();
    }
    
    // 🐛 BUG FIX: Move rider with driver during ride
    moveRiderWithDriver(rider, driver, path) {
        if (path.length === 0) return;
        
        let currentPathIndex = 0;
        
        const moveRiderToNextPoint = () => {
            if (currentPathIndex >= path.length) {
                return;
            }
            
            const targetPoint = path[currentPathIndex];
            const distance = Math.sqrt((rider.x - targetPoint.x) ** 2 + (rider.y - targetPoint.y) ** 2);
            const duration = (distance / driver.speed) * 1000;
            
            // Animate rider to next point
            this.animateElement(rider.element, targetPoint.x, targetPoint.y, duration, () => {
                // Update rider coordinates
                rider.x = targetPoint.x;
                rider.y = targetPoint.y;
                
                currentPathIndex++;
                moveRiderToNextPoint();
            });
        };
        
        moveRiderToNextPoint();
    }

    moveDriverDirectly(driver, targetX, targetY, onComplete) {
        // Direct movement without pathfinding (fallback)
        const distance = Math.sqrt((driver.x - targetX) ** 2 + (driver.y - targetY) ** 2);
        const duration = (distance / driver.speed) * 1000;
        
        console.log(`🚗 Direct movement: (${driver.x}, ${driver.y}) -> (${targetX}, ${targetY}), distance: ${Math.round(distance)}, duration: ${Math.round(duration)}ms`);
        
        this.animateElement(driver.element, targetX, targetY, duration, onComplete);
    }

    completeRide(rideRequest) {
        const driver = rideRequest.assignedDriver;
        const rider = rideRequest.rider;
        
        // Update earnings
        this.earnings += rideRequest.fare;
        
        // Calculate rating based on completion time
        const completionTime = Date.now() - rideRequest.startTime;
        const expectedTime = 30000; // 30 seconds expected
        const timeRatio = Math.min(completionTime / expectedTime, 2.0);
        const ratingChange = Math.max(0.1, 0.5 - (timeRatio - 1) * 0.2);
        this.rating = Math.min(5.0, this.rating + ratingChange);
        
        // Reset statuses
        driver.status = 'idle';
        rider.status = 'idle';
        
        // Remove markers
        rideRequest.dropoffMarker.remove();
        rideRequest.dropoffText.remove();
        
        // Remove ride request
        const index = this.rideRequests.indexOf(rideRequest);
        if (index > -1) {
            this.rideRequests.splice(index, 1);
        }
        
        this.activeRides--;
        
        // Clear the path for this completed ride
        this.clearPath(`path-${rideRequest.id}`);
        
        console.log(`✅ Completed SVG ride: +$${rideRequest.fare}, rating: ${this.rating.toFixed(1)}`);
        
        // 🐛 BUG FIX: Driver should automatically look for new available rides
        this.assignDriverToWaitingRides(driver);
    }

    animateElement(element, targetX, targetY, duration, onComplete = null) {
        const startX = parseFloat(element.getAttribute('x') || element.querySelector('rect').getAttribute('x')) + 
                      (parseFloat(element.querySelector('rect').getAttribute('width')) / 2);
        const startY = parseFloat(element.getAttribute('y') || element.querySelector('rect').getAttribute('y')) + 
                      (parseFloat(element.querySelector('rect').getAttribute('height')) / 2);
        
        const deltaX = targetX - startX;
        const deltaY = targetY - startY;
        
        const startTime = Date.now();
        
        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            const currentX = startX + deltaX * progress;
            const currentY = startY + deltaY * progress;
            
            // Update element position
            const rect = element.querySelector('rect');
            const text = element.querySelector('text');
            
            rect.setAttribute('x', (currentX - parseFloat(rect.getAttribute('width')) / 2).toString());
            rect.setAttribute('y', (currentY - parseFloat(rect.getAttribute('height')) / 2).toString());
            
            if (text) {
                text.setAttribute('x', currentX.toString());
                text.setAttribute('y', (currentY + 4).toString());
            }
            
            // Update data
            const data = this.drivers.find(d => d.element === element) || this.riders.find(r => r.element === element);
            if (data) {
                data.x = currentX;
                data.y = currentY;
            }
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else if (onComplete) {
                onComplete();
            }
        };
        
        requestAnimationFrame(animate);
    }

    autoGenerateRideRequest() {
        if (Math.random() < 0.3 && this.riders.length > 0) { // 30% chance
            this.createRideRequest();
        }
        
        // Auto-cleanup if too many objects accumulate (increased limits)
        if (this.rideRequests.length > 50 || this.drivers.length > 30 || this.riders.length > 30) {
            console.log('🧹 Auto-cleanup triggered - too many objects on map');
            this.smartCleanupMap();
        }
    }

    cleanupMap() {
        console.log('🧹 Cleaning up map objects...');
        
        // Remove all drivers
        this.drivers.forEach(driver => {
            if (driver.element && driver.element.parentNode) {
                driver.element.remove();
            }
        });
        this.drivers = [];
        
        // Remove all riders
        this.riders.forEach(rider => {
            if (rider.element && rider.element.parentNode) {
                rider.element.remove();
            }
        });
        this.riders = [];
        
        // Remove all ride requests and their markers
        this.rideRequests.forEach(ride => {
            if (ride.pickupMarker && ride.pickupMarker.parentNode) {
                ride.pickupMarker.remove();
            }
            if (ride.pickupText && ride.pickupText.parentNode) {
                ride.pickupText.remove();
            }
            if (ride.dropoffMarker && ride.dropoffMarker.parentNode) {
                ride.dropoffMarker.remove();
            }
            if (ride.dropoffText && ride.dropoffText.parentNode) {
                ride.dropoffText.remove();
            }
        });
        this.rideRequests = [];
        
        // Clear any existing paths
        this.clearPath();
        
        // Reset game stats
        this.earnings = 0;
        this.rating = 5.0;
        this.activeRides = 0;
        this.totalAgents = 0;
        
        // Clear rides panel
        if (this.uiElements && this.uiElements.ridesList) {
            this.uiElements.ridesList.innerHTML = '<div class="no-rides">No active rides</div>';
        }
        
        console.log('✅ Map cleaned up successfully');
    }
    
    // 🐛 BUG FIX: Smart cleanup that only removes old/completed objects
    smartCleanupMap() {
        console.log('🧹 Smart cleanup - removing old objects only...');
        
        // Remove old completed ride requests (older than 30 seconds)
        const now = Date.now();
        const oldRideRequests = this.rideRequests.filter(ride => {
            const age = now - ride.startTime;
            return age > 30000; // 30 seconds old
        });
        
        oldRideRequests.forEach(ride => {
            if (ride.pickupMarker && ride.pickupMarker.parentNode) {
                ride.pickupMarker.remove();
            }
            if (ride.pickupText && ride.pickupText.parentNode) {
                ride.pickupText.remove();
            }
            if (ride.dropoffMarker && ride.dropoffMarker.parentNode) {
                ride.dropoffMarker.remove();
            }
            if (ride.dropoffText && ride.dropoffText.parentNode) {
                ride.dropoffText.remove();
            }
            
            // Remove from array
            const index = this.rideRequests.indexOf(ride);
            if (index > -1) {
                this.rideRequests.splice(index, 1);
            }
        });
        
        // Remove idle riders (keep only active ones)
        const idleRiders = this.riders.filter(rider => rider.status === 'idle');
        idleRiders.forEach(rider => {
            if (rider.element && rider.element.parentNode) {
                rider.element.remove();
            }
            
            // Remove from array
            const index = this.riders.indexOf(rider);
            if (index > -1) {
                this.riders.splice(index, 1);
                this.totalAgents--;
            }
        });
        
        // Remove idle drivers (keep only active ones)
        const idleDrivers = this.drivers.filter(driver => driver.status === 'idle');
        idleDrivers.forEach(driver => {
            if (driver.element && driver.element.parentNode) {
                driver.element.remove();
            }
            
            // Remove from array
            const index = this.drivers.indexOf(driver);
            if (index > -1) {
                this.drivers.splice(index, 1);
                this.totalAgents--;
            }
        });
        
        // Clear old paths (older than 60 seconds)
        this.clearOldPaths(60000);
        
        console.log(`✅ Smart cleanup completed - removed ${oldRideRequests.length} old rides, ${idleRiders.length} idle riders, ${idleDrivers.length} idle drivers`);
    }
    
    // Helper function to clear old paths
    clearOldPaths(maxAge = 60000) {
        const now = Date.now();
        const pathElements = this.gameSvg.querySelectorAll('[id^="path-"]');
        
        pathElements.forEach(pathElement => {
            const pathId = pathElement.id;
            const rideId = pathId.replace('path-', '');
            
            // Find the ride request to check its age
            const ride = this.rideRequests.find(r => r.id.toString() === rideId);
            if (ride) {
                const age = now - ride.startTime;
                if (age > maxAge) {
                    pathElement.remove();
                }
            }
        });
    }

    centerCameraOn(x, y) {
        this.cameraX = x;
        this.cameraY = y;
        this.updateViewportSize();
    }

    startGameLoop() {
        const gameLoop = () => {
            const frameStart = performance.now();
            
            // Update game time
            this.gameTime += 16; // ~60 FPS
            
            
            // Update UI (with performance tracking)
            this.updateUI();
            this.performanceStats.uiUpdates++;
            
            // Performance monitoring
            this.performanceStats.frameCount++;
            const now = Date.now();
            if (now - this.performanceStats.lastFPSUpdate >= 1000) {
                this.performanceStats.currentFPS = this.performanceStats.frameCount;
                this.performanceStats.frameCount = 0;
                this.performanceStats.lastFPSUpdate = now;
                
                // Log performance stats every 5 seconds
                if (this.performanceStats.currentFPS % 5 === 0) {
                    console.log(`🎯 Performance: ${this.performanceStats.currentFPS} FPS, Mini-map updates: ${this.performanceStats.miniMapUpdates}, UI updates: ${this.performanceStats.uiUpdates}`);
                }
            }
            
            requestAnimationFrame(gameLoop);
        };
        
        requestAnimationFrame(gameLoop);
    }


    updateUI() {
        // Flyweight pattern: Cache DOM elements and only update when values change
        if (!this.uiElements) {
            this.uiElements = {
                earnings: document.getElementById('earnings'),
                rating: document.getElementById('rating'),
                activeRides: document.getElementById('active-rides'),
                mapTime: document.getElementById('map-time'),
                mapAgents: document.getElementById('map-agents'),
                zoomLevel: document.getElementById('zoom-level'),
                cameraPos: document.getElementById('camera-pos'),
                mapAvg: document.getElementById('map-avg'),
                avgDriverDistance: document.getElementById('avg-driver-distance'),
                ridesTableBody: document.getElementById('rides-table-body'),
                bannerAchievements: document.getElementById('banner-achievements')
            };
            this.lastUIValues = {};
            
            // Filtering and sorting state
            this.ridesFilter = {
                search: '',
                status: {
                    waiting: true,
                    inProgress: true,
                    completed: true
                }
            };
            this.ridesSort = {
                field: 'time',
                ascending: true
            };
            
            // Panel resize state
            this.panelSizes = {
                bottomPanelHeight: 36,
                rightPanelWidth: 300
            };
            
            // Load saved panel sizes from localStorage
            this.loadPanelSizes();
        }
        
        // Only update if values have changed (performance optimization)
        const newEarnings = this.earnings.toString();
        if (this.lastUIValues.earnings !== newEarnings) {
            this.uiElements.earnings.textContent = newEarnings;
            this.lastUIValues.earnings = newEarnings;
        }
        
        const newRating = this.rating.toFixed(1);
        if (this.lastUIValues.rating !== newRating) {
            this.uiElements.rating.textContent = newRating;
            this.lastUIValues.rating = newRating;
        }
        
        const newActiveRides = this.activeRides.toString();
        if (this.lastUIValues.activeRides !== newActiveRides) {
            this.uiElements.activeRides.textContent = newActiveRides;
            this.lastUIValues.activeRides = newActiveRides;
        }
        
        // Update game time (always update as it changes frequently)
        const minutes = Math.floor(this.gameTime / 60000);
        const seconds = Math.floor((this.gameTime % 60000) / 1000);
        const timeString = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        this.uiElements.mapTime.textContent = timeString;
        
        const newAgents = this.totalAgents.toString();
        if (this.lastUIValues.agents !== newAgents) {
            this.uiElements.mapAgents.textContent = newAgents;
            this.lastUIValues.agents = newAgents;
        }
        
        const newZoom = `${this.zoom.toFixed(1)}x`;
        if (this.lastUIValues.zoom !== newZoom) {
            this.uiElements.zoomLevel.textContent = newZoom;
            this.lastUIValues.zoom = newZoom;
        }
        
        const newCameraPos = `${Math.round(this.cameraX)}, ${Math.round(this.cameraY)}`;
        if (this.lastUIValues.cameraPos !== newCameraPos) {
            this.uiElements.cameraPos.textContent = newCameraPos;
            this.lastUIValues.cameraPos = newCameraPos;
        }
        
        // Update average ride duration
        let avgDurationText = '0s';
        if (this.rideRequests.length > 0) {
            const avgDuration = this.rideRequests.reduce((sum, ride) => {
                return sum + (Date.now() - ride.startTime);
            }, 0) / this.rideRequests.length;
            avgDurationText = `${Math.round(avgDuration / 1000)}s`;
        }
        
        if (this.lastUIValues.avgDuration !== avgDurationText) {
            this.uiElements.mapAvg.textContent = avgDurationText;
            this.lastUIValues.avgDuration = avgDurationText;
        }
        
        // Calculate average distance from drivers to pickup locations
        let avgDriverDistanceText = '0km';
        if (this.rideRequests.length > 0 && this.drivers.length > 0) {
            let totalDistance = 0;
            let validDistances = 0;
            
            this.rideRequests.forEach(ride => {
                if (ride.assignedDriver && ride.assignedDriver.x !== undefined && ride.assignedDriver.y !== undefined) {
                    const distance = Math.sqrt((ride.assignedDriver.x - ride.pickupX) ** 2 + (ride.assignedDriver.y - ride.pickupY) ** 2);
                    totalDistance += distance;
                    validDistances++;
                }
            });
            
            if (validDistances > 0) {
                const avgDistance = totalDistance / validDistances;
                avgDriverDistanceText = `${(avgDistance / 1000).toFixed(1)}km`;
            }
        }
        
        // Update the UI with average driver distance
        if (this.lastUIValues.avgDriverDistance !== avgDriverDistanceText) {
            this.uiElements.avgDriverDistance.textContent = avgDriverDistanceText;
            this.lastUIValues.avgDriverDistance = avgDriverDistanceText;
        }
        
        // Update rides table
        this.updateRidesTable();

        // Update floating banner achievements summary
        if (this.uiElements.bannerAchievements) {
            const bannerText = `$${newEarnings} • ⭐${this.rating.toFixed(1)} • Active ${this.activeRides}`;
            if (this.lastUIValues.bannerText !== bannerText) {
                this.uiElements.bannerAchievements.textContent = bannerText;
                this.lastUIValues.bannerText = bannerText;
            }
        }
    }
    
    updateRidesTable() {
        const tableBody = this.uiElements.ridesTableBody;
        
        // Clear existing rows
        tableBody.innerHTML = '';
        
        if (this.rideRequests.length === 0) {
            tableBody.innerHTML = '<tr class="no-rides-row"><td colspan="10">No active rides</td></tr>';
            return;
        }
        
        // Process rides with calculated values
        const processedRides = this.rideRequests.map(ride => {
            // Determine ride status and styling
            let status = 'waiting';
            let statusText = '⏳';
            let statusClass = 'waiting';
            
            if (ride.assignedDriver) {
                if (ride.assignedDriver.status === 'going_to_rider') {
                    status = 'in-progress';
                    statusText = '🚗';
                    statusClass = 'in-progress';
                } else if (ride.assignedDriver.status === 'on_ride') {
                    status = 'in-progress';
                    statusText = '🚗';
                    statusClass = 'in-progress';
                }
            }
            
            // Calculate elapsed time
            const elapsedTime = Math.floor((Date.now() - ride.startTime) / 1000);
            const elapsedText = elapsedTime < 60 ? `${elapsedTime}s` : `${Math.floor(elapsedTime / 60)}m ${elapsedTime % 60}s`;
            
            // Calculate ride distance (pickup to dropoff) with validation
            let rideDistance = 0;
            let rideDistanceKm = '0.0';
            let pricePerKm = '0.00';
            
            // Validate coordinates before calculation
            if (ride.pickupX !== undefined && ride.pickupY !== undefined && 
                ride.dropoffX !== undefined && ride.dropoffY !== undefined &&
                !isNaN(ride.pickupX) && !isNaN(ride.pickupY) && 
                !isNaN(ride.dropoffX) && !isNaN(ride.dropoffY)) {
                
                rideDistance = Math.sqrt((ride.dropoffX - ride.pickupX) ** 2 + (ride.dropoffY - ride.pickupY) ** 2);
                
                // Validate distance calculation
                if (!isNaN(rideDistance) && isFinite(rideDistance)) {
                    rideDistanceKm = (rideDistance / 1000).toFixed(1); // Convert pixels to "km" (scaled)
                    pricePerKm = rideDistance > 0 ? (ride.fare / (rideDistance / 1000)).toFixed(2) : '0.00';
                } else {
                    console.warn('Invalid ride distance calculation for ride', ride.id);
                    rideDistanceKm = 'N/A';
                    pricePerKm = 'N/A';
                }
            } else {
                console.warn('Invalid coordinates for ride', ride.id, { pickupX: ride.pickupX, pickupY: ride.pickupY, dropoffX: ride.dropoffX, dropoffY: ride.dropoffY });
                rideDistanceKm = 'N/A';
                pricePerKm = 'N/A';
            }
            
            // Calculate driver distance to pickup (if driver is assigned)
            let driverDistance = 0;
            let driverDistanceText = 'N/A';
            if (ride.assignedDriver && ride.assignedDriver.x !== undefined && ride.assignedDriver.y !== undefined) {
                driverDistance = Math.sqrt((ride.assignedDriver.x - ride.pickupX) ** 2 + (ride.assignedDriver.y - ride.pickupY) ** 2);
                const driverDistanceKm = (driverDistance / 1000).toFixed(1);
                driverDistanceText = `${driverDistanceKm}km`;
            } else if (ride.assignedDriver) {
                driverDistanceText = 'Invalid coords';
            }
            
            return {
                ...ride,
                status,
                statusText,
                statusClass,
                elapsedTime,
                elapsedText,
                rideDistance,
                rideDistanceKm,
                pricePerKm,
                driverDistance,
                driverDistanceText
            };
        });
        
        // Apply search filter
        let filteredRides = processedRides;
        if (this.ridesFilter.search) {
            filteredRides = processedRides.filter(ride => {
                const searchText = this.ridesFilter.search;
                return ride.id.toString().includes(searchText) ||
                       ride.fare.toString().includes(searchText) ||
                       ride.statusText.toLowerCase().includes(searchText) ||
                       ride.status.toLowerCase().includes(searchText);
            });
        }
        
        // Apply status filter
        filteredRides = filteredRides.filter(ride => {
            switch (ride.status) {
                case 'waiting':
                    return this.ridesFilter.status.waiting;
                case 'in-progress':
                    return this.ridesFilter.status.inProgress;
                case 'completed':
                    return this.ridesFilter.status.completed;
                default:
                    return true;
            }
        });
        
        // Apply sorting
        filteredRides.sort((a, b) => {
            let aValue, bValue;
            
            switch (this.ridesSort.field) {
                case 'id':
                    aValue = a.id;
                    bValue = b.id;
                    break;
                case 'time':
                    aValue = a.elapsedTime;
                    bValue = b.elapsedTime;
                    break;
                case 'fare':
                    aValue = a.fare;
                    bValue = b.fare;
                    break;
                case 'distance':
                    aValue = a.rideDistance;
                    bValue = b.rideDistance;
                    break;
                case 'driver-distance':
                    aValue = a.driverDistance;
                    bValue = b.driverDistance;
                    break;
                case 'status':
                    aValue = a.status;
                    bValue = b.status;
                    break;
                case 'price-per-km':
                    aValue = parseFloat(a.pricePerKm) || 0;
                    bValue = parseFloat(b.pricePerKm) || 0;
                    break;
                case 'driver-status':
                    aValue = a.assignedDriver ? a.assignedDriver.status : 'No driver';
                    bValue = b.assignedDriver ? b.assignedDriver.status : 'No driver';
                    break;
                case 'pickup-location':
                    aValue = `${Math.round(a.pickupX)},${Math.round(a.pickupY)}`;
                    bValue = `${Math.round(b.pickupX)},${Math.round(b.pickupY)}`;
                    break;
                case 'dropoff-location':
                    aValue = `${Math.round(a.dropoffX)},${Math.round(a.dropoffY)}`;
                    bValue = `${Math.round(b.dropoffX)},${Math.round(b.dropoffY)}`;
                    break;
                default:
                    aValue = a.elapsedTime;
                    bValue = b.elapsedTime;
            }
            
            // Handle string comparison for status
            if (typeof aValue === 'string' && typeof bValue === 'string') {
                return this.ridesSort.ascending ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
            }
            
            // Handle numeric comparison
            if (this.ridesSort.ascending) {
                return aValue - bValue;
            } else {
                return bValue - aValue;
            }
        });
        
        // Display filtered and sorted rides
        if (filteredRides.length === 0) {
            tableBody.innerHTML = '<tr class="no-rides-row"><td colspan="10">No rides match the current filter</td></tr>';
            return;
        }
        
        filteredRides.forEach(ride => {
            const row = document.createElement('tr');
            row.className = ride.status;
            
            // Create table row content
            row.innerHTML = `
                <td>#${ride.id}</td>
                <td><span class="status-badge ${ride.statusClass}">${ride.statusText}</span></td>
                <td>$${ride.fare}</td>
                <td>${ride.elapsedText}</td>
                <td>${ride.rideDistanceKm}km</td>
                <td>$${ride.pricePerKm}/km</td>
                <td>${ride.driverDistanceText}</td>
                <td><span class="driver-status-badge ${ride.assignedDriver ? ride.assignedDriver.status : 'no-driver'}">${ride.assignedDriver ? this.getDriverStatusEmoji(ride.assignedDriver.status) : '❌'}</span></td>
                <td>${Math.round(ride.pickupX)},${Math.round(ride.pickupY)}</td>
                <td>${Math.round(ride.dropoffX)},${Math.round(ride.dropoffY)}</td>
            `;
            
            tableBody.appendChild(row);
        });
        
        // Update quick stats
        this.updateQuickStats(processedRides, filteredRides);
    }
    
    updateQuickStats(allRides, filteredRides) {
        const totalRides = allRides.length;
        const waitingCount = allRides.filter(ride => ride.status === 'waiting').length;
        const activeCount = allRides.filter(ride => ride.status === 'in-progress').length;
        
        // Update the quick stats display
        const totalElement = document.getElementById('total-rides');
        const waitingElement = document.getElementById('waiting-count');
        const activeElement = document.getElementById('active-count');
        
        if (totalElement) totalElement.textContent = totalRides;
        if (waitingElement) waitingElement.textContent = waitingCount;
        if (activeElement) activeElement.textContent = activeCount;
    }
    
    getDriverStatusEmoji(status) {
        switch (status) {
            case 'idle':
                return '😴';
            case 'going_to_rider':
                return '🚗';
            case 'on_ride':
                return '🚗';
            case 'waiting':
                return '⏳';
            case 'in_ride':
                return '🚗';
            default:
                return '❓';
        }
    }
    
    // Panel resize functionality
    loadPanelSizes() {
        const saved = localStorage.getItem('trafficSimulator_panelSizes');
        if (saved) {
            try {
                const sizes = JSON.parse(saved);
                this.panelSizes.bottomPanelHeight = sizes.bottomPanelHeight || 140;
                this.panelSizes.rightPanelWidth = sizes.rightPanelWidth || 300;
                this.applyPanelSizes();
            } catch (e) {
                console.warn('Failed to load panel sizes:', e);
            }
        }
    }
    
    savePanelSizes() {
        localStorage.setItem('trafficSimulator_panelSizes', JSON.stringify(this.panelSizes));
    }
    
    applyPanelSizes() {
        // Apply bottom panel height
        const uiPanel = document.getElementById('ui-panel');
        const gameSvg = document.getElementById('game-svg');
        const ridesPanel = document.getElementById('rides-panel');
        const bottomResizeHandle = document.getElementById('bottom-resize-handle');
        const rightResizeHandle = document.getElementById('right-resize-handle');
        
        if (uiPanel && gameSvg) {
            uiPanel.style.height = this.panelSizes.bottomPanelHeight + 'px';
            gameSvg.style.bottom = this.panelSizes.bottomPanelHeight + 'px';
            bottomResizeHandle.style.bottom = this.panelSizes.bottomPanelHeight + 'px';
        }
        
        // Apply right panel width
        if (ridesPanel && gameSvg) {
            ridesPanel.style.width = this.panelSizes.rightPanelWidth + 'px';
            gameSvg.style.right = this.panelSizes.rightPanelWidth + 'px';
            rightResizeHandle.style.right = this.panelSizes.rightPanelWidth + 'px';
        }
    }
    
    setupResizeHandles() {
        const bottomResizeHandle = document.getElementById('bottom-resize-handle');
        const rightResizeHandle = document.getElementById('right-resize-handle');
        
        // Bottom panel resize (horizontal)
        if (bottomResizeHandle) {
            let isResizing = false;
            let startY = 0;
            let startHeight = 0;
            
            bottomResizeHandle.addEventListener('mousedown', (e) => {
                isResizing = true;
                startY = e.clientY;
                startHeight = this.panelSizes.bottomPanelHeight;
                document.body.classList.add('resizing-horizontal');
                e.preventDefault();
            });
            
            document.addEventListener('mousemove', (e) => {
                if (!isResizing) return;
                
                const deltaY = startY - e.clientY; // Inverted because we're resizing from bottom
                const newHeight = Math.max(100, Math.min(300, startHeight + deltaY));
                
                this.panelSizes.bottomPanelHeight = newHeight;
                this.applyPanelSizes();
            });
            
            document.addEventListener('mouseup', () => {
                if (isResizing) {
                    isResizing = false;
                    document.body.classList.remove('resizing-horizontal');
                    this.savePanelSizes();
                }
            });
        }
        
        // Right panel resize (vertical)
        if (rightResizeHandle) {
            let isResizing = false;
            let startX = 0;
            let startWidth = 0;
            
            rightResizeHandle.addEventListener('mousedown', (e) => {
                isResizing = true;
                startX = e.clientX;
                startWidth = this.panelSizes.rightPanelWidth;
                document.body.classList.add('resizing-vertical');
                e.preventDefault();
            });
            
            document.addEventListener('mousemove', (e) => {
                if (!isResizing) return;
                
                const deltaX = e.clientX - startX;
                const newWidth = Math.max(200, Math.min(600, startWidth + deltaX));
                
                this.panelSizes.rightPanelWidth = newWidth;
                this.applyPanelSizes();
            });
            
            document.addEventListener('mouseup', () => {
                if (isResizing) {
                    isResizing = false;
                    document.body.classList.remove('resizing-vertical');
                    this.savePanelSizes();
                }
            });
        }
    }
}

// Initialize game when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 DOM ready, initializing SVG game...');
    
    const game = new TrafficSimulatorSVG();
    game.init();
    
    // Setup resize handles
    game.setupResizeHandles();
    
    // Make game globally accessible
    window.game = game;
    
    console.log('🚗 Traffic Simulator SVG - Game initialized!');
});

// Handle window resize
window.addEventListener('resize', () => {
    if (window.game) {
        // Force layout recalculation
        setTimeout(() => {
            window.game.updateViewportSize();
        }, 100);
    }
});