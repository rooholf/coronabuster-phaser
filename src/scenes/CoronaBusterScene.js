import Phaser from "phaser";
import FallingObject from "../ui/FallingObject"; // Import kelas dari file terkait
import Laser from "../ui/Laser";

export default class CoronaBusterScene extends Phaser.Scene {
    constructor() {
        super("corona-buster-scene");
    }

    init() {
        // Inisialisasi variabel yang digunakan di seluruh scene
        this.clouds = undefined;
        this.nav_left = false;
        this.nav_right = false;
        this.shoot = false;
        this.player = undefined;
        this.speed = 100;
        this.enemies = undefined;
        this.enemySpeed = 50;
        this.lasers = undefined;
        this.lastFired = 10;
        this.scoreLabel = undefined;
        this.score = 0;
        // Menambahkan properti untuk kehidupan dan label kehidupan
        this.life = 3;  // Jumlah life
        this.lifeLabel = undefined;  // Label untuk menampilkan kehidupan
    }

    preload() {
        // Memuat aset game
        this.load.image("background", "assets/bg_layer1.png");
        this.load.image("cloud", "assets/cloud.png");
        this.load.image("left-btn", "assets/left-btn.png");
        this.load.image("right-btn", "assets/right-btn.png");
        this.load.image("shoot-btn", "assets/shoot-btn.png");
        this.load.spritesheet("player", "assets/ship.png", {
            frameWidth: 66,
            frameHeight: 66,
        });
        this.load.image("enemy", "assets/enemy.png");
        this.load.spritesheet("laser", "assets/laser-bolts.png", {
            frameWidth: 16,
            frameHeight: 16,
        });
    }

    create() {
        // Menambahkan latar belakang
        const gameWidth = this.scale.width * 0.5;
        const gameHeight = this.scale.height * 0.5;
        this.add.image(gameWidth, gameHeight, "background");

        // Membuat grup awan dengan fisika
        this.clouds = this.physics.add.group({
            key: "cloud",
            repeat: 10,
        });

        // Menempatkan awan secara acak dalam area dunia fisika
        Phaser.Actions.RandomRectangle(
            this.clouds.getChildren(),
            this.physics.world.bounds
        );

        // Membuat tombol navigasi
        this.createButton();

        // Membuat pemain
        this.player = this.createPlayer();

        this.enemies = this.physics.add.group({
            classType: FallingObject,
            maxSize: 10,  //-----> banyaknya enemy dalam satu grup
            runChildUpdate: true,
        });

        this.time.addEvent({
            delay: Phaser.Math.Between(500, 2000), //--------> Delay random  rentang 1-5 detik
            callback: this.spawnEnemy,
            callbackScope: this,        //--------------------> Memanggil method bernama spawnEnemy
            loop: true,
        });

        this.lasers = this.physics.add.group({
            classType: Laser,
            maxSize: 10,
            runChildUpdate: true,
        });
        // Mendaftarkan overlap antara laser dan musuh
        this.physics.add.overlap(this.lasers, this.enemies, this.hitEnemy, null, this);

        this.scoreLabel = this.add
            .text(10, 10, "Score", {
                fontSize: "16px",
                fill: "black",
                backgroundColor: "white",
            })
            .setDepth(1);

        this.lifeLabel = this.add
            .text(10, 30, "Life", {
                fontSize: "16px",
                fill: "black",
                backgroundColor: "white",
            })
            .setDepth(1);


        this.physics.add.overlap(
            this.player,
            this.enemies,
            this.decreaseLife,
            null,
            this
        );
    }

    update(time) {
        // Mengatur kecepatan dan animasi awan
        this.clouds.children.iterate((child) => {
            child.setVelocityY(20); // Awan bergerak ke bawah
            if (child.y > this.scale.height) {
                // Jika awan keluar dari layar, kembalikan ke atas dengan posisi acak
                child.x = Phaser.Math.Between(10, this.scale.width - 10);
                child.y = 0;
            }
        });

        // Menggerakkan pemain
        this.movePlayer(this.player, time);

        this.scoreLabel.setText("Score : " + this.score);
        this.lifeLabel.setText("Life : " + this.life);
    }

    createButton() {
        // Menambahkan pointer tambahan
        this.input.addPointer(3);

        // Membuat tombol-tombol dengan interaksi
        let shoot = this.add
            .image(320, 550, "shoot-btn")
            .setInteractive()
            .setDepth(0.5)
            .setAlpha(0.8);

        let nav_left = this.add
            .image(50, 550, "left-btn")
            .setInteractive()
            .setDepth(0.5)
            .setAlpha(0.8);

        let nav_right = this.add
            .image(nav_left.x + nav_left.displayWidth + 20, 550, "right-btn")
            .setInteractive()
            .setDepth(0.5)
            .setAlpha(0.8);

        // Mengatur event untuk tombol kiri
        nav_left.on("pointerdown", () => {
            this.nav_left = true;
        });
        nav_left.on("pointerup", () => {
            this.nav_left = false;
        });

        // Mengatur event untuk tombol kanan
        nav_right.on("pointerdown", () => {
            this.nav_right = true;
        });
        nav_right.on("pointerup", () => {
            this.nav_right = false;
        });

        // Mengatur event untuk tombol tembak
        shoot.on("pointerdown", () => {
            this.shoot = true;
        });
        shoot.on("pointerup", () => {
            this.shoot = false;
        });
    }

    createPlayer() {
        // Membuat sprite pemain dan mengatur batas dunia
        const player = this.physics.add.sprite(200, 450, "player");
        player.setCollideWorldBounds(true);

        // Membuat animasi pemain
        this.anims.create({
            key: "turn",
            frames: [{ key: "player", frame: 0 }],
        });
        this.anims.create({
            key: "left",
            frames: this.anims.generateFrameNumbers("player", { start: 1, end: 2 }),
        });
        this.anims.create({
            key: "right",
            frames: this.anims.generateFrameNumbers("player", { start: 1, end: 2 }),
        });

        return player;
    }

    movePlayer(player, time) {
        // Menggerakkan pemain ke kiri, kanan, atau berhenti
        if (this.nav_left) {
            player.setVelocityX(-this.speed);
            player.anims.play("left", true);
            player.setFlipX(false);
        } else if (this.nav_right) {
            player.setVelocityX(this.speed);
            player.anims.play("right", true);
            player.setFlipX(true);
        } else {
            player.setVelocityX(0);
            player.anims.play("turn");
        }

        //above there’s codes for moving player
        if (this.shoot && time > this.lastFired) {
            const laser = this.lasers.get(0, 0, "laser");
            if (laser) {
                laser.fire(this.player.x, this.player.y);
                this.lastFired = time + 150;
            }
        }
    }

    spawnEnemy() {
        const config = {
            speed: 30,       //-----------> Mengatur kecepatan dan besar rotasi dari enemy
            rotation: 0.1
        };
        // @ts-ignore
        const enemy = this.enemies.get(0, 0, 'enemy', config);
        const positionX = Phaser.Math.Between(50, 350); //-----> Mengambil angka acak dari 50-350
        if (enemy) {
            enemy.spawn(positionX);   //--------------> Memanggil method spawn dengan parameter nilai posisi sumbux
        }
    }

    hitEnemy(laser, enemy) {
        laser.die()           //--------> Laser dan enemy dihancurkan 
        enemy.die()
        this.score += 10;
    }

    decreaseLife(player, enemy) {
        enemy.die();
        this.life--;
        if (this.life == 2) {
            player.setTint(0xff0000);
        } else if (this.life == 1) {
            player.setTint(0xff0000).setAlpha(0.2);
        } else if (this.life == 0) {
            this.scene.start("over-scene", { score: this.score });
        }
    }
}
