const COLS = 10;
const ROWS = 20;
const BLOCK = 30;

const SHAPES = {
  I: [[1, 1, 1, 1]],
  O: [[1, 1], [1, 1]],
  T: [[0, 1, 0], [1, 1, 1]],
  S: [[0, 1, 1], [1, 1, 0]],
  Z: [[1, 1, 0], [0, 1, 1]],
  J: [[1, 0, 0], [1, 1, 1]],
  L: [[0, 0, 1], [1, 1, 1]],
};

const COLORS = {
  I: '#38bdf8', O: '#facc15', T: '#c084fc', S: '#4ade80', Z: '#f87171', J: '#60a5fa', L: '#fb923c'
};

function createBoard() {
  return Array.from({ length: ROWS }, () => Array(COLS).fill(null));
}

function rotate(matrix) {
  return matrix[0].map((_, i) => matrix.map(row => row[i]).reverse());
}

function randomPiece() {
  const types = Object.keys(SHAPES);
  const type = types[Math.floor(Math.random() * types.length)];
  const shape = SHAPES[type].map(row => [...row]);
  return { type, shape, x: Math.floor((COLS - shape[0].length) / 2), y: 0 };
}

function collide(board, piece) {
  for (let y = 0; y < piece.shape.length; y += 1) {
    for (let x = 0; x < piece.shape[y].length; x += 1) {
      if (!piece.shape[y][x]) continue;
      const nx = piece.x + x;
      const ny = piece.y + y;
      if (nx < 0 || nx >= COLS || ny >= ROWS) return true;
      if (ny >= 0 && board[ny][nx]) return true;
    }
  }
  return false;
}

function merge(board, piece) {
  piece.shape.forEach((row, y) => {
    row.forEach((v, x) => {
      if (v && piece.y + y >= 0) board[piece.y + y][piece.x + x] = piece.type;
    });
  });
}

function clearLines(board) {
  let cleared = 0;
  for (let y = ROWS - 1; y >= 0; y -= 1) {
    if (board[y].every(Boolean)) {
      board.splice(y, 1);
      board.unshift(Array(COLS).fill(null));
      cleared += 1;
      y += 1;
    }
  }
  return cleared;
}

if (typeof document !== 'undefined') {
  const canvas = document.getElementById('tetris');
  const ctx = canvas.getContext('2d');
  const scoreEl = document.getElementById('score');
  const linesEl = document.getElementById('lines');
  const levelEl = document.getElementById('level');
  const statusEl = document.getElementById('status');
  const startBtn = document.getElementById('startBtn');
  const pauseBtn = document.getElementById('pauseBtn');

  let board = createBoard();
  let piece = randomPiece();
  let score = 0;
  let lines = 0;
  let level = 1;
  let dropCounter = 0;
  let dropInterval = 800;
  let lastTime = 0;
  let running = false;
  let gameOver = false;

  function updateHud() {
    scoreEl.textContent = String(score);
    linesEl.textContent = String(lines);
    levelEl.textContent = String(level);
  }

  function drawBlock(x, y, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x * BLOCK, y * BLOCK, BLOCK - 1, BLOCK - 1);
  }

  function draw() {
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    board.forEach((row, y) => row.forEach((cell, x) => {
      if (cell) drawBlock(x, y, COLORS[cell]);
    }));

    piece.shape.forEach((row, y) => row.forEach((v, x) => {
      if (v && piece.y + y >= 0) drawBlock(piece.x + x, piece.y + y, COLORS[piece.type]);
    }));
  }

  function spawn() {
    piece = randomPiece();
    if (collide(board, piece)) {
      running = false;
      gameOver = true;
      statusEl.textContent = 'ゲームオーバー';
    }
  }

  function hardDrop() {
    while (!collide(board, { ...piece, y: piece.y + 1 })) piece.y += 1;
    lockPiece();
  }

  function lockPiece() {
    merge(board, piece);
    const cleared = clearLines(board);
    if (cleared > 0) {
      lines += cleared;
      score += [0, 100, 300, 500, 800][cleared] * level;
      level = Math.floor(lines / 10) + 1;
      dropInterval = Math.max(120, 800 - (level - 1) * 60);
    }
    spawn();
    updateHud();
  }

  function tick(time = 0) {
    if (!running) return;
    const delta = time - lastTime;
    lastTime = time;
    dropCounter += delta;

    if (dropCounter >= dropInterval) {
      dropCounter = 0;
      piece.y += 1;
      if (collide(board, piece)) {
        piece.y -= 1;
        lockPiece();
      }
    }

    draw();
    requestAnimationFrame(tick);
  }

  function move(dir) {
    piece.x += dir;
    if (collide(board, piece)) piece.x -= dir;
  }

  function softDrop() {
    piece.y += 1;
    if (collide(board, piece)) {
      piece.y -= 1;
      lockPiece();
    }
    dropCounter = 0;
  }

  function rotatePiece() {
    const prev = piece.shape;
    piece.shape = rotate(piece.shape);
    if (collide(board, piece)) {
      piece.x += 1;
      if (collide(board, piece)) {
        piece.x -= 2;
        if (collide(board, piece)) {
          piece.x += 1;
          piece.shape = prev;
        }
      }
    }
  }

  function startGame() {
    board = createBoard();
    piece = randomPiece();
    score = 0;
    lines = 0;
    level = 1;
    dropInterval = 800;
    dropCounter = 0;
    lastTime = 0;
    gameOver = false;
    running = true;
    statusEl.textContent = 'プレイ中';
    updateHud();
    draw();
    requestAnimationFrame(tick);
  }

  startBtn.addEventListener('click', startGame);
  pauseBtn.addEventListener('click', () => {
    if (gameOver) return;
    running = !running;
    statusEl.textContent = running ? 'プレイ中' : '一時停止中';
    if (running) {
      lastTime = performance.now();
      requestAnimationFrame(tick);
    }
  });

  document.addEventListener('keydown', (e) => {
    if (!running) {
      if (e.key.toLowerCase() === 'p' && !gameOver) {
        running = true;
        statusEl.textContent = 'プレイ中';
        lastTime = performance.now();
        requestAnimationFrame(tick);
      }
      return;
    }

    if (e.key === 'ArrowLeft') move(-1);
    else if (e.key === 'ArrowRight') move(1);
    else if (e.key === 'ArrowDown') softDrop();
    else if (e.key === 'ArrowUp') rotatePiece();
    else if (e.code === 'Space') hardDrop();
    else if (e.key.toLowerCase() === 'p') {
      running = false;
      statusEl.textContent = '一時停止中';
    }

    draw();
  });

  draw();
}

if (typeof module !== 'undefined') {
  module.exports = { createBoard, rotate, collide, clearLines, COLS, ROWS };
}
