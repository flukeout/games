var game =  {
  score : {
    player1 : 0,
    player2 : 0,
    max : window.Settings.playTo || 2, // First to this number wins
    winner : false,  // Holds the winning paddle object
    loser : false    // Holds the losing paddle object
  },

  physicsStepMS : 1000 / 60 / 2,
  physicsSamplingRatio : 2, // This means 2 times per frame

  terrainLinePercent : 50,  // The percent position between the players, 0 to 100
  minTerrainChange : 5,
  centerX : 0,

  freezeFrames : 0,

  ownGoalCooldownMS: 1000,    // How much to wait before allowign consecutive own goal
  ownGoalCooldownTimerMS : 0, // Keeps track of the cooldown for own goal

  // running - game is playing
  // roundover - round is over (about to reset)
  // gameover - game is over (loser screen)
  // finish - finish it
  // pregame - before a game starts
  // paused - game loop is paused
  // startup - kickstarting the game loop
  // off - ?
  mode : "off",

  goalTimeoutMS: Settings.goalTimeoutMS,
  timeSinceEndzoneHitMS: Settings.goalTimeoutMS,

  boardWidth : 0,
  boardHeight: 0,

  timeBetweenRoundsMS: 2000, // Time between rounds of the game

  powerupManager: null,

  paddles: [],
  balls: [],

  aiManager: null,

  init: function(){
    this.worldEl = document.querySelector(".world");
    this.tiltEl = document.querySelector(".tilt-wrapper");
    this.bodyEl = document.querySelector("body");
    this.surfaceOverlayEl = document.querySelector(".surface .overlay");

    this.messageEl = document.querySelector(".top-message");

    this.spinWallEls = document.querySelectorAll(".spin-wall");

    this.terrainOneEl = document.querySelector(".terrain.one");
    this.terrainTwoEl = document.querySelector(".terrain.two");

    this.goalOneEl = document.querySelector(".goal.one");
    this.goalTwoEl = document.querySelector(".goal.two");

    this.boardWidth = this.worldEl.clientWidth;
    this.boardHeight = this.worldEl.clientHeight;

    // Event listener for ball hitting an Endzone
    document.addEventListener("ballHitEndzone", e => {
      var scoringPlayer = e.detail.side == "left" ? 2 : 1;
      var scoredBy = e.detail.lastTouchedPaddle || 0;

      if(e.detail.side === "right" && scoredBy === 2) {
        return;
      }
      if(e.detail.side === "left" && scoredBy === 1) {
        return;
      }
      this.playerScored(scoringPlayer, e.detail.ball);
    });

    this.powerupManager = new PowerupManager(this);
    this.aiManager = new AIManager(this, engine);

    this.reactionMachine = new ReactionMachine();

    initEffects();
  },

  activeSpinPowerups : 0,
  
  
  // Lets the game know someone lost a powerup
  lostPowerup: function(player, type){
    if(type === "spin") {
      this.activeSpinPowerups--;
      if(this.activeSpinPowerups < 0){
        this.activeSpinPowerups = 0;
      }
      if(this.activeSpinPowerups === 0) {
        this.spinWallEls.forEach(function(el){
          el.style.display = "none";
        });
      }
    }
  },


  ballHitPaddle(player){
    if(game.mode != "running"){
      return;
    }

    this.goalOneEl.classList.remove("on");
    this.goalTwoEl.classList.remove("on");

    if(player === 1) {
      this.goalTwoEl.classList.add("on");
    } else {
      this.goalOneEl.classList.add("on");
    }
  },

  // Lets the game know someone got a powerup
  gotPowerup: function(player, type){
    if(type === "spin") {
      this.activeSpinPowerups++;
      this.spinWallEls.forEach(function(el){
        el.style.display = "block";
      });
    }
  },

  // When the loser survives the FINISH IT phase
  loserLived: function(){
    this.mode = "off";
    this.showMessage("HA! MISSED!", 1500);
    SoundManager.fireEvent('Finish_It_Heartbeat_Stop_Miss');

    // TODO - move this stuff to the paddle, add a setType function?
    this.score.loser.mode = "normal";
    this.score.loser.element.classList.remove("loser");
    this.score.loser.element.classList.remove("shaking");

    var that = this;
    setTimeout(() => {
      that.removeBalls();
    }, 1500);

    setTimeout(() => {
      this.restart();
    }, 2500);
  },

  // When the loser dies during the FINISH IT phase
  loserDied: function(){
    this.removeBalls();
    SoundManager.fireEvent('Finish_It_Heartbeat_Stop_Hit');
    
    setTimeout(() => {      
      this.showMessage("YOU MONSTER", 1750);
    }, 1000);

    setTimeout(() => {
      this.restart();
    }, 3000);
  },

  pause: function () {
    this.previousMode = this.mode;
    this.mode = 'paused';
  },

  resume: function () {
    this.mode = this.previousMode;
    this.run();
  },

  run: function () {
    var g = this;
    g.mode = 'startup';
    (function loop() {

      if(g.freezeFrames === 0) {
        g.step();
      } else {
        g.freezeFrames--;
      }

      if (g.mode === 'paused') {
        return;
      }

      requestAnimationFrame(loop);
    })();
  },

  step : function(){
    var currentTime = Date.now();
    var delta = 16;

    if(lastTime) {
      delta = currentTime - lastTime;
    }

    lastTime = currentTime;

    if(this.ownGoalCooldownTimerMS > 0) {
      this.ownGoalCooldownTimerMS = this.ownGoalCooldownTimerMS - delta;
    }

    if(this.ownGoalCooldownTimerMS < 0) {
      this.ownGoalCooldownTimerMS = 0;
    }

    this.timeSinceEndzoneHitMS = this.timeSinceEndzoneHitMS + delta;

    if(this.mode == "running") {
      this.powerupManager.update();
    }

    this.physicsSamplingRatio = 2; // Twice as fast
    this.physicsStepMS = 1000 / 60 / this.physicsSamplingRatio;

    this.tiltBoard()

    // Iterate over all of the objects are are updating on screen
    objectsToRender.forEach((obj) => {

      // TODO - pick a name for this function and standardize
      // "step" might be better than run or update actually, since we use that for the game
      // maybe "frameStep" for clarity;

      // Update the element position & angle
      var el = obj.element;
      var physics = obj.physics;
      var x = physics.position.x - obj.width / 2;
      var y = physics.position.y - obj.height / 2;
      var angle = physics.angle;

      if(obj.ignoreRotation) {
        el.style.transform = 'translateX('+ x + 'px) translateY(' + y + 'px)';
      } else {
        el.style.transform = 'translateX('+ x + 'px) translateY(' + y + 'px) rotate(' + angle + 'rad)';
      }

      el.style.zIndex = 100 + parseInt(y);

      if(obj.update){
        obj.update(delta);
      }

      if(obj.run) {
        obj.run(delta);
      }
    });

    for(var i = 0; i < this.physicsSamplingRatio; i++){
      Engine.update(engine, this.physicsStepMS);
    }

    drawParticles(); // Updates any particles we might have

    // Some vars for easy tweaking
    // TODO - move these to the top of the game object

    // Remove things we don't need
    if (removalList.length > 0) {
      removalList.forEach(function (obj) {
        if (obj.deleted) return;
        obj.element.parentNode.removeChild(obj.element);
        World.remove(engine.world, obj.physics);
        objectsToRender.splice(objectsToRender.indexOf(obj), 1);
        obj.deleted = true;
      });
      removalList = [];
    }

  },

  // Tils the board based on where the balls are
  tiltBoard: function(){
    
    var deltaX = deltaY = ballXs = ballYs = avgX = avgY = 0;
    
    // Gets average x,y position of all balls to calculate board tilt
    if(this.balls.length > 0) {
      for(var ball of this.balls) {
        ballXs = ballXs + ball.physics.position.x;
        ballYs =  ballYs + ball.physics.position.y;
      }

      var avgX = ballXs / this.balls.length;
      var avgY = ballYs / this.balls.length;

      deltaX = this.boardWidth / 2 - avgX;
      deltaY = this.boardHeight / 2 - avgY;
    }

    var maxRotation = 20;
    var rotateXDeg =  maxRotation * deltaY / this.boardHeight / 2 + 20;
    var rotateYDeg = -maxRotation * deltaX / this.boardWidth  / 2;

    if(game.mode != "off") {
      this.tiltEl.style.transform = "rotateX(" + rotateXDeg + "deg) rotateY(" + rotateYDeg + "deg)";
    }
  },


  // Shows a message above the game board
  showMessage : function(text, duration){
    this.messageEl.classList.add("show-message");
    this.messageEl.innerHTML = text;

    var that = this;
    setTimeout(function(){
      that.messageEl.classList.remove("show-message");
    }, 250);

    if(duration) {
      setTimeout(function(){
        that.messageEl.classList.add("remove-message");
      }, duration - 250);

      setTimeout(function(){
        that.messageEl.innerHTML = "";
        that.messageEl.classList.remove("remove-message");
      }, duration);
    }
  },


  // Create a new ball and launch it
  launchBall : function(){

    let ball = createBall();
    this.balls.push(ball);

    Matter.Body.set(ball.physics, {
      position: { 
        x : this.boardWidth / 2, 
        y : this.boardHeight / 2 - 15
      }
    });
 
    var chance = Math.floor(getRandom(0,2));
    var launchForce = (chance === 0 ? -1 : 1) * .02 * this.physicsSamplingRatio;
    ball.launch(0, launchForce);

    SoundManager.playSound('Ball_Spawn');
    this.aiManager.setBall(ball);
  },


  // Removes all balls from the game
  removeBalls: function(){
    var that = this;
    this.balls = this.balls.filter(ball => {
      ball.destroy();
      removalList.push(ball);
    });
  },


  // Animates the large score numbers on the board
  showScore : function(){
    var that = this;
    var delay = 500;
    
    var scoreOneEl = document.querySelector(".bigscore-wrapper.one .bigscore");
    var scoreTwoEl = document.querySelector(".bigscore-wrapper.two .bigscore");
    var bestOfOne = document.querySelector(".bigscore-wrapper.one .bestof");
    var bestOfTwo = document.querySelector(".bigscore-wrapper.two .bestof");
    
    var els = [scoreOneEl, scoreTwoEl, bestOfOne, bestOfTwo];

    bestOfTwo.innerHTML = "OF " + ((this.score.max * 2) - 1);
    
    els.map(el => el.classList.remove("hide-animation"));

    setTimeout(function(){
      scoreOneEl.querySelector(".score-number").innerHTML = that.score.player1;
      scoreTwoEl.querySelector(".score-number").innerHTML = that.score.player2;
      els.map(el => el.style.display = "block");
    }, delay);

    delay = delay + 1000;

    setTimeout(function(){
      els.map(el => el.classList.add("hide-animation"));
    }, delay);

    delay = delay + 500;

    setTimeout(function(){
      els.map(el => el.style.display = "none");
    }, delay);
  },


  // Restarts a round
  restart : function(){

    var that = this;
    var messageDelay = 0;

    var finalRound = that.score.player1 + that.score.player2 + 2 === that.score.max * 2 ? true : false;

    ["winner-screen", "winner-two", "winner-one"].forEach(function(className){
      that.bodyEl.classList.remove(className);
    });

    for(let paddle of this.paddles){
      paddle.reset();
    }

    this.mode = "pregame";
    this.terrainLinePercent = 50;

    this.updateBounds();
    this.updateScoreDisplay();


    setTimeout(function(){
      SoundManager.playSound("round-start");
    }, 2200);

    setTimeout(function(){
      that.showScore();
    }, 2500);


    setTimeout(function(){
      var message = finalRound ? "FINAL ROUND!!" : "GAME ON!";
      that.showMessage(message, 1500);
    }, 4200);

    setTimeout(function(){
      that.mode = "running";
      that.updateBounds();
      that.launchBall();

      if(finalRound){
        setTimeout(function(){
          that.showMessage("CHAOS MODE", 1500);
          that.launchBall();
        }, 1500);
      }
    }, 4200);
  },


  // Updates the score satellite
  updateScoreDisplay: function(){    
    document.querySelector(".player-1-score").innerText = this.score["player1"];
    document.querySelector(".player-2-score").innerText = this.score["player2"];
  },


  // Updates the terrain widths and paddle movement restrictions
  updateBounds : function(mode){

    for(var i = 0; i < this.paddles.length; i++) {

      var p = this.paddles[i];

      if(this.mode == "running") {
        if(p.player == 0) {
          p.maxX = this.boardWidth * (this.terrainLinePercent/100);
        } else if (p.player == 1) {
          p.minX = this.boardWidth * (this.terrainLinePercent/100);
        }
      }

      if(this.mode == "pregame") {
        if(p.player == 0) {
          p.maxX = this.boardWidth * .25;
        } else if (p.player == 1) {
          p.minX = this.boardWidth - (this.boardWidth * .25);
        }
      }
    }

    this.centerX = this.terrainLinePercent / 100 * this.boardWidth;

    var leftWidth = Math.floor(this.boardWidth * this.terrainLinePercent/100);
    var rightWidth = this.boardWidth - leftWidth;

    let terrainOneScale = this.terrainLinePercent/100;
    let terrainTwoScale = 1 - this.terrainLinePercent/100;

    this.terrainOneEl.style.transform = "scaleX(" + terrainOneScale + ")";
    this.terrainTwoEl.style.transform = "scaleX(" + terrainTwoScale + ")";
    
    // Changes the color of the planet by modifying opacity of the overlay
    var overlayOpacity = mapScale(this.terrainLinePercent, 25, 75, 0 , 1);
    this.surfaceOverlayEl.style.opacity = 1 - overlayOpacity;
  },


  // When a player wins enough rounds, the game is over
  // Goes into "finish it" mode.
  gameOver : function(){

    var that = this;
    
    setTimeout(() => { this.mode = "finish"; }, 50);

    this.bodyEl.classList.add("winner-screen");

    this.goalOneEl.classList.remove("on");
    this.goalTwoEl.classList.remove("on");

    this.score.loser.mode = "ghost";
    this.score.loser.element.classList.add("loser");

    if(this.score.winner == this.paddles[0]) {
      this.showMessage("Player 1 Wins!", 1500);
      this.bodyEl.classList.add("winner-one");
    } else {
      this.showMessage("Player 2 Wins!", 1500);
      this.bodyEl.classList.add("winner-two");
    }

    this.score.player1 = 0;
    this.score.player2 = 0;

    setTimeout(() => {
      var minY = that.score.loser.physics.bounds.min.y;
      var maxY = that.score.loser.physics.bounds.max.y;
      var deltaY = minY - maxY;
      var paddleY = maxY + deltaY/2;
      that.score.loser.element.classList.add("shaking");

      if(that.score.winner == this.paddles[0]) {
        var ballX = 600;
      } else {
        var ballX = 200;
      }

      that.showMessage("FINISH IT!!!");

      let ball = createBall({
        x: ballX,
        y: paddleY - 15
      });

      ball.element.classList.add('show');
      this.balls.push(ball);

      SoundManager.playSound('Ball_Spawn');
      SoundManager.fireEvent('Finish_It_Heartbeat_Start');
      
      this.aiManager.setBall(ball);

    }, 2000);

  },


  // When the round is over, but a player hasn't wong the game yet
  roundOver: function(ball) {

    this.paddles[0].maxX = false;
    this.paddles[1].minX = false;

    this.goalOneEl.classList.remove("on");
    this.goalTwoEl.classList.remove("on");

    if(ball) {
      if(ball.physics.speed > ball.wordSpeed) {
        addFakeBall(ball.physics);
      }
      this.removeBalls();
    }

    this.mode = "roundover";

    this.bodyEl.classList.add("winner-screen");

    var winner, loser;

    // TODO - change to Team 1 & Team 2
    if(this.terrainLinePercent == 100) {
      winner = this.paddles[0];
      loser = this.paddles[1];
      this.score["player1"] = this.score["player1"] + 1;
    } else {
      winner = this.paddles[1];
      loser = this.paddles[0];
      this.score["player2"] = this.score["player2"] + 1;
    }

    this.updateScoreDisplay();

    if(winner == this.paddles[0]) {
      this.bodyEl.classList.add("winner-one");
    } else {
      this.bodyEl.classList.add("winner-two");
    }

    if(this.score["player2"] == this.score.max || this.score["player1"] == this.score.max) {
      this.score.winner = winner;
      this.score.loser = loser;
      this.gameOver();
    } else {
      var that = this;
      setTimeout(function(){
        that.restart()
      },this.timeBetweenRoundsMS);
    }

  },

  flashTimeout : false, // Tracks if a flashing background animation is happening

  unghostBall(){
      for(let ball of game.balls){
        ball.element.classList.remove("ghost");
      }
      for(let paddle of game.paddles){
        paddle.physics.collisionFilter.category = 0x0001;
      }
  },

  playerScored : function(player, ballPhysics){

    var scoringBall = this.balls.find(ball => ball.id === ballPhysics.id);

    var that = this;
  
    if(this.timeSinceEndzoneHitMS < this.goalTimeoutMS) {
      return;
    }

    this.timeSinceEndzoneHitMS = 0;

    // Only score when game is still on
    if(this.mode === "off" || this.mode === "finish") {
      return;
    }

    var scoredByPlayerNum = player;
    var scoredOnPlayerNum = 2;
    if(scoredByPlayerNum == 2) {
      scoredOnPlayerNum = 1;
    }

    var goalAllowed = true;

    if(scoringBall.lastTouchedPaddle == scoredOnPlayerNum) {
      if(this.ownGoalCooldownTimerMS != 0) {
        goalAllowed = false;
      }
      this.ownGoalCooldownTimerMS = this.ownGoalCooldownMS;
    }

    if(!goalAllowed) {
      return;
    }

    // Make an explosion when someone scores
    var blastDirection = "left";

    var xPos = game.boardWidth;

    if(scoredByPlayerNum == 2) {
      blastDirection = "right";
      xPos = 0;
    }



    if(ballPhysics){
      for(let ball of game.balls){
        ball.element.classList.add("ghost");
      }
      for(let paddle of game.paddles){
        if(scoredByPlayerNum === paddle.player) {
          paddle.physics.collisionFilter.category = 0x0002;
        }
      }
      setTimeout(function(){
        that.unghostBall();
      }, 300);
    }



    makeExplosion(xPos, ballPhysics.position.y, 75, blastDirection);

    // Check horizontal velocity of the ball
    // the faster it hits an endzone the more that
    // player wins.

    var xForce = Math.abs(ballPhysics.velocity.x * this.physicsSamplingRatio);
    var xForceRatio = xForce / 15;

    var terrainChange = this.minTerrainChange + (xForceRatio * 15);
    // terrainChange = 50;

    // Add a message near the impact that indicates
    // the force of the hit (in percentage points)
    if(terrainChange >= 10) {
      
      let messages = ["OW","NICE","OOF","POW"];

      showMessage({
        text: messages[Math.floor(Math.random() * messages.length)],
        x: ballPhysics.position.x,
        y: ballPhysics.position.y,
        fontSize : (20 + 15 * xForceRatio),
        timeout: 2750
      });

      document.dispatchEvent(new CustomEvent("emotion", {detail: {
        player: scoredOnPlayerNum,
        type: "losing"
      }}));
    }

    this.moveTerrain(scoredByPlayerNum, terrainChange, scoringBall);
    
    addTemporaryClassName(this.bodyEl, "team-" + player + "-scored-flash", 500);

    SoundManager.playRandomSoundFromBank('score');
  },

  // Moves the terrain & Score based on a goal or mine...
  moveTerrain(player, change, scoringBall) {

    if(this.mode != "running") {
      return;
    }

    var modifier, className;

    if(player === 1) {
      modifier = 1;
      className = "pink-chunk";
    } else if (player === 2){
      modifier = -1;
      className = "green-chunk";
    }

    makeTerrainChunks(this.terrainLinePercent, modifier, className, this.boardWidth, this.boardHeight);

    // Move the terrain line accordingly
    if(player === 1) {
      this.terrainLinePercent = this.terrainLinePercent + change;
    } else {
      this.terrainLinePercent = this.terrainLinePercent - change;
    }

    if(this.terrainLinePercent > 100) {
      this.terrainLinePercent = 100;
    } else if(this.terrainLinePercent < 0) {
      this.terrainLinePercent = 0;
    }

    // Changes the bounds of the paddles based on the terrain line...
    this.updateBounds();


    // TODO - move this into playerscore or something
    // this whole function should just be cosmetic.
    if(this.terrainLinePercent === 100 || this.terrainLinePercent === 0) {
      this.roundOver(scoringBall);
      SoundManager.playSound("Win_Cheer");
      this.showMessage("NICE", 1500);
    }
  },

  removeObject: (object) => {
    removalList.push(object);
  }
}

function setupRenderer(selector){

  var sBox = document.querySelector(selector);

  game.boardWidth = sBox.clientWidth;

  addWalls({
    world: World,
    width: sBox.clientWidth,
    height: sBox.clientHeight,
    sides : ["top","right","bottom","left"]
  });


  world.bounds.min.x = 0;
  world.bounds.max.x = sBox.clientWidth;
  world.bounds.min.y = 0;
  world.bounds.max.y = sBox.clientHeight;

  world.gravity.y = 0;
  world.gravity.x = 0;

  Matter.Resolver._restingThresh = 0.1;

  let makeRenderer = false; // make this true if you want to overlay what the physics engine is doing

  if(makeRenderer) {
    var render = Render.create({
      element: document.querySelector(selector),
      engine: engine,
      options: {
        width: sBox.clientWidth,
        height: sBox.clientHeight,
        showVelocity: true,
        showAngleIndicator: true
      }
    });
    Render.run(render);
  }
  
}

var Engine = Matter.Engine,
    World = Matter.World,
    Bodies = Matter.Bodies,
    Render = Matter.Render,
    Runner = Matter.Runner,
    Events = Matter.Events,
    Constraint = Matter.Constraint;

var engine = Engine.create(),
    world = engine.world;

var objectsToRender = [];

// Objects to remove
var removalList = [];

// Adds 4 walls to the World to surround it
function addWalls(options){

  var width = options.width;
  var height = options.height;
  var world = options.world;
  var sides = options.sides;

  var thickness = 100;

  for(var i = 0; i < sides.length; i++) {
    var side = sides[i];
    var x, y, wallWidth, wallHeight;

    if(side == "top") {
      x = width / 2;
      y = -thickness/2;
      wallWidth = width;
      wallHeight = thickness;
    } else if (side == "left") {
      x = -thickness/2;
      y = height/2;
      wallWidth = thickness;
      wallHeight = height;
    } else if (side == "right") {
      x = width + thickness/2;
      y = height/2;
      wallWidth = thickness;
      wallHeight = height;
    } else if (side == "bottom") {
      x = width / 2;
      y = height + thickness / 2;
      wallWidth = width;
      wallHeight = thickness;
    }

    var wall = Bodies.rectangle(x, y, wallWidth, wallHeight, {
      isStatic: true,
      label: "wall-"  + side
    });
    wall.friction = options.friction || 0;
    world.add(engine.world, wall);
  }
}

var lastTime = false;
var reactionMachine;
