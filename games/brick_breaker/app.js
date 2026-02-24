const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const scoreEl = document.getElementById("score");
const livesEl = document.getElementById("lives");
const messageEl = document.getElementById("message");

const BASE_BALL_SPEED = 4;
const MIN_BALL_SPEED = 4;
const ITEM_DROP_CHANCE = 0.07;
const ITEM_SIZE = 18;
const ITEM_SPEED = 3.2;
const STAGE_CLEAR_DELAY_MS = 2000;

const STAGE_CONFIGS = [
  {
    rowCount: 9,
    colCount: 16,
    width: 70,
    height: 20,
    padding: 6,
    offsetTop: 50,
    offsetLeft: 32,
  },
  {
    rowCount: 14,
    colCount: 16,
    width: 70,
    height: 20,
    padding: 6,
    offsetTop: 50,
    offsetLeft: 32,
  },
  {
    rowCount: 14,
    colCount: 16,
    width: 70,
    height: 20,
    padding: 6,
    offsetTop: 50,
    offsetLeft: 32,
    bottomRowAllTwoHit: true,
  },
  {
    rowCount: 14,
    colCount: 16,
    width: 70,
    height: 20,
    padding: 6,
    offsetTop: 50,
    offsetLeft: 32,
    checkerboardHits: 2,
  },
  {
    rowCount: 14,
    colCount: 16,
    width: 70,
    height: 20,
    padding: 6,
    offsetTop: 50,
    offsetLeft: 32,
    checkerboardHits: 3,
  },
  {
    rowCount: 14,
    colCount: 16,
    width: 70,
    height: 20,
    padding: 6,
    offsetTop: 50,
    offsetLeft: 32,
    checkerboardPair: [4, 2],
    removeFifthColumnsBothSides: true,
  },
  {
    rowCount: 14,
    colCount: 16,
    width: 70,
    height: 20,
    padding: 6,
    offsetTop: 50,
    offsetLeft: 32,
    checkerboardPair: [5, 3],
    removeFifthColumnsBothSides: true,
  },
  {
    rowCount: 14,
    colCount: 16,
    width: 70,
    height: 20,
    padding: 6,
    offsetTop: 50,
    offsetLeft: 32,
    checkerboardPair: [6, 4],
    removeFifthColumnsBothSides: true,
  },
  {
    rowCount: 14,
    colCount: 16,
    width: 70,
    height: 20,
    padding: 6,
    offsetTop: 50,
    offsetLeft: 32,
    checkerboardPair: [6, 5],
    removeFifthColumnsBothSides: true,
  },
  {
    rowCount: 14,
    colCount: 16,
    width: 70,
    height: 20,
    padding: 6,
    offsetTop: 50,
    offsetLeft: 32,
    fullHits: 6,
    removeFifthColumnsBothSides: true,
  },
];

const paddle = {
  width: 170,
  height: 14,
  speed: 10,
  x: (canvas.width - 170) / 2,
  y: canvas.height - 28,
};

let brickCfg = { ...STAGE_CONFIGS[0] };
let bricks = [];
let balls = [];
let powerups = [];
let score = 0;
let lives = 3;
let running = true;
let rightPressed = false;
let leftPressed = false;
let isPaused = false;
let currentStageIndex = 0;
let remainingBricks = 0;
let stageClearUntil = 0;
let gameWon = false;

function createBall(x, y, dx, dy) {
  return {
    radius: 8,
    x,
    y,
    dx,
    dy,
    active: true,
  };
}

function enforceMinBallSpeed(ball) {
  const speed = Math.hypot(ball.dx, ball.dy);
  if (speed >= MIN_BALL_SPEED) return;

  const heading = Math.atan2(ball.dy || -BASE_BALL_SPEED, ball.dx || BASE_BALL_SPEED);
  ball.dx = Math.cos(heading) * MIN_BALL_SPEED;
  ball.dy = Math.sin(heading) * MIN_BALL_SPEED;
}

function getBrickMaxHits(stageIndex, col, row) {
  const stageCfg = STAGE_CONFIGS[stageIndex];
  if (stageCfg.fullHits) return stageCfg.fullHits;

  if (stageCfg.checkerboardPair) {
    return (col + row) % 2 === 0 ? stageCfg.checkerboardPair[0] : stageCfg.checkerboardPair[1];
  }

  if (stageCfg.checkerboardHits) {
    return (col + row) % 2 === 0 ? stageCfg.checkerboardHits : 1;
  }

  if (!stageCfg.bottomRowAllTwoHit) return 1;

  const bottomRow = stageCfg.rowCount - 1;
  if (row !== bottomRow) return 1;
  return 2;
}

function shouldPlaceBrick(stageCfg, col) {
  if (!stageCfg.removeFifthColumnsBothSides) return true;
  const leftFifth = 4;
  const rightFifth = stageCfg.colCount - 5;
  return col !== leftFifth && col !== rightFifth;
}

function buildBricks() {
  bricks = [];
  remainingBricks = 0;
  for (let c = 0; c < brickCfg.colCount; c += 1) {
    bricks[c] = [];
    for (let r = 0; r < brickCfg.rowCount; r += 1) {
      if (!shouldPlaceBrick(brickCfg, c)) {
        bricks[c][r] = { x: 0, y: 0, alive: false, maxHits: 0, hitsLeft: 0 };
        continue;
      }

      const maxHits = getBrickMaxHits(currentStageIndex, c, r);
      bricks[c][r] = { x: 0, y: 0, alive: true, maxHits, hitsLeft: maxHits };
      remainingBricks += 1;
    }
  }
}

function resetBallAndPaddle() {
  paddle.x = (canvas.width - paddle.width) / 2;
  const dx = BASE_BALL_SPEED * (Math.random() > 0.5 ? 1 : -1);
  balls = [createBall(canvas.width / 2, canvas.height - 45, dx, -BASE_BALL_SPEED)];
}

function updateHud() {
  scoreEl.textContent = String(score);
  livesEl.textContent = String(lives);
}

function endGame(text) {
  running = false;
  isPaused = false;
  gameWon = false;
  stageClearUntil = 0;
  messageEl.textContent = `${text} (R 키로 다시 시작)`;
}

function loadStage(stageIndex) {
  currentStageIndex = stageIndex;
  brickCfg = { ...STAGE_CONFIGS[stageIndex] };
  powerups = [];
  stageClearUntil = 0;
  running = true;
  isPaused = false;
  gameWon = false;
  buildBricks();
  resetBallAndPaddle();
  messageEl.textContent = `스테이지 ${currentStageIndex + 1}`;
}

function restart() {
  score = 0;
  lives = 3;
  gameWon = false;
  loadStage(0);
  updateHud();
}

function drawPaddle() {
  ctx.beginPath();
  ctx.roundRect(paddle.x, paddle.y, paddle.width, paddle.height, 8);
  ctx.fillStyle = "#38bdf8";
  ctx.fill();
  ctx.closePath();
}

function drawBalls() {
  for (let i = 0; i < balls.length; i += 1) {
    const ball = balls[i];
    if (!ball.active) continue;

    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fillStyle = "#f97316";
    ctx.fill();
    ctx.closePath();
  }
}

function drawPowerups() {
  for (let i = 0; i < powerups.length; i += 1) {
    const item = powerups[i];

    ctx.beginPath();
    ctx.roundRect(item.x, item.y, item.size, item.size, 4);
    ctx.fillStyle = "#ef4444";
    ctx.fill();
    ctx.closePath();

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 12px Segoe UI";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("3", item.x + item.size / 2, item.y + item.size / 2 + 0.5);
  }
}

function drawBricks() {
  for (let c = 0; c < brickCfg.colCount; c += 1) {
    for (let r = 0; r < brickCfg.rowCount; r += 1) {
      const brick = bricks[c][r];
      if (!brick.alive) continue;

      const brickX = c * (brickCfg.width + brickCfg.padding) + brickCfg.offsetLeft;
      const brickY = r * (brickCfg.height + brickCfg.padding) + brickCfg.offsetTop;
      brick.x = brickX;
      brick.y = brickY;

      ctx.beginPath();
      ctx.roundRect(brickX, brickY, brickCfg.width, brickCfg.height, 6);
      if (brick.hitsLeft <= 1) {
        ctx.fillStyle = "#eab308";
      } else if (brick.hitsLeft === 2) {
        ctx.fillStyle = "#d78fa8";
      } else if (brick.hitsLeft === 3) {
        ctx.fillStyle = "#ef4444";
      } else if (brick.hitsLeft === 4) {
        ctx.fillStyle = "#7dd3fc";
      } else if (brick.hitsLeft === 5) {
        ctx.fillStyle = "#1d4ed8";
      } else {
        ctx.fillStyle = "#166534";
      }
      ctx.fill();
      ctx.closePath();
    }
  }
}

function trySpawnPowerup(brick) {
  if (Math.random() > ITEM_DROP_CHANCE) return;

  powerups.push({
    type: "split3",
    x: brick.x + brickCfg.width / 2 - ITEM_SIZE / 2,
    y: brick.y + brickCfg.height,
    size: ITEM_SIZE,
    dy: ITEM_SPEED,
  });
}

function splitAllBallsToThree() {
  if (balls.length === 0) return;

  const spread = 0.42;
  const expanded = [];

  for (let i = 0; i < balls.length; i += 1) {
    const source = balls[i];
    if (!source.active) continue;

    const speed = Math.max(BASE_BALL_SPEED, Math.hypot(source.dx, source.dy));
    const heading = Math.atan2(source.dy || -BASE_BALL_SPEED, source.dx || BASE_BALL_SPEED);

    expanded.push(createBall(source.x, source.y, Math.cos(heading) * speed, Math.sin(heading) * speed));
    expanded.push(
      createBall(source.x, source.y, Math.cos(heading - spread) * speed, Math.sin(heading - spread) * speed),
    );
    expanded.push(
      createBall(source.x, source.y, Math.cos(heading + spread) * speed, Math.sin(heading + spread) * speed),
    );
  }

  balls = expanded;
}

function applyPowerup(type) {
  if (type !== "split3") return;
  splitAllBallsToThree();
  messageEl.textContent = "3볼 분열 아이템 발동!";
}

function updatePowerups() {
  for (let i = 0; i < powerups.length; i += 1) {
    const item = powerups[i];
    item.y += item.dy;

    const inX = item.x + item.size > paddle.x && item.x < paddle.x + paddle.width;
    const inY = item.y + item.size > paddle.y && item.y < paddle.y + paddle.height;

    if (inX && inY) {
      applyPowerup(item.type);
      powerups.splice(i, 1);
      i -= 1;
      continue;
    }

    if (item.y > canvas.height) {
      powerups.splice(i, 1);
      i -= 1;
    }
  }
}

function handleStageClear() {
  if (stageClearUntil > 0) return;

  running = false;
  isPaused = false;
  powerups = [];
  stageClearUntil = Date.now() + STAGE_CLEAR_DELAY_MS;
  messageEl.textContent = `스테이지 ${currentStageIndex + 1} 클리어!`;
}

function winGame() {
  running = false;
  isPaused = false;
  gameWon = true;
  stageClearUntil = 0;
  powerups = [];
  messageEl.textContent = "";
}

function collisionDetection(ball) {
  for (let c = 0; c < brickCfg.colCount; c += 1) {
    for (let r = 0; r < brickCfg.rowCount; r += 1) {
      const brick = bricks[c][r];
      if (!brick.alive) continue;

      const insideX = ball.x + ball.radius > brick.x && ball.x - ball.radius < brick.x + brickCfg.width;
      const insideY = ball.y + ball.radius > brick.y && ball.y - ball.radius < brick.y + brickCfg.height;
      if (!insideX || !insideY) continue;

      ball.dy = -ball.dy;
      brick.hitsLeft -= 1;

      if (brick.hitsLeft <= 0) {
        brick.alive = false;
        remainingBricks -= 1;
        score += 10;
        updateHud();
        trySpawnPowerup(brick);
      }

      if (remainingBricks <= 0) {
        if (currentStageIndex >= STAGE_CONFIGS.length - 1) {
          winGame();
        } else {
          handleStageClear();
        }
      }
      return;
    }
  }
}

function updateBallPhysics() {
  for (let i = 0; i < balls.length; i += 1) {
    const ball = balls[i];
    if (!ball.active) continue;

    ball.x += ball.dx;
    ball.y += ball.dy;

    if (ball.x + ball.radius > canvas.width || ball.x - ball.radius < 0) {
      ball.dx = -ball.dx;
      ball.x = Math.min(canvas.width - ball.radius, Math.max(ball.radius, ball.x));
    }

    if (ball.y - ball.radius < 0) {
      ball.dy = -ball.dy;
    }

    const inPaddleX = ball.x > paddle.x && ball.x < paddle.x + paddle.width;
    const touchPaddleY = ball.y + ball.radius >= paddle.y && ball.y - ball.radius <= paddle.y + paddle.height;
    if (ball.dy > 0 && inPaddleX && touchPaddleY) {
      const offset = (ball.x - (paddle.x + paddle.width / 2)) / (paddle.width / 2);
      ball.dx = 5 * offset;
      ball.dy = -Math.abs(ball.dy);
      ball.y = paddle.y - ball.radius;
    }

    if (ball.y - ball.radius > canvas.height) {
      ball.active = false;
      continue;
    }

    collisionDetection(ball);
    enforceMinBallSpeed(ball);
  }

  balls = balls.filter((ball) => ball.active);

  if (balls.length === 0) {
    lives -= 1;
    updateHud();
    if (lives <= 0) {
      endGame("게임 오버!");
    } else {
      resetBallAndPaddle();
    }
  }
}

function updateStageTransition() {
  if (stageClearUntil === 0 || Date.now() < stageClearUntil) return;

  if (currentStageIndex >= STAGE_CONFIGS.length - 1) {
    endGame("모든 스테이지 클리어!");
    return;
  }

  loadStage(currentStageIndex + 1);
}

function updatePhysics() {
  updateStageTransition();
  if (!running || isPaused || gameWon) return;

  if (rightPressed && paddle.x + paddle.width < canvas.width) {
    paddle.x += paddle.speed;
  } else if (leftPressed && paddle.x > 0) {
    paddle.x -= paddle.speed;
  }

  updateBallPhysics();
  updatePowerups();
}

function togglePause() {
  if (!running || stageClearUntil > 0 || gameWon) return;
  isPaused = !isPaused;
  messageEl.textContent = isPaused ? "일시정지 (ESC로 재개)" : "";
}

function drawWinOverlay() {
  if (!gameWon) return;

  ctx.fillStyle = "rgba(2, 6, 23, 0.68)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#f8fafc";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = "bold 120px Segoe UI";
  ctx.fillText("You Win!", canvas.width / 2, canvas.height / 2);
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBricks();
  drawPowerups();
  drawBalls();
  drawPaddle();
  drawWinOverlay();
  updatePhysics();
  requestAnimationFrame(draw);
}

document.addEventListener("keydown", (event) => {
  if (event.key === "Right" || event.key === "ArrowRight") rightPressed = true;
  if (event.key === "Left" || event.key === "ArrowLeft") leftPressed = true;
  if (event.key.toLowerCase() === "r") restart();
  if (event.key === "Escape" && !event.repeat) togglePause();
});

document.addEventListener("keyup", (event) => {
  if (event.key === "Right" || event.key === "ArrowRight") rightPressed = false;
  if (event.key === "Left" || event.key === "ArrowLeft") leftPressed = false;
});

loadStage(0);
updateHud();
draw();
