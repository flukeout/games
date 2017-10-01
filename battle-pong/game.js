var worldEl;
var tiltEl;

var game =  {
  terrainLine : 50,
  terrainChange : 5,
  mode : "off", // on - game on, off - game over (refresh browser to restart)
  boardWidth : 0,
  boardHeight: 0,
  runLoopStarted : false,
  terrainOne : "",
  terrainTwo: "",
  restartTimeoutMS: 3500, //time before the game restarts
  init: function(){

    var world = document.querySelector(".world");
    this.boardWidth = world.getBoundingClientRect().width;
    this.boardHeight = world.getBoundingClientRect().height;

    this.terrainOne = document.querySelector(".terrain.one");
    this.terrainTwo = document.querySelector(".terrain.two");

    run();

    this.restart();
  },

  restart : function(){



    this.mode = "on";
    hasPowerup  = false;
    ball.launch(0, .02);

    this.terrainLine = 50;
    this.updateBounds();

    document.querySelector(".score-display").innerHTML = "";

    Matter.Body.set(ball.physics, {
      position: { x: 400, y: 0 },
      velocity: { x: 0, y: 0 }
    });
  },

  // Updates the terrain and the paddle movement
  // restrictions.
  updateBounds : function(){
    paddleOne.maxX = this.boardWidth * (this.terrainLine/100);
    paddleTwo.minX = this.boardWidth * (this.terrainLine/100);

    this.terrainOne.style.width = this.terrainLine + "%";
    this.terrainTwo.style.width = (100-this.terrainLine) + "%";

    // var deltaX = ball.physics.position.x - paddleTwo.physics.position.x;
    // var deltaY = ball.physics.position.y - paddleTwo.physics.position.y;

  },

  gameOver : function() {
    paddleOne.maxX = false;
    paddleTwo.minX = false;

    this.mode = "off";

    if(this.terrainLine == 100) {
      document.querySelector(".score-display").innerHTML = "&larr; P1 WINS";
    } else {
      document.querySelector(".score-display").innerHTML = "P2 WINS &rarr;";
    }

    var that = this;
    setTimeout(function(){
      that.restart();
    }, this.restartTimeoutMS);

  },
  flashTimeout : false,
  playerScored : function(player){

    // Only score when game is still on
    if(this.mode === "off") {
      return;
    }

    // Make an explosion when someone scores
    makeExplosion(ball.physics.position.x,ball.physics.position.y, 75);

    // var delta = Math.sqrt(Math.pow(deltaX,2) + Math.pow(deltaY,2));

    // var deltaX = ball.physics.position.x - paddleTwo.physics.position.x;
    // var deltaY = ball.physics.position.y - paddleTwo.physics.position.y;
    // var delta = Math.sqrt(Math.pow(deltaX,2) + Math.pow(deltaY,2));

    // console.log(paddleTwo.element.remove());




    // Flash some color on the body element to correspond to the player
    // who scored.
    var lightupEl = document.querySelector("body");
    var width = lightupEl.getBoundingClientRect().width;

    if(this.flashTimeout) {
      clearTimeout(this.flashTimeout);
      this.flashTimeout = false;
      lightupEl.classList.remove("light-up-red");
      lightupEl.classList.remove("light-up-blue");
      lightupEl.style.width = width;
    }

    if(player == 2) {
      lightupEl.classList.add("light-up-red");
    } else {
      lightupEl.classList.add("light-up-blue");
    }

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
    var messageEl = document.createElement("div");
    messageEl.classList.add("message");
    var messageBody = document.createElement("div");
    messageBody.classList.add("body");
    messageBody.innerText = Math.round(this.terrainChange) + "%";
    messageBody.style.fontSize = (20 + 35 * xForceRatio) + "px";
    messageEl.appendChild(messageBody);

    messageEl.style.transform = "translateX("+ ball.physics.position.x +"px) translateY(" + ball.physics.position.y +"px)";

    document.querySelector(".world").appendChild(messageEl);

    setTimeout(function(el) {
      return function() {
        el.remove();
      };
    }(messageEl), 2750);

    // Add red or blue particles when the terrain line moves
    var modifier = 1;
    if( player===1 ) {
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

      if(player === 1) {
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
      this.terrainLine = this.terrainLine - this.terrainChange;
    } else {
      this.terrainLine = this.terrainLine + this.terrainChange;
    }

    if(this.terrainLine > 100) {
      this.terrainLine = 100;
    } else if(this.terrainLine < 0) {
      this.terrainLine = 0;
    }

    this.updateBounds();




    if(this.terrainLine === 100 || this.terrainLine === 0) {
      this.gameOver();
    }



  }
}


// Sets up the world
document.addEventListener('DOMContentLoaded', function () {

  // Build a renderer based on an element
  setupRenderer(".world");

  worldEl = document.querySelector(".world");
  tiltEl = document.querySelector(".tilt-wrapper");


});


function setupRenderer(worldSelector){

  var sBox = document.querySelector(worldSelector);
  var sBoxDim = sBox.getBoundingClientRect();

  game.boardWidth = sBoxDim.width;


  addWalls({
    world: World,
    width: sBoxDim.width,
    height: sBoxDim.height,
    sides : ["top","right","bottom","left"]
  });

  // Create a renderer
  var render = Render.create({
    element: document.querySelector(worldSelector),
    engine: engine,
    options: {
      width: sBoxDim.width,
      height: sBoxDim.height,
      showVelocity: true,
      showAngleIndicator: true
    }
  });

  world.bounds.min.x = 0;
  world.bounds.max.x = sBoxDim.width;
  world.bounds.min.y = 0;
  world.bounds.max.y = sBoxDim.height;
  world.gravity.y = 0;

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

    var wall = Bodies.rectangle(x, y, wallWidth, wallHeight, { isStatic: true });
    wall.friction = options.friction || 0;
    world.add(engine.world, wall);
  }
}




var frameTick = 0;  // Keeps track of frames for the ball trail effect

// The main game engine, moves things around

var letterIndex = 0;
var hasPowerup = false;

function run() {

  // TODO - should we base the engine update tick based on elapsed time since last frame?

  if(!hasPowerup) {
    var chance = getRandom(0, 250);
    if(chance < 1) {
      addPowerup(game.boardWidth * game.terrainLine/100, getRandom(0, game.boardHeight - 50));
      hasPowerup = true;
    }
  }


  Engine.update(engine, 1000 / 60);

  objectsToRender.forEach(function (obj) {

    if(obj == ball) {

      var deltaX = 400 - ball.physics.position.x;
      var deltaY = 250 - ball.physics.position.y;

      var rotateX = 5 * deltaY/250 + 20 ;
      var rotateY = -5 * deltaX/400;

      tiltEl.style.transform = "rotateX("+rotateX+"deg) rotateY("+rotateY+"deg) rotateZ(0)";

      // This is how we have to handle collisions
      // First they get marked as hit by the collisionManager
      // then we resolve the collision on the next frame.
      if(obj.gotHit) {
        obj.resolveHit();
      }


    }

    if(obj.run) {
      obj.run();
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


    if(obj.update){
      obj.update();
    }
  });

  drawParticles();

  // Saving this for later
  removalList.forEach(function (obj) {
    obj.element.parentNode.removeChild(obj.element);
    World.remove(engine.world, obj.physics);
    objectsToRender.splice(objectsToRender.indexOf(obj), 1);
  });

  removalList = [];

  requestAnimationFrame(run);
};
