// Traffic Simulator - Ride Sharing Game
// A simulation where riders request rides and drivers compete to complete them

class TrafficSimulator extends Phaser.Scene {
    constructor() {
        super({ key: 'TrafficSimulator' });
        
        // Game state
        this.earnings = 0;
        this.rating = 5.0;
        this.activeRides = 0;
        this.riders = [];
        this.drivers = [];
        this.rideRequests = [];
        this.completedRides = 0;
        
        // Game settings
        this.unitTypes = {
            rider: { 
                color: 0x00ff00, 
                size: 18,
                speed: 0, // Riders don't move
                type: 'rider'
            },
            driver: { 
                color: 0x0066ff, 
                size: 24,
                speed: 100,
                type: 'driver',
                status: 'idle' // idle, going_to_rider, on_ride
            }
        };
        
        // Ride settings
        this.rideSettings = {
            baseFare: 10,
            distanceMultiplier: 0.5,
            ratingBonus: 0.1
        };
    }
    
    preload() {
        console.log('Traffic Simulator loading...');
    }
    
    create() {
        const { width, height } = this.cameras.main;
        
        // Define a larger world so we can scroll the camera
        this.worldWidth = 2400;
        this.worldHeight = 1600;
        this.cameras.main.setBounds(0, 0, this.worldWidth, this.worldHeight);
        this.cameras.main.setZoom(1);
        
        // Start camera at center of world
        this.cameras.main.centerOn(this.worldWidth / 2, this.worldHeight / 2);
        
        // Create city background
        this.createCityBackground();
        console.log('City background created with roads and buildings');
        
        // Test: Create a simple visible rectangle to verify rendering
        const testRect = this.add.rectangle(100, 100, 50, 50, 0xff0000);
        testRect.setStrokeStyle(3, 0xffffff);
        console.log('Test rectangle created at (100, 100)');
        
        // Set up input handlers
        this.setupInputHandlers();
        
        // Set up UI handlers
        this.setupUIHandlers();
        
        // Update UI
        this.updateUI();
        
        // Mini map setup (scale to world, not viewport)
        const miniCanvas = document.getElementById('minimap-canvas');
        this.minimapCtx = miniCanvas.getContext('2d');
        this.minimapScaleX = 240 / this.worldWidth;
        this.minimapScaleY = 160 / this.worldHeight;
        this.simStartMs = Date.now();
        this.rideDurationsMs = [];

        // Click-to-pan on minimap
        miniCanvas.addEventListener('click', (e) => {
            const rect = miniCanvas.getBoundingClientRect();
            const mx = e.clientX - rect.left;
            const my = e.clientY - rect.top;
            const worldX = mx / this.minimapScaleX;
            const worldY = my / this.minimapScaleY;
            console.log(`Mini-map clicked at canvas (${mx}, ${my}) -> world (${worldX}, ${worldY})`);
            this.centerCameraOn(worldX, worldY);
        });
        
        // Add zoom controls
        this.setupZoomControls();
        
        // Start ride request timer
        this.time.addEvent({
            delay: 5000, // Every 5 seconds
            callback: this.spawnRandomRideRequest,
            callbackScope: this,
            loop: true
        });
        
        console.log('Traffic Simulator initialized!');
    }
    
    createCityBackground() {
        const width = this.worldWidth;
        const height = this.worldHeight;
        console.log(`Creating city background: ${width}x${height}`);

        // Create a simple background first
        const bg = this.add.rectangle(0, 0, width, height, 0x1a1a1a);
        bg.setOrigin(0, 0);
        console.log('Background rectangle created');

        // Create roads as separate rectangles for better visibility
        this.roadWidth = 32;
        const roadColor = 0x4a5a6a;
        
        // Road grid positions
        this.roadY = [];
        this.roadX = [];
        this.roadObjects = []; // Store road objects for viewport culling
        
        // Horizontal roads
        for (let y = 120; y < height - 120; y += 100) {
            this.roadY.push(y);
            const road = this.add.rectangle(width/2, y, width, this.roadWidth, roadColor);
            road.setOrigin(0.5, 0.5);
            this.roadObjects.push(road);
        }
        
        // Vertical roads
        for (let x = 120; x < width - 120; x += 140) {
            this.roadX.push(x);
            const road = this.add.rectangle(x, height/2, this.roadWidth, height, roadColor);
            road.setOrigin(0.5, 0.5);
            this.roadObjects.push(road);
        }
        console.log(`Created ${this.roadY.length} horizontal roads and ${this.roadX.length} vertical roads`);

        // Create buildings as separate rectangles
        this.createBuildingsGrid(width, height);
        console.log(`Created ${this.buildings.length} buildings`);

        // Landmarks (named POIs)
        this.createLandmarks();
        
        // Add some initial drivers and riders for testing
        this.spawnDriver();
        this.spawnDriver();
        this.spawnRider();
        this.spawnRider();
        console.log('Spawned initial test units');
        
        // Add a test rectangle at center to verify graphics are working
        const testRect = this.add.rectangle(this.worldWidth / 2, this.worldHeight / 2, 100, 100, 0xff0000);
        testRect.setStrokeStyle(5, 0xffffff);
        console.log('Added test rectangle at center');
    }

    createBuildingsGrid(width, height) {
        const blockColor = 0x8f9ca3; // brighter buildings
        const borderColor = 0x6d7d8e; // brighter borders
        const xs = [0, ...this.roadX, width];
        const ys = [0, ...this.roadY, height];
        this.buildings = [];
        this.buildingObjects = []; // Store building objects for viewport culling

        // For each block (between two roads), place a few building rectangles
        for (let i = 0; i < ys.length - 1; i++) {
            for (let j = 0; j < xs.length - 1; j++) {
                // Compute block inner area excluding half road widths
                const x0 = j === 0 ? 0 : xs[j] + this.roadWidth / 2;
                const x1 = j === xs.length - 2 ? width : xs[j + 1] - this.roadWidth / 2;
                const y0 = i === 0 ? 0 : ys[i] + this.roadWidth / 2;
                const y1 = i === ys.length - 2 ? height : ys[i + 1] - this.roadWidth / 2;
                const blockW = x1 - x0;
                const blockH = y1 - y0;
                if (blockW < 60 || blockH < 60) continue;

                // Create 2–3 buildings inside the block
                const cols = 2;
                const rows = 2;
                for (let r = 0; r < rows; r++) {
                    for (let c = 0; c < cols; c++) {
                        const pad = 8;
                        const bw = blockW / cols - pad * 2;
                        const bh = blockH / rows - pad * 2;
                        const bx = x0 + c * (blockW / cols) + pad + Math.random() * 6;
                        const by = y0 + r * (blockH / rows) + pad + Math.random() * 6;
                        
                        // Create building as separate rectangle
                        const building = this.add.rectangle(bx + bw/2, by + bh/2, bw, bh, blockColor);
                        building.setStrokeStyle(1, borderColor);
                        this.buildings.push({ x: bx, y: by, w: bw, h: bh });
                        this.buildingObjects.push(building);
                    }
                }
            }
        }
    }
    
    createLandmarks() {
        const width = this.worldWidth;
        const height = this.worldHeight;
        
        // Create landmarks (pickup/dropoff points)
        const landmarks = [
            { x: 150, y: 150, name: 'Downtown', type: 'pickup' },
            { x: 300, y: 200, name: 'Airport', type: 'pickup' },
            { x: 500, y: 100, name: 'Mall', type: 'pickup' },
            { x: 700, y: 250, name: 'Station', type: 'pickup' },
            { x: 200, y: 400, name: 'Hospital', type: 'pickup' },
            { x: 450, y: 450, name: 'University', type: 'pickup' }
        ];
        
        this.landmarkObjects = []; // Store landmark objects for viewport culling
        landmarks.forEach(landmark => {
            const marker = this.add.circle(landmark.x, landmark.y, 12, 0xff6b6b);
            marker.setStrokeStyle(3, 0xffffff);
            marker.setData('landmark', landmark);
            
            // Add label with background
            const label = this.add.text(landmark.x, landmark.y + 20, landmark.name, {
                fontSize: '12px',
                fill: '#ffffff',
                backgroundColor: '#000000',
                padding: { x: 4, y: 2 },
                align: 'center'
            });
            label.setOrigin(0.5);
            
            this.landmarkObjects.push({ marker, label });
        });
    }
    
    setupInputHandlers() {
        // Initialize dragging state
        this.isDragging = false;
        this.dragStartX = 0;
        this.dragStartY = 0;
        this.cameraStartX = 0;
        this.cameraStartY = 0;
        
        // Left-click and drag to pan camera (more intuitive)
        this.input.on('pointerdown', (pointer) => {
            if (pointer.leftButtonDown()) {
                // Check if clicking on UI elements (don't drag if clicking buttons)
                const target = pointer.event.target;
                if (target.tagName === 'BUTTON' || target.closest('button')) {
                    return; // Don't start dragging if clicking UI buttons
                }
                
                this.isDragging = true;
                this.dragStartX = pointer.x;
                this.dragStartY = pointer.y;
                this.cameraStartX = this.cameras.main.x;
                this.cameraStartY = this.cameras.main.y;
                
                // Change cursor to indicate dragging
                document.body.style.cursor = 'grabbing';
                
                console.log(`Started dragging from (${this.dragStartX}, ${this.dragStartY})`);
            }
        });
        
        this.input.on('pointermove', (pointer) => {
            if (this.isDragging && pointer.leftButtonDown()) {
                const deltaX = pointer.x - this.dragStartX;
                const deltaY = pointer.y - this.dragStartY;
                const newX = this.cameraStartX - deltaX;
                const newY = this.cameraStartY - deltaY;
                
                // Clamp to world bounds
                const clampedX = Phaser.Math.Clamp(newX, 0, this.worldWidth - this.cameras.main.width);
                const clampedY = Phaser.Math.Clamp(newY, 0, this.worldHeight - this.cameras.main.height);
                
                this.cameras.main.setPosition(clampedX, clampedY);
                this.updateUI();
                
                console.log(`Dragging to (${Math.round(clampedX)}, ${Math.round(clampedY)})`);
            }
        });
        
        this.input.on('pointerup', (pointer) => {
            if (this.isDragging) {
                console.log('Stopped dragging');
                this.isDragging = false;
                
                // Reset cursor
                document.body.style.cursor = 'default';
            }
        });
        
        // Right-click for spawning units at clicked location
        this.input.on('pointerdown', (pointer) => {
            if (pointer.rightButtonDown()) {
                this.handleRightClick(pointer);
            }
        });
    }
    
    handleLeftClick(pointer) {
        // Left-click is now used for dragging, so this function is not needed
        // But keeping it for potential future use
    }
    
    handleRightClick(pointer) {
        const worldX = pointer.worldX;
        const worldY = pointer.worldY;
        
        // Spawn a driver at right-clicked location
        const driver = this.createDriver(worldX, worldY);
        this.drivers.push(driver);
        
        console.log(`Spawned driver at right-click location (${worldX}, ${worldY})`);
    }
    
    getLandmarkAt(x, y) {
        const graphics = this.children.list;
        for (let child of graphics) {
            if (child.getData('landmark')) {
                const distance = Phaser.Math.Distance.Between(x, y, child.x, child.y);
                if (distance < 20) {
                    return child.getData('landmark');
                }
            }
        }
        return null;
    }
    
    setupUIHandlers() {
        // Spawn rider button
        document.getElementById('spawn-rider').addEventListener('click', () => {
            this.spawnRider();
        });
        
        // Spawn driver button
        document.getElementById('spawn-driver').addEventListener('click', () => {
            this.spawnDriver();
        });
        
        // Request ride button
        document.getElementById('request-ride').addEventListener('click', () => {
            this.createRideRequest();
        });
    }
    
    spawnRider() {
        const x = Phaser.Math.Between(50, this.worldWidth - 50);
        const y = Phaser.Math.Between(50, this.worldHeight - 50);
        
        const rider = this.createRider(x, y);
        this.riders.push(rider);
        
        console.log(`Spawned rider at (${x}, ${y})`);
    }
    
    spawnDriver() {
        const x = Phaser.Math.Between(50, this.worldWidth - 50);
        const y = Phaser.Math.Between(50, this.worldHeight - 50);
        
        const driver = this.createDriver(x, y);
        this.drivers.push(driver);
        
        console.log(`Spawned driver at (${x}, ${y}) - Total drivers: ${this.drivers.length}`);
    }
    
    createRider(x, y) {
        const riderData = this.unitTypes.rider;
        
        const rider = this.add.rectangle(x, y, riderData.size, riderData.size, riderData.color);
        rider.setStrokeStyle(2, 0xffffff);
        rider.setData('type', 'rider');
        rider.setData('status', 'waiting'); // waiting, in_ride, completed
        rider.setData('currentRide', null);
        
        // Add rider icon - larger and more visible
        const icon = this.add.text(x, y, '👤', { fontSize: '16px' });
        icon.setOrigin(0.5);
        rider.setData('icon', icon);
        
        return rider;
    }
    
    createDriver(x, y) {
        const driverData = this.unitTypes.driver;
        
        const driver = this.add.rectangle(x, y, driverData.size, driverData.size, driverData.color);
        driver.setStrokeStyle(2, 0xffffff);
        driver.setData('type', 'driver');
        driver.setData('status', 'idle'); // idle, going_to_rider, on_ride
        driver.setData('currentRide', null);
        driver.setData('target', null);
        driver.setData('speed', driverData.speed); // FIX: Set the speed data!
        
        // Add driver icon - larger and more visible
        const icon = this.add.text(x, y, '🚗', { fontSize: '16px' });
        icon.setOrigin(0.5);
        driver.setData('icon', icon);
        
        return driver;
    }
    
    createRideRequest() {
        if (this.riders.length === 0) {
            alert('Spawn some riders first!');
            return;
        }
        
        // Find a waiting rider
        const waitingRiders = this.riders.filter(rider => rider.getData('status') === 'waiting');
        if (waitingRiders.length === 0) {
            alert('All riders are busy!');
            return;
        }
        
        const rider = Phaser.Utils.Array.GetRandom(waitingRiders);
        const pickupX = rider.x;
        const pickupY = rider.y;
        
        // Generate random destination
        const dropoffX = Phaser.Math.Between(50, this.worldWidth - 50);
        const dropoffY = Phaser.Math.Between(50, this.worldHeight - 50);
        
        // Calculate fare based on distance
        const distance = Phaser.Math.Distance.Between(pickupX, pickupY, dropoffX, dropoffY);
        const fare = Math.round(this.rideSettings.baseFare + (distance * this.rideSettings.distanceMultiplier));
        
        const rideRequest = {
            id: Date.now(),
            rider: rider,
            pickupX: pickupX,
            pickupY: pickupY,
            dropoffX: dropoffX,
            dropoffY: dropoffY,
            fare: fare,
            status: 'requested', // requested, assigned, in_progress, completed
            assignedDriver: null,
            startTime: Date.now()
        };
        
        this.rideRequests.push(rideRequest);
        rider.setData('currentRide', rideRequest);
        rider.setData('status', 'requested');
        
        // Visual indicator for ride request
        this.createRideRequestIndicator(rideRequest);
        
        // Notify drivers
        this.notifyDriversOfRideRequest(rideRequest);
        
        this.activeRides++;
        this.updateUI();
        
        console.log(`Created ride request: ${fare} fare, distance: ${Math.round(distance)}`);
    }
    
    createRideRequestIndicator(rideRequest) {
        // Create pickup marker
        const pickupMarker = this.add.circle(rideRequest.pickupX, rideRequest.pickupY, 12, 0xffd700);
        pickupMarker.setStrokeStyle(3, 0xff6b6b);
        pickupMarker.setData('rideRequest', rideRequest);
        pickupMarker.setData('type', 'pickup');
        
        // Create dropoff marker
        const dropoffMarker = this.add.circle(rideRequest.dropoffX, rideRequest.dropoffY, 10, 0x00ff00);
        dropoffMarker.setStrokeStyle(2, 0xffffff);
        dropoffMarker.setData('rideRequest', rideRequest);
        dropoffMarker.setData('type', 'dropoff');
        
        // Add fare text
        const fareText = this.add.text(rideRequest.pickupX, rideRequest.pickupY - 20, `$${rideRequest.fare}`, {
            fontSize: '12px',
            fill: '#ffffff',
            backgroundColor: '#000000',
            padding: { x: 4, y: 2 }
        });
        fareText.setOrigin(0.5);
        
        rideRequest.pickupMarker = pickupMarker;
        rideRequest.dropoffMarker = dropoffMarker;
        rideRequest.fareText = fareText;
    }
    
    notifyDriversOfRideRequest(rideRequest) {
        // Find available drivers
        const availableDrivers = this.drivers.filter(driver => driver.getData('status') === 'idle');
        
        if (availableDrivers.length === 0) {
            console.log('No available drivers for ride request');
            return;
        }
        
        // Calculate distances and assign closest driver
        let closestDriver = null;
        let closestDistance = Infinity;
        
        availableDrivers.forEach(driver => {
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
            this.assignRideToDriver(rideRequest, closestDriver);
        }
    }
    
    assignRideToDriver(rideRequest, driver) {
        rideRequest.assignedDriver = driver;
        rideRequest.status = 'assigned';
        
        driver.setData('currentRide', rideRequest);
        driver.setData('status', 'going_to_rider');
        driver.setData('target', { x: rideRequest.pickupX, y: rideRequest.pickupY });
        
        // Move driver to pickup location
        this.moveDriverToPickup(driver, rideRequest);
        
        console.log(`Assigned ride to driver, fare: $${rideRequest.fare}`);
    }
    
    moveDriverToPickup(driver, rideRequest) {
        const distance = Phaser.Math.Distance.Between(
            driver.x, driver.y, 
            rideRequest.pickupX, rideRequest.pickupY
        );
        
        const speed = driver.getData('speed');
        const duration = (distance / speed) * 1000; // Convert to milliseconds
        
        console.log(`Driver moving to pickup: distance=${Math.round(distance)}, speed=${speed}, duration=${Math.round(duration)}ms`);
        
        this.tweens.add({
            targets: driver,
            x: rideRequest.pickupX,
            y: rideRequest.pickupY,
            duration: duration,
            ease: 'Power2',
            onComplete: () => {
                console.log('Driver reached pickup location!');
                this.pickupRider(driver, rideRequest);
            }
        });
        
        // Also move the icon
        this.tweens.add({
            targets: driver.getData('icon'),
            x: rideRequest.pickupX,
            y: rideRequest.pickupY,
            duration: duration,
            ease: 'Power2'
        });
    }
    
    pickupRider(driver, rideRequest) {
        console.log('Driver picked up rider!');
        
        // Update statuses
        driver.setData('status', 'on_ride');
        rideRequest.rider.setData('status', 'in_ride');
        rideRequest.status = 'in_progress';
        
        // Move both driver and rider to dropoff
        this.moveToDropoff(driver, rideRequest);
    }
    
    moveToDropoff(driver, rideRequest) {
        const distance = Phaser.Math.Distance.Between(
            rideRequest.pickupX, rideRequest.pickupY,
            rideRequest.dropoffX, rideRequest.dropoffY
        );
        
        const speed = driver.getData('speed');
        const duration = (distance / speed) * 1000;
        
        console.log(`Moving to dropoff: distance=${Math.round(distance)}, speed=${speed}, duration=${Math.round(duration)}ms`);
        
        // Move driver
        this.tweens.add({
            targets: driver,
            x: rideRequest.dropoffX,
            y: rideRequest.dropoffY,
            duration: duration,
            ease: 'Power2',
            onComplete: () => {
                console.log('Driver reached dropoff location!');
                this.completeRide(driver, rideRequest);
            }
        });
        
        // Move rider
        this.tweens.add({
            targets: rideRequest.rider,
            x: rideRequest.dropoffX,
            y: rideRequest.dropoffY,
            duration: duration,
            ease: 'Power2'
        });
        
        // Move icons
        this.tweens.add({
            targets: driver.getData('icon'),
            x: rideRequest.dropoffX,
            y: rideRequest.dropoffY,
            duration: duration,
            ease: 'Power2'
        });
        
        this.tweens.add({
            targets: rideRequest.rider.getData('icon'),
            x: rideRequest.dropoffX,
            y: rideRequest.dropoffY,
            duration: duration,
            ease: 'Power2'
        });
    }
    
    completeRide(driver, rideRequest) {
        console.log(`Ride completed! Fare: $${rideRequest.fare}`);
        
        // Update earnings
        this.earnings += rideRequest.fare;
        this.completedRides++;
        
        // Update rating (simple system)
        const rideTime = Date.now() - rideRequest.startTime;
        const expectedTime = 10000; // 10 seconds expected
        const timeBonus = Math.max(0, (expectedTime - rideTime) / expectedTime);
        this.rating = Math.min(5.0, this.rating + (timeBonus * 0.1));
        
        // For stats
        this.rideDurationsMs.push(rideTime);
        
        // Reset statuses
        driver.setData('status', 'idle');
        driver.setData('currentRide', null);
        driver.setData('target', null);
        
        rideRequest.rider.setData('status', 'waiting');
        rideRequest.rider.setData('currentRide', null);
        
        // Remove visual indicators
        rideRequest.pickupMarker.destroy();
        rideRequest.dropoffMarker.destroy();
        rideRequest.fareText.destroy();
        
        // Remove from active rides
        this.activeRides--;
        
        // Remove from ride requests
        const index = this.rideRequests.indexOf(rideRequest);
        if (index > -1) {
            this.rideRequests.splice(index, 1);
        }
        
        this.updateUI();
        
        // Show completion message
        this.showCompletionMessage(rideRequest.fare);
    }
    
    showCompletionMessage(fare) {
        const message = this.add.text(400, 300, `Ride Completed!\n+$${fare}`, {
            fontSize: '24px',
            fill: '#00ff00',
            backgroundColor: '#000000',
            padding: { x: 10, y: 5 },
            align: 'center'
        });
        message.setOrigin(0.5);
        
        // Fade out after 2 seconds
        this.tweens.add({
            targets: message,
            alpha: 0,
            duration: 2000,
            onComplete: () => {
                message.destroy();
            }
        });
    }
    
    spawnRandomRideRequest() {
        // Auto-spawn ride requests occasionally
        if (Math.random() < 0.3 && this.riders.length > 0) { // 30% chance
            this.createRideRequest();
        }
    }
    
    updateUI() {
        document.getElementById('earnings').textContent = this.earnings;
        document.getElementById('rating').textContent = this.rating.toFixed(1);
        document.getElementById('active-rides').textContent = this.activeRides;
        
        // Update camera info
        const cam = this.cameras.main;
        document.getElementById('zoom-level').textContent = `${cam.zoom.toFixed(1)}x`;
        document.getElementById('camera-pos').textContent = `${Math.round(cam.centerX)}, ${Math.round(cam.centerY)}`;
    }
    
    update() {
        // Update driver AI and ride status
        this.updateDriverAI();
        
        // Update object visibility based on camera viewport
        this.updateObjectVisibility();
        
        // Render minimap each frame
        this.renderMiniMap();
    }
    
    updateObjectVisibility() {
        const cam = this.cameras.main;
        const viewportLeft = cam.x;
        const viewportTop = cam.y;
        const viewportRight = cam.x + cam.width;
        const viewportBottom = cam.y + cam.height;
        
        // Add some padding to viewport for smoother experience
        const padding = 50;
        const paddedLeft = viewportLeft - padding;
        const paddedTop = viewportTop - padding;
        const paddedRight = viewportRight + padding;
        const paddedBottom = viewportBottom + padding;
        
        // Update driver visibility
        this.drivers.forEach(driver => {
            const isVisible = driver.x >= paddedLeft && driver.x <= paddedRight &&
                             driver.y >= paddedTop && driver.y <= paddedBottom;
            driver.setVisible(isVisible);
            if (driver.getData('icon')) {
                driver.getData('icon').setVisible(isVisible);
            }
        });
        
        // Update rider visibility
        this.riders.forEach(rider => {
            const isVisible = rider.x >= paddedLeft && rider.x <= paddedRight &&
                             rider.y >= paddedTop && rider.y <= paddedBottom;
            rider.setVisible(isVisible);
            if (rider.getData('icon')) {
                rider.getData('icon').setVisible(isVisible);
            }
        });
        
        // Update ride request markers visibility
        this.rideRequests.forEach(rideRequest => {
            if (rideRequest.pickupMarker) {
                const pickupVisible = rideRequest.pickupX >= paddedLeft && rideRequest.pickupX <= paddedRight &&
                                    rideRequest.pickupY >= paddedTop && rideRequest.pickupY <= paddedBottom;
                rideRequest.pickupMarker.setVisible(pickupVisible);
                if (rideRequest.fareText) {
                    rideRequest.fareText.setVisible(pickupVisible);
                }
            }
            
            if (rideRequest.dropoffMarker) {
                const dropoffVisible = rideRequest.dropoffX >= paddedLeft && rideRequest.dropoffX <= paddedRight &&
                                     rideRequest.dropoffY >= paddedTop && rideRequest.dropoffY <= paddedBottom;
                rideRequest.dropoffMarker.setVisible(dropoffVisible);
            }
        });
        
        // Update landmark visibility
        if (this.landmarkObjects) {
            this.landmarkObjects.forEach(landmarkObj => {
                const isVisible = landmarkObj.marker.x >= paddedLeft && landmarkObj.marker.x <= paddedRight &&
                                 landmarkObj.marker.y >= paddedTop && landmarkObj.marker.y <= paddedBottom;
                landmarkObj.marker.setVisible(isVisible);
                landmarkObj.label.setVisible(isVisible);
            });
        }
        
        // Update building visibility (buildings are large, so use intersection check)
        if (this.buildingObjects) {
            this.buildingObjects.forEach(building => {
                const buildingLeft = building.x - building.width / 2;
                const buildingRight = building.x + building.width / 2;
                const buildingTop = building.y - building.height / 2;
                const buildingBottom = building.y + building.height / 2;
                
                const isVisible = !(buildingRight < paddedLeft || buildingLeft > paddedRight ||
                                  buildingBottom < paddedTop || buildingTop > paddedBottom);
                building.setVisible(isVisible);
            });
        }
        
        // Update road visibility (roads span the entire world, but we can optimize)
        if (this.roadObjects) {
            this.roadObjects.forEach(road => {
                // Roads are always visible since they span the entire world
                // But we could add more sophisticated culling if needed
                road.setVisible(true);
            });
        }
        
        // Debug logging for viewport culling
        if (this.isDragging) {
            console.log(`Viewport culling: (${Math.round(viewportLeft)}, ${Math.round(viewportTop)}) to (${Math.round(viewportRight)}, ${Math.round(viewportBottom)})`);
        }
    }

    updateDriverAI() {
        // Update driver status indicators
        this.drivers.forEach(driver => {
            const status = driver.getData('status');
            const icon = driver.getData('icon');
            
            // Update icon based on status
            if (status === 'idle') {
                icon.setText('🚗');
            } else if (status === 'going_to_rider') {
                icon.setText('🚗➡️');
            } else if (status === 'on_ride') {
                icon.setText('🚗👤');
            }
        });
    }

    renderMiniMap() {
        if (!this.minimapCtx) return;
        const ctx = this.minimapCtx;

        // Clear
        ctx.clearRect(0, 0, 240, 160);
        ctx.fillStyle = '#1f2a35';
        ctx.fillRect(0, 0, 240, 160);

        // Draw roads (scaled)
        ctx.strokeStyle = '#566573';
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let y = 120; y < this.worldHeight - 120; y += 100) {
            const sy = y * this.minimapScaleY;
            ctx.moveTo(0, sy);
            ctx.lineTo(240, sy);
        }
        for (let x = 120; x < this.worldWidth - 120; x += 140) {
            const sx = x * this.minimapScaleX;
            ctx.moveTo(sx, 0);
            ctx.lineTo(sx, 160);
        }
        ctx.stroke();

        // Buildings (as dim rectangles)
        if (this.buildings) {
            ctx.fillStyle = 'rgba(127,140,141,0.5)';
            this.buildings.forEach(b => {
                const x = b.x * this.minimapScaleX;
                const y = b.y * this.minimapScaleY;
                const w = b.w * this.minimapScaleX;
                const h = b.h * this.minimapScaleY;
                ctx.fillRect(x, y, w, h);
            });
        }

        // Riders
        this.riders.forEach(r => {
            const x = r.x * this.minimapScaleX;
            const y = r.y * this.minimapScaleY;
            ctx.fillStyle = '#2ecc71';
            ctx.fillRect(x - 2, y - 2, 4, 4);
        });

        // Drivers
        this.drivers.forEach(d => {
            const x = d.x * this.minimapScaleX;
            const y = d.y * this.minimapScaleY;
            ctx.fillStyle = '#3498db';
            ctx.fillRect(x - 2, y - 2, 4, 4);
        });

        // Ride markers
        this.rideRequests.forEach(req => {
            ctx.strokeStyle = '#f1c40f';
            ctx.beginPath();
            ctx.arc(req.pickupX * this.minimapScaleX, req.pickupY * this.minimapScaleY, 4, 0, Math.PI * 2);
            ctx.stroke();
            ctx.strokeStyle = '#2ecc71';
            ctx.beginPath();
            ctx.arc(req.dropoffX * this.minimapScaleX, req.dropoffY * this.minimapScaleY, 3, 0, Math.PI * 2);
            ctx.stroke();
        });

        // Draw viewport indicator (red square showing current camera view)
        this.drawViewportIndicator(ctx);

        // Stats
        const elapsed = Math.floor((Date.now() - this.simStartMs) / 1000);
        const mm = String(Math.floor(elapsed / 60));
        const ss = String(elapsed % 60).padStart(2, '0');
        document.getElementById('map-time').textContent = `${mm}:${ss}`;
        const agents = this.riders.length + this.drivers.length;
        document.getElementById('map-agents').textContent = String(agents);
        const avgMs = this.rideDurationsMs.length ? Math.round(this.rideDurationsMs.reduce((a,b)=>a+b,0) / this.rideDurationsMs.length) : 0;
        document.getElementById('map-avg').textContent = `${Math.round(avgMs/1000)}s`;
    }

    drawViewportIndicator(ctx) {
        const cam = this.cameras.main;
        
        // Calculate viewport bounds in world coordinates
        const viewportLeft = cam.x;
        const viewportTop = cam.y;
        const viewportRight = cam.x + cam.width;
        const viewportBottom = cam.y + cam.height;
        
        // Convert to mini-map coordinates
        const miniLeft = viewportLeft * this.minimapScaleX;
        const miniTop = viewportTop * this.minimapScaleY;
        const miniRight = viewportRight * this.minimapScaleX;
        const miniBottom = viewportBottom * this.minimapScaleY;
        
        // Draw red square outline for viewport
        ctx.strokeStyle = '#ff0000';
        ctx.lineWidth = 2;
        ctx.strokeRect(miniLeft, miniTop, miniRight - miniLeft, miniBottom - miniTop);
        
        // Add semi-transparent red fill
        ctx.fillStyle = 'rgba(255, 0, 0, 0.1)';
        ctx.fillRect(miniLeft, miniTop, miniRight - miniLeft, miniBottom - miniTop);
        
        console.log(`Viewport indicator: world(${Math.round(viewportLeft)}, ${Math.round(viewportTop)}) -> mini(${Math.round(miniLeft)}, ${Math.round(miniTop)})`);
    }

    setupZoomControls() {
        // Mouse wheel zoom
        this.input.on('wheel', (pointer, gameObjects, deltaX, deltaY, deltaZ) => {
            const cam = this.cameras.main;
            const zoomFactor = 0.1;
            const currentZoom = cam.zoom;
            
            if (deltaY > 0) {
                // Zoom out
                const newZoom = Math.max(0.5, currentZoom - zoomFactor);
                cam.setZoom(newZoom);
                console.log(`Zoomed out to: ${newZoom}`);
            } else {
                // Zoom in
                const newZoom = Math.min(3.0, currentZoom + zoomFactor);
                cam.setZoom(newZoom);
                console.log(`Zoomed in to: ${newZoom}`);
            }
            this.updateUI();
        });
        
        // Keyboard zoom controls
        this.input.keyboard.on('keydown-PLUS', () => {
            const cam = this.cameras.main;
            const newZoom = Math.min(3.0, cam.zoom + 0.2);
            cam.setZoom(newZoom);
            console.log(`Zoomed in to: ${newZoom}`);
            this.updateUI();
        });
        
        this.input.keyboard.on('keydown-MINUS', () => {
            const cam = this.cameras.main;
            const newZoom = Math.max(0.5, cam.zoom - 0.2);
            cam.setZoom(newZoom);
            console.log(`Zoomed out to: ${newZoom}`);
            this.updateUI();
        });
        
        // Reset zoom with '0' key
        this.input.keyboard.on('keydown-ZERO', () => {
            this.cameras.main.setZoom(1.0);
            console.log('Zoom reset to 1.0');
            this.updateUI();
        });
    }

    centerCameraOn(worldX, worldY) {
        const cam = this.cameras.main;
        console.log(`Centering camera on world position: (${worldX}, ${worldY})`);
        
        // Clamp the target position to world bounds
        const clampedX = Phaser.Math.Clamp(worldX, 0, this.worldWidth);
        const clampedY = Phaser.Math.Clamp(worldY, 0, this.worldHeight);
        
        // Use centerOn for proper centering
        cam.centerOn(clampedX, clampedY);
        
        console.log(`Camera centered at: (${cam.centerX}, ${cam.centerY})`);
        this.updateUI();
    }
}

// Game configuration
const config = {
    type: Phaser.AUTO,
    width: window.innerWidth,
    height: window.innerHeight - 140, // leave space for bottom UI like Warcraft
    parent: 'game-canvas',
    backgroundColor: '#2c3e50',
    scene: TrafficSimulator,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    }
};

// Start the game
const game = new Phaser.Game(config);

// Handle window resize
window.addEventListener('resize', () => {
    game.scale.resize(window.innerWidth, window.innerHeight - 140);
});