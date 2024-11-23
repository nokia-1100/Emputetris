const canvas = document.getElementById("tetris");
const context = canvas.getContext("2d");

const ROWS = 20;
const COLUMNS = 10;
const BLOCK_SIZE = 20; // Reduced block size to fit better on the screen

context.scale(BLOCK_SIZE, BLOCK_SIZE);

// Colors for each piece type with a yellowish glow effect
const colors = [
    null,
    "#FF0000",     // Red
    "#0000FF",     // Blue
    "#00FF00",     // Green
    "#800080",     // Purple
    "#FFA500",     // Orange
    "#00FFFF",     // Cyan
    "#FFFF00"      // Yellow
];

// Tetromino shapes
const pieces = "ILJOTSZ".split("").map(type => createPiece(type));

// Create shapes for tetromino pieces
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

// Add glow effect when drawing pieces
function drawMatrix(matrix, offset) {
    matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value) {
                context.fillStyle = colors[value]; // Use the color corresponding to the piece
                context.fillRect(x + offset.x, y + offset.y, 1, 1);
                // Apply a soft yellowish glow effect
                context.shadowColor = colors[value];
                context.shadowBlur = 10;
            }
        });
    });
}

// Draw everything
function draw() {
    context.fillStyle = "#111"; // Dark background for the game area
    context.fillRect(0, 0, canvas.width, canvas.height);

    drawMatrix(arena, { x: 0, y: 0 });
    drawMatrix(player.matrix, player.pos);

    // Reset the shadow properties after drawing the pieces
    context.shadowColor = "transparent";
    context.shadowBlur = 0;

    // Update score display
    document.querySelector(".score").textContent = `Score: ${score}`;
}

// Merge player piece with the arena
function merge(arena, player) {
    player.matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value) {
                arena[y + player.pos.y][x + player.pos.x] = value;
            }
        });
    });
}

// Arena sweep and score incrementing logic
function arenaSweep() {
    let linesCleared = 0;
    outer: for (let y = arena.length - 1; y >= 0; y--) {
        if (arena[y].every(value => value)) {
            arena.splice(y, 1);
            arena.unshift(new Array(COLUMNS).fill(0));
            linesCleared++;
        }
    }
    score += linesCleared * 100; // Add 100 points for each cleared line
}

// Player drop logic
function playerDrop() {
    player.pos.y++;
    if (collide(arena, player)) {
        player.pos.y--;
        merge(arena, player);
        arenaSweep();
        resetPlayer();
    }
    dropCounter = 0;
}

// Generate least convenient piece
function getLeastConvenientPiece() {
    // Analyze the arena and player position
    const worstPiece = pieces.find(piece => {
        const testPlayer = { ...player, matrix: piece };
        testPlayer.pos.y++;
        return collide(arena, testPlayer);
    });
    return worstPiece || pieces[0]; // Default to the first piece if no clear "worst" exists
}

function resetPlayer() {
    player.matrix = getLeastConvenientPiece();
    player.pos = { x: Math.floor(COLUMNS / 2 - player.matrix[0].length / 2), y: 0 };
    if (collide(arena, player)) {
        arena.forEach(row => row.fill(0));
        alert("Game Over!");
        score = 0; // Reset the score
    }
}

function collide(arena, player) {
    const [matrix, offset] = [player.matrix, player.pos];
    return matrix.some((row, y) => 
        row.some((value, x) => 
            value && (arena[y + offset.y] && arena[y + offset.y][x + offset.x]) !== 0
        )
    );
}

function playerMove(dir) {
    player.pos.x += dir;
    if (collide(arena, player)) {
        player.pos.x -= dir;
    }
}

function playerRotate() {
    const originalMatrix = player.matrix.map(row => [...row]);
    player.matrix = rotate(player.matrix);
    if (collide(arena, player)) {
        player.matrix = originalMatrix;
    }
}

function rotate(matrix) {
    return matrix[0].map((_, i) => matrix.map(row => row[i]).reverse());
}

// Score and other game variables
let score = 0;
const arena = Array.from({ length: ROWS }, () => new Array(COLUMNS).fill(0));

const player = {
    pos: { x: 0, y: 0 },
    matrix: pieces[0],
};

let dropCounter = 0;
let dropInterval = 1000;
let lastTime = 0;

// Update the game every frame
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

// Player control
document.addEventListener("keydown", event => {
    if (event.key === "ArrowLeft") playerMove(1); // Reversed keys
    if (event.key === "ArrowRight") playerMove(-1);
    if (event.key === "ArrowDown") playerDrop();
    if (event.key === "ArrowUp") playerRotate();
});

resetPlayer();
update();
