var game =  {
  score : {
    player1 : 0,
    player2 : 0,
    max: 2,
    winner : false,
    loser : false
  },
  terrainLine : 50,
  terrainChange : 5,

  // running - game is playing
  // gameover - game is over (loser screen)
  // roundover - round is over (about to reset)
  // finish - finish it
  // pregame - before a game starts
  // paused - game loop is paused
  // startup - kickstarting the game loop
  mode : "off",

  boardWidth : 0,
  boardHeight: 0,

  terrainOneEl : "",
  terrainTwoEl: "",
  worldE: "",

  timeBetweenRoundsMS: 1000, // Time between rounds of the game

  init: function(){
    this.worldEl = document.querySelector(".world");
    this.boardWidth = this.worldEl.clientWidth;
    this.boardHeight = this.worldEl.clientHeight;

    this.terrainOneEl = document.querySelector(".terrain.one");
    this.terrainTwoEl = document.querySelector(".terrain.two");

    var that = this;

    var lastPlayerTouch = 0;

    document.addEventListener("ballHitPaddle", function(e) {
      console.log('Ball touched player ' + e.detail.player + ' last');
      lastPlayerTouch = e.detail.player;
      ball.paddleHit();
    });

    // Event listener for ball hitting an Endzone
    document.addEventListener("ballHitEndzone", function(e) {

      var scoringPlayer = 1;
      var losingPlayer = 2;

      if(e.detail.side == "left") {
        scoringPlayer = 2;
        losingPlayer = 1;
      }

      that.playerScored(scoringPlayer);

      if (e.detail.player !== lastPlayerTouch && lastPlayerTouch > 0) {
        // If the player scored on themselves, SHAME
        reactionMachine.react(scoringPlayer, 'taunting');
        reactionMachine.react(losingPlayer, 'embarrassed');
      }
      else {
        // Otherwise, more normal reaction
        reactionMachine.react(scoringPlayer, 'winning');
      }

      // Reset this each time so that player can't score on themselves again if ball keeps moving
      lastPlayerTouch = 0;
    });
  },

  loserLived: function(){

    this.mode = "off";

    this.showMessage("HA! MISSED!", 1500);
    this.score.loser.mode = "normal";
    this.score.loser.element.classList.remove("loser");   // TODO - move to the paddle... setType, setMode..?
    this.score.loser.element.classList.remove("shaking"); // TODO - move to the paddle...

    var that = this;

    setTimeout(function(){
      removalList.push(ball);
    },1500);

    setTimeout(function(){
      that.restart();
    },2500);
  },

  loserDied: function(){

    removalList.push(ball);

    var that = this;

    setTimeout(function(){
      that.showMessage("YOU MONSTER", 1750);
    },1000);

    setTimeout(function(){
      that.restart()
    },3000);
  },

  // Keeps track of where the ball is and for how long so
  // we can apply penalties if someone is hogging it.

  previousTime: false,
  elapsedTime : 0,

  ballZone : false,
  lastBallZone : false,
  ballState : "neutral",

  run: function () {
    var g = this;
    g.mode = 'startup';
    (function loop() {
      if (g.mode === 'paused') {
        return;
      }

      g.step();
      requestAnimationFrame(loop);
    })();
  },
  pause: function () {
    this.mode = 'paused';
  },

  step : function(){
    currentTime = Date.now();

    if(lastTime){
      delta = currentTime - lastTime;
    }

    lastTime = currentTime;

    // TODO - should we base the engine update tick based on elapsed time since last frame?

    if(!hasPowerup && game.mode == "running") {
      var chance = getRandom(0, 300);
      if(chance < 1) {
        addPowerup(game.boardWidth * game.terrainLine/100, getRandom(0, game.boardHeight - 50));
        hasPowerup = true;
      }
    }

    Engine.update(engine, 1000 / 60);
    // Engine.update(engine, delta);

    if(ball) {
      var deltaX = 400 - ball.physics.position.x;
      var deltaY = 250 - ball.physics.position.y;
      if(ball.deleted == true) {
        var deltaX = 0;
        var deltaY = 0;
      }
    } else {
      var deltaX = 0;
      var deltaY = 0;
    }

    var rotateX = 5 * deltaY/250 + 20;
    var rotateY = -5 * deltaX/400;

    if(game.mode != "off") {
      tiltEl.style.transform = "rotateX("+rotateX+"deg) rotateY("+rotateY+"deg)";
    }

    objectsToRender.forEach(function (obj) {

      if(obj == ball) {
        if(obj.gotHit) {
          obj.resolveHit();
        }
      }

      if(obj.run) {
        obj.run();
      }

      if(obj.update){
        obj.update();
      }

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

    });

    drawParticles();

    // Some vars for easy tweaking
    var delayTimeoutMS = 5000;   // How long we let a slow ball stay on one side before penalizing
    var penaltyTimeoutMS = 500;  // How often we penalize once things are too slow
    var percentPenalty = 2;      // How many percent of the field we penalize

    //var middleBuffer;

    var currentTime = Date.now();
    var middleX = this.boardWidth * this.terrainLine/100;


    if (ball) {
      // Figure out what player zone we are in
      if(ball.physics.position.x > middleX) {
        this.ballZone = 2;
      } else {
        this.ballZone = 1;
      }

      if(this.ballZone != this.lastBallZone) {
        this.elapsedTime = 0;
        this.ballState = "neutral";
        ball.element.classList.remove("overtime");
      }

      this.lastBallZone = this.ballZone;

      // Ff the ball is going slower than 2.5
      // We start keeping track of time
      if(this.previousTime && ball.physics.speed < 2.5) {
        var delta =  currentTime - this.previousTime;
        this.elapsedTime = this.elapsedTime + delta;
      } else {
        this.elapsedTime = 0;
        ball.element.classList.remove("overtime");
      }

      if(this.ballState == "neutral" && this.elapsedTime > delayTimeoutMS) {
        this.ballState = "overtime";
        this.elapsedTime = 0;
      }

      if(this.ballState == "overtime") {
        if(this.elapsedTime > penaltyTimeoutMS) {
          ball.element.classList.add("overtime");
          this.playerDelay(this.ballZone, percentPenalty);
          playSound("beep");
          this.elapsedTime = 0;
        }
      }

      this.previousTime = currentTime;
    }

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
      this.terrainLine = this.terrainLine - penalty;
    } else {
      this.terrainLine = this.terrainLine + penalty;
    }

    if(this.terrainLine > 100) {
      this.terrainLine = 100;
    } else if(this.terrainLine < 0) {
      this.terrainLine = 0;
    }

    this.updateBounds();

    if(this.terrainLine === 100 || this.terrainLine === 0) {
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


  launchBall : function(){
    ball = createBall();
    ball.element.classList.add('show');

    var y = this.boardHeight / 2 - 15;
    var x = this.boardWidth / 2;

    Matter.Body.set(ball.physics, {
      position: { x: x, y: y }
    });

    var chance = Math.floor(getRandom(0,2));
    if(chance == 0) {
      ball.launch(0, -.02);
    } else {
      ball.launch(0, .02);
    }
  },


  showScore : function(){
    var that = this;
    var delay = 500;
    var scoreOneEl = document.querySelector(".terrain.one .bigscore");
    var scoreTwoEl = document.querySelector(".terrain.two .bigscore");

    var bestOfOne = document.querySelector(".terrain.one .bestof");
    var bestOfTwo = document.querySelector(".terrain.two .bestof");

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

    document.querySelector("body").classList.remove("winner-screen");
    document.querySelector("body").classList.remove("winner-two");
    document.querySelector("body").classList.remove("winner-one");

    for(var i = 0; i < paddles.length; i++){
      var p = paddles[i];
      p.reset();
    }

    hasPowerup  = false;
    this.mode = "pregame";
    this.terrainLine = 50;

    this.updateBounds();

    this.updateScoreDisplay();
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


  // Updates the terrain and the paddle movement
  // restrictions.
  updateBounds : function(mode){
    for(var i = 0; i < paddles.length; i++) {
      var p = paddles[i];

      if(this.mode == "running") {
        if(p.player == 0) {
          p.maxX = this.boardWidth * (this.terrainLine/100);
        } else if (p.player == 1) {
          p.minX = this.boardWidth * (this.terrainLine/100);
        }
      }

      if(this.mode == "pregame") {
        if(p.player == 0) {
          p.maxX = this.boardWidth * .25;
        } else if (p.player == 1) {
          p.minX = this.boardWidth - (this.boardWidth * .2);
        }
      }
    }

    var widthOne = Math.floor(this.boardWidth * this.terrainLine/100);
    var widthTwo = this.boardWidth - widthOne;

    this.terrainOneEl.style.width = widthOne + "px";
    this.terrainTwoEl.style.width = widthTwo + "px";

  },


  // When a player wins enough rounds, the game is over
  // Goes into "finish it" mode.
  gameOver : function(){

    this.mode = "finish";

    document.querySelector("body").classList.add("winner-screen");

    this.score.loser.mode = "ghost";
    this.score.loser.element.classList.add("loser");

    var that = this;

    if(this.score.winner == paddles[0]) {
      this.showMessage("Player 1 Wins!", 1500);
      document.querySelector("body").classList.add("winner-one");
    } else {
      this.showMessage("Player 2 Wins!", 1500);
      document.querySelector("body").classList.add("winner-two");
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

    }, 2000);

  },


  // When the round is over, but a player hasn't wong the game yet
  roundOver: function() {
    paddles[0].maxX = false;
    paddles[1].minX = false;

    removalList.push(ball);

    this.mode = "roundover";

    document.querySelector("body").classList.add("winner-screen");
    var winner, loser;

    if(this.terrainLine == 100) {
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
      document.querySelector("body").classList.add("winner-one");
    } else {
      document.querySelector("body").classList.add("winner-two");
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


  flashTimeout : false,
  playerScored : function(player){

    // Only score when game is still on
    if(this.mode === "off" || this.mode === "finish") {
      return;
    }

    // Make an explosion when someone scores
    makeExplosion(ball.physics.position.x,ball.physics.position.y, 75);

    // Flash some color on the body element to correspond to the player
    // who scored.
    // TODO - move this to a utils function that...
    // * effects.addTemporaryClassName(el, className, durationMS)
    var lightupEl = document.querySelector("body");
    var width = lightupEl.clientWidth;

    if(this.flashTimeout) {
      clearTimeout(this.flashTimeout);
      this.flashTimeout = false;
      lightupEl.classList.remove("light-up-red");
      lightupEl.classList.remove("light-up-blue");
      lightupEl.style.width = width;
    }

    if(player == 1) {
      lightupEl.classList.add("light-up-red");
    } else {
      lightupEl.classList.add("light-up-blue");
    }

    // Remove the lightup
    var that = this;
    this.flashTimeout = setTimeout(function(){
      lightupEl.classList.remove("light-up-red");
      lightupEl.classList.remove("light-up-blue");
      that.flashTimeout = false;
    }, 1000);

    // Check horizontal velocity of the ball
    // the faster it hits an endzone the more that
    // player wins.

    var xForce = Math.abs(ball.physics.velocity.x);
    var xForceRatio = xForce / 15;

    this.terrainChange = 5 + (xForceRatio * 15);

    // Add a message near the impact that indicates
    // the force of the hit (in percentage points)

    if(this.terrainChange >= 10) {
      showMessage({
        text: Math.round(this.terrainChange) + "%",
        x: ball.physics.position.x,
        y: ball.physics.position.y,
        fontSize : (20 + 35 * xForceRatio),
        timeout: 2750
      });
    }

    // Add red or blue particles when the terrain line moves
    var modifier = 1;

    if( player == 2 ) {
      modifier = -1;
    }

    var maxSize = 65;

    for(var i = 0; i < 10; i++) {
      var options = {
        zR : getRandom(-5,5),
        scaleV : -.02,
        height: getRandom(25,maxSize),
        lifespan: 100,
        xV : getRandom(modifier * 15, modifier * 20),
        minX : 0
      }

      options.maxX = 800 - options.height;
      options.x = this.terrainLine/100 * 800 - (modifier * options.height),
      options.xV = options.xV - ((options.height / maxSize) * options.xV * .5);
      options.xVa = -options.xV / 40;
      options.y  = getRandom(0, 500 - options.height);

      if(player == 2) {
        options.className = "blue-chunk";
      } else {
        options.className = "red-chunk";
      }

      options.width = options.height;
      options.x = options.x - options.width / 2;
      makeParticle(options);
    }

    // Move the terrain line accordingly
    if(player === 1) {
      this.terrainLine = this.terrainLine + this.terrainChange;
    } else {
      this.terrainLine = this.terrainLine - this.terrainChange;
    }

    if(this.terrainLine > 100) {
      this.terrainLine = 100;
    } else if(this.terrainLine < 0) {
      this.terrainLine = 0;
    }

    // this.terrainLine = 100; // TODO - comment out <- used for testing instant wins

    this.updateBounds();

    if(this.terrainLine === 100 || this.terrainLine === 0) {
      this.roundOver();
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
  world.gravity.y = 0;
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


var frameTick = 0;  // Keeps track of frames for the ball trail effect

// The main game engine, moves things around

var letterIndex = 0;
var hasPowerup = false;
var currentTime;
var lastTime = false;
var delta;
var worldEl;
var tiltEl;

var reactionMachine;
