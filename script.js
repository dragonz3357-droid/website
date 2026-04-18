const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const startScreen = document.getElementById('startScreen');
const gameOverScreen = document.getElementById('gameOverScreen');
const finalScoreEl = document.getElementById('finalScore');
const startBtn = document.getElementById('startBtn');
const restartBtn = document.getElementById('restartBtn');

// Set canvas resolution
function resizeCanvas() {
  const container = document.getElementById('gameContainer');
  canvas.width = container.clientWidth;
  canvas.height = container.clientHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Game State
let gameRunning = false;
let score = 0;
let speed = 3;
let lastTime = 0;
let frameCount = 0;

// Player (Hopmon)
const player = {
  x: 60,
  y: 0,
  width: 40,
  height: 40,
  vy: 0,
  grounded: false,
  jumpPower: -14,
  gravity: 0.6,
  color: '#4ecca3',
  eyeColor: '#1a1a2e'
};

// Platforms & Collectibles
let platforms = [];
let collectibles = [];

function initGame() {
  score = 0;
  speed = 3;
  frameCount = 0;
  player.y = canvas.height - 100;
  player.vy = 0;
  player.grounded = true;
  platforms = [
    { x: 0, y: canvas.height - 60, width: canvas.width, height: 60, type: 'ground' }
  ];
  collectibles = [];
  scoreEl.textContent = `Score: 0`;
  gameOverScreen.classList.add('hidden');
  startScreen.classList.add('hidden');
  gameRunning = true;
  requestAnimationFrame(gameLoop);
}

function spawnPlatform() {
  const width = 80 + Math.random() * 60;
  const gap = 120 + Math.random() * 80;
  const lastPlat = platforms[platforms.length - 1];
  const x = lastPlat.x + lastPlat.width + gap;
  const y = Math.max(100, Math.min(canvas.height - 100, lastPlat.y + (Math.random() * 80 - 40)));
  platforms.push({ x, y, width, height: 20, type: 'platform' });

  // 50% chance to spawn a collectible above platform
  if (Math.random() > 0.5) {
    collectibles.push({
      x: x + width / 2 - 10,
      y: y - 40,
      width: 20,
      height: 20,
      collected: false
    });
  }
}

function jump() {
  if (player.grounded && gameRunning) {
    player.vy = player.jumpPower;
    player.grounded = false;
  }
}

// Input
window.addEventListener('keydown', e => {
  if (e.code === 'Space') {
    e.preventDefault();
    jump();
  }
});
canvas.addEventListener('touchstart', e => { e.preventDefault(); jump(); });
canvas.addEventListener('mousedown', jump);
startBtn.addEventListener('click', initGame);
restartBtn.addEventListener('click', initGame);

function update(deltaTime) {
  frameCount++;
  speed += 0.001; // Slowly increase difficulty

  // Player physics
  player.vy += player.gravity;
  player.y += player.vy;

  // Platform movement & generation
  platforms.forEach(p => p.x -= speed);
  if (platforms[platforms.length - 1].x < canvas.width) {
    spawnPlatform();
  }

  // Remove off-screen platforms
  platforms = platforms.filter(p => p.x + p.width > 0);

  // Collision with platforms
  player.grounded = false;
  for (let p of platforms) {
    if (player.x + player.width > p.x &&
        player.x < p.x + p.width &&
        player.y + player.height >= p.y &&
        player.y + player.height <= p.y + p.height + 5 &&
        player.vy >= 0) {
      player.y = p.y - player.height;
      player.vy = 0;
      player.grounded = true;
    }
  }

  // Collectibles
  collectibles.forEach(c => {
    c.x -= speed;
    if (!c.collected &&
        player.x < c.x + c.width &&
        player.x + player.width > c.x &&
        player.y < c.y + c.height &&
        player.y + player.height > c.y) {
      c.collected = true;
      score += 10;
      scoreEl.textContent = `Score: ${score}`;
    }
  });
  collectibles = collectibles.filter(c => c.x + c.width > 0 && !c.collected);

  // Game Over conditions
  if (player.y > canvas.height || player.x + player.width < 0) {
    gameOver();
  }
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Background gradient
  const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
  grad.addColorStop(0, '#0f3460');
  grad.addColorStop(1, '#16213e');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw platforms
  ctx.fillStyle = '#e94560';
  platforms.forEach(p => {
    ctx.fillRect(p.x, p.y, p.width, p.height);
    // Top highlight
    ctx.fillStyle = 'rgba(255,255,255,0.2)';
    ctx.fillRect(p.x, p.y, p.width, 4);
    ctx.fillStyle = '#e94560';
  });

  // Draw collectibles
  ctx.fillStyle = '#f9d56e';
  collectibles.forEach(c => {
    if (!c.collected) {
      ctx.beginPath();
      ctx.arc(c.x + c.width/2, c.y + c.height/2, c.width/2, 0, Math.PI * 2);
      ctx.fill();
      // Shine
      ctx.fillStyle = 'rgba(255,255,255,0.4)';
      ctx.beginPath();
      ctx.arc(c.x + c.width/2 - 4, c.y + c.height/2 - 4, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#f9d56e';
    }
  });

  // Draw Hopmon (player)
  // Body
  ctx.fillStyle = player.color;
  ctx.beginPath();
  ctx.roundRect(player.x, player.y, player.width, player.height, 8);
  ctx.fill();
  // Eyes
  ctx.fillStyle = player.eyeColor;
  ctx.beginPath();
  ctx.arc(player.x + 12, player.y + 15, 4, 0, Math.PI * 2);
  ctx.arc(player.x + 28, player.y + 15, 4, 0, Math.PI * 2);
  ctx.fill();
  // Mouth
  ctx.beginPath();
  ctx.arc(player.x + 20, player.y + 25, 6, 0, Math.PI, false);
  ctx.stroke();
}

function gameOver() {
  gameRunning = false;
  finalScoreEl.textContent = `Final Score: ${score}`;
  gameOverScreen.classList.remove('hidden');
}

function gameLoop(timestamp) {
  if (!gameRunning) return;
  const deltaTime = timestamp - lastTime;
  lastTime = timestamp;

  update(deltaTime);
  draw();

  requestAnimationFrame(gameLoop);
}
