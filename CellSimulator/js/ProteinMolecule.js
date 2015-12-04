/*
    ProteinMolecule class
*/

function ProteinMolecule(game, x, y) {
    Phaser.Sprite.call(this, game, x, y, 'protein');

    game.physics.enable(this, Phaser.Physics.ARCADE);

    this.maxSize = 64;

    this.proteinValue = 15;

    this.body.gravity.y = 0;
    this.body.bounce.x = 1.0;
    this.body.bounce.y = 1.0;
    this.body.collideWorldBounds = true;
    this.body.velocity.x = 100 * Math.random();
    this.body.velocity.y = 100 * Math.random();
    this.animations.add('idle');
    this.animations.play('idle', 10, true);
    
    this.body.setSize(22,22,22,22);

    this.events.onKilled.add(this.handleDeath, this);
    
    this.alive = true;

    this.height = 0;
    this.width = 0;
};

ProteinMolecule.prototype = Object.create(Phaser.Sprite.prototype);
ProteinMolecule.prototype.constructor = ProteinMolecule;

ProteinMolecule.prototype.handleDeath = function() {
    while(this.width > 0) {
        this.width --;
        this.height --;
    }
};

ProteinMolecule.prototype.updateProtein = function() {
    if(this.width < this.maxSize) {
        this.width += 1;
        this.height += 1;
    }
};


