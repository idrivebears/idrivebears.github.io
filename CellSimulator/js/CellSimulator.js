/*
    Project todo list:
    -Add animations for killing cells
    -Add all other animations pretty much
    -Make infected cells stand out more, maybe increase their size
    -Make start screen
    -Improve UI
*/

var DEBUG = false;

var SimulatorState = function(game) {
    this.commonCells = null;
    this.whiteBloodCells = null;
    this.proteins = null;

    this.proteinsPerSecond = 5;
    this.maxProteins = 25;

    this.displayText = null;

    this.cellsEliminated = 0;
};

SimulatorState.prototype.preload = function() {
    //this.game.load.audio('eat', 'assets/audio/eat.mp3');
    //this.game.load.audio('kill', 'assets/audio/kill.mp3');
    //this.game.load.audio('mate', 'assets/audio/mate.mp3');
    this.game.load.image('background', 'assets/bg.png');
    this.game.load.image('ui', 'assets/ui.png');
    this.game.load.spritesheet('commoncell', 'assets/CommonCell2_Sprite.png', 64, 64);
    this.game.load.spritesheet('protein', 'assets/protein.png', 64 ,64);
    this.game.load.spritesheet('whitebloodcell', 'assets/WhiteBloodCell_Sprite4.png', 64, 64);
};

SimulatorState.prototype.create = function() {

    // Enable aracde physics for game
    this.game.physics.startSystem(Phaser.Physics.ARCADE);

    // Set background to trippy ass dank ass cell type thing
    background = this.game.add.sprite(0, 0, 'background');

    // Create initial common cells
    var startingCells = 30;
    var startingSeed = "ab";

    this.proteins = this.game.add.group();
    this.proteins.enableBody = true;

    this.commonCells = this.game.add.group();
    this.commonCells.enableBody = true;        //  Enable physics for any cell in the group

    for(var i = 0; i < startingCells; i++) {
        var randx = this.game.rnd.integerInRange(0, this.game.width);
        var randy = this.game.rnd.integerInRange(0, this.game.height);
        var testCell = new CommonCell(this.game, randx, randy, "a", "b");

        testCell.onKilled = this.commonCells.add(testCell);
    }

    // Create initial white blood cells
    startingCells = 4;
    var sicknessIndicator = ['z', 'r', 'h', 'f'];

    this.whiteBloodCells = this.game.add.group();
    this.commonCells.enableBody = true;

    for(var i = 0; i < startingCells; i++) {
        var randx = this.game.rnd.integerInRange(0, this.game.width);
        var randy = this.game.rnd.integerInRange(0, this.game.height);
        var testWhiteBloodCell = new WhiteBloodCell(this.game, randx, randy, sicknessIndicator);
        this.whiteBloodCells.add(testWhiteBloodCell);
    }

    this.displayText = this.game.add.text(20,20, 'Game data: ', {fontSize:'20px', fill:'#fff'});
    this.displayText.setShadow(3, 3, 'rgba(0,0,0,0.5)', 5);

    //setting 1s tick
    console.log("Setting 1s tick");
    this.game.time.events.add(Phaser.Timer.SECOND * 1, this.onSecondElapsed, this);


};

SimulatorState.prototype.update = function() {

    //Add collision between cells and other cells
    //this.game.physics.arcade.collide(this.commonCells, this.commonCells);
    //this.game.physics.arcade.collide(this.commonCells, this.whiteBloodCells);
    // Set collisions between white blood cells and themselves
    this.game.physics.arcade.collide(this.whiteBloodCells, this.whiteBloodCells);
    // Set collisions between common cells and white blood cells, handled by specific events
    this.game.physics.arcade.overlap(this.commonCells, this.whiteBloodCells, this.whiteBloodCellCollision, null, this);
    // Set collisions between common cells and proteins, handled by specific event
    this.game.physics.arcade.overlap(this.commonCells, this.proteins, this.proteinCollision, null, this);
    // Set collisions between common cells and themselves
    this.game.physics.arcade.overlap(this.commonCells, this.commonCells, this.commonCellCollision, null, this);

    //Call cell update function
    this.commonCells.forEachAlive(function(cell){
        cell.updateCell();
    }, this);

    //Call white blood cell update function
    this.whiteBloodCells.forEachAlive(function(whiteBloodCell){
        whiteBloodCell.updateCell();
    }, this);

    //Call white blood cell update function
    this.proteins.forEachAlive(function(protein){
        protein.updateProtein();
    }, this);
};

SimulatorState.prototype.render = function() {

    if(DEBUG) {
        this.commonCells.forEachAlive(function(cell){
            this.game.debug.body(cell);
        },this);
        this.whiteBloodCells.forEachAlive(function(whiteBloodCell){
            this.game.debug.body(whiteBloodCell);
        },this);
        this.proteins.forEachAlive(function(protein){
            this.game.debug.body(protein);
        },this);
    }


};

SimulatorState.prototype.whiteBloodCellCollision = function(commonCell, whiteBloodCell) {
    if(whiteBloodCell.checkCollidedCell(commonCell)) {
        this.cellsEliminated += 1;

    }
};

SimulatorState.prototype.proteinCollision = function(commonCell, protein) {
    commonCell.checkCollidedProtein(protein);
};

SimulatorState.prototype.commonCellCollision = function(commonCell1, commonCell2) {
    commonCell1.checkCommonCellCollision(commonCell2);

};

SimulatorState.prototype.onSecondElapsed = function() {
    console.log("tick tick tick");

    this.commonCells.forEachAlive(function(cell){
        cell.secondElapsed();
    }, this);

    this.whiteBloodCells.forEachAlive(function(whiteBloodCell){
        whiteBloodCell.secondElapsed();
    }, this);

    //Generate random food every second

    if(this.proteins.countLiving() < this.maxProteins) {
        for(var i = 0; i < this.proteinsPerSecond ; i++)
        {
            var randx = this.game.rnd.integerInRange(0, this.game.width);
            var randy = this.game.rnd.integerInRange(0, this.game.height);
            var tempProtein = new ProteinMolecule(this.game, randx, randy);
            this.proteins.add(tempProtein);
        }
    }
    else {
        console.log("Max food reached");
    }

    this.displayText.text = "Game data \nTotal cells alive: " + this.commonCells.countLiving() +"\nCells Eliminated: "+this.cellsEliminated;
    this.game.time.events.add(Phaser.Timer.SECOND * 1, this.onSecondElapsed, this);
};



//Create new game with the simulator starting state
var game = new Phaser.Game(1280, 600, Phaser.AUTO, 'game');
game.state.add('simulator', SimulatorState, true);
