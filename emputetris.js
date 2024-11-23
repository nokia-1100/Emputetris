const canvas = document.getElementById("tetris");
const context = canvas.getContext("2d");

const ROWS = 20;
const COLUMNS = 10;
const BLOCK_SIZE = 30;

context.scale(BLOCK_SIZE, BLOCK_SIZE);

// Colors for each piece type
const colors = [
    null,          // Empty space
    "#FF0000",     // Red for "T"
    "#0000FF",     // Blue for "O"
    "#00FF00",     // Green for "L"
    "#800080",     // Purple for "J"
    "#FFA500",     // Orange for "I"
    "#00FFFF",     // Cyan for "S"
    "#FFFF00"      // Yellow for "Z"
];

// Tetromino shapes
function createPiece(type) {
    switch (type) {
        case "T": return [[0, 1, 0], [1, 1, 1]];
        case "O": return [[2, 2], [2, 2]];
        case "L": return [[0, 0, 3], [3, 3, 3]];
        case "J": return [[4, 0, 0], [4, 4, 4]];
        case "I": return [[0, 0, 0, 0], [5, 5, 5, 5]];
        case "S": return [[0, 6, 6], [6, 6, 0]];
        case "Z": return [[7, 7, 0], [0, 7, 7]];
    }
}

// Draw the matrix on the canvas
function drawMatrix(matrix, offset) {
    matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value) {
                context.fillStyle = colors[value]; // Use color corresponding to the piece
                context.fillRect(x + offset.x, y + offset.y, 1, 1);
            }
        });
    });
}

// Draw the entire game
function draw() {
    // Clear the canvas
    context.fillStyle = "#000"; // Black background
    context.fillRect(0, 0, canvas.width, canvas.height);

    // Draw the arena and the player
    drawMatrix(arena, { x: 0, y: 0 });
    drawMatrix(player.matrix, player.pos);
}

// Merge player piece into the arena
function merge(arena, player) {
    player.matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value) {
                arena[y + player.pos.y][x + player.pos.x] = value;
            }
        });
    });
}

// Clear full rows in the arena
function arenaSweep() {
    outer: for (let y = arena.length - 1; y >= 0; y--) {
        if (arena[y].every(value => value)) {
            arena.splice(y, 1); // Remove full row
            arena.unshift(new Array(COLUMNS).fill(0)); // Add an empty row on top
        }
    }
}

// Drop the player's piece
function playerDrop() {
    player.pos.y++;
    if (collide(arena, player)) {
        player.pos.y--;
        merge(arena, player);
        resetPlayer();
        arenaSweep();
    }
    dropCounter = 0;
}

// Reset the player when a piece is placed or the game starts
function resetPlayer() {
    player.matrix = pieces[Math.floor(Math.random() * pieces.length)]; // Random piece
    player.pos = { x: Math.floor(COLUMNS / 2 - player.matrix[0].length / 2), y: 0 };
    if (collide(arena, player)) {
        arena.forEach(row => row.fill(0)); // Clear the arena
        alert("Game Over!");
    }
}

// Check for collision between the player and the arena
function collide(arena, player) {
    const [matrix, offset] = [player.matrix, player.pos];
    return matrix.some((row, y) => 
        row.some((value, x) => 
            value && (arena[y + offset.y] && arena[y + offset.y][x + offset.x]) !== 0
        )
    );
}

// Move the player left or right
function playerMove(dir) {
    player.pos.x += dir;
    if (collide(arena, player)) {
        player.pos.x -= dir;
    }
}

// Rotate the player's piece
function playerRotate() {
    const originalMatrix = player.matrix.map(row => [...row]);
    player.matrix = rotate(player.matrix);
    if (collide(arena, player)) {
        player.matrix = originalMatrix;
    }
}

// Rotate a matrix (90 degrees clockwise)
function rotate(matrix) {
    return matrix[0].map((_, i) => matrix.map(row => row[i]).reverse());
}

// Create the game arena
const arena = Array.from({ length: ROWS }, () => new Array(COLUMNS).fill(0));

// Player object
const player = {
    pos: { x: 0, y: 0 },
    matrix: createPiece("T"), // Default starting piece
};

// Pieces array for random selection
const pieces = "ILJOTSZ".split("").map(type => createPiece(type));

let dropCounter = 0;
let dropInterval = 1000;
let lastTime = 0;

// Game update loop
function update(time = 0) {
    const deltaTime = time - lastTime;
    lastTime = time;

    dropCounter += deltaTime;
    if (dropCounter >= dropInterval) {
        playerDrop();
    }

    draw();
    requestAnimationFrame(update);
}

// Key event listeners for player controls
document.addEventListener("keydown", event => {
    if (event.key === "ArrowLeft") playerMove(-1);
    if (event.key === "ArrowRight") playerMove(1);
    if (event.key === "ArrowDown") playerDrop();
    if (event.key === "ArrowUp") playerRotate();
});

// Start the game
resetPlayer();
update();
