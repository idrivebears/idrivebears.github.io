/*
    WhiteBloodCell class
*/

var WB_STATES = {
    BORN : {value: 0, name: "BORN"},
    SEARCH_SICKNESS : {value: 1, name: "SEARCH_SICKNESS"},
    KILL_MODE : {value: 2, name: "KILL_MODE"}
};

function WhiteBloodCell(game, x, y, sicknessIndicator) {
    Phaser.Sprite.call(this, game, x, y, 'whitebloodcell');
    this.x = x;
    this.y = y;
    this.sicknessIndicator = sicknessIndicator;
    this.currentState = WB_STATES.BORN;

    this.isKilling = false;
    this.secondsInKillMode = 5;

    this.animations.add('');

    game.physics.enable(this, Phaser.Physics.ARCADE);

    this.body.gravity.y = 0;
    this.body.bounce.x = 0.7;
    this.body.bounce.y = 0.7;
    this.body.collideWorldBounds = true;
    this.body.velocity.x = 100 * Math.random();
    this.body.velocity.y = 100 * Math.random();
    this.animations.add('idle', [0,1,2,3,4,5,6],10,true);
    this.animations.add('attack', [7,8,9,10,11,12,13],10,false);
    this.animations.play('idle');
    this.body.setSize(20,34, 23,10);
    this.alive = true;
    this.isSelected = true;

    this.inputEnabled = true;
    this.input.useHandCursor = true;

    this.events.onAnimationComplete.add(function() {
        this.animations.play('idle'); 
    }, this);

    style = {font: "18px Arial", fill: "#ffffff", wordWrap: true, wordWrapWidth: this.width, align: "center" };
    this.text = game.add.text(this.x-15, this.y-15, "", style);
    this.text.setShadow(3, 3, 'rgba(0,0,0,0.5)', 5);
    this.text.visible = false;

    this.events.onInputDown.add(this.onDown, this);
};

WhiteBloodCell.prototype = Object.create(Phaser.Sprite.prototype);
WhiteBloodCell.prototype.constructor = WhiteBloodCell;

WhiteBloodCell.prototype.moveCell = function() {

};

WhiteBloodCell.prototype.onDown = function(whiteBloodCell, cursor) {
    this.isSelected = !this.isSelected;
};

WhiteBloodCell.prototype.updateCell = function() {
    this.moveCell();

    // Show text if selected
    if(this.isSelected) {
        this.text.visible = true;
        this.text.x = this.body.x-105;
        this.text.y = this.body.y-30;
        this.text.text = "CurrentState:"+this.currentState.name;
    }
    else {
        this.text.visible=false;
    }

    if(this.currentState == WB_STATES.BORN) {
        // do born animation


        this.currentState = WB_STATES.SEARCH_SICKNESS;
    }

    else if(this.currentState == WB_STATES.SEARCH_SICKNESS) {
        if(this.isKilling == true) {
            this.currentState = WB_STATES.KILL_MODE;
        }

        this.tint = 0xF3C2FF;

    }

    else if(this.currentState == WB_STATES.KILL_MODE) {
        if(this.isKilling == false) {
            this.currentState = WB_STATES.SEARCH_SICKNESS;
            this.secondsInKillMode = 8;
        }
        this.tint = 0xF123D1;
    }

};

WhiteBloodCell.prototype.secondElapsed = function() {
    if(this.game.rnd.integerInRange(0,100)%2 === 0) {
        this.body.velocity.y = this.body.velocity.y + this.game.rnd.integerInRange(-20, 20);
        this.body.velocity.x = this.body.velocity.x + this.game.rnd.integerInRange(-20, 20);
    }

    if(this.currentState == WB_STATES.KILL_MODE) {
        this.secondsInKillMode--;
        if(this.secondsInKillMode == 0) {
            this.isKilling = false;
        }
    }
};

WhiteBloodCell.prototype.checkCollidedCell = function(commonCell) {
    this.animations.play('attack');

    if(commonCell.currentState == CC_STATES.DEATH) {
        //commonCell.kill();
    }

    else {
        // If the cell has already been tagged, mark its death
        if(this.isKilling == true && commonCell.isInfected == true) {
            commonCell.wasKilled = true;
            commonCell.currentState = CC_STATES.DEATH;
            return true;
        }
        // Tag the cell as infected on the first run
        else {
            for(var i = 0; i < this.sicknessIndicator.length; i++) {
                if(commonCell.DNA.indexOf(this.sicknessIndicator[i]) !== -1) {
                    console.log("Found infected cell with character: " + this.sicknessIndicator[i]);
                    commonCell.isInfected = true;

                    this.isKilling = true;
                }
            }
        }
    }
    return false;
};
