// (Previous code remains the same up until player controls)

// Piece generation function: Now finds the *least convenient piece* based on the board.
function createPieceBasedOnPerformance() {
    const pieceTypes = "ILJOTSZ".split("");

    // Analyze the board for gaps and column heights
    const columnHeights = Array(COLUMNS).fill(0);
    arena.forEach((row, y) =>
        row.forEach((value, x) => {
            if (value && columnHeights[x] === 0) columnHeights[x] = ROWS - y;
        })
    );

    // Find the column with the most height discrepancy
    const maxHeight = Math.max(...columnHeights);
    const minHeight = Math.min(...columnHeights);
    const widestGap = columnHeights.findIndex(height => height === minHeight);

    // Hard mode: prioritize pieces that don't fill gaps or balance columns
    const hardPieces = pieceTypes.filter(type => {
        const testPiece = createPiece(type);
        return !canFillGap(testPiece, widestGap);
    });

    // Fallback to a random piece if all pieces can fill the gap
    const selectedPiece = hardPieces.length
        ? hardPieces[Math.floor(Math.random() * hardPieces.length)]
        : pieceTypes[Math.floor(Math.random() * pieceTypes.length)];

    return createPiece(selectedPiece);
}

function canFillGap(piece, gapColumn) {
    return piece.some((row, y) =>
        row.some((value, x) => value && gapColumn >= x && gapColumn <= x + piece[0].length)
    );
}

// Update the score system: dynamic updates when lines are cleared
function arenaSweep() {
    outer: for (let y = arena.length - 1; y >= 0; y--) {
        if (arena[y].every(value => value)) {
            arena.splice(y, 1);
            arena.unshift(new Array(COLUMNS).fill(0));
            linesCleared++; // Increment lines cleared
        }
    }
    document.getElementById("score").textContent = `Score: ${linesCleared}`;
}

// Controls: Reversed left and right keys
document.addEventListener("keydown", event => {
    if (event.key === "ArrowLeft") playerMove(1); // Moves right
    if (event.key === "ArrowRight") playerMove(-1); // Moves left
    if (event.key === "ArrowDown") playerDrop();
    if (event.key === "ArrowUp") playerRotate(); // (Optional) Keep this or reverse it
});
