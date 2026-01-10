const canvas = document.getElementById("world");
const ctx = canvas.getContext("2d");

// Player sprite
const playerImg = new Image();
playerImg.src = "assets/playerboat.png";

// ✅ SAFE OCEAN SPAWN (top-left Atlantic)
const player = {
  x: 60,      // ocean
  y: 320,     // ocean
  size: 35,
  speed: 4
};

// Prevent instant redirect on spawn
let spawnProtection = true;
setTimeout(() => spawnProtection = false, 600);

// Continent hitboxes (aligned to map)
// 🔥 TIGHT continent hitboxes (closer to land pixels)
const continents = [
  {
    name: "North America",
    x: 40,
    y: 20,
    w: 130,
    h: 150
  },
  {
    name: "South America",
    x: 150,
    y: 200,
    w: 80,
    h: 142
  },
  {
    name: "Europe",
    x: 300,
    y: 36,
    w: 120,
    h: 80
  },

   {
    name: "Africa",
    x: 300,
    y: 130,
    w: 130,
    h: 160
  },
  {
    name: "Asia",
    x: 440,
    y: 95,
    w: 230,
    h: 135
  },
  {
    name: "Oceania",
    x: 580,
    y: 250,
    w: 150,
    h: 90
  }
];


// Movement
const keys = {};
document.addEventListener("keydown", e => keys[e.key] = true);
document.addEventListener("keyup", e => keys[e.key] = false);

function update() {
  if (keys["ArrowUp"]) player.y -= player.speed;
  if (keys["ArrowDown"]) player.y += player.speed;
  if (keys["ArrowLeft"]) player.x -= player.speed;
  if (keys["ArrowRight"]) player.x += player.speed;

  keepPlayerInBounds();
  checkContinent();
  draw();

  requestAnimationFrame(update);
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw continent hitboxes (ALWAYS VISIBLE)
  continents.forEach(c => {
    ctx.fillStyle = "rgba(56, 189, 248, 0.25)"; // soft blue overlay
    ctx.fillRect(c.x, c.y, c.w, c.h);

    ctx.strokeStyle = "rgba(139,27,27,0.8)";
    ctx.lineWidth = 2;
    ctx.strokeRect(c.x, c.y, c.w, c.h);
  });

  // Draw player on top
  ctx.drawImage(playerImg, player.x, player.y, player.size, player.size);
}


function keepPlayerInBounds() {
  player.x = Math.max(0, Math.min(canvas.width - player.size, player.x));
  player.y = Math.max(0, Math.min(canvas.height - player.size, player.y));
}

// Redirect only after spawn protection ends
function checkContinent() {
  if (spawnProtection) return;

  for (const c of continents) {
    if (
      player.x + player.size > c.x &&
      player.x < c.x + c.w &&
      player.y + player.size > c.y &&
      player.y < c.y + c.h
    ) {
      window.location.href =
        "countries.html?continent=" + encodeURIComponent(c.name);
    }
  }
}

playerImg.onload = () => update();
// DEBUG: show hitboxes (remove later)
ctx.strokeStyle = "rgba(255,0,0,0.6)";
continents.forEach(c => {
  ctx.strokeRect(c.x, c.y, c.w, c.h);
});
