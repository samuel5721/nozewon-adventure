document.addEventListener("DOMContentLoaded", function () {
  const nozeImage = document.getElementById("noze");
  const bananaImage = document.getElementById("banana");
  const scoreDisplay = document.getElementById("score");
  const staminaBar = document.getElementById("stamina");
  const ammoBar = document.getElementById("ammo");
  const container = document.getElementById("container");

  let x = window.innerWidth / 2;
  let y = window.innerHeight / 2;
  let score = 0;
  let stamina = 100;
  let ammo = 10;
  const maxAmmo = 20;
  let invincible = false;

  let velocityX = 0;
  let velocityY = 0;
  const baseAcceleration = 25000;
  const friction = 0.99;
  const staminaDecreaseRate = 5;

  const bulletSpeed = 10;
  const ssalSpeed = 3;

  let lastTime = performance.now();

  setTimeout(() => {
    document.querySelector("#init").style.opacity = 0;
  }, 3000);

  const moveNoze = () => {
    if (stamina > 0) {
      const currentTime = performance.now();
      const deltaTime = (currentTime - lastTime) / 1000; // seconds since last frame
      lastTime = currentTime;

      x += velocityX * deltaTime;
      y += velocityY * deltaTime;

      velocityX *= friction;
      velocityY *= friction;

      nozeImage.style.left = `${x}px`;
      nozeImage.style.top = `${y}px`;

      checkCollision();

      stamina -= staminaDecreaseRate * deltaTime;
      if (stamina < 0) stamina = 0;
      updateStaminaBar();
    }

    requestAnimationFrame(moveNoze);
  };

  const updateStaminaBar = () => {
    staminaBar.style.width = `${stamina}%`;
  };

  const updateAmmoBar = () => {
    ammoBar.style.width = `${(ammo / maxAmmo) * 100}%`;
  };

  const randomPosition = () => {
    const containerWidth = window.innerWidth - bananaImage.width;
    const containerHeight = window.innerHeight - bananaImage.height;
    const randomX = Math.random() * containerWidth;
    const randomY = Math.random() * containerHeight;
    bananaImage.style.left = `${randomX}px`;
    bananaImage.style.top = `${randomY}px`;
  };

  const checkCollision = () => {
    const nozeRect = nozeImage.getBoundingClientRect();
    const bananaRect = bananaImage.getBoundingClientRect();

    if (
      nozeRect.x < bananaRect.x + bananaRect.width &&
      nozeRect.x + nozeRect.width > bananaRect.x &&
      nozeRect.y < bananaRect.y + bananaRect.height &&
      nozeRect.y + nozeRect.height > bananaRect.y
    ) {
      bananaImage.style.display = "none";
      var audio = new Audio("sound/banana_eat.mp3");
      audio.play();
      nozeImage.src = "image/Noze_eating.png";
      setTimeout(() => {
        nozeImage.src = "image/Noze.png";
      }, 300);
      score++;
      stamina = Math.min(stamina + 10, 100);
      ammo = Math.min(ammo + 3, maxAmmo);
      scoreDisplay.textContent = `Score: ${score}`;
      updateStaminaBar();
      updateAmmoBar();
      setTimeout(() => {
        bananaImage.style.display = "block";
        randomPosition();
      }, 0);
    }

    document.querySelectorAll(".ssal").forEach((ssal) => {
      const ssalRect = ssal.getBoundingClientRect();
      if (
        nozeRect.x < ssalRect.x + ssalRect.width &&
        nozeRect.x + nozeRect.width > ssalRect.x &&
        nozeRect.y < ssalRect.y + ssalRect.height &&
        nozeRect.y + nozeRect.height > ssalRect.y
      ) {
        if (!invincible) {
          document.querySelector(".rectangle").style.opacity = 0.5;
          setTimeout(() => {
            document.querySelector(".rectangle").style.opacity = 0;
          }, 250);

          var audio = new Audio("sound/hit.mp3");
          audio.play();

          stamina -= 15;
          if (stamina < 0) stamina = 0;
          updateStaminaBar();
          invincible = true;
          setTimeout(() => {
            invincible = false;
          }, 1000);
        }
      }
    });
  };

  const shootBananaBullet = (direction) => {
    if (ammo <= 0) return;

    const bullet = document.createElement("img");
    bullet.src = "image/BananaBullet.png";
    bullet.classList.add("bananaBullet");
    bullet.style.left = `${x}px`;
    bullet.style.top = `${y}px`;

    let dx = 0;
    let dy = 0;

    switch (direction) {
      case "ArrowUp":
      case "w":
        dy = bulletSpeed * -1;
        break;
      case "ArrowDown":
      case "s":
        dy = bulletSpeed;
        break;
      case "ArrowLeft":
      case "a":
        dx = bulletSpeed * -1;
        break;
      case "ArrowRight":
      case "d":
        dx = bulletSpeed;
        break;
    }

    var audio = new Audio("sound/bullet_shoot.mp3");
    audio.play();

    container.appendChild(bullet);
    ammo--;
    updateAmmoBar();

    const moveBullet = setInterval(() => {
      const bulletX = parseFloat(bullet.style.left) + dx;
      const bulletY = parseFloat(bullet.style.top) + dy;

      bullet.style.left = `${bulletX}px`;
      bullet.style.top = `${bulletY}px`;

      document.querySelectorAll(".ssal").forEach((ssal) => {
        const ssalRect = ssal.getBoundingClientRect();
        const bulletRect = bullet.getBoundingClientRect();
        if (
          bulletRect.x < ssalRect.x + ssalRect.width &&
          bulletRect.x + bulletRect.width > ssalRect.x &&
          bulletRect.y < ssalRect.y + ssalRect.height &&
          bulletRect.y + bulletRect.height > ssalRect.y
        ) {
          var audio = new Audio("sound/enemy_hit.mp3");
          audio.play();
          ssal.remove();
          bullet.remove();
          clearInterval(moveBullet);
        }
      });

      if (
        bulletX < 0 ||
        bulletX > window.innerWidth ||
        bulletY < 0 ||
        bulletY > window.innerHeight
      ) {
        clearInterval(moveBullet);
        bullet.remove();
      }
    }, 10);
  };

  const spawnSsal = () => {
    const ssal = document.createElement("img");
    ssal.src = "image/Ssal.png";
    ssal.classList.add("ssal");
    const spawnEdge = Math.floor(Math.random() * 4);

    let ssalX, ssalY, targetX, targetY;
    let ignoreCollisionFrames = 100;

    switch (spawnEdge) {
      case 0:
        ssalX = Math.random() * window.innerWidth;
        ssalY = -20;
        break;
      case 1:
        ssalX = window.innerWidth + 20;
        ssalY = Math.random() * window.innerHeight;
        break;
      case 2:
        ssalX = Math.random() * window.innerWidth;
        ssalY = window.innerHeight + 20;
        break;
      case 3:
        ssalX = -20;
        ssalY = Math.random() * window.innerHeight;
        break;
    }

    const behavior = Math.floor(Math.random() * 2);

    let dx = 0,
      dy = 0;

    if (behavior === 0) {
      switch (spawnEdge) {
        case 0:
          dy = ssalSpeed;
          break;
        case 1:
          dx = ssalSpeed * -1;
          break;
        case 2:
          dy = ssalSpeed * -1;
          break;
        case 3:
          dx = ssalSpeed;
          break;
      }
    } else {
      setInterval(() => {
        const targetRect = nozeImage.getBoundingClientRect();
        targetX = targetRect.x;
        targetY = targetRect.y;

        const angle = Math.atan2(targetY - ssalY, targetX - ssalX);
        dx = Math.cos(angle) * ssalSpeed;
        dy = Math.sin(angle) * ssalSpeed;
      }, 100);
    }

    ssal.style.left = `${ssalX}px`;
    ssal.style.top = `${ssalY}px`;

    container.appendChild(ssal);

    const moveSsal = setInterval(() => {
      ssalX += dx;
      ssalY += dy;
      ssal.style.left = `${ssalX}px`;
      ssal.style.top = `${ssalY}px`;

      if (ignoreCollisionFrames > 0) {
        ignoreCollisionFrames--;
        return;
      }

      const ssalRect = ssal.getBoundingClientRect();

      if (
        behavior === 0 &&
        (ssalX < 0 ||
          ssalX > window.innerWidth ||
          ssalY < 0 ||
          ssalY > window.innerHeight)
      ) {
        clearInterval(moveSsal);
        ssal.remove();
      }
    }, 10);
  };

  setInterval(spawnSsal, Math.random() * 2500 + 1000);

  let keys = {};

  window.addEventListener("keydown", function (event) {
    keys[event.key] = true;

    if (event.repeat) return;

    if (event.key === "ArrowUp") {
      shootBananaBullet("ArrowUp");
    }
    if (event.key === "ArrowDown") {
      shootBananaBullet("ArrowDown");
    }
    if (event.key === "ArrowLeft") {
      shootBananaBullet("ArrowLeft");
    }
    if (event.key === "ArrowRight") {
      shootBananaBullet("ArrowRight");
    }
  });

  window.addEventListener("keyup", function (event) {
    keys[event.key] = false;
  });

  const updateVelocity = () => {
    const currentTime = performance.now();
    const deltaTime = (currentTime - lastTime) / 1000; // seconds since last frame
    lastTime = currentTime;

    if (stamina > 0) {
      if (keys["w"]) {
        velocityY -= baseAcceleration * deltaTime;
      }
      if (keys["s"]) {
        velocityY += baseAcceleration * deltaTime;
      }
      if (keys["a"]) {
        velocityX -= baseAcceleration * deltaTime;
        nozeImage.style.transform = "scaleX(1)";
      }
      if (keys["d"]) {
        velocityX += baseAcceleration * deltaTime;
        nozeImage.style.transform = "scaleX(-1)";
      }
    }

    requestAnimationFrame(updateVelocity);
  };

  moveNoze();
  updateVelocity();

  randomPosition();
  updateStaminaBar();
  updateAmmoBar();

  setInterval(spawnSsal, 3000);
});
