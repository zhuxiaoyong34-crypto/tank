// 游戏常量
const CANVAS_WIDTH = 600;
const CANVAS_HEIGHT = 600;
const TANK_SIZE = 30;
const BULLET_SIZE = 5;
const BULLET_SPEED = 5;
const TANK_SPEED = 3;
const ENEMY_SPEED = 1;
const ENEMY_SPAWN_INTERVAL = 2000;

// 游戏状态
let score = 0;
let lives = 3;
let gameOver = false;

// 游戏对象
let playerTank;
let bullets = [];
let enemyTanks = [];
let obstacles = [];

// 键盘状态
const keys = {
    w: false,
    a: false,
    s: false,
    d: false,
    space: false
};

// 初始化游戏
function initGame() {
    // 获取画布和上下文
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    
    // 初始化玩家坦克
    playerTank = {
        x: CANVAS_WIDTH / 2 - TANK_SIZE / 2,
        y: CANVAS_HEIGHT - TANK_SIZE - 10,
        width: TANK_SIZE,
        height: TANK_SIZE,
        direction: 'up',
        speed: TANK_SPEED
    };
    
    // 初始化障碍物
    createObstacles();
    
    // 开始游戏循环
    gameLoop(ctx);
    
    // 开始生成敌人
    setInterval(spawnEnemy, ENEMY_SPAWN_INTERVAL);
}

// 创建障碍物
function createObstacles() {
    // 在画布上随机生成一些障碍物
    for (let i = 0; i < 20; i++) {
        obstacles.push({
            x: Math.random() * (CANVAS_WIDTH - 30),
            y: Math.random() * (CANVAS_HEIGHT - 30),
            width: 30,
            height: 30
        });
    }
}

// 生成敌人坦克
function spawnEnemy() {
    if (gameOver) return;
    
    enemyTanks.push({
        x: Math.random() * (CANVAS_WIDTH - TANK_SIZE),
        y: 10,
        width: TANK_SIZE,
        height: TANK_SIZE,
        direction: 'down',
        speed: ENEMY_SPEED
    });
}

// 游戏循环
function gameLoop(ctx) {
    if (gameOver) return;
    
    // 清空画布
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    // 更新玩家坦克
    updatePlayerTank();
    
    // 更新子弹
    updateBullets();
    
    // 更新敌人坦克
    updateEnemyTanks();
    
    // 检测碰撞
    detectCollisions();
    
    // 绘制障碍物
    drawObstacles(ctx);
    
    // 绘制玩家坦克
    drawTank(ctx, playerTank, 'blue');
    
    // 绘制子弹
    drawBullets(ctx);
    
    // 绘制敌人坦克
    drawEnemyTanks(ctx);
    
    // 绘制游戏信息
    updateGameInfo();
    
    // 继续游戏循环
    requestAnimationFrame(() => gameLoop(ctx));
}

// 更新玩家坦克
function updatePlayerTank() {
    // 根据键盘输入移动坦克
    if (keys.w) {
        playerTank.direction = 'up';
        playerTank.y = Math.max(0, playerTank.y - playerTank.speed);
    }
    if (keys.s) {
        playerTank.direction = 'down';
        playerTank.y = Math.min(CANVAS_HEIGHT - playerTank.height, playerTank.y + playerTank.speed);
    }
    if (keys.a) {
        playerTank.direction = 'left';
        playerTank.x = Math.max(0, playerTank.x - playerTank.speed);
    }
    if (keys.d) {
        playerTank.direction = 'right';
        playerTank.x = Math.min(CANVAS_WIDTH - playerTank.width, playerTank.x + playerTank.speed);
    }
    
    // 发射子弹
    if (keys.space) {
        fireBullet();
        keys.space = false; // 防止连续发射
    }
}

// 发射子弹
function fireBullet() {
    let bulletX, bulletY;
    
    // 根据坦克方向确定子弹起始位置
    switch (playerTank.direction) {
        case 'up':
            bulletX = playerTank.x + playerTank.width / 2 - BULLET_SIZE / 2;
            bulletY = playerTank.y - BULLET_SIZE;
            break;
        case 'down':
            bulletX = playerTank.x + playerTank.width / 2 - BULLET_SIZE / 2;
            bulletY = playerTank.y + playerTank.height;
            break;
        case 'left':
            bulletX = playerTank.x - BULLET_SIZE;
            bulletY = playerTank.y + playerTank.height / 2 - BULLET_SIZE / 2;
            break;
        case 'right':
            bulletX = playerTank.x + playerTank.width;
            bulletY = playerTank.y + playerTank.height / 2 - BULLET_SIZE / 2;
            break;
    }
    
    // 添加子弹到数组
    bullets.push({
        x: bulletX,
        y: bulletY,
        width: BULLET_SIZE,
        height: BULLET_SIZE,
        direction: playerTank.direction,
        speed: BULLET_SPEED
    });
}

// 更新子弹
function updateBullets() {
    for (let i = bullets.length - 1; i >= 0; i--) {
        const bullet = bullets[i];
        
        // 根据方向移动子弹
        switch (bullet.direction) {
            case 'up':
                bullet.y -= bullet.speed;
                break;
            case 'down':
                bullet.y += bullet.speed;
                break;
            case 'left':
                bullet.x -= bullet.speed;
                break;
            case 'right':
                bullet.x += bullet.speed;
                break;
        }
        
        // 检查子弹是否超出画布
        if (bullet.x < 0 || bullet.x > CANVAS_WIDTH || bullet.y < 0 || bullet.y > CANVAS_HEIGHT) {
            bullets.splice(i, 1);
        }
    }
}

// 更新敌人坦克
function updateEnemyTanks() {
    for (let i = enemyTanks.length - 1; i >= 0; i--) {
        const enemy = enemyTanks[i];
        
        // 敌人坦克向下移动
        enemy.y += enemy.speed;
        
        // 随机改变方向
        if (Math.random() < 0.01) {
            const directions = ['up', 'down', 'left', 'right'];
            enemy.direction = directions[Math.floor(Math.random() * directions.length)];
        }
        
        // 检查敌人是否超出画布
        if (enemy.y > CANVAS_HEIGHT) {
            enemyTanks.splice(i, 1);
            lives--;
            
            // 检查游戏是否结束
            if (lives <= 0) {
                gameOver = true;
                alert('游戏结束！你的得分：' + score);
            }
        }
    }
}

// 检测碰撞
function detectCollisions() {
    // 检测子弹与敌人的碰撞
    for (let i = bullets.length - 1; i >= 0; i--) {
        const bullet = bullets[i];
        
        for (let j = enemyTanks.length - 1; j >= 0; j--) {
            const enemy = enemyTanks[j];
            
            if (isColliding(bullet, enemy)) {
                bullets.splice(i, 1);
                enemyTanks.splice(j, 1);
                score++;
                break;
            }
        }
    }
    
    // 检测敌人与玩家的碰撞
    for (let i = enemyTanks.length - 1; i >= 0; i--) {
        const enemy = enemyTanks[i];
        
        if (isColliding(enemy, playerTank)) {
            enemyTanks.splice(i, 1);
            lives--;
            
            if (lives <= 0) {
                gameOver = true;
                alert('游戏结束！你的得分：' + score);
            }
        }
    }
    
    // 检测坦克与障碍物的碰撞
    // 这里可以添加障碍物碰撞检测逻辑
}

// 检查两个矩形是否碰撞
function isColliding(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
}

// 绘制坦克
function drawTank(ctx, tank, color) {
    ctx.fillStyle = color;
    ctx.fillRect(tank.x, tank.y, tank.width, tank.height);
    
    // 绘制炮管
    ctx.fillStyle = 'black';
    switch (tank.direction) {
        case 'up':
            ctx.fillRect(tank.x + tank.width / 2 - 2, tank.y - 10, 4, 10);
            break;
        case 'down':
            ctx.fillRect(tank.x + tank.width / 2 - 2, tank.y + tank.height, 4, 10);
            break;
        case 'left':
            ctx.fillRect(tank.x - 10, tank.y + tank.height / 2 - 2, 10, 4);
            break;
        case 'right':
            ctx.fillRect(tank.x + tank.width, tank.y + tank.height / 2 - 2, 10, 4);
            break;
    }
}

// 绘制子弹
function drawBullets(ctx) {
    ctx.fillStyle = 'red';
    bullets.forEach(bullet => {
        ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
    });
}

// 绘制敌人坦克
function drawEnemyTanks(ctx) {
    enemyTanks.forEach(enemy => {
        drawTank(ctx, enemy, 'red');
    });
}

// 绘制障碍物
function drawObstacles(ctx) {
    ctx.fillStyle = 'gray';
    obstacles.forEach(obstacle => {
        ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
    });
}

// 更新游戏信息
function updateGameInfo() {
    document.getElementById('score').textContent = score;
    document.getElementById('lives').textContent = lives;
}

// 键盘事件处理
function handleKeyDown(e) {
    switch (e.key) {
        case 'w':
            keys.w = true;
            break;
        case 'a':
            keys.a = true;
            break;
        case 's':
            keys.s = true;
            break;
        case 'd':
            keys.d = true;
            break;
        case ' ': // 空格键
            keys.space = true;
            break;
    }
}

function handleKeyUp(e) {
    switch (e.key) {
        case 'w':
            keys.w = false;
            break;
        case 'a':
            keys.a = false;
            break;
        case 's':
            keys.s = false;
            break;
        case 'd':
            keys.d = false;
            break;
        case ' ': // 空格键
            keys.space = false;
            break;
    }
}

// 添加键盘事件监听器
document.addEventListener('keydown', handleKeyDown);
document.addEventListener('keyup', handleKeyUp);

// 初始化游戏
window.onload = initGame;