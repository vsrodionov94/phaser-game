import * as Phaser from "phaser";

export default class GameScene extends Phaser.Scene {
    private platforms?: Phaser.Physics.Arcade.StaticGroup;
    private player?: Phaser.Physics.Arcade.Sprite;
    private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;
    private stars?: Phaser.Physics.Arcade.Group;
    private score = 0;
    private scoreText?: Phaser.GameObjects.Text;
    private bombs?: Phaser.Physics.Arcade.Group;
    private shoots?: Phaser.Physics.Arcade.Group;
    
    constructor() {
        super('Game');   
    }

    public preload (): void {
        this.load.image('sky', '../../../public/assets/sky.png');
        this.load.image('ground', '../../../public/assets/platform.png');
        this.load.image('star', '../../../public/assets/star.png');
        this.load.image('bomb', '../../../public/assets/bomb.png');
        this.load.spritesheet('dude', '../../../public/assets/dude.png', { frameWidth: 32, frameHeight: 48 });
        this.load.image('shoot', '../../../public/assets/star.png'); 
        this.load.image('border', '../../../public/assets/borders.png');
    }

    public create (): void {
        this.add.image(400, 300, 'sky');

        this.platforms = this.physics.add.staticGroup();
        const ground = this.platforms.create(400, 568, 'ground') as Phaser.Physics.Arcade.Sprite;
        
        ground
            .setScale(2)
            .refreshBody();
        this.platforms.create(600, 400, 'ground');
        this.platforms.create(50, 250, 'ground');
        this.platforms.create(750, 220, 'ground');
        this.platforms.create(-10,0, 'border').setScale(2).refreshBody();
        this.platforms.create(810,0, 'border').setScale(2).refreshBody();

        this.player = this.physics.add.sprite(100, 450, 'dude');
        this.player.setBounce(0.2);
        this.player.setCollideWorldBounds(true);

        this.anims.create({
            key: 'left',
            frames: this.anims.generateFrameNumbers('dude', {start: 0, end: 3}),
            frameRate: 10,
            repeat: -1,
        });
        this.anims.create({
            key: 'turn',
            frames: [{key: 'dude', frame: 4}],
            frameRate: 20,
        });
        this.anims.create({
            key: 'right',
            frames: this.anims.generateFrameNumbers('dude', {start: 5, end: 8}),
            frameRate: 10,
            repeat: -1
        });

        this.cursors = this.input.keyboard.createCursorKeys();

        this.stars = this.physics.add.group({
            key: 'star',
            repeat: 11,
            setXY: {
                x: 12,
                y: 0,
                stepX: 70
            }
        })

        this.stars.children.iterate((child: Phaser.Physics.Arcade.Sprite) => {
            child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));

        this.physics.add.collider(this.player, this.platforms);
        this.physics.add.collider(this.stars, this.platforms)
        this.physics.add.overlap(this.player, this.stars, this.handleCollectStar, null, this);
        
        this.scoreText = this.add.text(16, 16, ' ', { fontSize: '32px', fill: '#000' });
        this.bombs = this.physics.add.group();
        this.physics.add.collider(this.bombs, this.platforms);
        this.physics.add.collider(this.player, this.bombs, this.handlerHitBomb, null, this);

        this.shoots = this.physics.add.group();
        this.physics.add.collider(this.shoots, this.bombs, this.handlerDestroyBomb, null, this);
        this.physics.add.collider(this.shoots, this.platforms, this.handleDestroyShoot, null, this);
    })
}
    public update(): void {
        if (!this.cursors){
            return
        }
        if (this.cursors.left.isDown) {
            this.player.setVelocityX(-160);
            this.player.anims.play('left', true);
        } else if (this.cursors.right.isDown) {
            this.player.setVelocityX(160);
            this.player.anims.play('right', true);
        } else {
            this.player.setVelocityX(0);
            this.player.anims.play('turn');
        }
    
        if (this.cursors.up.isDown && this.player.body.touching.down) {
            this.player.setVelocityY(-330);
        }

        if (this.cursors.space.isDown && this.score > 0 && !this.shoots.countActive(true) ) {
            const shoot:Phaser.Physics.Arcade.Sprite = this.shoots.create(this.player.x, this.player.y, 'shoot').setScale(0.5);
            if (this.cursors.left.isDown) {
                shoot.setGravityY(500);
                shoot.setVelocityX(-800);
            } else if (this.cursors.right.isDown) {
                shoot.setVelocityX(800);
                shoot.setGravityY(500);
            } else {
                shoot.setVelocityY(-800);
                shoot.setGravityY(500);
            }
                this.score -= 1;
                this.scoreText.setText('Score: ' + this.score);
            }
    }

    private handleCollectStar(player: Phaser.GameObjects.GameObject, s: Phaser.GameObjects.GameObject): void {
        const star = s as Phaser.Physics.Arcade.Sprite;
        star.disableBody(true, true);

        this.score += 10;
        this.scoreText.setText('Score:' + this.score);

        if (this.stars.countActive(true) === 0) {
            this.stars.children.iterate((child: Phaser.Physics.Arcade.Sprite) => {
                child.enableBody(true, child.x, 0, true, true);
            });
            if (this.player){
                const x = (this.player.x < 400) 
                ? Phaser.Math.Between(400, 800) 
                : Phaser.Math.Between(0, 400);

                const bomb = this.bombs.create(x, 16, 'bomb');
                bomb.setBounce(1);
                bomb.setCollideWorldBounds(true);
                bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
            }
        }
    }

    private handlerHitBomb (p: Phaser.GameObjects.GameObject, bomb: Phaser.GameObjects.GameObject): void {
        this.physics.pause();
        this.player.setTint(0xff0000);
        this.player.anims.play('turn');
        this.scene.start('Start');
    }

    private handlerDestroyBomb (shoot: Phaser.GameObjects.GameObject, b: Phaser.GameObjects.GameObject): void {
        const bomb = b as Phaser.Physics.Arcade.Sprite;
        bomb.disableBody(true, true);
    }

    private handleDestroyShoot(s: Phaser.GameObjects.GameObject, platforms: Phaser.GameObjects.GameObject): void {
        const shoot = s as Phaser.Physics.Arcade.Sprite;
        shoot.destroy();
    }

}