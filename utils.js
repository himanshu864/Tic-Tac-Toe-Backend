export const initialGrid = [
  [-1, -1, -1],
  [-1, -1, -1],
  [-1, -1, -1],
];

export const combinations = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

export function availableMoves(grid) {
  const moves = [];
  for (let i = 0; i < 9; i++)
    if (grid[Math.floor(i / 3)][i % 3] === -1) moves.push(i);
  return moves;
}

export function winCheck(grid) {
  for (const line of combinations) {
    if (line.every((i) => grid[Math.floor(i / 3)][i % 3] === 0)) return 0; // Player wins
    if (line.every((i) => grid[Math.floor(i / 3)][i % 3] === 1)) return 1; // Computer wins
  }
  if (availableMoves(grid).length === 0) return 2; // draw
  return -1; // nothing
}

export function blinkIt(newGrid) {
  const blinker = new Array(9).fill(false);
  for (const line of combinations)
    if (
      line.every((i) => newGrid[Math.floor(i / 3)][i % 3] === 0) ||
      line.every((i) => newGrid[Math.floor(i / 3)][i % 3] === 1)
    )
      line.forEach((cell) => (blinker[cell] = true));
  return blinker;
}
