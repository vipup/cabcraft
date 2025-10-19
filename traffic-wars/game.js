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
        this.cameraY = 800;
        this.zoom = 1.0;
        this.viewportWidth = 0;
        this.viewportHeight = 0;
        
        // Input state
        this.isDragging = false;
        this.dragStart = { x: 0, y: 0 };
        this.cameraStart = { x: 0, y: 0 };
        
        // SVG elements
        this.gameSVG = null;
        this.miniMapSVG = null;
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
        this.miniMapSVG = document.getElementById('minimap-svg');
        
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
        
        // Ensure SVG has proper dimensions
        this.gameSVG.setAttribute('width', this.viewportWidth.toString());
        this.gameSVG.setAttribute('height', this.viewportHeight.toString());
        
        // Update SVG viewBox to show the current camera view
        const viewBoxX = this.cameraX - this.viewportWidth / (2 * this.zoom);
        const viewBoxY = this.cameraY - this.viewportHeight / (2 * this.zoom);
        const viewBoxWidth = this.viewportWidth / this.zoom;
        const viewBoxHeight = this.viewportHeight / this.zoom;
        
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
        // Create buildings in grid pattern between roads
        for (let x = 50; x < this.worldWidth - 50; x += 120) {
            for (let y = 50; y < this.worldHeight - 50; y += 120) {
                // Skip if on road
                if (this.isOnRoad(x, y)) continue;
                
                const width = 60 + Math.random() * 60; // 60-120px width
                const height = 60 + Math.random() * 60; // 60-120px height
                
                const building = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
                building.setAttribute('x', (x - width/2).toString());
                building.setAttribute('y', (y - height/2).toString());
                building.setAttribute('width', width.toString());
                building.setAttribute('height', height.toString());
                building.setAttribute('fill', '#8f9ca3');
                building.setAttribute('stroke', '#6d7d8e');
                building.setAttribute('stroke-width', '2');
                building.setAttribute('id', `building-${x}-${y}`);
                this.worldGroup.appendChild(building);
                this.buildingObjects.push(building);
            }
        }
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
        
        // Mini-map click handler
        this.miniMapSVG.addEventListener('click', (event) => {
            const rect = this.miniMapSVG.getBoundingClientRect();
            const x = (event.clientX - rect.left) / rect.width * this.worldWidth;
            const y = (event.clientY - rect.top) / rect.height * this.worldHeight;
            this.centerCameraOn(x, y);
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
        
        const dropoffX = 200 + Math.random() * (this.worldWidth - 400);
        const dropoffY = 200 + Math.random() * (this.worldHeight - 400);
        
        // Calculate fare
        const distance = Math.sqrt((dropoffX - pickupX) ** 2 + (dropoffY - pickupY) ** 2);
        const fare = Math.round(distance * 0.1);
        
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
        
        const distance = Math.sqrt((driver.x - rideRequest.pickupX) ** 2 + (driver.y - rideRequest.pickupY) ** 2);
        const duration = (distance / driver.speed) * 1000; // Convert to milliseconds
        
        // Animate driver movement
        this.animateElement(driver.element, rideRequest.pickupX, rideRequest.pickupY, duration, () => {
            this.pickupRider(rideRequest);
        });
    }

    pickupRider(rideRequest) {
        const driver = rideRequest.assignedDriver;
        const rider = rideRequest.rider;
        
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
        
        const distance = Math.sqrt((driver.x - rideRequest.dropoffX) ** 2 + (driver.y - rideRequest.dropoffY) ** 2);
        const duration = (distance / driver.speed) * 1000;
        
        // Animate driver movement
        this.animateElement(driver.element, rideRequest.dropoffX, rideRequest.dropoffY, duration, () => {
            this.completeRide(rideRequest);
        });
        
        // Animate rider movement
        this.animateElement(rider.element, rideRequest.dropoffX, rideRequest.dropoffY, duration);
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
        
        console.log(`✅ Completed SVG ride: +$${rideRequest.fare}, rating: ${this.rating.toFixed(1)}`);
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
            
            // Update mini-map (with performance tracking)
            this.renderMiniMap();
            this.performanceStats.miniMapUpdates++;
            
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

    renderMiniMap() {
        // Flyweight pattern: Reuse existing elements instead of recreating
        if (!this.miniMapElements) {
            this.miniMapElements = {
                roads: [],
                buildings: [],
                drivers: [],
                riders: [],
                rideRequests: [],
                viewportIndicator: null
            };
            this.initializeMiniMapElements();
        }
        
        // Update existing elements instead of recreating
        this.updateMiniMapElements();
    }

    initializeMiniMapElements() {
        // Create road elements once
        // Horizontal roads
        for (let i = 0; i < 14; i++) {
            const road = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            road.setAttribute('fill', '#4a5a6a');
            road.setAttribute('width', '240');
            road.setAttribute('height', '2');
            this.miniMapSVG.appendChild(road);
            this.miniMapElements.roads.push(road);
        }
        
        // Vertical roads
        for (let i = 0; i < 16; i++) {
            const road = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            road.setAttribute('fill', '#4a5a6a');
            road.setAttribute('width', '2');
            road.setAttribute('height', '160');
            this.miniMapSVG.appendChild(road);
            this.miniMapElements.roads.push(road);
        }
        
        // Create building elements (reuse for visible buildings only)
        for (let i = 0; i < 50; i++) { // Limit to 50 visible buildings max
            const building = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            building.setAttribute('fill', '#8f9ca3');
            building.style.display = 'none'; // Hidden by default
            this.miniMapSVG.appendChild(building);
            this.miniMapElements.buildings.push(building);
        }
        
        // Create unit elements (reuse for all units)
        for (let i = 0; i < 20; i++) { // Max 20 units
            const driver = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            driver.setAttribute('width', '4');
            driver.setAttribute('height', '4');
            driver.setAttribute('fill', '#3498db');
            driver.style.display = 'none';
            this.miniMapSVG.appendChild(driver);
            this.miniMapElements.drivers.push(driver);
            
            const rider = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            rider.setAttribute('width', '2');
            rider.setAttribute('height', '2');
            rider.setAttribute('fill', '#2ecc71');
            rider.style.display = 'none';
            this.miniMapSVG.appendChild(rider);
            this.miniMapElements.riders.push(rider);
        }
        
        // Create ride request elements
        for (let i = 0; i < 10; i++) { // Max 10 ride requests
            const pickup = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            pickup.setAttribute('r', '3');
            pickup.setAttribute('fill', '#f1c40f');
            pickup.style.display = 'none';
            this.miniMapSVG.appendChild(pickup);
            
            const dropoff = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            dropoff.setAttribute('r', '2');
            dropoff.setAttribute('fill', '#2ecc71');
            dropoff.style.display = 'none';
            this.miniMapSVG.appendChild(dropoff);
            
            this.miniMapElements.rideRequests.push({ pickup, dropoff });
        }
        
        // Create viewport indicator
        this.miniMapElements.viewportIndicator = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        this.miniMapElements.viewportIndicator.setAttribute('fill', 'none');
        this.miniMapElements.viewportIndicator.setAttribute('stroke', '#e74c3c');
        this.miniMapElements.viewportIndicator.setAttribute('stroke-width', '2');
        this.miniMapSVG.appendChild(this.miniMapElements.viewportIndicator);
    }

    updateMiniMapElements() {
        // Update road positions (static, but update for completeness)
        for (let i = 0; i < 14; i++) {
            const y = (100 + i * 100) / this.worldHeight * 160;
            this.miniMapElements.roads[i].setAttribute('x', '0');
            this.miniMapElements.roads[i].setAttribute('y', (y - 1).toString());
        }
        
        for (let i = 0; i < 16; i++) {
            const x = (100 + i * 140) / this.worldWidth * 240;
            this.miniMapElements.roads[14 + i].setAttribute('x', (x - 1).toString());
            this.miniMapElements.roads[14 + i].setAttribute('y', '0');
        }
        
        // Update buildings (show only visible ones)
        this.miniMapElements.buildings.forEach(building => building.style.display = 'none');
        
        let buildingIndex = 0;
        this.buildingObjects.forEach(building => {
            if (buildingIndex >= this.miniMapElements.buildings.length) return;
            
            const x = parseFloat(building.getAttribute('x')) / this.worldWidth * 240;
            const y = parseFloat(building.getAttribute('y')) / this.worldHeight * 160;
            const width = parseFloat(building.getAttribute('width')) / this.worldWidth * 240;
            const height = parseFloat(building.getAttribute('height')) / this.worldHeight * 160;
            
            // Only show buildings that are reasonably sized on mini-map
            if (width > 1 && height > 1) {
                const miniBuilding = this.miniMapElements.buildings[buildingIndex];
                miniBuilding.setAttribute('x', x.toString());
                miniBuilding.setAttribute('y', y.toString());
                miniBuilding.setAttribute('width', width.toString());
                miniBuilding.setAttribute('height', height.toString());
                miniBuilding.style.display = 'block';
                buildingIndex++;
            }
        });
        
        // Update drivers
        this.miniMapElements.drivers.forEach(driver => driver.style.display = 'none');
        this.drivers.forEach((driver, index) => {
            if (index >= this.miniMapElements.drivers.length) return;
            
            const x = driver.x / this.worldWidth * 240;
            const y = driver.y / this.worldHeight * 160;
            
            const miniDriver = this.miniMapElements.drivers[index];
            miniDriver.setAttribute('x', (x - 2).toString());
            miniDriver.setAttribute('y', (y - 2).toString());
            miniDriver.style.display = 'block';
        });
        
        // Update riders
        this.miniMapElements.riders.forEach(rider => rider.style.display = 'none');
        this.riders.forEach((rider, index) => {
            if (index >= this.miniMapElements.riders.length) return;
            
            const x = rider.x / this.worldWidth * 240;
            const y = rider.y / this.worldHeight * 160;
            
            const miniRider = this.miniMapElements.riders[index];
            miniRider.setAttribute('x', (x - 1).toString());
            miniRider.setAttribute('y', (y - 1).toString());
            miniRider.style.display = 'block';
        });
        
        // Update ride requests
        this.miniMapElements.rideRequests.forEach(ride => {
            ride.pickup.style.display = 'none';
            ride.dropoff.style.display = 'none';
        });
        
        this.rideRequests.forEach((ride, index) => {
            if (index >= this.miniMapElements.rideRequests.length) return;
            
            const pickupX = ride.pickupX / this.worldWidth * 240;
            const pickupY = ride.pickupY / this.worldHeight * 160;
            const dropoffX = ride.dropoffX / this.worldWidth * 240;
            const dropoffY = ride.dropoffY / this.worldHeight * 160;
            
            const miniRide = this.miniMapElements.rideRequests[index];
            miniRide.pickup.setAttribute('cx', pickupX.toString());
            miniRide.pickup.setAttribute('cy', pickupY.toString());
            miniRide.pickup.style.display = 'block';
            
            miniRide.dropoff.setAttribute('cx', dropoffX.toString());
            miniRide.dropoff.setAttribute('cy', dropoffY.toString());
            miniRide.dropoff.style.display = 'block';
        });
        
        // Update viewport indicator
        const viewBoxX = this.cameraX - this.viewportWidth / (2 * this.zoom);
        const viewBoxY = this.cameraY - this.viewportHeight / (2 * this.zoom);
        const viewBoxWidth = this.viewportWidth / this.zoom;
        const viewBoxHeight = this.viewportHeight / this.zoom;
        
        const left = viewBoxX / this.worldWidth * 240;
        const top = viewBoxY / this.worldHeight * 160;
        const width = viewBoxWidth / this.worldWidth * 240;
        const height = viewBoxHeight / this.worldHeight * 160;
        
        this.miniMapElements.viewportIndicator.setAttribute('x', left.toString());
        this.miniMapElements.viewportIndicator.setAttribute('y', top.toString());
        this.miniMapElements.viewportIndicator.setAttribute('width', width.toString());
        this.miniMapElements.viewportIndicator.setAttribute('height', height.toString());
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
                mapAvg: document.getElementById('map-avg')
            };
            this.lastUIValues = {};
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
    }
}

// Initialize game when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 DOM ready, initializing SVG game...');
    
    const game = new TrafficSimulatorSVG();
    game.init();
    
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