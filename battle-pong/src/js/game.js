var game =  {
  score : {
    player1 : 0,
    player2 : 0,
    max : window.Settings.playTo || 3,         // First to this number wins
    winner : false,  // Holds the winning paddle object
    loser : false    // Holds the losing paddle object
  },

  physicsStepMS : 1000 / 60 / 2,
  physicsSamplingRatio : 2, // This means 2 times per frame

  terrainLinePercent : 50,  // The percent position between the players, 50 = 50% =
  minTerrainChange : 5,

  powerupFrequency: window.Settings.powerupFrequency || 300, // A powerup appears once in every X frames
  activePowerupCount : 0,
  maxPowerupCount: window.Settings.maxPowerupCount || 2,

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

  goalTimeoutMS: window.Settings.goalTimeoutMS,
  timeSinceEndzoneHitMS: window.Settings.goalTimeoutMS,

  boardWidth : 0,
  boardHeight: 0,

  terrainOneEl : "",
  terrainTwoEl : "",
  worldE : "",
  bodyEl : "",

  timeBetweenRoundsMS: 2000, // Time between rounds of the game

  init: function(){
    this.worldEl = document.querySelector(".world");
    this.boardWidth = this.worldEl.clientWidth;
    this.boardHeight = this.worldEl.clientHeight;

    this.bodyEl = document.querySelector("body");

    this.terrainOneEl = document.querySelector(".terrain.one");
    this.terrainTwoEl = document.querySelector(".terrain.two");

    var that = this;

    // Event listener for ball hitting an Endzone
    document.addEventListener("ballHitEndzone", function(e) {
      var scoringPlayer = 1;
      if(e.detail.side == "left") {
        scoringPlayer = 2;
      }
      that.playerScored(scoringPlayer, e.detail.ball);
    });

  },

  loserLived: function(){
    this.mode = "off";
    this.showMessage("HA! MISSED!", 1500);

    // TODO - move this stuff to the paddle, add a setType function?
    this.score.loser.mode = "normal";
    this.score.loser.element.classList.remove("loser");
    this.score.loser.element.classList.remove("shaking");

    setTimeout(function(){
      removalList.push(ball);
    }, 1500);

    var that = this;

    setTimeout(function(){
      that.restart();
    }, 2500);
  },

  loserDied: function(){
    removalList.push(ball);

    var that = this;

    setTimeout(function(){
      that.showMessage("YOU MONSTER", 1750);
    }, 1000);

    setTimeout(function(){
      that.restart()
    }, 3000);
  },

  // Keeps track of where the ball is and for how long so
  // we can apply penalties if someone is hogging it.

  previousTime: false,

  // TODO - change this to elapsedTimeInZone, it only keeps track of when a slow-moving
  // ball hangs out in one terrain too long
  elapsedTime : 0,

  // TODO - rename to reference 'terrain' maybe for consistency
  ballZone : false,
  lastBallZone : false,

  ballState : "neutral",

  run: function () {
    var g = this;
    g.mode = 'startup';
    (function loop() {

      if(g.freezeFrames == 0) {
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

  pause: function () {
    this.mode = "paused";
  },

  ticks : 0,

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

    if(game.mode == "running") {
      var chance = getRandom(0, this.powerupFrequency);
      if(chance < 1 && this.activePowerupCount < this.maxPowerupCount) {

        var x = game.boardWidth * game.terrainLinePercent/100;

        if(x < 50) {
          x = 50;
        } else if ( x > game.boardWidth - 50) {
          x = game.boardWidth - 50;
        }

        var y = getRandom(50, game.boardHeight - 50);

        addPowerup(x, y);
        this.activePowerupCount++;
      }
    }

    // TODO - increase physics sampling rate

    this.physicsSamplingRatio = 2; // Twice as fast
    this.physicsStepMS = 1000 / 60 / this.physicsSamplingRatio;

    // Tilts the board depending on where the ball is
    var deltaX = 0;
    var deltaY = 0;

    var wind = -.1;

    if(ball) {
      if(ball.deleted != true) {
        deltaX = this.boardWidth / 2 - ball.physics.position.x;
        deltaY = this.boardHeight / 2 - ball.physics.position.y;
      }
    }
    this.ticks++;
    if(wind < 0 && this.ticks > 20) {

      this.ticks = 0;
        var options = {
          x : getRandom(-40, this.boardWidth + 40),
          y : -200,
          z: getRandom(-100,100),
          zR : getRandom(-20,20),
          angle: 180,
          height: 30,
          width: 30,
          o: .8,
          speed : 20,
          lifespan: 1500,
          className : "paddleChunk"
        }

        options.z = 0;
    }

    var maxRotation = 20;
    var rotateXDeg =  maxRotation * deltaY / this.boardHeight / 2 + 20;
    var rotateYDeg = -maxRotation * deltaX / this.boardWidth  / 2;

    if(game.mode != "off") {
      tiltEl.style.transform = "rotateX(" + rotateXDeg + "deg) rotateY(" + rotateYDeg + "deg)";
    }

    // Iterate over all of the objects are are updating on screen
    objectsToRender.forEach(function (obj) {

      // TODO - remove this because the ball has a function that runs every frame anyway now
      // so we can add that logic internally in the ball.
      if(obj == ball) {
        if(obj.gotHit) {
          obj.resolveHit();
        }

        // Matter.Body.applyForce(obj.physics, obj.physics.position, {
        //   x : 0,
        //   y : 0.001
        // });
      }

      // Matter.Body.setVelocity(obj.physics,{
      //   x: obj.physics.velocity.x,
      //   y: obj.physics.velocity.y - wind
      // })


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

    var delayTimeoutMS = 5000;   // How long we let a slow ball stay on one side before penalizing
    var penaltyTimeoutMS = 500;  // How often we penalize once things are too slow
    var percentPenalty = 2;      // How many percent of the field we penalize
    var slowSpeedCutoff = 2.5;

    var terrainCenterX = this.boardWidth * this.terrainLinePercent/100;

    if (ball) {

      // Figure out what player zone we are in
      if(ball.physics.position.x < terrainCenterX) {
        this.ballZone = 1;
      } else {
        this.ballZone = 2;
      }

      if(this.ballZone != this.lastBallZone) {
        this.elapsedTime = 0;
        this.ballState = "neutral";
        ball.element.classList.remove("overtime");
      }

      this.lastBallZone = this.ballZone;

      // If the ball is going slower than 2.5
      // We start keeping track of time

      if(this.previousTime && ball.physics.speed < slowSpeedCutoff) {
        this.elapsedTime = this.elapsedTime + delta;
      } else {
        this.elapsedTime = 0;
        // TODO - make this an event, or at least a method on the ball?
        ball.element.classList.remove("overtime");
      }

      if(this.ballState == "neutral" && this.elapsedTime > delayTimeoutMS && this.mode == "running") {
        this.ballState = "overtime";
        this.elapsedTime = 0;
      }

      if(this.ballState == "overtime") {
        if(this.elapsedTime > penaltyTimeoutMS) {
          // ball.element.classList.add("overtime");
          // this.playerDelay(this.ballZone, percentPenalty);
          // playSound("beep");
          // this.elapsedTime = 0;
        }
      }

      this.previousTime = currentTime;
    }

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

  playerDelay : function(player, penalty){
    // Move the terrain line accordingly
    if(player === 1) {
      this.terrainLinePercent = this.terrainLinePercent - penalty;
    } else {
      this.terrainLinePercent = this.terrainLinePercent + penalty;
    }

    if(this.terrainLinePercent > 100) {
      this.terrainLinePercent = 100;
    } else if(this.terrainLinePercent < 0) {
      this.terrainLinePercent = 0;
    }

    this.updateBounds();

    if(this.terrainLinePercent === 100 || this.terrainLinePercent === 0) {
      this.roundOver();
    }
  },

  // Shows a message above the game board
  showMessage : function(text, timeoutMS){

    var scoreEl = document.querySelector(".score-display");

    scoreEl.classList.add("show-message");
    scoreEl.innerHTML = text;

    setTimeout(function(){
      scoreEl.classList.remove("show-message");
    }, 250);

    if(timeoutMS) {
      setTimeout(function(){
        scoreEl.classList.add("remove-message");
      }, timeoutMS - 250);

      setTimeout(function(){
        scoreEl.innerHTML = "";
        scoreEl.classList.remove("remove-message");
      }, timeoutMS);

    }
  },


  // TODO - fix de-dupe
  cloneBall : function(options){

    if(!ball) { return }

    if(!options){
      options = {};
    }

    options.lifeSpan = 250;

    this.showMessage("MULTIBALL", 1500);

    var newBall = createBall(options);

    setTimeout(function(){
      newBall.element.classList.add('show');
    },0)

    newBall.element.classList.add('clone-ball');

    var x = ball.physics.position.x;
    var y = ball.physics.position.y;


    Matter.Body.set(newBall.physics, {
      position: { x : x, y : y }
    });

    Matter.Body.setVelocity(newBall.physics, {
      x : ball.physics.velocity.x,
      y : ball.physics.velocity.y
    });

    popBall(ball.physics);
  },


  launchBall : function(options){
    if(!options){
      options = {};
    }

    ball = createBall(options);

    // TODO - Move a lot of this stuff to the ball object?
    ball.element.classList.add('show');

    var y = this.boardHeight / 2 - 15;
    var x = this.boardWidth * this.terrainLinePercent / 100;


    Matter.Body.set(ball.physics, {
      position: { x : x, y : y }
    });

    var chance = Math.floor(getRandom(0,1));
    var launchForce = .02 * this.physicsSamplingRatio;

    if(chance === 0) {
      ball.launch(0, -launchForce);
    } else {
      ball.launch(0, launchForce);
    }
  },

  showScore : function(){
    var that = this;
    var delay = 500;
    var scoreOneEl = document.querySelector(".terrain.one .bigscore");
    var scoreTwoEl = document.querySelector(".terrain.two .bigscore");

    var bestOfOne = document.querySelector(".terrain.one .bestof");
    var bestOfTwo = document.querySelector(".terrain.two .bestof");

    bestOfTwo.innerHTML = "OF " + ((this.score.max * 2) - 1);

    // TODO simplify all this carp you moron
    scoreOneEl.classList.remove("hide-animation");
    scoreTwoEl.classList.remove("hide-animation")
    bestOfOne.classList.remove("hide-animation");;
    bestOfTwo.classList.remove("hide-animation");

    setTimeout(function(){
      scoreOneEl.querySelector(".score-number").innerHTML = that.score.player1;
      scoreOneEl.style.display = "block";
      bestOfOne.style.display = "block";
      scoreTwoEl.querySelector(".score-number").innerHTML = that.score.player2;
      scoreTwoEl.style.display = "block";
      bestOfTwo.style.display = "block";
    }, delay);

    delay = delay + 1000;

    setTimeout(function(){
      scoreOneEl.classList.add("hide-animation");
      scoreTwoEl.classList.add("hide-animation");
      bestOfOne.classList.add("hide-animation");
      bestOfTwo.classList.add("hide-animation");

    }, delay);

    delay = delay + 500;
    setTimeout(function(){
      scoreOneEl.style.display = "none";
      scoreTwoEl.style.display = "none";
      bestOfOne.style.display = "none";
      bestOfTwo.style.display = "none";

    }, delay);
  },


  // Restarts a round
  restart : function(){

    var that = this;
    var messageDelay = 0;

    this.showScore();

    setTimeout(function(){
      that.mode = "running";
      that.updateBounds();
      that.launchBall();
    }, 1500);

    this.bodyEl.classList.remove("winner-screen");
    this.bodyEl.classList.remove("winner-two");
    this.bodyEl.classList.remove("winner-one");

    for(var i = 0; i < paddles.length; i++){
      var p = paddles[i];
      p.reset();
    }

    this.mode = "pregame";
    this.terrainLinePercent = 50;

    this.updateBounds();

    this.updateScoreDisplay();

    var that = this;
    setTimeout(function(){
      that.showMessage("GAME ON!", 1500);
    }, 1400)
  },


  // Updates the score display in the corners of the game
  updateScoreDisplay: function(){
    var scoreEls = document.querySelectorAll(".score");

    for(var i = 1; i < 3; i++) {
      var scoreEl = scoreEls[i-1];
      scoreEl.innerHTML = "";
      var playerScore = this.score["player" + i];
      for(var j = 0; j < this.score.max; j++) {
        if(j < this.score["player" + i]) {
          scoreEl.innerHTML = scoreEl.innerHTML + " <span class='scored'>&middot;</span>";
        } else {
          scoreEl.innerHTML = scoreEl.innerHTML + " <span>&middot;</span>";
        }
      }
    }
  },


  // Updates the terrain widths and paddle movement restrictions
  updateBounds : function(mode){

    for(var i = 0; i < paddles.length; i++) {

      var p = paddles[i];


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

    var leftWidth = Math.floor(this.boardWidth * this.terrainLinePercent/100);
    var rightWidth = this.boardWidth - leftWidth;

    this.terrainOneEl.style.width = leftWidth + "px";
    this.terrainTwoEl.style.width = rightWidth + "px";

    var maxRotation = 4.5;
    var delta = 50 - this.terrainLinePercent;
    var planetRotation = -delta / 50 * 4.5;
    document.querySelector(".surface").style.transform = "rotate(" + planetRotation + "deg)";
  },


  // When a player wins enough rounds, the game is over
  // Goes into "finish it" mode.
  gameOver : function(){

    var that = this;
    setTimeout(function(){
      that.mode = "finish";
    }, 50);

    this.bodyEl.classList.add("winner-screen");

    this.score.loser.mode = "ghost";
    this.score.loser.element.classList.add("loser");

    var that = this;

    if(this.score.winner == paddles[0]) {
      this.showMessage("Player 1 Wins!", 1500);
      this.bodyEl.classList.add("winner-one");
    } else {
      this.showMessage("Player 2 Wins!", 1500);
      this.bodyEl.classList.add("winner-two");
    }

    this.score.player1 = 0;
    this.score.player2 = 0;

    setTimeout(function(){

      var minY = that.score.loser.physics.bounds.min.y;
      var maxY = that.score.loser.physics.bounds.max.y;
      var deltaY = minY - maxY;
      var paddleY = maxY + deltaY/2 - ball.width/2;
      that.score.loser.element.classList.add("shaking");

      // Create the ball
      // TODO make this relative to the paddle X value?
      if(that.score.winner == paddles[0]) {
        var ballX = 600;
      } else {
        var ballX = 200;
      }

      that.showMessage("FINISH IT!!!");

      ball = createBall({
        x: ballX,
        y: paddleY
      });

      ball.element.classList.add('show');

    }, 2000);

  },


  // When the round is over, but a player hasn't wong the game yet
  roundOver: function() {

    paddles[0].maxX = false;
    paddles[1].minX = false;

    if(ball.physics.speed > ball.wordSpeed) {
      addFakeBall(ball.physics);
    }

    removalList.push(ball);

    this.mode = "roundover";

    this.bodyEl.classList.add("winner-screen");

    var winner, loser;

    // TODO - change to Team 1 & Team 2
    if(this.terrainLinePercent == 100) {
      winner = paddles[0];
      loser = paddles[1];
      this.score["player1"] = this.score["player1"] + 1;
    } else {
      winner = paddles[1];
      loser = paddles[0];
      this.score["player2"] = this.score["player2"] + 1;
    }

    this.updateScoreDisplay();

    if(winner == paddles[0]) {
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

  playerScored : function(player, ballPhysics){

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

    if(ball.lastTouchedPaddle == scoredOnPlayerNum) {
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

    makeExplosion(xPos, ballPhysics.position.y, 75, blastDirection);

    // Check horizontal velocity of the ball
    // the faster it hits an endzone the more that
    // player wins.

    var xForce = Math.abs(ballPhysics.velocity.x * this.physicsSamplingRatio);
    var xForceRatio = xForce / 15;

    var terrainChange = this.minTerrainChange + (xForceRatio * 15);
    // this.terrainChange = 50;
    // Add a message near the impact that indicates
    // the force of the hit (in percentage points)

    // TODO - make the 10 a variable up top somehwere
    if(terrainChange >= 10) {
      showMessage({
        text: "-" + Math.round(terrainChange) + "%",
        x: ballPhysics.position.x,
        y: ballPhysics.position.y,
        fontSize : (20 + 35 * xForceRatio),
        timeout: 2750
      });

      document.dispatchEvent(new CustomEvent("emotion", {detail: {
        player: scoredOnPlayerNum,
        type: "losing"
      }}));
    }

    this.moveTerrain(scoredByPlayerNum, terrainChange);
    addTemporaryClassName(this.bodyEl, "team-" + player + "-scored-flash", 500);
  },

  // Moves the terrain & Score based on a goal or mine...
  // Rlayer ris 1 or 2
  moveTerrain(player, change) {

    if(this.mode != "running") {
      return;
    }

    var modifier, className;

    if(player === 1) {
      modifier = 1;
      className = "red-chunk";
    } else if (player === 2){
      modifier = -1;
      className = "blue-chunk";
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

    if(this.terrainLinePercent === 100 || this.terrainLinePercent === 0) {
      this.roundOver();
      playSound("win-round");
      this.showMessage("NICE", 1500);
    }
  }
}


// Sets up the world
document.addEventListener('DOMContentLoaded', function () {
  reactionMachine = new ReactionMachine();

  // Build a renderer based on an element
  setupRenderer(".world");

  worldEl = document.querySelector(".world");
  tiltEl = document.querySelector(".tilt-wrapper");

});


function setupRenderer(worldSelector){

  var sBox = document.querySelector(worldSelector);

  game.boardWidth = sBox.clientWidth;

  addWalls({
    world: World,
    width: sBox.clientWidth,
    height: sBox.clientHeight,
    sides : ["top","right","bottom","left"]
  });

  // Create a renderer
  var render = Render.create({
    element: document.querySelector(worldSelector),
    engine: engine,
    options: {
      width: sBox.clientWidth,
      height: sBox.clientHeight,
      showVelocity: true,
      showAngleIndicator: true
    }
  });

  world.bounds.min.x = 0;
  world.bounds.max.x = sBox.clientWidth;
  world.bounds.min.y = 0;
  world.bounds.max.y = sBox.clientHeight;

  // TODO - mess with world gravity?
  world.gravity.y = 0;
  world.gravity.x = 0;

  Matter.Resolver._restingThresh = 0.1;

  //Render.run(render); // TODO - since this is for debugging only, we should make it a flag
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


// The main game engine, moves things around

var letterIndex = 0;

var currentTime;
var lastTime = false;
var delta;
var worldEl;
var tiltEl;

var reactionMachine;