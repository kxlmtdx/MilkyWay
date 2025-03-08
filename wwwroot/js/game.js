const config = {
    type: Phaser.AUTO,
    width: window.innerWidth, // Ширина окна браузера
    height: window.innerHeight - 60, // Высота окна браузера минус высота навбара
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    scale: {
        mode: Phaser.Scale.RESIZE, // Динамическое изменение размеров
        autoCenter: Phaser.Scale.CENTER_BOTH,
        parent: 'game-container', // Родительский элемент
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

const game = new Phaser.Game(config);

let ship;
let cursors;
let asteroids;
let fuel;
let score = 0;
let scoreText;
let gameOver = false;
let target = { x: 400, y: 500 };

function preload() {
    this.load.image('ship', 'assets/123123323.jpg');
    this.load.image('asteroid', 'assets/asteroid.png');
    this.load.image('fuel', 'assets/fuel.png');
}

function create() {
    // Корабль игрока
    ship = this.physics.add.sprite(this.scale.width * 0.5, this.scale.height * 0.8, 'ship');
    ship.setCollideWorldBounds(true);

    // Управление мышью
    this.input.on('pointermove', (pointer) => {
        target.x = pointer.x;
        target.y = pointer.y;
    });

    // Астероиды
    asteroids = this.physics.add.group();
    createAsteroid.call(this);

    // Топливо
    fuel = this.physics.add.group();
    createFuel.call(this);

    // Счет
    scoreText = this.add.text(this.scale.width * 0.02, this.scale.height * 0.02, 'Score: 0', { fontSize: '14px', fill: '#fff' });

    // Обработка изменения размера окна
    this.scale.on('resize', resize, this);
}

function resize(gameSize, baseSize, displaySize, resolution) {
    const width = gameSize.width;
    const height = gameSize.height;

    // Обновление размеров и позиций объектов
    ship.setPosition(width * 0.5, height * 0.8);
    scoreText.setPosition(width * 0.02, height * 0.02);

    // Обновление камеры
    this.cameras.resize(width, height);
}

function createAsteroid() {
    const x = Phaser.Math.Between(0, this.scale.width);
    const asteroid = asteroids.create(x, 0, 'asteroid');
    asteroid.setVelocityY(Phaser.Math.Between(100, 300));
    asteroid.setAngularVelocity(Phaser.Math.Between(-200, 200));
    asteroid.setCollideWorldBounds(true);
    asteroid.setBounce(1);

    this.time.delayedCall(1000, createAsteroid, [], this);
}

function createFuel() {
    const x = Phaser.Math.Between(0, this.scale.width);
    const fuelItem = fuel.create(x, 0, 'fuel');
    fuelItem.setVelocityY(Phaser.Math.Between(100, 200));
    fuelItem.setCollideWorldBounds(true);
    fuelItem.setBounce(1);

    this.time.delayedCall(5000, createFuel, [], this);
}

function update() {
    if (gameOver) return;

    this.physics.moveToObject(ship, target, 200);
}

function hitAsteroid(ship, asteroid) {
    gameOver = true;
    this.physics.pause();
    ship.setTint(0xff0000);
    scoreText.setText('Игра окончена! Счет: ' + score);

    fetch('/api/game/save-score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ score: score })
    });
}

function collectFuel(ship, fuelItem) {
    fuelItem.disableBody(true, true);
    score += 10;
    scoreText.setText('Счет: ' + score);
}