window.onload = function () {
    const canvas = document.querySelector("canvas");
    const ctx = canvas.getContext("2d");

    let gameState = "menu";
    let shakeMagnitude = 0;
    let enemySpawnInterval;
    let frameCount = 0;
    let isPaused = false;
    let pausedByVisibility = false;
    let mouse;
    let playerLife;
    let bullets;
    let enemies;
    let enemyBullets;
    let stars;
    let particles;
    let score;
    let canvasOffsetX;
    let canvasOffsetY;

    function drawMenu() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.shadowColor = "pink";
        ctx.shadowBlur = 10;
        ctx.fillStyle = "pink";
        ctx.font = "50px Courier New";
        ctx.textAlign = "center";
        ctx.fillText("SPACE SHOOTER", canvas.width / 2, canvas.height / 2 - 10);

        ctx.font = "17px Courier New";
        ctx.fillStyle = "rgba(254, 208, 244, 0.8)";
        ctx.fillText("CLICK ANYWHERE TO START", canvas.width / 2, canvas.height / 2 + 20);
        ctx.fillText("PRESS 'I' FOR INSTRUCTIONS", canvas.width / 2, canvas.height / 2 + 50);
        ctx.shadowBlur = 0;
    }

    function drawInstructions() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.shadowColor = "pink";
        ctx.shadowBlur = 10;
        ctx.fillStyle = "pink";
        ctx.font = "40px Courier New";
        ctx.textAlign = "center";
        ctx.fillText("INSTRUCTIONS", canvas.width / 2, 100);

        ctx.font = "20px Courier New";
        ctx.textAlign = "left";
        ctx.fillText("- Move with your mouse", 100, 200);
        ctx.fillText("- Shoot automatically", 100, 240);
        ctx.fillText("- Avoid enemy bullets", 100, 280);
        ctx.fillText("- Destroy enemies to score points", 100, 320);

        ctx.textAlign = "center";
        ctx.fillText("PRESS 'M' TO RETURN TO MENU", canvas.width / 2, canvas.height - 100);
        ctx.shadowBlur = 0;
    }

    function drawgameover() {
        ctx.fillStyle = "rgba(0,0,0,0.5)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.shadowBlur = 10;
        ctx.fillStyle = "pink";
        ctx.font = "50px Courier New";
        ctx.textAlign = "center";
        ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 2 - 10);
            
        ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
        ctx.font = "17px Courier New";
        ctx.textAlign = "center";
        ctx.fillText("SCORE:" + score, canvas.width / 2, canvas.height / 2 + 25);
        ctx.fillText("CLICK ANYWHERE TO PLAY AGAIN", canvas.width / 2, canvas.height / 2 + 50);
        ctx.shadowBlur = 0;
    }

    canvas.addEventListener("click", () => {
        if(gameState === "menu") {
            gameState = "playing";
            resetGame();
        } else if(gameState === "gameover") {
            resetGame();
            gameState = "playing";
        }
    });

    document.addEventListener("keydown", (e) => {
        if(gameState === "menu" && e.key.toLowerCase() === "i") {
            gameState = "instructions";
        } else if(gameState === "instructions" && e.key.toLowerCase() === "m") {
            gameState = "menu";
        } else if(gameState === "playing" && e.key.toLowerCase() === "p") {
            isPaused = !isPaused;
        } else if(gameState === "playing" && isPaused && e.key.toLowerCase() === "m") {
            gameState = "menu";
            isPaused = false;
        }
    });

    function mainLoop() {
        requestAnimationFrame(mainLoop);

        if(gameState === "menu") {
            drawMenu();
        } else if(gameState === "instructions") {
            drawInstructions();
        } else if(gameState === "playing") {
            animate();
        } else if(gameState === "gameover") {
            drawgameover();
        }
    }

    function resize() {
        canvas.width = innerWidth * 0.9;
        canvas.height = innerHeight * 0.9;
        canvasOffsetX = (innerWidth - canvas.width) / 2;
        canvasOffsetY = (innerHeight - canvas.height) / 2;
    }
    window.addEventListener("resize", resize);
    resize();
    generateStars();
    lastTime = performance.now();
   
    mouse = {
        x: window.innerWidth / 2,
        y: window.innerHeight - 50,
    }
    playerLife = 100;
    bullets = [];
    enemies = [];
    enemyBullets = [];
    stars = [];
    particles = [];
    score = 0;
    speedMultiplier = 1;
    gameStartTime = performance.now();

    const playerImg = new Image();
    playerImg.src = "images/nave.png";
    const enemyImg = new Image();
    enemyImg.src= "images/nave-enemiga.png";
    const pW = 32;
    const pH = 32;

    canvas.addEventListener("mousemove", (e) => {
        mouse.x = Math.max(0, Math.min(canvas.width, e.clientX - canvasOffsetX));
        mouse.y = Math.max(0, Math.min(canvas.height, e.clientY - canvasOffsetY));
    });

    document.addEventListener("visibilitychange", () => {
        if (document.hidden) {
            isPaused = true;
            pausedByVisibility = true;
            clearInterval(enemySpawnInterval);
        } else {
            if (pausedByVisibility && playerLife > 0) {
                isPaused = false;
                pausedByVisibility = false;
                enemySpawnInterval = setInterval(spawnEnemy, 1500)
            }
        }
    });

    function spawnEnemy() {
        if(!isPaused) {
            enemies.push({ 
                x: Math.random() * (canvas.width - 32), 
                y: -32, 
                w: 32, 
                h: 32 
            });
        }
    }

    function generateStars() {
        stars = [];
        for (let i = 0; i < 100; i++) {
            stars.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                size: Math.random() * 2 + 1,
                opacity: Math.random() * 0.5 + 0.5
            });
        }
    }

    function createExplosion(x, y) {
        let parts = [];
        for (let i = 0; i < 10; i++) {
            parts.push({
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 4,
                vy: (Math.random() - 0.5) * 4,
                life: 30,
                color: `hsl(${Math.random() * 60 + 10}, 100%, 50%)`
            });
        }
        return parts;
    }

    function drawRoundedRect(ctx, x, y, width, height, radius) {
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        ctx.lineTo(x + radius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
    }

    lastTime = 0;

    function animate() {
        let currentTime = performance.now();
        let deltaTime = currentTime - lastTime || 16.67;
        lastTime = currentTime;
        
        speedMultiplier += 0.0005 * (deltaTime / 1000);
        
        
        if (isPaused && playerLife > 0) {
            ctx.fillStyle = "rgba(0,0,0,0.3)";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = "pink";
            ctx.font = "50px Courier New";
            ctx.textAlign = "center";
            ctx.fillText("PAUSED", canvas.width / 2, canvas.height / 2 - 20);

            ctx.font = "17px Courier New";
            ctx.textAlign = "center";
            ctx.fillText("PRESS 'P' TO RESUME", canvas.width / 2, canvas.height / 2 + 10);
            ctx.fillText("PRESS 'M' TO MENU", canvas.width / 2, canvas.height / 2 + 30);

            return;
        }
        
        frameCount++;
        if(frameCount % 20 === 0) {
            bullets.push({
                x: mouse.x,
                y: mouse.y -20,
                w: 6,
                h: 8
            });
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        stars.forEach(star => {
            ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`;
            ctx.beginPath();
            ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
            ctx.fill();
        });
        
        bullets.forEach((bull, bullIndex) => {
            bull.y -= 10;
            ctx.fillStyle = "yellow";
            ctx.fillRect(bull.x, bull.y, bull.w, bull.h);
            if(bull.y < 0) bullets.splice(bullIndex, 1);
        });

        enemies.forEach((enem, enemIndex) => {
            enem.y += 100 * speedMultiplier * (deltaTime / 1000);
            ctx.drawImage(enemyImg, enem.x, enem.y, enem.w, enem.h);

            if(Math.random() < 0.02) {
                enemyBullets.push({
                    x: enem.x,
                    y: enem.y + 32,
                    w: 4,
                    h: 8
                });
            }

            if (mouse.x - 16 < enem.x + 32 && mouse.x + 16 > enem.x &&
                mouse.y - 16 < enem.y + 32 && mouse.y + 16 > enem.y) {
                playerLife = 0;
                enemies.splice(enemIndex, 1);
            }
            
            if(enem.y > canvas.height) enemies.splice(enemIndex, 1);
        });
        
        particles.forEach((p, i) => {
            p.x += p.vx;
            p.y += p.vy;
            p.life--;
            if (p.life <= 0) particles.splice(i, 1);
        });
        
        enemyBullets.forEach((enemB, enemBI) => {
            enemB.y += 5;
            ctx.fillStyle = "red";
            ctx.fillRect(enemB.x, enemB.y, enemB.w, enemB.h);

            if(enemB.x < mouse.x + 16 && enemB.x + 4 > mouse.x - 16 &&
                enemB.y < mouse.y + 16 && enemB.y + 8 > mouse.y - 16) {
                playerLife -= 5;
                enemyBullets.splice(enemBI, 1);
                shakeMagnitude = 10;
            }
            
            if (enemB.y > canvas.height) enemyBullets.splice(enemBI, 1);
        });
            
        particles.forEach(p => {
            ctx.fillStyle = p.color;
            ctx.globalAlpha = p.life / 30;
            ctx.beginPath();
            ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1;
        });
            
        bullets.forEach((bull, bullIndex) => {
            enemies.forEach((enem, enemIndex) => {
                if(bull.x < enem.x + 32 && bull.x + 6 > enem.x && 
                   bull.y < enem.y + 32 && bull.y + 8 > enem.y) {
                    particles.push(...createExplosion(enem.x + 16, enem.y + 16));
                    score += 10;
                    enemies.splice(enemIndex, 1);
                    bullets.splice(bullIndex, 1);
                }
            });
        });

        let dx = 0;
        let dy = 0;
        if (shakeMagnitude > 0) {
            dx = (Math.random() - 0.5) * shakeMagnitude;
            dy = (Math.random() - 0.5) * shakeMagnitude;
            shakeMagnitude *= 0.9;
        }

        ctx.save();
        ctx.translate(dx, dy);
        ctx.drawImage(playerImg, mouse.x - pW / 2, mouse.y - pH  / 2, pW, pH);
        ctx.restore();

        // Health bar
        ctx.strokeStyle = "pink";
        ctx.lineWidth = 3;
        drawRoundedRect(ctx, 47, 27, 206, 26, 5);
        ctx.stroke();
        ctx.fillStyle = "rgb(255, 167, 196)";
        drawRoundedRect(ctx, 50, 30, 200, 20, 5);
        ctx.fill();
        ctx.fillStyle = "rgb(212, 255, 167)";
        drawRoundedRect(ctx, 50, 30, (playerLife / 100) * 200, 20, 5);
        ctx.fill();
        
        // Score
        ctx.fillStyle = "pink";
        ctx.font = "bold 24px Courier New";
        ctx.textAlign = "left";
        ctx.fillText("Score: " + score, 50, 80)

        if(playerLife <= 0) {
            clearInterval(enemySpawnInterval);

            gameState = "gameover";
            return;
        }
    }

    function resetGame() {
        isPaused = false;
        playerLife = 100;
        bullets = [];
        enemies = [];
        enemyBullets = [];
        frameCount = 0;
        shakeMagnitude = 0;
        lastTime = performance.now();
        score = 0;
        particles = [];
        speedMultiplier = 1;
        gameStartTime = performance.now();

        clearInterval(enemySpawnInterval);
        enemySpawnInterval = setInterval(spawnEnemy, 1500);

    }

    playerImg.onload = () => {
        mainLoop();
    }

}
