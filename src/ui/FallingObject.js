import Phaser from 'phaser';

export default class FallingObject extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, texture, config) {
        super(scene, x, y, texture);
        this.scene = scene;
        this.speed = config.speed;
        this.rotationVal = config.rotation;

        // Enable physics for this object
        this.scene.physics.world.enable(this);
        this.setActive(false);
        this.setVisible(false);
    }

    spawn(positionX) {
        // Set the position for the enemy object at the top of the screen
        this.setPosition(positionX, -10); // Spawn slightly off the top of the screen
        this.setVelocityY(this.speed);    // Set the speed for falling

        // Make the object active and visible
        this.setActive(true);
        this.setVisible(true);
    }

    die() {
        // Destroy the object when it goes off-screen
        this.setActive(false);
        this.setVisible(false);
        this.destroy();  // Clean up memory by destroying the sprite
    }

    update(time, delta) {
        // Apply rotation and update position for falling object
        this.rotation += this.rotationVal;

        // If the object goes off the bottom of the screen, destroy it
        if (this.y > this.scene.scale.height + 5) {
            this.die();
        }
    }
}
