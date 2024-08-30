document.addEventListener('DOMContentLoaded', function() {
  const nozeImage = document.getElementById('noze');
  const bananaImage = document.getElementById('banana');
  const scoreDisplay = document.getElementById('score');
  const staminaBar = document.getElementById('stamina');
  const ammoBar = document.getElementById('ammo');
  const container = document.getElementById('container');
  
  let x = window.innerWidth / 2;
  let y = window.innerHeight / 2;
  let score = 0;
  let stamina = 100;
  let ammo = 10;
  const maxAmmo = 20;
  let invincible = false; // for noze invincibility

  // Velocity and acceleration variables
  let velocityX = 0;
  let velocityY = 0;
  const acceleration = 0.25;
  const friction = 0.98;
  const staminaDecreaseRate = 0.05;

  // Speeds for bullets and Ssal
  const bulletSpeed = 10; // Speed for the banana bullet
  const ssalSpeed = 3; // Speed for Ssal

  setTimeout(() => {
  document.querySelector('#init').style.opacity = 0;
  }, 3000);

  const moveNoze = () => {

    if (stamina > 0) {
      x += velocityX;
      y += velocityY;
  
      // Apply friction to simulate sliding
      velocityX *= friction;
      velocityY *= friction;
  
      // Update position
      nozeImage.style.left = `${x}px`;
      nozeImage.style.top = `${y}px`;

      checkCollision();

      // Decrease stamina gradually
      stamina -= staminaDecreaseRate;
      if (stamina < 0) stamina = 0;
      updateStaminaBar();
    }

    // Request the next frame for smooth animation
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

    // Check collision between Noze and Banana
    if (
      (nozeRect.x < bananaRect.x + bananaRect.width &&
      nozeRect.x + nozeRect.width > bananaRect.x &&
      nozeRect.y < bananaRect.y + bananaRect.height &&
      nozeRect.y + nozeRect.height > bananaRect.y)
    ) {
      bananaImage.style.display = 'none';
      var audio = new Audio("sound/banana_eat.mp3");
      audio.play();
      this.querySelector('img').src = 'image/Noze_eating.png';
      setTimeout(() => {
        this.querySelector('img').src = 'image/Noze.png';
      }, 300);
      score++;
      stamina = Math.min(stamina + 10, 100); // Recover stamina when eating a banana
      ammo = Math.min(ammo + 3, maxAmmo); // Recover ammo when eating a banana
      scoreDisplay.textContent = `Score: ${score}`;
      updateStaminaBar();
      updateAmmoBar();
      setTimeout(() => {
        bananaImage.style.display = 'block';
        randomPosition();
      }, 0);
    }

    // Check collision between Noze and Ssal
    document.querySelectorAll('.ssal').forEach(ssal => {
      const ssalRect = ssal.getBoundingClientRect();
      if (
        nozeRect.x < ssalRect.x + ssalRect.width &&
        nozeRect.x + nozeRect.width > ssalRect.x &&
        nozeRect.y < ssalRect.y + ssalRect.height &&
        nozeRect.y + nozeRect.height > ssalRect.y
      ) {
        if (!invincible) {
          document.querySelector('.rectangle').style.opacity = 0.5;
          setTimeout(() => {
            document.querySelector('.rectangle').style.opacity = 0;
          }, 250);

          var audio = new Audio("sound/hit.mp3");
          audio.play();

          stamina -= 15; // Reduce stamina if hit by Ssal
          if (stamina < 0) stamina = 0;
          updateStaminaBar();
          invincible = true; // Trigger invincibility
          setTimeout(() => {
            invincible = false;
          }, 1000); // 1-second invincibility
        }
      }
    });
  };

  const shootBananaBullet = (direction) => {
    if (ammo <= 0) return; // Do not shoot if out of ammo

    const bullet = document.createElement('img');
    bullet.src = 'image/BananaBullet.png';
    bullet.classList.add('bananaBullet');
    bullet.style.left = `${x}px`;
    bullet.style.top = `${y}px`;

    let dx = 0;
    let dy = 0;

    switch(direction) {
      case 'ArrowUp':
      case 'w':
        dy = bulletSpeed * -1;
        break;
      case 'ArrowDown':
      case 's':
        dy = bulletSpeed;
        break;
      case 'ArrowLeft':
      case 'a':
        dx = bulletSpeed * -1;
        break;
      case 'ArrowRight':
      case 'd':
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

      // Check collision between BananaBullet and Ssal
      document.querySelectorAll('.ssal').forEach(ssal => {
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
          ssal.remove(); // Ssal disappears when hit by BananaBullet
          bullet.remove(); // Bullet disappears upon hitting Ssal
          clearInterval(moveBullet);
        }
      });

      if (
        bulletX < 0 || bulletX > window.innerWidth ||
        bulletY < 0 || bulletY > window.innerHeight
      ) {
        clearInterval(moveBullet);
        bullet.remove();
      }
    }, 10);
  };

// Function to spawn Ssal
const spawnSsal = () => {
  const ssal = document.createElement('img');
  ssal.src = 'image/Ssal.png';
  ssal.classList.add('ssal');
  const spawnEdge = Math.floor(Math.random() * 4); // Random edge: 0 = top, 1 = right, 2 = bottom, 3 = left

  let ssalX, ssalY, targetX, targetY;
  let ignoreCollisionFrames = 100; // Ignore collisions for the first 10 frames
  
  switch(spawnEdge) {
    case 0: // top
      ssalX = Math.random() * window.innerWidth;
      ssalY = -20;
      break;
    case 1: // right
      ssalX = window.innerWidth + 20;
      ssalY = Math.random() * window.innerHeight;
      break;
    case 2: // bottom
      ssalX = Math.random() * window.innerWidth;
      ssalY = window.innerHeight + 20;
      break;
    case 3: // left
      ssalX = -20;
      ssalY = Math.random() * window.innerHeight;
      break;
  }

  // Randomly choose one of the three behaviors
  const behavior = Math.floor(Math.random() * 2);

  let dx = 0, dy = 0;
  
  if (behavior === 0) {
    // Behavior 1: Move in a straight line until it hits the opposite wall
    switch(spawnEdge) {
      case 0: // top
        dy = ssalSpeed;
        break;
      case 1: // right
        dx = ssalSpeed * -1;
        break;
      case 2: // bottom
        dy = ssalSpeed * -1;
        break;
      case 3: // left
        dx = ssalSpeed;
        break;
    }
  } else {
    // Behavior 3: Always move toward Noze
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
      ignoreCollisionFrames--; // Decrease the collision ignore counter
      return; // Skip collision detection for this frame
    }

    const ssalRect = ssal.getBoundingClientRect();

    // Remove Ssal if it reaches the opposite wall (for straight line behavior)
    if (behavior === 0 && (
      ssalX < 0 || ssalX > window.innerWidth ||
      ssalY < 0 || ssalY > window.innerHeight
    )) {
      clearInterval(moveSsal);
      ssal.remove();
    }

  }, 10);
};

// Spawn Ssal at regular intervals (every 3 seconds)
setInterval(spawnSsal, Math.random() * 2500+1000);

  // Keydown and keyup event listeners for controlling acceleration
  let keys = {};

  window.addEventListener('keydown', function(event) {
    keys[event.key] = true;

    if (event.repeat) return;

    if (event.key === 'ArrowUp') {
      shootBananaBullet('ArrowUp');
    }
    if (event.key === 'ArrowDown') {
      shootBananaBullet('ArrowDown');
    }
    if (event.key === 'ArrowLeft') {
      shootBananaBullet('ArrowLeft');
    }
    if (event.key === 'ArrowRight') {
      shootBananaBullet('ArrowRight');
    }
  });

  window.addEventListener('keyup', function(event) {
    keys[event.key] = false;
  });

  const updateVelocity = () => {
    if (stamina > 0) {
      if (keys['w']) {
        velocityY -= acceleration;
      }
      if (keys['s']) {
        velocityY += acceleration;
      }
      if (keys['a']) {
        velocityX -= acceleration;
        this.querySelector('img').style.transform = 'scaleX(1)';
      }
      if (keys['d']) {
        velocityX += acceleration;
        this.querySelector('img').style.transform = 'scaleX(-1)';
      }
    }

    // Continue updating the velocity every frame
    requestAnimationFrame(updateVelocity);
  };

  // Start the movement and velocity update loops
  moveNoze();
  updateVelocity();

  randomPosition();
  updateStaminaBar();
  updateAmmoBar();

  // Spawn Ssal at random intervals
  setInterval(spawnSsal, 3000);
});
