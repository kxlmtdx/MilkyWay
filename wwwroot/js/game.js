const config = {
    type: Phaser.AUTO,
    width: window.innerWidth,
    height: window.innerHeight - 60,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        parent: 'game-container',
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
    this.load.image('ship', 'https://i.imgur.com/KJAHGlr.png');
    this.load.image('asteroid', 'https://i.imgur.com/guFLRFT.png');
    this.load.image('fuel', 'assets/fuel.png');
}

function create() {
    this.cameras.main.setBackgroundColor('#141414');

    ship = this.physics.add.sprite(this.scale.width * 0.5, this.scale.height * 0.8, 'ship');
    ship.setCollideWorldBounds(true);

    this.input.on('pointermove', (pointer) => {
        target.x = pointer.x;
        target.y = pointer.y;
    });

    asteroids = this.physics.add.group();
    createAsteroid.call(this);

    fuel = this.physics.add.group();
    createFuel.call(this);

    scoreText = this.add.text(this.scale.width * 0.02, this.scale.height * 0.02, 'Score: 0', { fontSize: '14px', fill: '#fff' });

    // ьеьеьеь коллайдеры
    this.physics.add.collider(ship, asteroids, hitAsteroid, null, this);
    this.physics.add.overlap(ship, fuel, collectFuel, null, this);

    this.scale.on('resize', resize, this);
}

function resize(gameSize, baseSize, displaySize, resolution) {
    const width = gameSize.width;
    const height = gameSize.height;

    ship.setPosition(width * 0.5, height * 0.8);
    scoreText.setPosition(width * 0.02, height * 0.02);

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

    // Вычисляем угол между кораблем и курсором ААААААААААААА
    const angle = Phaser.Math.RadToDeg(Math.atan2(target.y - ship.y, target.x - ship.x));

    ship.setRotation(Phaser.Math.DegToRad(angle + 90)); // +90 чтобы верхняя грань смотрела на курсор
}

function hitAsteroid(ship, asteroid) {
    if (gameOver) return;

    gameOver = true;
    this.physics.pause();
    ship.setTint(0xff0000);
    scoreText.setText('Иди нахуй! Счет: ' + score);

    fetch('/api/game/save-score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ score: score }) // score — переменная с вашим счетом
    })
        .then(response => response.json())
        .then(data => {
            console.log('Успешно:', data);
            if (data.highScore !== undefined) {
                alert(`Ваш рекорд: ${data.highScore}`);
            }
        })
        .catch(error => {
            console.error('Ошибка:', error);
        });
}

function collectFuel(ship, fuelItem) {
    fuelItem.disableBody(true, true);
    score += 10;
    scoreText.setText('Score: ' + score);
}