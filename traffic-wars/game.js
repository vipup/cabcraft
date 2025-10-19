// 🚗 Traffic Simulator - Complete Implementation from Scratch
// Based on AI_AGENT_REQUIREMENTS.md specifications

class TrafficSimulator extends Phaser.Scene {
    constructor() {
        super({ key: 'TrafficSimulator' });
        
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
        
        // Input state
        this.isDragging = false;
        this.dragStart = { x: 0, y: 0 };
        this.cameraStart = { x: 0, y: 0 };
    }

    preload() {
        // No external assets needed - using dynamic graphics
    }

    create() {
        console.log('🚗 Traffic Simulator - Creating game world...');
        
        // Set world bounds
        this.physics.world.setBounds(0, 0, this.worldWidth, this.worldHeight);
        
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
        
        // Center camera on world center
        this.cameras.main.centerOn(this.worldWidth / 2, this.worldHeight / 2);
        
        // Set camera bounds
        this.cameras.main.setBounds(0, 0, this.worldWidth, this.worldHeight);
        
        // Start auto ride generation
        this.time.addEvent({
            delay: 5000,
            callback: this.autoGenerateRideRequest,
            callbackScope: this,
            loop: true
        });
        
        console.log('✅ Game world created successfully!');
    }

    createCityBackground() {
        console.log('🏗️ Creating city background...');
        
        // Create roads (14 horizontal, 16 vertical)
        this.createRoads();
        
        // Create buildings
        this.createBuildings();
        
        console.log(`✅ City created: ${this.roadObjects.length} roads, ${this.buildingObjects.length} buildings`);
    }

    createRoads() {
        // Horizontal roads (14 roads)
        for (let i = 0; i < 14; i++) {
            const y = 100 + i * 100; // 100px spacing
            const road = this.add.rectangle(this.worldWidth / 2, y, this.worldWidth, 32, 0x4a5a6a);
            road.setDepth(1);
            this.roadObjects.push(road);
        }
        
        // Vertical roads (16 roads)
        for (let i = 0; i < 16; i++) {
            const x = 100 + i * 140; // 140px spacing
            const road = this.add.rectangle(x, this.worldHeight / 2, 32, this.worldHeight, 0x4a5a6a);
            road.setDepth(1);
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
                
                const building = this.add.rectangle(x, y, width, height, 0x8f9ca3);
                building.setStrokeStyle(2, 0x6d7d8e);
                building.setDepth(2);
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
        console.log('🏷️ Creating street names...');
        
        // Horizontal street names (3 per street: left, right, center)
        for (let i = 0; i < 14; i++) {
            const y = 100 + i * 100;
            const streetName = this.streetNames[i] || `Street ${i + 1}`;
            
            // Left edge
            const leftName = this.add.text(50, y, streetName, {
                fontSize: '14px',
                fill: '#ffffff',
                backgroundColor: '#000000',
                padding: { x: 4, y: 2 }
            });
            leftName.setDepth(1000);
            this.streetNameObjects.push(leftName);
            
            // Right edge
            const rightName = this.add.text(this.worldWidth - 50, y, streetName, {
                fontSize: '14px',
                fill: '#ffffff',
                backgroundColor: '#000000',
                padding: { x: 4, y: 2 }
            });
            rightName.setDepth(1000);
            this.streetNameObjects.push(rightName);
            
            // Center
            const centerName = this.add.text(this.worldWidth / 2, y, streetName, {
                fontSize: '14px',
                fill: '#ffffff',
                backgroundColor: '#000000',
                padding: { x: 4, y: 2 }
            });
            centerName.setDepth(1000);
            this.streetNameObjects.push(centerName);
        }
        
        // Vertical avenue names (3 per avenue: top, bottom, center)
        for (let i = 0; i < 16; i++) {
            const x = 100 + i * 140;
            const avenueName = this.avenueNames[i] || `Avenue ${i + 1}`;
            
            // Top edge
            const topName = this.add.text(x, 50, avenueName, {
                fontSize: '14px',
                fill: '#ffffff',
                backgroundColor: '#000000',
                padding: { x: 4, y: 2 }
            });
            topName.setDepth(1000);
            this.streetNameObjects.push(topName);
            
            // Bottom edge
            const bottomName = this.add.text(x, this.worldHeight - 50, avenueName, {
                fontSize: '14px',
                fill: '#ffffff',
                backgroundColor: '#000000',
                padding: { x: 4, y: 2 }
            });
            bottomName.setDepth(1000);
            this.streetNameObjects.push(bottomName);
            
            // Center
            const centerName = this.add.text(x, this.worldHeight / 2, avenueName, {
                fontSize: '14px',
                fill: '#ffffff',
                backgroundColor: '#000000',
                padding: { x: 4, y: 2 }
            });
            centerName.setDepth(1000);
            this.streetNameObjects.push(centerName);
        }
        
        console.log(`✅ Created ${this.streetNameObjects.length} street name labels`);
    }

    createLandmarks() {
        console.log('🏛️ Creating landmarks...');
        
        this.landmarks.forEach(landmark => {
            const landmarkObj = this.add.text(landmark.x, landmark.y, landmark.icon, {
                fontSize: '24px',
                fill: '#f39c12'
            });
            landmarkObj.setDepth(1001);
            
            const label = this.add.text(landmark.x, landmark.y + 30, landmark.name, {
                fontSize: '12px',
                fill: '#ffffff',
                backgroundColor: '#000000',
                padding: { x: 4, y: 2 }
            });
            label.setDepth(1001);
            
            this.landmarkObjects.push(landmarkObj, label);
        });
        
        console.log(`✅ Created ${this.landmarks.length} landmarks`);
    }

    setupInputHandlers() {
        // Left-click drag for camera panning
        this.input.on('pointerdown', (pointer) => {
            if (pointer.leftButtonDown()) {
                this.isDragging = true;
                this.dragStart.x = pointer.x;
                this.dragStart.y = pointer.y;
                this.cameraStart.x = this.cameras.main.scrollX;
                this.cameraStart.y = this.cameras.main.scrollY;
                this.game.canvas.style.cursor = 'grabbing';
            }
        });
        
        this.input.on('pointermove', (pointer) => {
            if (this.isDragging && pointer.isDown) {
                const deltaX = this.dragStart.x - pointer.x;
                const deltaY = this.dragStart.y - pointer.y;
                
                this.cameras.main.setScroll(
                    this.cameraStart.x + deltaX,
                    this.cameraStart.y + deltaY
                );
            }
        });
        
        this.input.on('pointerup', () => {
            this.isDragging = false;
            this.game.canvas.style.cursor = 'grab';
        });
        
        // Mouse wheel zoom
        this.input.on('wheel', (pointer, gameObjects, deltaX, deltaY, deltaZ) => {
            const zoomFactor = deltaY > 0 ? 0.9 : 1.1;
            const newZoom = Phaser.Math.Clamp(this.cameras.main.zoom * zoomFactor, 0.5, 3.0);
            this.cameras.main.setZoom(newZoom);
        });
        
        // Keyboard controls
        this.input.keyboard.on('keydown-PLUS', () => {
            const newZoom = Phaser.Math.Clamp(this.cameras.main.zoom * 1.1, 0.5, 3.0);
            this.cameras.main.setZoom(newZoom);
        });
        
        this.input.keyboard.on('keydown-MINUS', () => {
            const newZoom = Phaser.Math.Clamp(this.cameras.main.zoom * 0.9, 0.5, 3.0);
            this.cameras.main.setZoom(newZoom);
        });
        
        this.input.keyboard.on('keydown-ZERO', () => {
            this.cameras.main.setZoom(1.0);
        });
        
        // Right-click to spawn driver
        this.input.on('pointerdown', (pointer) => {
            if (pointer.rightButtonDown()) {
                const worldPoint = this.cameras.main.getWorldPoint(pointer.x, pointer.y);
                this.spawnDriver(worldPoint.x, worldPoint.y);
            }
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
        const minimapCanvas = document.getElementById('minimap-canvas');
        minimapCanvas.addEventListener('click', (event) => {
            const rect = minimapCanvas.getBoundingClientRect();
            const x = (event.clientX - rect.left) / rect.width * this.worldWidth;
            const y = (event.clientY - rect.top) / rect.height * this.worldHeight;
            this.centerCameraOn(x, y);
        });
    }

    spawnRider() {
        const x = 200 + Math.random() * (this.worldWidth - 400);
        const y = 200 + Math.random() * (this.worldHeight - 400);
        
        const rider = this.add.rectangle(x, y, 18, 18, 0x2ecc71);
        rider.setStrokeStyle(2, 0x27ae60);
        rider.setDepth(10);
        
        // Add rider icon
        const icon = this.add.text(x, y, '🏍️', {
            fontSize: '12px'
        });
        icon.setDepth(11);
        icon.setOrigin(0.5);
        
        const riderData = {
            x: x,
            y: y,
            status: 'idle',
            icon: icon
        };
        
        rider.setData('riderData', riderData);
        this.riders.push(rider);
        this.totalAgents++;
        
        console.log(`🏍️ Spawned rider at (${Math.round(x)}, ${Math.round(y)})`);
    }

    spawnDriver(x = null, y = null) {
        if (x === null) {
            x = 200 + Math.random() * (this.worldWidth - 400);
            y = 200 + Math.random() * (this.worldHeight - 400);
        }
        
        const driver = this.add.rectangle(x, y, 24, 24, 0x3498db);
        driver.setStrokeStyle(2, 0x2980b9);
        driver.setDepth(10);
        
        // Add driver icon
        const icon = this.add.text(x, y, '🚗', {
            fontSize: '16px'
        });
        icon.setDepth(11);
        icon.setOrigin(0.5);
        
        const driverData = {
            x: x,
            y: y,
            status: 'idle',
            speed: 100 + Math.random() * 50, // 100-150 pixels per second
            icon: icon
        };
        
        driver.setData('driverData', driverData);
        this.drivers.push(driver);
        this.totalAgents++;
        
        console.log(`🚗 Spawned driver at (${Math.round(x)}, ${Math.round(y)})`);
    }

    createRideRequest() {
        if (this.riders.length === 0) {
            alert('No riders available! Spawn some riders first.');
            return;
        }
        
        // Find idle riders
        const idleRiders = this.riders.filter(rider => {
            const data = rider.getData('riderData');
            return data.status === 'idle';
        });
        
        if (idleRiders.length === 0) {
            alert('All riders are busy!');
            return;
        }
        
        // Pick random idle rider
        const rider = idleRiders[Math.floor(Math.random() * idleRiders.length)];
        const riderData = rider.getData('riderData');
        
        // Generate pickup and dropoff points
        const pickupX = riderData.x;
        const pickupY = riderData.y;
        
        const dropoffX = 200 + Math.random() * (this.worldWidth - 400);
        const dropoffY = 200 + Math.random() * (this.worldHeight - 400);
        
        // Calculate fare
        const distance = Phaser.Math.Distance.Between(pickupX, pickupY, dropoffX, dropoffY);
        const fare = Math.round(distance * 0.1);
        
        // Create pickup marker
        const pickupMarker = this.add.circle(pickupX, pickupY, 20, 0xf1c40f);
        pickupMarker.setStrokeStyle(3, 0xe67e22);
        pickupMarker.setDepth(5);
        
        const pickupText = this.add.text(pickupX, pickupY, `$${fare}`, {
            fontSize: '12px',
            fill: '#000000',
            fontWeight: 'bold'
        });
        pickupText.setDepth(6);
        pickupText.setOrigin(0.5);
        
        // Create dropoff marker
        const dropoffMarker = this.add.circle(dropoffX, dropoffY, 15, 0x2ecc71);
        dropoffMarker.setStrokeStyle(3, 0x27ae60);
        dropoffMarker.setDepth(5);
        
        const dropoffText = this.add.text(dropoffX, dropoffY, '🎯', {
            fontSize: '12px'
        });
        dropoffText.setDepth(6);
        dropoffText.setOrigin(0.5);
        
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
        riderData.status = 'waiting_for_pickup';
        
        // Assign driver
        this.assignDriverToRide(rideRequest);
        
        console.log(`📱 Created ride request: $${fare} fare, distance: ${Math.round(distance)}px`);
    }

    assignDriverToRide(rideRequest) {
        // Find idle drivers
        const idleDrivers = this.drivers.filter(driver => {
            const data = driver.getData('driverData');
            return data.status === 'idle';
        });
        
        if (idleDrivers.length === 0) {
            console.log('No available drivers for ride request');
            return;
        }
        
        // Find closest driver
        let closestDriver = null;
        let closestDistance = Infinity;
        
        idleDrivers.forEach(driver => {
            const distance = Phaser.Math.Distance.Between(
                driver.x, driver.y,
                rideRequest.pickupX, rideRequest.pickupY
            );
            
            if (distance < closestDistance) {
                closestDistance = distance;
                closestDriver = driver;
            }
        });
        
        if (closestDriver) {
            rideRequest.assignedDriver = closestDriver;
            const driverData = closestDriver.getData('driverData');
            driverData.status = 'going_to_rider';
            
            // Move driver to pickup
            this.moveDriverToPickup(rideRequest);
            
            console.log(`🚗 Assigned driver to ride request ${rideRequest.id}`);
        }
    }

    moveDriverToPickup(rideRequest) {
        const driver = rideRequest.assignedDriver;
        const driverData = driver.getData('driverData');
        
        const distance = Phaser.Math.Distance.Between(
            driver.x, driver.y,
            rideRequest.pickupX, rideRequest.pickupY
        );
        
        const duration = (distance / driverData.speed) * 1000; // Convert to milliseconds
        
        this.tweens.add({
            targets: driver,
            x: rideRequest.pickupX,
            y: rideRequest.pickupY,
            duration: duration,
            ease: 'Linear',
            onComplete: () => {
                this.pickupRider(rideRequest);
            }
        });
        
        // Move driver icon
        this.tweens.add({
            targets: driverData.icon,
            x: rideRequest.pickupX,
            y: rideRequest.pickupY,
            duration: duration,
            ease: 'Linear'
        });
    }

    pickupRider(rideRequest) {
        const driver = rideRequest.assignedDriver;
        const driverData = driver.getData('driverData');
        const riderData = rideRequest.rider.getData('riderData');
        
        // Update statuses
        driverData.status = 'on_ride';
        riderData.status = 'in_ride';
        
        // Hide pickup marker
        rideRequest.pickupMarker.setVisible(false);
        rideRequest.pickupText.setVisible(false);
        
        // Move to dropoff
        this.moveToDropoff(rideRequest);
        
        console.log(`🚗 Driver picked up rider for ride ${rideRequest.id}`);
    }

    moveToDropoff(rideRequest) {
        const driver = rideRequest.assignedDriver;
        const driverData = driver.getData('driverData');
        
        const distance = Phaser.Math.Distance.Between(
            driver.x, driver.y,
            rideRequest.dropoffX, rideRequest.dropoffY
        );
        
        const duration = (distance / driverData.speed) * 1000;
        
        this.tweens.add({
            targets: driver,
            x: rideRequest.dropoffX,
            y: rideRequest.dropoffY,
            duration: duration,
            ease: 'Linear',
            onComplete: () => {
                this.completeRide(rideRequest);
            }
        });
        
        // Move driver icon
        this.tweens.add({
            targets: driverData.icon,
            x: rideRequest.dropoffX,
            y: rideRequest.dropoffY,
            duration: duration,
            ease: 'Linear'
        });
        
        // Move rider with driver
        this.tweens.add({
            targets: rideRequest.rider,
            x: rideRequest.dropoffX,
            y: rideRequest.dropoffY,
            duration: duration,
            ease: 'Linear'
        });
        
        this.tweens.add({
            targets: riderData.icon,
            x: rideRequest.dropoffX,
            y: rideRequest.dropoffY,
            duration: duration,
            ease: 'Linear'
        });
    }

    completeRide(rideRequest) {
        const driver = rideRequest.assignedDriver;
        const driverData = driver.getData('driverData');
        const riderData = rideRequest.rider.getData('riderData');
        
        // Update earnings
        this.earnings += rideRequest.fare;
        
        // Calculate rating based on completion time
        const completionTime = Date.now() - rideRequest.startTime;
        const expectedTime = 30000; // 30 seconds expected
        const timeRatio = Math.min(completionTime / expectedTime, 2.0);
        const ratingChange = Math.max(0.1, 0.5 - (timeRatio - 1) * 0.2);
        this.rating = Math.min(5.0, this.rating + ratingChange);
        
        // Reset statuses
        driverData.status = 'idle';
        riderData.status = 'idle';
        
        // Remove markers
        rideRequest.pickupMarker.destroy();
        rideRequest.pickupText.destroy();
        rideRequest.dropoffMarker.destroy();
        rideRequest.dropoffText.destroy();
        
        // Remove ride request
        const index = this.rideRequests.indexOf(rideRequest);
        if (index > -1) {
            this.rideRequests.splice(index, 1);
        }
        
        this.activeRides--;
        
        console.log(`✅ Completed ride: +$${rideRequest.fare}, rating: ${this.rating.toFixed(1)}`);
    }

    autoGenerateRideRequest() {
        if (Math.random() < 0.3 && this.riders.length > 0) { // 30% chance
            this.createRideRequest();
        }
    }

    centerCameraOn(x, y) {
        this.cameras.main.pan(x, y, 250, 'Power2');
    }

    update(time, delta) {
        // Update game time
        this.gameTime += delta;
        
        // Update object visibility (viewport culling)
        this.updateObjectVisibility();
        
        // Update mini-map
        this.renderMiniMap();
        
        // Update UI
        this.updateUI();
    }

    updateObjectVisibility() {
        const camera = this.cameras.main;
        const viewport = {
            left: camera.scrollX - 50,
            right: camera.scrollX + camera.width + 50,
            top: camera.scrollY - 50,
            bottom: camera.scrollY + camera.height + 50
        };
        
        // Update street name visibility
        this.streetNameObjects.forEach(name => {
            const visible = name.x >= viewport.left && name.x <= viewport.right &&
                           name.y >= viewport.top && name.y <= viewport.bottom;
            name.setVisible(visible);
        });
        
        // Update building visibility
        this.buildingObjects.forEach(building => {
            const visible = building.x >= viewport.left && building.x <= viewport.right &&
                           building.y >= viewport.top && building.y <= viewport.bottom;
            building.setVisible(visible);
        });
        
        // Update landmark visibility
        this.landmarkObjects.forEach(landmark => {
            const visible = landmark.x >= viewport.left && landmark.x <= viewport.right &&
                           landmark.y >= viewport.top && landmark.y <= viewport.bottom;
            landmark.setVisible(visible);
        });
    }

    renderMiniMap() {
        const canvas = document.getElementById('minimap-canvas');
        const ctx = canvas.getContext('2d');
        
        // Clear canvas
        ctx.fillStyle = '#2c3e50';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw roads
        ctx.fillStyle = '#4a5a6a';
        
        // Horizontal roads
        for (let i = 0; i < 14; i++) {
            const y = (100 + i * 100) / this.worldHeight * canvas.height;
            ctx.fillRect(0, y, canvas.width, 2);
        }
        
        // Vertical roads
        for (let i = 0; i < 16; i++) {
            const x = (100 + i * 140) / this.worldWidth * canvas.width;
            ctx.fillRect(x, 0, 2, canvas.height);
        }
        
        // Draw buildings
        ctx.fillStyle = '#8f9ca3';
        this.buildingObjects.forEach(building => {
            if (building.visible) {
                const x = building.x / this.worldWidth * canvas.width;
                const y = building.y / this.worldHeight * canvas.height;
                const width = building.width / this.worldWidth * canvas.width;
                const height = building.height / this.worldHeight * canvas.height;
                ctx.fillRect(x - width/2, y - height/2, width, height);
            }
        });
        
        // Draw drivers
        ctx.fillStyle = '#3498db';
        this.drivers.forEach(driver => {
            const x = driver.x / this.worldWidth * canvas.width;
            const y = driver.y / this.worldHeight * canvas.height;
            ctx.fillRect(x - 2, y - 2, 4, 4);
        });
        
        // Draw riders
        ctx.fillStyle = '#2ecc71';
        this.riders.forEach(rider => {
            const x = rider.x / this.worldWidth * canvas.width;
            const y = rider.y / this.worldHeight * canvas.height;
            ctx.fillRect(x - 1, y - 1, 2, 2);
        });
        
        // Draw ride requests
        this.rideRequests.forEach(ride => {
            // Pickup marker
            ctx.fillStyle = '#f1c40f';
            const pickupX = ride.pickupX / this.worldWidth * canvas.width;
            const pickupY = ride.pickupY / this.worldHeight * canvas.height;
            ctx.beginPath();
            ctx.arc(pickupX, pickupY, 3, 0, Math.PI * 2);
            ctx.fill();
            
            // Dropoff marker
            ctx.fillStyle = '#2ecc71';
            const dropoffX = ride.dropoffX / this.worldWidth * canvas.width;
            const dropoffY = ride.dropoffY / this.worldHeight * canvas.height;
            ctx.beginPath();
            ctx.arc(dropoffX, dropoffY, 2, 0, Math.PI * 2);
            ctx.fill();
        });
        
        // Draw viewport indicator (red square)
        this.drawViewportIndicator(ctx);
        
        // Draw street names on mini-map
        this.drawMiniMapStreetNames(ctx);
    }

    drawViewportIndicator(ctx) {
        const camera = this.cameras.main;
        const canvas = document.getElementById('minimap-canvas');
        
        const left = camera.scrollX / this.worldWidth * canvas.width;
        const top = camera.scrollY / this.worldHeight * canvas.height;
        const width = camera.width / this.worldWidth * canvas.width;
        const height = camera.height / this.worldHeight * canvas.height;
        
        ctx.strokeStyle = '#e74c3c';
        ctx.lineWidth = 2;
        ctx.strokeRect(left, top, width, height);
    }

    drawMiniMapStreetNames(ctx) {
        const canvas = document.getElementById('minimap-canvas');
        ctx.font = '8px Arial';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        
        // Draw horizontal street names
        for (let i = 0; i < 14; i++) {
            const y = (100 + i * 100) / this.worldHeight * canvas.height;
            const streetName = this.streetNames[i] || `S${i + 1}`;
            ctx.fillText(streetName, canvas.width / 2, y - 2);
        }
        
        // Draw vertical avenue names
        for (let i = 0; i < 16; i++) {
            const x = (100 + i * 140) / this.worldWidth * canvas.width;
            const avenueName = this.avenueNames[i] || `A${i + 1}`;
            ctx.save();
            ctx.translate(x + 10, canvas.height / 2);
            ctx.rotate(-Math.PI / 2);
            ctx.fillText(avenueName, 0, 0);
            ctx.restore();
        }
    }

    updateUI() {
        // Update earnings
        document.getElementById('earnings').textContent = this.earnings;
        
        // Update rating
        document.getElementById('rating').textContent = this.rating.toFixed(1);
        
        // Update active rides
        document.getElementById('active-rides').textContent = this.activeRides;
        
        // Update game time
        const minutes = Math.floor(this.gameTime / 60000);
        const seconds = Math.floor((this.gameTime % 60000) / 1000);
        document.getElementById('map-time').textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        
        // Update agents count
        document.getElementById('map-agents').textContent = this.totalAgents;
        
        // Update zoom level
        document.getElementById('zoom-level').textContent = `${this.cameras.main.zoom.toFixed(1)}x`;
        
        // Update camera position
        const camX = Math.round(this.cameras.main.scrollX + this.cameras.main.width / 2);
        const camY = Math.round(this.cameras.main.scrollY + this.cameras.main.height / 2);
        document.getElementById('camera-pos').textContent = `${camX}, ${camY}`;
        
        // Update average ride duration
        if (this.rideRequests.length > 0) {
            const avgDuration = this.rideRequests.reduce((sum, ride) => {
                return sum + (Date.now() - ride.startTime);
            }, 0) / this.rideRequests.length;
            document.getElementById('map-avg').textContent = `${Math.round(avgDuration / 1000)}s`;
        } else {
            document.getElementById('map-avg').textContent = '0s';
        }
    }
}

// Game configuration
const config = {
    type: Phaser.AUTO,
    width: window.innerWidth,
    height: window.innerHeight - 140, // Leave space for bottom UI
    parent: 'game-canvas',
    backgroundColor: '#2c3e50',
    scene: TrafficSimulator,
    scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    }
};

// Create game instance
const game = new Phaser.Game(config);

// Handle window resize
window.addEventListener('resize', () => {
    game.scale.resize(window.innerWidth, window.innerHeight - 140);
});

// Force canvas styling on load
window.addEventListener('load', () => {
    const canvas = document.getElementById('game-canvas');
    if (canvas) {
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.style.position = 'absolute';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style.right = '0';
        canvas.style.bottom = '140px';
    }
});

console.log('🚗 Traffic Simulator - Game initialized!');