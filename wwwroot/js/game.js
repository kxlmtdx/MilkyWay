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
let highScore = 0;
let scoreDisplay;
let gameOver = false;
let target = { x: 400, y: 500 };

const restartButton = document.getElementById('restart-button');

function preload() {
    this.load.image('ship', 'https://i.imgur.com/TyESJam.png');
    this.load.image('asteroid', 'https://i.imgur.com/bLsLDqP.png');
    this.load.image('fuel', 'https://i.imgur.com/UPdZZJa.png');
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

    scoreDisplay = document.querySelector('h5[name="selfscore"]');
    updateScoreDisplay();

    this.physics.add.collider(ship, asteroids, hitAsteroid, null, this);
    this.physics.add.overlap(ship, fuel, collectFuel, null, this);

    this.scale.on('resize', resize, this);

    fetchHighScore();
}

function resize(gameSize, baseSize, displaySize, resolution) {
    const width = gameSize.width;
    const height = gameSize.height;

    ship.setPosition(width * 0.5, height * 0.8);
    if (scoreDisplay) {
        scoreDisplay.style.textAlign = 'center';
    }
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

    const angle = Phaser.Math.RadToDeg(Math.atan2(target.y - ship.y, target.x - ship.x));
    ship.setRotation(Phaser.Math.DegToRad(angle + 90));
}

function updateScoreDisplay() {
    if (scoreDisplay) {
        if (highScore > 0) {
            scoreDisplay.textContent = `Score: ${score} High Score: ${highScore}`;
        } else {
            scoreDisplay.textContent = `Score: ${score}`;
        }
    }
}

async function fetchHighScore() {
    try {
        const response = await fetch('/api/game/get-high-score');
        const data = await response.json();
        highScore = data.highScore || 0;
        updateScoreDisplay();
    } catch (error) {
        console.error('Ошибка при получении рекорда:', error);
    }
}

function collectFuel(ship, fuelItem) {
    fuelItem.disableBody(true, true);
    score += 10;
    updateScoreDisplay();
}

function hitAsteroid(ship, asteroid) {
    if (gameOver) return;

    gameOver = true;
    this.physics.pause();
    ship.setTint(0xff0000);
    updateScoreDisplay();

    restartButton.style.display = 'block';

    fetch('/api/game/save-score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ score: score })
    })
        .then(response => response.json())
        .then(data => {
            console.log('Успешно:', data);
            if (data.highScore !== undefined) {
                highScore = data.highScore;
                updateScoreDisplay();
            }
        })
        .catch(error => {
            console.error('Ошибка:', error);
        });
}

restartButton.addEventListener('click', () => {
    restartButton.style.display = 'none';
    gameOver = false;
    score = 0;
    updateScoreDisplay();
    game.scene.getScene('default').scene.restart();
});