
//#region Constant Manipulation Variables

var tileSizeMultiplier = 1.5;
var wallStripMultiplier = 2;
var FOV = 75
var backroundColourChoice = 1;

if (localStorage.getItem("tileSizeMultiplierKey") != null) {
    tileSizeMultiplier = parseFloat(localStorage.getItem("tileSizeMultiplierKey"));
}

if (localStorage.getItem("wallStripMultiplier") != null) {
    wallStripMultiplier = parseInt(localStorage.getItem("wallStripMultiplier"));
}

if (localStorage.getItem("FOV") != null) {
    FOV = parseInt(localStorage.getItem("FOV"));
}

if (localStorage.getItem("backroundColourChoice") != null) {
    backroundColourChoice = parseInt(localStorage.getItem("backroundColourChoice"));
}


//#endregion

//#region Local Storage Functions

function chooseSize(choice) {
    localStorage.setItem("tileSizeMultiplierKey", choice);
    location.reload();
}

function chooseQuality(choice) {
    localStorage.setItem("wallStripMultiplier", choice);
    location.reload();
}

function chooseFOV(choice) {
    localStorage.setItem("FOV", choice);
    location.reload();
}

function chooseBackground(choice) {
    localStorage.setItem("backroundColourChoice", choice);
    location.reload();
}

//#endregion

//#region Constants

const TILE_SIZE = 16;
const MAP_NUM_ROWS = 15;
const MAP_NUM_COLS = 20;

const WINDOW_WIDTH = MAP_NUM_COLS * (TILE_SIZE * tileSizeMultiplier);
const WINDOW_HEIGHT = MAP_NUM_ROWS * (TILE_SIZE * tileSizeMultiplier);

const FOV_ANGLE = FOV * (Math.PI / 180);

const WALL_STRIP_WIDTH = 1;
const NUM_RAYS = WINDOW_WIDTH / (WALL_STRIP_WIDTH * wallStripMultiplier);

const MINIMAP_SCALE_FACTOR = 0.25; // 0.25

//#endregion

//#region Classes

class Map {

    constructor() {

        this.grid = mapSelection(1);
    }

    hasWallAt(x, y) {

        if (x < 0 || x > WINDOW_WIDTH || y < 0 || y > WINDOW_HEIGHT) {
            return true;
        }

        var mapGridIndexX = Math.floor(x / (TILE_SIZE * tileSizeMultiplier));
        var mapGridIndexY = Math.floor(y / (TILE_SIZE * tileSizeMultiplier));

        if (this.grid[mapGridIndexY][mapGridIndexX] == 0) {
            return false;
        }
        else {
            return true;
        }

    }

    render() {
        //640

        // Minimap background rectangle
        //stroke(255, 204, 0);
        stroke(rgbSelection(backroundColourChoice, false));
        strokeWeight(((TILE_SIZE * tileSizeMultiplier) / 16));
        fill("#222");
        rect(
            WINDOW_WIDTH / 50,
            WINDOW_WIDTH / 50, 
            (((TILE_SIZE * tileSizeMultiplier) * MAP_NUM_COLS) * MINIMAP_SCALE_FACTOR) + (WINDOW_WIDTH / 110),
            (((TILE_SIZE * tileSizeMultiplier) * MAP_NUM_ROWS) * MINIMAP_SCALE_FACTOR) + (WINDOW_WIDTH / 110)
        );

        // Each minimap tile rectangle
        for (var i = 0; i < MAP_NUM_ROWS; i++) {
            for (var j = 0; j < MAP_NUM_COLS; j++) {
                var tileX = j * (TILE_SIZE * tileSizeMultiplier); 
                var tileY = i * (TILE_SIZE * tileSizeMultiplier);
                var tileColor = this.grid[i][j] == 1 ? "rgba(20, 20, 20, 1)" : "rgba(200, 200, 200, 1)";
                stroke("#222");
                strokeWeight(1);
                fill(tileColor);
                rect(
                    (tileX * MINIMAP_SCALE_FACTOR) + (WINDOW_WIDTH / 50) + ((TILE_SIZE * tileSizeMultiplier) / 16),
                    (tileY * MINIMAP_SCALE_FACTOR) + (WINDOW_WIDTH / 50) + ((TILE_SIZE * tileSizeMultiplier) / 16), 
                    (TILE_SIZE * tileSizeMultiplier) * MINIMAP_SCALE_FACTOR, 
                    (TILE_SIZE * tileSizeMultiplier) * MINIMAP_SCALE_FACTOR
                );
            }
        }
    }
}

class Player {

    constructor() {
        this.x = WINDOW_WIDTH / 2;
        this.y = WINDOW_HEIGHT / 2;
        this.radius = 3;
        this.turnDirection = 0; // -1 if left, +1 if right
        this.walkDirection = 0; // -1 if back, +1 if front
        this.rotationAngle = Math.PI / 2;
        this.moveSpeed = ((TILE_SIZE * tileSizeMultiplier) / 16);
        this.rotationSpeed = 4 * (Math.PI / 180);
    }

    update() {
        this.rotationAngle += this.turnDirection * this.rotationSpeed;

        var moveStep = this.walkDirection * this.moveSpeed;

        var newPlayerX = this.x + Math.cos(this.rotationAngle) * moveStep;
        var newPlayerY = this.y + Math.sin(this.rotationAngle) * moveStep;

        if (!grid.hasWallAt(newPlayerX, newPlayerY)) {
            this.x = newPlayerX;
            this.y = newPlayerY;
        }
        else if (!grid.hasWallAt(this.x, newPlayerY)){
           this.y = newPlayerY;
        }
        else if (!grid.hasWallAt(newPlayerX, this.y)){
            this.x = newPlayerX;
         }
    }

    render() {
        noStroke();
        fill("green");
        circle(
            this.x * MINIMAP_SCALE_FACTOR + (WINDOW_WIDTH / 50) + ((TILE_SIZE * tileSizeMultiplier) / 16), 
            this.y * MINIMAP_SCALE_FACTOR + (WINDOW_WIDTH / 50) + ((TILE_SIZE * tileSizeMultiplier) / 16), 
            this.radius * (MINIMAP_SCALE_FACTOR * ((TILE_SIZE * tileSizeMultiplier) / 6))
        );
    }
}

class Ray {

    constructor(rayAngle) {

        this.rayAngle = normalizeAngle(rayAngle);
        this.wallHitX = 0;
        this.wallHitY = 0;
        this.distance = 0;
        this.wasHitVertical = false;

        this.isRayFacingDown = this.rayAngle > 0 && this.rayAngle < Math.PI;
        this.isRayFacingUp = !this.isRayFacingDown;

        this.isRayFacingRight = this.rayAngle < 0.5 * Math.PI || this.rayAngle > 1.5 * Math.PI;
        this.isRayFacingLeft = !this.isRayFacingRight;
    }

    cast() {

        var xIntercept, yIntercept;
        var xstep, ystep;

        ////////////////////////////////////////////////
        // HORIZONTAL RAY-GRID INTERSECTION CODE
        ////////////////////////////////////////////////

        var foundHorizontalWallHit = false;
        var horizontalWallHitX = 0;
        var horizontalWallHitY = 0;
        // Find y co-ord of the closest horizontal grid intersection
        yIntercept = Math.floor(player.y / (TILE_SIZE * tileSizeMultiplier)) * (TILE_SIZE * tileSizeMultiplier);

        if (this.isRayFacingDown) {
            yIntercept += (TILE_SIZE * tileSizeMultiplier);
        }

        // Find x co-ord of the closest horizontal grid intersection
        xIntercept = player.x + (yIntercept - player.y) / Math.tan(this.rayAngle);

        // Calculate the increment for xstep and ystep
        ystep = (TILE_SIZE * tileSizeMultiplier);

        if (this.isRayFacingUp) {
            ystep *= -1;
        }

        xstep = (TILE_SIZE * tileSizeMultiplier) / Math.tan(this.rayAngle);

        if (this.isRayFacingLeft && xstep > 0 ||
            this.isRayFacingRight && xstep < 0) {
            xstep *= -1;
        }

        var nextHorizontalTouchX = xIntercept;
        var nextHorizontalTouchY = yIntercept;

        // Increment xstep and ystep until wall is found
        while (nextHorizontalTouchX >= 0 && 
            nextHorizontalTouchX <= WINDOW_WIDTH &&
            nextHorizontalTouchY >= 0 && 
            nextHorizontalTouchY <= WINDOW_HEIGHT) {

            var numToSubtract = 0;

            if (this.isRayFacingUp) {
                numToSubtract = 1;
            }

            if (grid.hasWallAt(nextHorizontalTouchX, nextHorizontalTouchY - numToSubtract)) {
                // Wall found
                foundHorizontalWallHit = true;
                horizontalWallHitX = nextHorizontalTouchX;
                horizontalWallHitY = nextHorizontalTouchY;
                break;
            }
            else {
                nextHorizontalTouchX += xstep;
                nextHorizontalTouchY += ystep;
            }
        }

        ////////////////////////////////////////////////
        // VERTICAL RAY-GRID INTERSECTION CODE
        ////////////////////////////////////////////////

        var foundVerticalWallHit = false;
        var verticalWallHitX = 0;
        var verticalWallHitY = 0;
        // Find x co-ord of the closest vertical grid intersection
        xIntercept = Math.floor(player.x / (TILE_SIZE * tileSizeMultiplier)) * (TILE_SIZE * tileSizeMultiplier);

        if (this.isRayFacingRight) {
            xIntercept += (TILE_SIZE * tileSizeMultiplier);
        }

        // Find y co-ord of the closest vertical grid intersection
        yIntercept = player.y + (xIntercept - player.x) * Math.tan(this.rayAngle);

        // Calculate the increment for xstep and ystep
        xstep = (TILE_SIZE * tileSizeMultiplier);

        if (this.isRayFacingLeft) {
            xstep *= -1;
        }

        ystep = (TILE_SIZE * tileSizeMultiplier) * Math.tan(this.rayAngle);

        if (this.isRayFacingUp && ystep > 0 ||
            this.isRayFacingDown && ystep < 0) {
            ystep *= -1;
        }

        var nextVerticalTouchX = xIntercept;
        var nextVerticalTouchY = yIntercept;

        // Increment by xstep and ystep until wall is found
        while (nextVerticalTouchX >= 0 && 
            nextVerticalTouchX <= WINDOW_WIDTH &&
            nextVerticalTouchY >= 0 && 
            nextVerticalTouchY <= WINDOW_HEIGHT) {

            var numToSubtract = 0;

            if (this.isRayFacingLeft) {
                numToSubtract = 1;
            }

            if (grid.hasWallAt(nextVerticalTouchX - numToSubtract, nextVerticalTouchY)) {
                // Wall found
                foundVerticalWallHit = true;
                verticalWallHitX = nextVerticalTouchX;
                verticalWallHitY = nextVerticalTouchY;
                break;
            }
            else {
                nextVerticalTouchX += xstep;
                nextVerticalTouchY += ystep;
            }
        }


        ////////////////////////////////////////////////
        // CALCULATE DISTANCE CODE
        ////////////////////////////////////////////////

        // Calculate both horizontal and vertical distance and choose the smallest
        var horizontalHitDistance;
        if (foundHorizontalWallHit) {
            horizontalHitDistance = distanceBetweenPoints(
                player.x, 
                player.y, 
                horizontalWallHitX, 
                horizontalWallHitY)
        }
        else {
            horizontalHitDistance = Number.MAX_VALUE;
        }

        var verticalHitDistance;
        if (foundVerticalWallHit) {
            verticalHitDistance = distanceBetweenPoints(
                player.x, 
                player.y, 
                verticalWallHitX, 
                verticalWallHitY)
        }
        else {
            verticalHitDistance = Number.MAX_VALUE;
        }

        // Only store smallest of the two distances
        if (horizontalHitDistance < verticalHitDistance) {
            this.wallHitX = horizontalWallHitX;
            this.wallHitY = horizontalWallHitY;
            this.distance = horizontalHitDistance;
        }
        else {
            this.wallHitX = verticalWallHitX;
            this.wallHitY = verticalWallHitY;
            this.distance = verticalHitDistance;
            this.wasHitVertical = true;
        }
    }

    render() {
        stroke("rgba(200, 50, 50, 0.2)");
        line(
            (player.x * MINIMAP_SCALE_FACTOR) + (WINDOW_WIDTH / 50) + ((TILE_SIZE * tileSizeMultiplier) / 16), 
            (player.y * MINIMAP_SCALE_FACTOR) + (WINDOW_WIDTH / 50) + ((TILE_SIZE * tileSizeMultiplier) / 16), 
            (this.wallHitX * MINIMAP_SCALE_FACTOR + (WINDOW_WIDTH / 50) + ((TILE_SIZE * tileSizeMultiplier) / 16)),
            (this.wallHitY * MINIMAP_SCALE_FACTOR) + (WINDOW_WIDTH / 50) + ((TILE_SIZE * tileSizeMultiplier) / 16)
        );
    }
}

//#endregion

//#region Variables

// Canvas
var canvas;

// Instances of Classes
var grid = new Map();
var player = new Player();

// Ray Array
var rays = [];

// Character Animation
var viewBobCount = 0;
var fireGunAnimationCount = 0;
var gunFired = false;

// Pause Menu
var isGamePaused = false;
var displayQuality;

// Images
var pistolSpriteNeutral;
var pistolSpriteFiring;

var settingsIcon;
var exitIcon;

// Fonts
var subspace;


//#endregion

//#region Keyboard Functions

function keyPressed() {
    
    if (keyCode == 27) {
        console.log("Key pressed = " + keyCode);
        console.log("isGamePaused = " + isGamePaused);

        if (isGamePaused) {
            isGamePaused = false;
        }
        else {
            isGamePaused = true;
        }
        console.log("isGamePaused = " + isGamePaused);
    }
    if (!isGamePaused) {
        if (keyCode == 32) {
            gunFired = true;
            event.preventDefault();
        }
        else if (keyCode == 87) {
            player.walkDirection = 1;
        }
        else if (keyCode == 83) {
            player.walkDirection = -1;
        }
        else if (keyCode == 68) {
            player.turnDirection = 1;
        }
        else if (keyCode == 65) {
            player.turnDirection = -1;
        }
    }
}

function keyReleased() {
    
    if (!isGamePaused) {
        if (keyCode == 87) {
            if (keyIsDown(83)) {
                player.walkDirection = -1;
            }
            else {
                player.walkDirection = 0;
            }
        }
        else if (keyCode == 83) {
            if (keyIsDown(87)) {
                player.walkDirection = 1;
            }
            else {
                player.walkDirection = 0;
            }
        }
        else if (keyCode == 68) {
            if (keyIsDown(65)) {
                player.turnDirection = -1;
            }
            else {
                player.turnDirection = 0;
            }
        }
        else if (keyCode == 65) {
            if (keyIsDown(68)) {
                player.turnDirection = 1;
            }
            else {
                player.turnDirection = 0;
            }
        }
    }
    else {
        player.walkDirection = 0;
        player.turnDirection = 0;
    }
}

//#endregion

//#region Maps, Rays, Walls, Background

function mapSelection(choice) {

    var map;

    switch(choice) {
        case 1:
            map = [
                [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1],
                [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 1],
                [1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1, 0, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1, 0, 0, 0, 0, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 1, 0, 0, 0, 0, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 1, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1],
                [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
            ];
            break;

        case 2: 
            map = [
                [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
            ];
            break;

        case 3:
            map = [
                [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1],
                [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 1],
                [1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1, 0, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1, 0, 0, 0, 0, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 1, 0, 0, 0, 0, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 1, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1],
                [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
            ];
    }
    return map;
}

function castAllRays() {

    var rayAngle = player.rotationAngle - (FOV_ANGLE / 2);

    rays = [];

    for (var i = 0; i < NUM_RAYS; i++) {
        var ray = new Ray(rayAngle);

        ray.cast();

        rays.push(ray);

        rayAngle += FOV_ANGLE / NUM_RAYS;
    }
}

function render3DProjectedWalls() {

    for (var i = 0; i < NUM_RAYS; i++) {
        var ray = rays[i];

        // Prevent fish eye effect
        var correctWallDistance = ray.distance * Math.cos(ray.rayAngle - player.rotationAngle);

        // Calculate the distance to the projection plane
        var distanceProjectionPlane = (WINDOW_WIDTH / 2) / Math.tan(FOV_ANGLE / 2);

        // Projected wall height
        var wallStripHeight = ((TILE_SIZE * tileSizeMultiplier) / correctWallDistance) * distanceProjectionPlane;

        // Create background walls
        fill("rgba(40, 40, 40, 1)"); // 40, 40, 40, 1
        noStroke();
        rect(
            i * (WALL_STRIP_WIDTH * wallStripMultiplier),
            (WINDOW_HEIGHT / 2) - (wallStripHeight / 2),
            (WALL_STRIP_WIDTH * wallStripMultiplier),
            wallStripHeight
        );

        // Calculate transparancy based on wall distance
        var alpha = 200 / correctWallDistance;
        var colourIntensity = 120; // 120

        if (ray.wasHitVertical) {
            colourIntensity = 160; // 180
        }

        // Create actual walls
        fill("rgba(" + colourIntensity + ", " + colourIntensity + ", " + 
                    colourIntensity + ", " + alpha + ")"
        );
        noStroke();
        rect(
            i * (WALL_STRIP_WIDTH * wallStripMultiplier),
            (WINDOW_HEIGHT / 2) - (wallStripHeight / 2),
            (WALL_STRIP_WIDTH * wallStripMultiplier),
            wallStripHeight
        );
        


        
        // Tall Walls
        /*
        fill("rgba(40, 40, 40, 1)");
        noStroke();
        rect(
            i * (WALL_STRIP_WIDTH * wallStripMultiplier),
            (WINDOW_HEIGHT / 2) - (wallStripHeight / 2) * 2.5,
            (WALL_STRIP_WIDTH * wallStripMultiplier),
            wallStripHeight
        );

        fill("rgba(" + colourIntensity + ", " + colourIntensity + ", " + 
                    colourIntensity + ", " + alpha + ")"
        );
        noStroke();
        rect(
            i * (WALL_STRIP_WIDTH * wallStripMultiplier),
            (WINDOW_HEIGHT / 2) - (wallStripHeight / 2) * 2.5,
            (WALL_STRIP_WIDTH * wallStripMultiplier),
            wallStripHeight
        );
        */

        // Create wall bottom border
        /*
        fill("rgba(0, 0, 0, 1)"
        );
        noStroke();
        rect(
            i * (WALL_STRIP_WIDTH * wallStripMultiplier),
            (WINDOW_HEIGHT / 2) - (wallStripHeight / 2) * 8,
            (WALL_STRIP_WIDTH * wallStripMultiplier),
            wallStripHeight
        );
        */

        // Create mirror flooring
        /*
        fill("rgba(" + colourIntensity + ", " + colourIntensity + ", " + 
                    colourIntensity + ", " + alpha + ")"
        );
        noStroke();
        rect(
            i * (WALL_STRIP_WIDTH * wallStripMultiplier),
            (WINDOW_HEIGHT / 2) + (wallStripHeight / 2),
            (WALL_STRIP_WIDTH * wallStripMultiplier),
            wallStripHeight
        );
        */


    }
}

function normalizeAngle(angle) {
    angle = angle % (2 * Math.PI);
    if (angle < 0) {
        angle = (2 * Math.PI) + angle;
    }
    return angle;
}

function distanceBetweenPoints(x1, y1, x2, y2) {
    return Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2-y1));
}

function renderBackground(backgroundChoice) {

    // Background
    noStroke();
    fill(rgbSelection(backroundColourChoice, false));
    rect(
        0,
        0,
        WINDOW_WIDTH,
        WINDOW_HEIGHT
    );

    if (backgroundChoice == 2) {

        // Background rectangle floor
        noStroke();
        fill("rgba( 60, 60, 60, 1)");
        rect(
            0,
            WINDOW_HEIGHT / 2,
            WINDOW_WIDTH,
            WINDOW_HEIGHT
        );

    }

    if (backgroundChoice == 3) {
        // Background rectangle ceiling
        noStroke();
        fill("rgba( 80, 20, 20, 1)");
        rect(
            0,
            0,
            WINDOW_WIDTH,
            WINDOW_HEIGHT / 2
        );
    }

}

function rgbSelection(choice, inverse) {
    
    var red = 50;
    var green = 0;
    var blue = 0;

    var xPos, xPosInverse, yPos, finalColour;

    xPos = (player.x / WINDOW_WIDTH) * 100;
    xPosInverse = 100 - xPos;
    yPos = (((player.y / WINDOW_WIDTH) * 100));

    if (choice == 1) {

        red = Math.floor(xPos);
        blue = Math.floor(xPosInverse);
        green = Math.floor(yPos) * 2;

        if (green > 100) {
            green = 200 - green;
        }
    }
    else if (choice == 2) {
        red = 0;
        green = 20;
        blue = 20;
    }
    else if (choice == 3) {
        red = 50;
        green = 0;
        blue = 0;
    }

    if (!inverse) {
        finalColour = "rgba(" + red + ", " + green + ", " + blue + ", 1)";
    }
    else {
        finalColour = "rgba(" + 255 - red + ", " + 255 - green + ", " + 255 - blue + ", 1)";
    }
    

    return finalColour;
}

//#endregion

//#region Pause Menu

function displayPauseButton() {

    image(
        settingsIcon, 
        ((TILE_SIZE * tileSizeMultiplier) * 17), // 4.28
        ((TILE_SIZE * tileSizeMultiplier) * 13), // 6.56
        ((TILE_SIZE * tileSizeMultiplier) * 3), // 12
        ((TILE_SIZE * tileSizeMultiplier) * 3) // 12
    );

}

function pauseMenu() {

    if (wallStripMultiplier == 2) {
        displayQuality = "High";
    }
    else if (wallStripMultiplier == 3) {
        displayQuality = "Med";
    }
    else {
        displayQuality = "Low";
    }

    // Background tint rectangle
    fill("rgba(20, 20, 20, 0.6)");
    rect(
        0,
        0,
        WINDOW_WIDTH,
        WINDOW_HEIGHT
    );


    // Middle rectangle
    strokeWeight(2 * tileSizeMultiplier);
    stroke("rgba(150, 150, 150, 1)");
    fill("rgba(20, 20, 20, 0.9)");
    rect(
        WINDOW_WIDTH / 4,
        WINDOW_HEIGHT / 4,
        WINDOW_WIDTH / 2,
        WINDOW_HEIGHT / 2,
        2 * tileSizeMultiplier
    );

    // Exit Icon
    image(
        exitIcon, 
        ((TILE_SIZE * tileSizeMultiplier) * 5.25), // 4.28
        ((TILE_SIZE * tileSizeMultiplier) * 4), // 6.56
        ((TILE_SIZE * tileSizeMultiplier) * 0.8), // 12
        ((TILE_SIZE * tileSizeMultiplier) * 0.8) // 12
    );

    // Quality option rectangle
    strokeWeight(2 * tileSizeMultiplier);
    stroke("rgba(220, 220, 220, 1)");
    fill("rgba(180, 180, 180, 0.8)");
    rect(
        WINDOW_WIDTH / 3,
        WINDOW_HEIGHT / 3,
        WINDOW_WIDTH / 3,
        WINDOW_HEIGHT / 12,
        2 * tileSizeMultiplier
    );
    
    // Quality text
    strokeWeight(0.3 * tileSizeMultiplier);
    stroke("rgba(255, 255, 255, 1)");
    textFont(subspace);
    textSize(16 * tileSizeMultiplier);
    fill("rgba(30, 30, 30, 1)");
    text('Quality', WINDOW_WIDTH / 2.8, WINDOW_HEIGHT / 2.49);

    // Quality choice text
    strokeWeight(0.3 * tileSizeMultiplier);
    stroke("rgba(255, 255, 255, 1)");
    textFont(subspace);
    textSize(16 * tileSizeMultiplier);
    fill("rgba(30, 30, 30, 1)");
    text(displayQuality, WINDOW_WIDTH / 1.72, WINDOW_HEIGHT / 2.49);


    // FOV option rectangle
    strokeWeight(2 * tileSizeMultiplier);
    stroke("rgba(220, 220, 220, 1)");
    fill("rgba(180, 180, 180, 0.8)");
    rect(
        WINDOW_WIDTH / 3,
        WINDOW_HEIGHT / 3 + WINDOW_HEIGHT / 8,
        WINDOW_WIDTH / 3,
        WINDOW_HEIGHT / 12,
        2 * tileSizeMultiplier
    );

    // FOV text
    strokeWeight(0.3 * tileSizeMultiplier);
    stroke("rgba(255, 255, 255, 1)");
    textFont(subspace);
    textSize(16 * tileSizeMultiplier);
    fill("rgba(30, 30, 30, 1)");
    text('FOV', WINDOW_WIDTH / 2.8, WINDOW_HEIGHT / 2.49 + WINDOW_HEIGHT / 8);

    // FOV choice text
    strokeWeight(0.3 * tileSizeMultiplier);
    stroke("rgba(255, 255, 255, 1)");
    textFont(subspace);
    textSize(16 * tileSizeMultiplier);
    fill("rgba(30, 30, 30, 1)");
    text(FOV, WINDOW_WIDTH / 1.65, WINDOW_HEIGHT / 2.49 + WINDOW_HEIGHT / 8);


    // Background option rectangle
    strokeWeight(2 * tileSizeMultiplier);
    stroke("rgba(220, 220, 220, 1)");
    fill("rgba(180, 180, 180, 0.8)");
    rect(
        WINDOW_WIDTH / 3,
        WINDOW_HEIGHT / 3 + WINDOW_HEIGHT / 4,
        WINDOW_WIDTH / 3,
        WINDOW_HEIGHT / 12,
        2 * tileSizeMultiplier
    );

    // Background text
    strokeWeight(0.3 * tileSizeMultiplier);
    stroke("rgba(255, 255, 255, 1)");
    textFont(subspace);
    textSize(16 * tileSizeMultiplier);
    fill("rgba(30, 30, 30, 1)");
    text('Background', WINDOW_WIDTH / 2.8, WINDOW_HEIGHT / 2.49 + WINDOW_HEIGHT / 4);

    // Background choice text
    strokeWeight(0.3 * tileSizeMultiplier);
    stroke("rgba(255, 255, 255, 1)");
    textFont(subspace);
    textSize(16 * tileSizeMultiplier);
    fill("rgba(30, 30, 30, 1)");
    text(backroundColourChoice, WINDOW_WIDTH / 1.6, WINDOW_HEIGHT / 2.49 + WINDOW_HEIGHT / 4);
}

function mousePressed() {

    // Check if pause menu is open
    if (!isGamePaused) {

        // Check if cursor is over settings button
        if (mouseX >= WINDOW_WIDTH / 1.15 + (22 - 4 * tileSizeMultiplier) && 
            mouseX <= WINDOW_WIDTH / 0.98 + (22 - 4 * tileSizeMultiplier) &&
            mouseY >= WINDOW_HEIGHT / 1.05 + (22 - 4 * tileSizeMultiplier) && 
            mouseY <= WINDOW_HEIGHT / 0.98 + (22 - 4 * tileSizeMultiplier)) {

                console.log("settings");
                isGamePaused = true;

        }

    }

    else {

        // Check if cursor is over exit icon
        if (mouseX >= WINDOW_WIDTH / 3.6 + (22 - 4 * tileSizeMultiplier) && 
            mouseX <= WINDOW_WIDTH / 3.15 + (22 - 4 * tileSizeMultiplier) &&
            mouseY >= WINDOW_HEIGHT / 3.5 + (22 - 4 * tileSizeMultiplier) && 
            mouseY <= WINDOW_HEIGHT / 2.95 + (22 - 4 * tileSizeMultiplier)) {

                console.log("exit");
                isGamePaused = false;
                

        }

        // Check if cursor is inside Quality option rectangle
        if (mouseX >= WINDOW_WIDTH / 2.85 + (22 - 4 * tileSizeMultiplier) && 
            mouseX <= WINDOW_WIDTH / 1.4675 + (22 - 4 * tileSizeMultiplier) &&
            mouseY >= WINDOW_HEIGHT / 2.825 + (22 - 4 * tileSizeMultiplier) && 
            mouseY <= WINDOW_HEIGHT / 2.275 + (22 - 4 * tileSizeMultiplier)) {

                console.log("yay1");
                changeQuality();

        }

        // Check if cursor is inside FOV option rectangle
        if (mouseX >= WINDOW_WIDTH / 2.85 + (22 - 4 * tileSizeMultiplier) &&
            mouseX <= WINDOW_WIDTH / 1.4675 + (22 - 4 * tileSizeMultiplier) &&
            mouseY >= WINDOW_HEIGHT / 2.1 + (22 - 4 * tileSizeMultiplier) && 
            mouseY <= WINDOW_HEIGHT / 1.7825 + (22 - 4 * tileSizeMultiplier)) {

                console.log("yay2");
                changeFOV();

        }

        // Check if cursor is inside Background option rectangle
        if (mouseX >= WINDOW_WIDTH / 2.85 + (22 - 4 * tileSizeMultiplier) &&
            mouseX <= WINDOW_WIDTH / 1.4675 + (22 - 4 * tileSizeMultiplier) &&
            mouseY >= WINDOW_HEIGHT / 1.6525 + (22 - 4 * tileSizeMultiplier) && 
            mouseY <= WINDOW_HEIGHT / 1.4525 + (22 - 4 * tileSizeMultiplier)) {

                console.log("yay3");
                changeBackground();

        }

    }

    return false;
}

function changeQuality() {

    if (wallStripMultiplier == 2) {
        chooseQuality(wallStripMultiplier + 1);
    }
    else if (wallStripMultiplier == 3) {
        chooseQuality(wallStripMultiplier + 1);
    }
    else {
        wallStripMultiplier = 2;
        chooseQuality(wallStripMultiplier);
    }

}

function changeFOV() {

    if (FOV == 60) {
        chooseFOV(FOV + 15);
    }
    else if (FOV == 75) {
        chooseFOV(FOV + 15);
    }
    else {
        chooseFOV(60);
    }

}

function changeBackground() {

    if (backroundColourChoice == 1) {
        chooseBackground(backroundColourChoice + 1);
    }
    else if (backroundColourChoice == 2) {
        chooseBackground(backroundColourChoice + 1);
    }
    else {
        chooseBackground(1);
    }

}


//#endregion

//#region Character Animation

function stationaryGunAnimation() {

    image(
        pistolSpriteNeutral, 
        ((TILE_SIZE * tileSizeMultiplier) * 4.28), // 4.28
        ((TILE_SIZE * tileSizeMultiplier) * 6.56), // 6.56
        ((TILE_SIZE * tileSizeMultiplier) * 12), // 12
        ((TILE_SIZE * tileSizeMultiplier) * 12) // 12
    );
    viewBobCount = 0;
}

function viewBobbing() {

    if (viewBobCount < 30) {
        image(
            pistolSpriteNeutral, 
            ((TILE_SIZE * tileSizeMultiplier) * 4.28), // 4.28
            ((TILE_SIZE * tileSizeMultiplier) * 6.56), // 6.56
            ((TILE_SIZE * tileSizeMultiplier) * 12), // 12
            ((TILE_SIZE * tileSizeMultiplier) * 12) // 12
        );
        viewBobCount++;
    }
    else if (viewBobCount < 60) {
        image(
            pistolSpriteNeutral, 
            ((TILE_SIZE * tileSizeMultiplier) * 5), // 5
            ((TILE_SIZE * tileSizeMultiplier) * 7.5), // 7.5
            ((TILE_SIZE * tileSizeMultiplier) * 12), // 12
            ((TILE_SIZE * tileSizeMultiplier) * 12) // 12
        );
        viewBobCount++;
    }
    else {
        viewBobCount = 0;
    }
}

function fireGunAnimation() {
    
    if (fireGunAnimationCount < 10) {
        image(
            pistolSpriteFiring, 
            ((TILE_SIZE * tileSizeMultiplier) * 4.28), // 4.28
            ((TILE_SIZE * tileSizeMultiplier) * 5.1), // 5.1
            ((TILE_SIZE * tileSizeMultiplier) * 12), // 12
            ((TILE_SIZE * tileSizeMultiplier) * 12) // 12
        );
        fireGunAnimationCount++;
    }
    else {
        gunFired = false;
        fireGunAnimationCount = 0;
        viewBobCount = 0;
        stationaryGunAnimation();
    }
}

//#endregion

//#region PreLoad, Setup, Update, Draw Functions

function preload() {

    // Images
    pistolSpriteNeutral = loadImage('RayCasting/PixelArt/HandGunNeutral.png');
    pistolSpriteFiring = loadImage('RayCasting/PixelArt/HandGunFire.png');

    settingsIcon = loadImage('images/settings.png');
    exitIcon = loadImage('images/exit-icon.png');

    // Fonts
    subspace = loadFont('RayCasting/Fonts/Subspace/Subspace.otf');
}

function setup() {
    canvas = createCanvas(WINDOW_WIDTH, WINDOW_HEIGHT);

    canvas.parent('sketch-holder');
}

function update() {
    player.update();
    castAllRays();
}

function draw() {

    clear();
    update();

    renderBackground(backroundColourChoice)

    render3DProjectedWalls();

    grid.render();

    for (ray of rays) {
        ray.render();
    }

    player.render();

    // Weapon Animation
    if (gunFired) {
        fireGunAnimation();
    }
    else if (player.walkDirection == -1 || player.walkDirection == 1) {
        viewBobbing();
    }
    else {
        stationaryGunAnimation();
    }

    // Pause Animation
    if (!isGamePaused) {
        displayPauseButton();
    }
    else {
        pauseMenu();
    }
    
    
}

//#endregion

