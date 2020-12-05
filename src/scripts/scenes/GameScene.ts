import * as Phaser from "phaser";

const sky = require('../../../public/assets/sky.png');
const ground = require('../../../public/assets/platform.png');
const star = require('../../../public/assets/star.png');
const bomb = require('../../../public/assets/bomb.png');
const dude = require('../../../public/assets/dude.png');
const border = require('../../../public/assets/borders.png');

export default class GameScene extends Phaser.Scene {
    private platforms?: Phaser.Physics.Arcade.StaticGroup;
    private player?: Phaser.Physics.Arcade.Sprite;
    private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;
    private stars?: Phaser.Physics.Arcade.Group;
    private score = 0;
    private scoreText: Phaser.GameObjects.Text;
    private bombs?: Phaser.Physics.Arcade.Group;
    private gameOver = false;
    constructor() {
        super('Game');   
    }

    public preload (): void {
        this.load.image('sky', sky);
        this.load.image('ground', ground);
        this.load.image('star', star);
        this.load.image('bomb', bomb);
        this.load.spritesheet('dude', dude, { frameWidth: 32, frameHeight: 48 });
        this.load.image('shoot', star); 
        this.load.image('border', border);
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
        
        this.scoreText = this.add.text(16, 16, 'Score: 0', { fontSize: '32px', fill: '#000' });
    
        this.bombs = this.physics.add.group();
        this.physics.add.collider(this.bombs, this.platforms);
        this.physics.add.collider(this.player, this.bombs, this.handlerHitBomb, null, this);
    
    })
}
    public update() {
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
    }

    private handleCollectStar (player: Phaser.GameObjects.GameObject, s: Phaser.GameObjects.GameObject) {
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

    private handlerHitBomb (p: Phaser.GameObjects.GameObject, bomb: Phaser.GameObjects.GameObject) {
        this.physics.pause();
        this.player.setTint(0xff0000);
        this.player.anims.play('turn');
        this.gameOver = true;
    }

}