const gameBoard = document.getElementById("game-board");
const ctx = gameBoard.getContext("2d");
const scoreText = document.getElementById("scoreText");
const resetBtn = document.getElementById("reset-btn");

const unitSize = 25;
const gameWidth = gameBoard.width;
const gameHeight = gameBoard.height;

// colors
const boardBackground = "#7fbf7f";
const snakeColor = "#ff9ecb";
const snakeBorder = "#c94f7c";
const foodColor = "#ff4d6d";

let running = false;
let timerId;
let gameStarted = false;

let xVelocity = unitSize;
let yVelocity = 0;

let foodX;
let foodY;

let score = 0;
let changingDirection = false;

// snake
let snake = [
  { x: unitSize * 4, y: 0 },
  { x: unitSize * 3, y: 0 },
  { x: unitSize * 2, y: 0 },
  { x: unitSize, y: 0 },
  { x: 0, y: 0 },
];

// no autostart
function initGame() {
  clearTimeout(timerId);

  running = false;
  gameStarted = false;

  score = 0;
  scoreText.textContent = score;

  xVelocity = unitSize;
  yVelocity = 0;

  snake = [
    { x: unitSize * 4, y: 0 },
    { x: unitSize * 3, y: 0 },
    { x: unitSize * 2, y: 0 },
    { x: unitSize, y: 0 },
    { x: 0, y: 0 },
  ];

  createFood();
  drawFrame();
}

// start only when key pressed
function startGameIfNeeded() {
  if (!gameStarted) {
    gameStarted = true;
    startGame();
  }
}

// game start
function startGame() {
  clearTimeout(timerId);

  running = true;

  score = 0;
  scoreText.textContent = score;

  xVelocity = unitSize;
  yVelocity = 0;

  createFood();
  gameLoop();
}

// game loop
function gameLoop() {
  if (!running) return;

  timerId = setTimeout(() => {
    changingDirection = false;

    clearBoard();
    drawFood();
    moveSnake();
    drawSnake();
    checkGameOver();

    gameLoop();
  }, 150);
}

function drawFrame() {
  clearBoard();
  drawFood();
  drawSnake();
}

// game board
function clearBoard() {
  ctx.fillStyle = boardBackground;
  ctx.fillRect(0, 0, gameWidth, gameHeight);

  for (let i = 0; i < gameWidth; i += unitSize) {
    for (let j = 0; j < gameHeight; j += unitSize) {
      ctx.fillStyle =
        (i + j) % (unitSize * 2) === 0
          ? "rgba(255,255,255,0.05)"
          : "rgba(0,0,0,0.03)";
      ctx.fillRect(i, j, unitSize, unitSize);
    }
  }
}

function drawSnake() {
  snake.forEach((part) => {
    ctx.fillStyle = snakeColor;
    ctx.strokeStyle = snakeBorder;

    ctx.beginPath();
    ctx.roundRect(part.x, part.y, unitSize, unitSize, 6);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "rgba(255,255,255,0.35)";
    ctx.beginPath();
    ctx.roundRect(part.x + 4, part.y + 3, unitSize / 2, unitSize / 3, 4);
    ctx.fill();
  });
}

function drawFood() {
  ctx.fillStyle = foodColor;
  ctx.beginPath();
  ctx.roundRect(foodX, foodY, unitSize, unitSize, 6);
  ctx.fill();

  ctx.fillStyle = "rgba(255,255,255,0.35)";
  ctx.beginPath();
  ctx.roundRect(foodX + 4, foodY + 3, unitSize / 2, unitSize / 3, 4);
  ctx.fill();
}

function createFood() {
  function random(min, max) {
    return Math.floor(Math.random() * ((max - min) / unitSize)) * unitSize;
  }

  let valid = false;

  while (!valid) {
    foodX = random(0, gameWidth);
    foodY = random(0, gameHeight);

    valid = !snake.some((p) => p.x === foodX && p.y === foodY);
  }
}

function moveSnake() {
  const head = {
    x: snake[0].x + xVelocity,
    y: snake[0].y + yVelocity,
  };

  snake.unshift(head);

  if (head.x === foodX && head.y === foodY) {
    score++;
    scoreText.textContent = score;
    createFood();
  } else {
    snake.pop();
  }
}

// keyboard controls
window.addEventListener("keydown", (e) => {
  startGameIfNeeded();
  changeDirection(e);
});

function changeDirection(e) {
  if (changingDirection) return;
  changingDirection = true;

  const goingUp = yVelocity === -unitSize;
  const goingDown = yVelocity === unitSize;
  const goingLeft = xVelocity === -unitSize;
  const goingRight = xVelocity === unitSize;

  switch (e.key) {
    case "ArrowLeft":
      if (!goingRight) {
        xVelocity = -unitSize;
        yVelocity = 0;
      }
      break;
    case "ArrowRight":
      if (!goingLeft) {
        xVelocity = unitSize;
        yVelocity = 0;
      }
      break;
    case "ArrowUp":
      if (!goingDown) {
        xVelocity = 0;
        yVelocity = -unitSize;
      }
      break;
    case "ArrowDown":
      if (!goingUp) {
        xVelocity = 0;
        yVelocity = unitSize;
      }
      break;
  }
}

// mobile buttons
document.getElementById("up").addEventListener("click", () => {
  startGameIfNeeded();
  setDirection(0, -unitSize);
});

document.getElementById("down").addEventListener("click", () => {
  startGameIfNeeded();
  setDirection(0, unitSize);
});

document.getElementById("left").addEventListener("click", () => {
  startGameIfNeeded();
  setDirection(-unitSize, 0);
});

document.getElementById("right").addEventListener("click", () => {
  startGameIfNeeded();
  setDirection(unitSize, 0);
});

function setDirection(x, y) {
  if (changingDirection) return;
  changingDirection = true;

  const goingUp = yVelocity === -unitSize;
  const goingDown = yVelocity === unitSize;
  const goingLeft = xVelocity === -unitSize;
  const goingRight = xVelocity === unitSize;

  if (x === -unitSize && goingRight) return;
  if (x === unitSize && goingLeft) return;
  if (y === -unitSize && goingDown) return;
  if (y === unitSize && goingUp) return;

  xVelocity = x;
  yVelocity = y;
}

function checkGameOver() {
  const head = snake[0];

  const hitWall =
    head.x < 0 || head.x >= gameWidth || head.y < 0 || head.y >= gameHeight;

  const hitSelf = snake.slice(1).some((p) => p.x === head.x && p.y === head.y);

  if (hitWall || hitSelf) {
    running = false;
    gameStarted = false;
    displayGameOver();
  }
}

function displayGameOver() {
  clearBoard();

  ctx.fillStyle = "rgba(0,0,0,0.35)";
  ctx.fillRect(0, 0, gameWidth, gameHeight);

  ctx.shadowColor = "#ff4d6d";
  ctx.shadowBlur = 20;

  ctx.fillStyle = "#fff";
  ctx.font = "bold 28px 'Press Start 2P', monospace";
  ctx.textAlign = "center";
  ctx.fillText("GAME OVER", gameWidth / 2, gameHeight / 2 - 20);

  ctx.shadowBlur = 0;

  ctx.fillStyle = "#ffe3ec";
  ctx.font = "bold 28px 'Press Start 2P', monospace";
  ctx.fillText("Press Reset to play again", gameWidth / 2, gameHeight / 2 + 25);

  ctx.fillStyle = "#fff";
  ctx.font = "13px 'Press Start 2P', monospace";
  ctx.fillText("Score: " + score, gameWidth / 2, gameHeight / 2 + 60);
}

resetBtn.addEventListener("click", initGame);

initGame();
