// Beginning of game object
var worldEl;
var tiltEl;

// Do a cool <title>

var position = 0;
var direction = "up";

setInterval(function(){

  var titleString = "|";

  for(var i = 0; i < 7; i++) {
    if(i == position) {
      titleString = titleString + "\u2022";
    } else {
      titleString = titleString + "\u00A0";
    }
  }
  titleString = titleString + "|";

  document.title = titleString;

  if(direction == "up") {
    position++;
    if(position > 5) {
      direction = "down";
    }
  } else {
    position--;
    if(position < 1) {
      direction = "up";
    }
  }
}, 250);

var game =  {
  score : {
    player1: 0,
    player2: 0
  },
  terrainLine : 50,
  terrainChange : 5,
  mode : "off", // on - game on, off - game over (refresh browser to restart)
  boardWidth : 0,
  start : function(){
    this.mode = "on";

    var world = document.querySelector(".world");
    this.boardWidth = world.getBoundingClientRect().width;

    var that = this;
    setTimeout(function(){
      that.updateBounds();
    },100);
  },
  updateBounds : function(){
    paddleOne.maxX = this.boardWidth * (this.terrainLine/100);
    paddleTwo.minX = this.boardWidth * (this.terrainLine/100);

    document.querySelector(".terrain.one").style.width = this.terrainLine + "%";
    document.querySelector(".terrain.two").style.width = (100-this.terrainLine) + "%";

  },
  gameOver : function() {
    paddleOne.maxX = false;
    paddleTwo.minX = false;

    this.mode = "off";
    if(this.terrainLine == 100) {
      document.querySelector(".score-display").innerHTML = "&larr; RED WINS";
    } else {
      document.querySelector(".score-display").innerHTML = "&rarr; BLUE WINS";
    }
  },
  flashTimeout : false,
  playerScored : function(player){

    if(this.mode === "off") {
      return;
    }

    makeExplosion(ball.physics.position.x,ball.physics.position.y, 75);

    // playSound("score");

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
    if(xForceRatio > 1) {
      xForceRatio = 1;
    }

    this.terrainChange = 5 + (xForceRatio * 10);
    document.querySelector(".score-display").innerHTML = this.terrainChange.toFixed(1) + "%";

    setTimeout(function(){
      document.querySelector(".score-display").innerHTML = "";
    }, 500);

    // Move the terrain line accordingly
    if(player === 1) {
      this.terrainLine = this.terrainLine - this.terrainChange;
    } else {
      this.terrainLine = this.terrainLine + this.terrainChange;
    }

    this.updateBounds();

    if(this.terrainLine === 100 || this.terrainLine === 0) {
      this.gameOver();
    }

    // Add red or blue particles when the terrain line moves
    for(var i = 0; i < 10; i++) {
      var options = {
        x : this.terrainLine/100 * 800,
        y : getRandom(20,460),
        zRv : getRandom(-2,2),
        scaleV : -.01,
        height: getRandom(15,25),
        lifespan : 100
      }

      if(player === 1) {
        options.xV = getRandom(-1, -3);
        options.xVa = .03;
        options.className = "blue-chunk";
      } else {
        options.xV = getRandom(1, 3);
        options.xVa = -.03;
        options.className = "red-chunk";
      }

      options.width = options.height;
      options.x = options.x - options.width / 2;
      makeParticle(options);
    }

    if(this.terrainLine > 100) {
      this.terrainLine = 100;
    } else if(this.terrainLine < 0) {
      this.terrainLine = 0;
    }

  }
}


// Sets up the world
document.addEventListener('DOMContentLoaded', function () {

  // Build a renderer based on an element
  setupRenderer(".world");

  worldEl = document.querySelector(".world");
  tiltEl = document.querySelector(".tilt-wrapper");

  game.start();

});


function setupRenderer(worldSelector){

  var sBox = document.querySelector(worldSelector);
  var sBoxDim = sBox.getBoundingClientRect();

  game.boardWidth = sBoxDim.width;
  game.start();

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

  // Render.run(render); // TODO - since this is for debugging only, we should make it a flag
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


// Bounds for collision detection
// This keeps it inside the world DIV / area

// The main game engine, moves things around
var tick = 0;

(function run() {

  // TODO - should we base the engine update tick based on elapsed time since last frame?

  Engine.update(engine, 1000 / 60);

  objectsToRender.forEach(function (obj) {

    if(obj.selector == ".ball") {

      var deltaX = 400 - obj.physics.position.x;
      var deltaY = 250 - obj.physics.position.y;

      var rotateX = 5 * deltaY/250 + 20 ;
      var rotateY = -5 * deltaX/400;

      if(obj.gotHit) {
        obj.resolveHit();
      }

      tiltEl.style.transform = "rotateX("+rotateX+"deg) rotateY("+rotateY+"deg)";

      if(ball.physics.speed > 8) {

        tick++;
        if(tick > 4) {
          var options = {
            x : ball.physics.position.x - 3,
            y : ball.physics.position.y - 3,
            o : .5,
            oV : -.01,
            height: 6,
            width: 6,
            lifespan : 100,
            className : "speed"
          }

          makeParticle(options);
          tick = 0;
        }


      }

    }

    var el = obj.element;
    var physics = obj.physics;
    var x = physics.position.x - obj.width / 2;
    var y = physics.position.y - obj.height / 2;
    var angle = physics.angle;

    el.style.transform = 'translateX('+ x + 'px) translateY(' + y + 'px) rotate(' + angle + 'rad)';

    if(obj.update){
      obj.update();
    }
  });

  // Saving this for later
  // var removalList = [];
  // removalList.forEach(function (element) {
  //   element.parentNode.removeChild(element);
  //   World.remove(engine.world, element.physics);
  //   objectsToRender.splice(objectsToRender.indexOf(element), 1);
  // });

  requestAnimationFrame(run);
})();




// Collision manager
Events.on(engine, 'collisionStart', function(event) {
  var pairs = event.pairs;

  for (var i = 0, j = pairs.length; i != j; ++i) {
    var pair = pairs[i];
    var objA, objB;

    for(var k = 0; k < objectsToRender.length; k++) {
      if(objectsToRender[k].physics === pair.bodyA){
        objA = objectsToRender[k];
      }
      if(objectsToRender[k].physics === pair.bodyB){
        objB = objectsToRender[k];
      }
    }

    if(!objA){
      objA = {};
    }
    if(!objB){
      objB = {};
    }

    collisionManager(objA,objB);
  }

});


// Runs collision stuff! - this seems lame still
// Should we build a Game object that has this and all of the states?
// Should we build a lookup table thing to quickly get the parent object based on the object.physics?

function collisionManager(a,b){

  // These are the physics objects from the engine
  // Need a good way to map these to our gameobjects inside objectsToRender
  // so that we can reference them easily.
  // Some kind of lookup function?

  var objects = [];
  objects.push(a);
  objects.push(b);

  var selectors = [];
  selectors.push(a.selector);
  selectors.push(b.selector);

  var scored = false;

  if(selectors.indexOf(".ball") > -1 && selectors.indexOf(".endzone.one") < 0 && selectors.indexOf(".endzone.two") < 0) {
    var index = selectors.indexOf(".ball");
    objects[index].hit();
  }

  if(selectors.indexOf(".ball") > -1 && selectors.indexOf(".endzone.one") > -1) {
    game.playerScored(1);
    scored = true;
  }

  if(selectors.indexOf(".ball") > -1 && selectors.indexOf(".endzone.two") > -1) {
    game.playerScored(2);
    scored = true;
  }

}
