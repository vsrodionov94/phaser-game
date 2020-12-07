import * as Phaser from "phaser";

enum Texts {
    Title = 'Phaser 3 TestGame',
    Button = 'Click here to start'
}

enum Styles {
    Color = '#333333',
    Font = 'Arial'
}

const keys = require('../../../public/assets/keys.png');
export class StartScene extends Phaser.Scene {
    private title: Phaser.GameObjects.Text;
    private text: Phaser.GameObjects.Text;
    constructor() {
        super('Start');
    }

    public preload (): void {
        this.load.image('keys', keys);
    }
     
    public create(): void {
        this.add.image(
            this.cameras.main.centerX,
            this.cameras.main.centerY -50, 
            'keys')
            .setScale(0.3);


        this.title = this.add.text(
            this.cameras.main.centerX,
            this.cameras.main.centerY - 200,
            Texts.Title,
            {font: `52px ${Styles.Font}`, fill: Styles.Color})
        .setOrigin(0.5);      

        this.text = this.add.text(
            this.cameras.main.centerX,
            this.cameras.main.centerY + 100,
            Texts.Button,
            {font: `28px ${Styles.Font}`, fill: Styles.Color})
        .setOrigin(0.5);

        this.text.setInteractive();
        this.text.on('pointerdown', () => {
            this.scene.start('Game')
        });
    }
 }