/*
    ProteinMolecule class
*/

function ProteinMolecule(game, x, y) {
    Phaser.Sprite.call(this, game, x, y, 'protein');

    game.physics.enable(this, Phaser.Physics.ARCADE);

    this.proteinValue = 15;

    this.body.gravity.y = 0;
    this.body.bounce.x = 1.0;
    this.body.bounce.y = 1.0;
    this.body.collideWorldBounds = true;
    this.body.velocity.x = 100 * Math.random();
    this.body.velocity.y = 100 * Math.random();
    this.animations.add('idle');
    this.animations.play('idle', 10, true);
    this.body.height = 38;
    this.body.width = 38;
    
    this.alive = true;

    this.body.height = 0;
    this.body.width = 0;
};

ProteinMolecule.prototype = Object.create(Phaser.Sprite.prototype);
ProteinMolecule.prototype.constructor = ProteinMolecule;

ProteinMolecule.prototype.updateProtein = function() {
    if(this.body.width ) {
        this.body.width += 1;
        this.body.height += 1;
    }
};


