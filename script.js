const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const startScreen = document.getElementById("startScreen");
const gameOverScreen = document.getElementById("gameOverScreen");
const startButton = document.getElementById("startButton");
const restartButton = document.getElementById("restartButton");
const exitButton = document.getElementById("exitButton");
const musicButton = document.getElementById("musicButton");
const spaceshipSelect = document.getElementById("spaceshipSelect");
const spaceshipPreview = document.getElementById("spaceshipPreview");

canvas.width = 800;
canvas.height = 600;

let spaceshipImg = new Image();
spaceshipImg.src = spaceshipSelect.value;

const backgroundImg1 = new Image();
backgroundImg1.src = "assets/background1.png";

const backgroundImg2 = new Image();
backgroundImg2.src = "assets/background2.png";

const meteorImg = new Image();
meteorImg.src = "assets/meteor.png";

const bigMeteorImg = new Image();
bigMeteorImg.src = "assets/big_meteor.png";

const starImg = new Image();
starImg.src = "assets/star.png";

const bulletImg = new Image();
bulletImg.src = "assets/big_meteor.png";

const backgroundMusic = new Audio("assets/background-music.mp3");
backgroundMusic.loop = true;

const shootSound = new Audio("assets/shoot-sound.mp3");
const levelUpSound = new Audio("assets/level-up-sound.mp3");
const flameImg = new Image();
flameImg.src = "assets/flame.png"; // Ruta de la imagen de la llama

let spaceship = {
  x: canvas.width / 2 - 25,
  y: canvas.height - 60,
  width: 50,
  height: 50,
  speed: 5,
  dx: 0,
  dy: 0,
};

let bullets = [];
let meteors = [];
let stars = [];
let score = 0;
let level = 1;
let gameOver = false;
let isMusicPlaying = true;
let meteorInterval = 4000;

function resetGame() {
  spaceship = {
    x: canvas.width / 2 - 25,
    y: canvas.height - 60,
    width: 50,
    height: 50,
    speed: 5,
    dx: 0,
    dy: 0,
  };
  bullets = [];
  meteors = [];
  stars = [];
  score = 0;
  level = 1;
  lives = 3; // Asegúrate de inicializar las vidas
  gameOver = false;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function drawSpaceship() {
  ctx.drawImage(
    spaceshipImg,
    spaceship.x,
    spaceship.y,
    spaceship.width,
    spaceship.height
  );

  if (spaceship.dy !== 0) {
    // Calcula la posición de la llama del motor
    const flameX = spaceship.x + spaceship.width / 2 - 10; // Ajusta el valor según la posición de la llama en la imagen
    const flameY = spaceship.y + spaceship.height; // Ajusta el valor según la posición de la llama en la imagen
    ctx.drawImage(flameImg, flameX, flameY, 20, 20); // Ajusta el tamaño según el tamaño de la llama en la imagen
  }


}

function createBullet() {
  const bullet = {
    x: spaceship.x + spaceship.width / 2 - 5,
    y: spaceship.y,
    width: 10,
    height: 20,
    speed: 7,
  };
  bullets.push(bullet);
  shootSound.play();
}

function drawBullets() {
  bullets.forEach((bullet, index) => {
    ctx.drawImage(bulletImg, bullet.x, bullet.y, bullet.width, bullet.height);
    bullet.y -= bullet.speed;

    if (bullet.y + bullet.height < 0) {
      bullets.splice(index, 1);
    }
  });
}

function createMeteor() {
  const meteor = {
    x: Math.random() * canvas.width,
    y: -50,
    width: level === 2 ? 100 : 50,
    height: level === 2 ? 100 : 50,
    speed: Math.random() * 3 + 2,
  };
  meteors.push(meteor);
}

function createStar() {
  const star = {
    x: Math.random() * canvas.width,
    y: -50,
    width: 30,
    height: 30,
    speed: 3,
  };
  stars.push(star);
}

function drawMeteors() {
  meteors.forEach((meteor, index) => {
    ctx.drawImage(
      level === 2 && meteor.width === 100 ? bigMeteorImg : meteorImg,
      meteor.x,
      meteor.y,
      meteor.width,
      meteor.height
    );
    meteor.y += meteor.speed;

    if (meteor.y > canvas.height) {
      meteors.splice(index, 1);
    }

    if (collisionDetection(spaceship, meteor)) {
      gameOver = true;
      endGame();
    }

    bullets.forEach((bullet, bulletIndex) => {
      if (collisionDetection(bullet, meteor)) {
        meteors.splice(index, 1);
        bullets.splice(bulletIndex, 1);
        score += 10; // Incrementa el puntaje al destruir un meteorito
      }
    });
  });
}

function drawStars() {
  stars.forEach((star, index) => {
    ctx.drawImage(starImg, star.x, star.y, star.width, star.height);
    star.y += star.speed;

    if (star.y > canvas.height) {
      stars.splice(index, 1);
    }

    if (collisionDetection(spaceship, star)) {
      score += 1;
      stars.splice(index, 1);
      if (score >= 100 && level === 1) {
        levelUp();
      }
    }
  });
}


function playShootSound() {
  const shootSoundClone = shootSound.cloneNode(); // Clona el nodo de audio
  shootSoundClone.play();
}

function collisionDetection(obj1, obj2) {
  return (
    obj1.x < obj2.x + obj2.width &&
    obj1.x + obj1.width > obj2.x &&
    obj1.y < obj2.y + obj2.height &&
    obj1.y + obj1.height > obj2.y
  );
}

function moveSpaceship() {
  spaceship.x += spaceship.dx;
  spaceship.y += spaceship.dy;

  if (spaceship.x < 0) {
    spaceship.x = 0;
  }

  if (spaceship.x + spaceship.width > canvas.width) {
    spaceship.x = canvas.width - spaceship.width;
  }

  if (spaceship.y < 0) {
    spaceship.y = 0;
  }

  if (spaceship.y + spaceship.height > canvas.height) {
    spaceship.y = canvas.height - spaceship.height;
  }
}

function update() {
  if (!gameOver) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (level === 1) {
      ctx.drawImage(backgroundImg1, 0, 0, canvas.width, canvas.height);
    } else if (level === 2) {
      ctx.drawImage(backgroundImg2, 0, 0, canvas.width, canvas.height);
    }

    drawSpaceship();
    drawBullets();
    drawMeteors();
    drawStars();

    moveSpaceship();

    ctx.fillStyle = "#fff";
    ctx.font = "20px Arial";
    ctx.fillText(`Puntaje: ${score}`, 10, 30);
    ctx.fillText(`Nivel: ${level}`, canvas.width - 100, 30);

    requestAnimationFrame(update);
  }
}

function levelUp() {
  level = 2;
  meteors = [];
  stars = [];
  meteorInterval = 3000;
  // Reproducir el sonido de nivel ascendente
  levelUpSound.play();
  // Mostrar el anuncio de nivel 2
  alert("¡Has alcanzado el nivel 2!");
  // Cambiar la música de fondo
  backgroundMusic.src = "assets/background-music-level2.mp3";
  backgroundMusic.play();
}
function endGame() {
  gameOver = true;
  canvas.style.display = "none"; // Esconde el canvas de juego
  gameOverScreen.style.display = "flex"; // Muestra la pantalla de Game Over
}
let shooting = false;
let shootInterval;
function keyDown(e) {
  if (e.key === "ArrowRight" || e.key === "Right") {
    spaceship.dx = spaceship.speed;
  } else if (e.key === "ArrowLeft" || e.key === "Left") {
    spaceship.dx = -spaceship.speed;
  } else if (e.key === "ArrowUp" || e.key === "Up") {
    spaceship.dy = -spaceship.speed;
  } else if (e.key === "ArrowDown" || e.key === "Down") {
    spaceship.dy = spaceship.speed;
  } else if (e.key === " " || e.key === "Spacebar") {
    e.preventDefault(); // Evita el comportamiento predeterminado de la barra espaciadora
    createBullet();
    playShootSound();
      shootInterval = setInterval(() => {
        createBullet();
        playShootSound();
      }, 200); // Ajusta el intervalo según la velocidad deseada de disparo
    console.log("Bullet created", bullets); // Depuración: Verificar que las balas se creen
  }
}

function keyUp(e) {
  if (
    e.key === "ArrowRight" ||
    e.key === "Right" ||
    e.key === "ArrowLeft" ||
    e.key === "Left" ||
    e.key === "ArrowUp" ||
    e.key === "Up" ||
    e.key === "ArrowDown" ||
    e.key === "Down"
  ) {
    spaceship.dx = 0;
    spaceship.dy = 0;
  } else if (e.key === " " || e.key === "Spacebar") {
    shooting = false;
    clearInterval(shootInterval);
  }
}


function startGame() {
  spaceshipImg.src = spaceshipSelect.value;
  startScreen.style.display = "none";
  canvas.style.display = "block";
  gameOverScreen.style.display = "none";
  document.addEventListener("keydown", keyDown);
  document.addEventListener("keyup", keyUp);
  setInterval(createMeteor, meteorInterval);
  setInterval(createStar, 3000);
  resetGame();
  backgroundMusic.play();
  update();
}

function restartGame() {
  resetGame();
  startGame();
}

function exitGame() {
  window.close();
}

function keyDown(e) {
  if (e.key === "ArrowRight" || e.key === "Right") {
    spaceship.dx = spaceship.speed;
  } else if (e.key === "ArrowLeft" || e.key === "Left") {
    spaceship.dx = -spaceship.speed;
  } else if (e.key === "ArrowUp" || e.key === "Up") {
    spaceship.dy = -spaceship.speed;
  } else if (e.key === "ArrowDown" || e.key === "Down") {
    spaceship.dy = spaceship.speed;
  } else if (e.key === " " || e.key === "Spacebar") {
    createBullet();
    console.log("Bullet created", bullets); // Depuración: Verificar que las balas se creen
  }
}

function keyUp(e) {
  if (
    e.key === "ArrowRight" ||
    e.key === "Right" ||
    e.key === "ArrowLeft" ||
    e.key === "Left" ||
    e.key === "ArrowUp" ||
    e.key === "Up" ||
    e.key === "ArrowDown" ||
    e.key === "Down"
  ) {
    spaceship.dx = 0;
    spaceship.dy = 0;
  }
}


function toggleMusic() {
  if (isMusicPlaying) {
    backgroundMusic.pause();
    musicButton.textContent = "Play Music";
  } else {
    backgroundMusic.play();
    musicButton.textContent = "Pause Music";
  }
  isMusicPlaying = !isMusicPlaying;
}

startButton.addEventListener("click", startGame);
restartButton.addEventListener("click", restartGame);
exitButton.addEventListener("click", exitGame);
musicButton.addEventListener("click", toggleMusic);

spaceshipSelect.addEventListener("change", function () {
  spaceshipImg.src = this.value;
  spaceshipPreview.src = this.value;
});
