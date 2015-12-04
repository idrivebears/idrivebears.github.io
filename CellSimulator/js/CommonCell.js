/*
    CommonCell class
*/

var CC_STATES = {
    BORN : {value: 0, name: "BORN"},
    SEARCH_FOOD : {value: 1, name: "SEARCH_FOOD"},
    SEARCH_MATE : {value: 3, name: "SEARCH_MATE"},
    MATING : {value: 4, name: "MATING"},
    DEATH: {value: 5, name:"DEATH"}
};

function CommonCell(game, x, y, parentDNA1, parentDNA2) {
    Phaser.Sprite.call(this, game, x, y, 'commoncell');
    this.game = game;
    this.DNA = parentDNA1 + parentDNA2;

    this.ALPHABET = "abcdefghijklmnopqrstuvwxyz";

    // Mutate DNA on creation
    this.DNA = this.mutateDna();
    this.isInfected = false;

    if(this.DNA != parentDNA1+parentDNA2) {
        //this.isInfected = true;
        this.tint = 0xD0FF12;
    }


    this.currentState = CC_STATES.BORN;

    game.physics.enable(this, Phaser.Physics.ARCADE);

    // How hungry the cell is, if it gets to 100, the cell dies.
    this.hunger = 30;

    this.isMated = false;
    this.isAvailable = true;
    this.isMatingFinished = false;
    this.partner = null;
    this.matingTime = 8; //in secs

    this.wasKilled = false;

    this.isSelected = false;
    this.selectionRectangle = game.add.graphics(this.body.x, this.body.y);

    this.body.gravity.y = 0;
    this.body.bounce.x = 1.0;
    this.body.bounce.y = 1.0;
    this.body.collideWorldBounds = true;
    this.body.velocity.x = Math.random() * 100;
    this.body.velocity.y = Math.random() * 100;
    this.animations.add('idle');
    this.animations.play('idle', 10, true);

    this.MAX_HEIGHT = 64;
    this.MAX_WIDTH = 64;

    this.body.setSize(32,32, 15, 15);

    this.height = 1;
    this.width = 1;


    this.alive = true;
    this.inputEnabled = true;
    this.input.useHandCursor = true;
    this.events.onInputDown.add(this.onDown, this);

    this.events.onKilled.add(this.handleDeath, this);

    //this.inputEnabled = true;


    style = {font: "18px Arial", fill: "#ffffff", wordWrap: true, wordWrapWidth: this.width, align: "center" };
    this.text = game.add.text(this.x-15, this.y-15, "DNA:"+this.DNA, style);
    this.text.setShadow(3, 3, 'rgba(0,0,0,0.5)', 5);
    this.text.visible = false;
};

CommonCell.prototype = Object.create(Phaser.Sprite.prototype);
CommonCell.prototype.constructor = CommonCell;


CommonCell.prototype.onDown=function(cell, cursor) {
    this.isSelected = !this.isSelected;
};

CommonCell.prototype.moveCell = function() {

};

CommonCell.prototype.handleDeath = function() {
    cells = this.game.world.children[2];

    if(this.wasKilled == false) {
        var tempCell = new CommonCell(this.game, this.x-5, this.y-5, this.DNA,  this.DNA);
        cells.add(tempCell);

        tempCell = new CommonCell(this.game, this.x+5, this.y+5, this.DNA, this.DNA);
        cells.add(tempCell);
    }
    this.isSelected = false;
    this.text.visible=false;

};

CommonCell.prototype.updateCell = function() {
    this.moveCell();

    //game.debug.renderPhysicsBody(this.body);
    if(this.isSelected) {
        this.text.visible = true;
        this.text.x = this.body.x-105;
        this.text.y = this.body.y-55;
        this.text.text = "DNA:"+this.DNA+"\n"+"CurrentState:"+this.currentState.name;
    }
    else {
        this.text.visible=false;
    }


    // Update cell states
    //BORN STATE
    if(this.currentState == CC_STATES.BORN) {

        // set animation
        this.width += 1;
        this.height += 1;

        if(this.width == this.MAX_WIDTH || this.height == this.MAX_HEIGHT) {
            this.currentState = CC_STATES.SEARCH_FOOD;
        }

    }
    //SEARCHING FOR FOOD STATE
    else if(this.currentState == CC_STATES.SEARCH_FOOD) {
        if(this.hunger <= 1) {
            this.currentState = CC_STATES.SEARCH_MATE;
        }
        if(this.hunger >= 100) {
            this.currentState = CC_STATES.DEATH;
            this.wasKilled = true;
        }
        this.resizeCell(64,64);
        this.tint = 0x93E68A;
    }
    //SEARCHING FOR MATE <3
    else if(this.currentState == CC_STATES.SEARCH_MATE) {
        if(this.hunger >= 40) {
            this.currentState = CC_STATES.SEARCH_FOOD;
        }
        if(this.isMated == true) {
            this.currentState = CC_STATES.MATING;
        }
        this.tint = 0xFF7AEB;
    }
    //MATING STATE
    else if(this.currentState == CC_STATES.MATING) {
        this.body.velocity.x = 0;
        this.body.velocity.y = 0;

        if(this.isMatingFinished == true) {
            this.currentState = CC_STATES.DEATH;
        }

        this.tint = 0xD9020D;
    }
    //DEATH STATE
    else if(this.currentState == CC_STATES.DEATH) {
        // set death animation
        this.width -= 1;
        this.height -= 1;

        if(this.width == 0 || this.height == 0) {
            this.kill();
        }

        this.tint = 0x3D4D52;
    }

    if(this.isInfected == true) {
        // Set cells tint to sick
        this.tint = 0xB3FF30;
    }


};

CommonCell.prototype.checkCommonCellCollision = function(commonCell) {
    if(this === commonCell){
        return;
    }
    if(this.currentState == CC_STATES.SEARCH_MATE && this.isMated == false &&commonCell.isMated == false && commonCell.currentState == CC_STATES.SEARCH_MATE) {
        this.isMated = true;
        this.partner = commonCell;
        commonCell.isMated = true;
    }
};

CommonCell.prototype.secondElapsed = function() {
    if(this.matingTime == 0) {
        this.isMatingFinished = true;
    }
    if(this.isMated == true) {
        this.matingTime--;
    }

    this.hunger += 2;

    if(this.game.rnd.integerInRange(0,100)%2 === 0) {
        this.body.velocity.y = this.body.velocity.y + this.game.rnd.integerInRange(-10, 10);
        this.body.velocity.x = this.body.velocity.x + this.game.rnd.integerInRange(-10, 10);
    }
};

CommonCell.prototype.mutateDna = function() {
    var result = "";
    for (var i = 0; i < this.DNA.length; i++)
    {
        if (this.game.rnd.integerInRange(0,50) % 7 == 0)
            result += this.ALPHABET[this.game.rnd.integerInRange(0,this.ALPHABET.length-2)];
        else
            result += this.DNA[i];
    }
    return result;
};

CommonCell.prototype.checkCollidedProtein = function(protein) {
    if(this.currentState == CC_STATES.SEARCH_FOOD) {
        this.hunger -= protein.proteinValue;
        this.resizeCell(this.width+5, this.height+5);
        protein.kill();
    }
};

CommonCell.prototype.resizeCell = function(width, height) {
    this.width = width;
    this.height = height;
    this.body.setSize(this.width/2, this.height/2);
};
