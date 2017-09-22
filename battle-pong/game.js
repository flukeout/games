// Beginning of game object
var worldEl;
var tiltEl;

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
  },
  gameOver : function() {
    this.mode = "off";
    if(this.terrainLine == 100) {
      document.querySelector(".score-display").innerHTML = "&larr; RED WINS";
    } else {
      document.querySelector(".score-display").innerHTML = "&rarr; BLUE WINS";
    }
  },
  playerScored : function(player){


    if(this.mode === "off") {
      return;
    }

    document.querySelector(".world").classList.add("light-up");

    setTimeout(function(){
      document.querySelector(".world").classList.remove("light-up");
    },250);

    if(player === 1) {
      this.terrainLine = this.terrainLine - this.terrainChange;
    } else {
      this.terrainLine = this.terrainLine + this.terrainChange;
    }

    document.querySelector(".terrain.one").style.width = this.terrainLine + "%";
    document.querySelector(".terrain.two").style.width = (100-this.terrainLine) + "%";
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

  game.start();

});


function setupRenderer(worldSelector){

  var sBox = document.querySelector(worldSelector);
  var sBoxDim = sBox.getBoundingClientRect();

  game.boardWidth = sBoxDim.width;
  game.start();

  addWalls(World, sBoxDim.width, sBoxDim.height);
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

  Render.run(render);
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
function addWalls(World, width, height){

  var thickness = 100;

  // Top
  var topWall = Bodies.rectangle(width/2, -50, width, thickness, { isStatic: true });
  World.add(engine.world, topWall);

  // Left
  var leftWall = Bodies.rectangle(0 - thickness/2, height/2, thickness, height, { isStatic: true });
  World.add(engine.world, leftWall);

  // Right
  var rightWall = Bodies.rectangle(width + thickness/2, height/2, thickness, height, { isStatic: true });
  World.add(engine.world, rightWall);

  // Bottom
  var bottomWall = Bodies.rectangle(width/2, height + 50, width, thickness, { isStatic: true });
  World.add(engine.world, bottomWall);

}


// Bounds for collision detection
// This keeps it inside the world DIV / area

// The main game engine, moves things around
(function run() {

  // TODO - should we base the engine update tick based on elapsed time since last frame?
  Engine.update(engine, 1000 / 60);

  checkControllers();

  objectsToRender.forEach(function (obj) {

    if(obj.selector == ".ball") {

      var deltaX = 400 - obj.physics.position.x;
      var deltaY = 250 - obj.physics.position.y;

      var rotateX = 5 * deltaY/250 + 20 ;
      var rotateY = -5 * deltaX/400;

      tiltEl.style.transform = "rotateX("+rotateX+"deg) rotateY("+rotateY+"deg)";
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

    // if(objA && objB){
      collisionManager(objA,objB);
    // }
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

  console.log(a);

  var scored = false;

  if(selectors.indexOf(".ball") > -1 && selectors.indexOf(".endzone.one") < 0 && selectors.indexOf(".endzone.two") < 0) {
    playSound("hit");
    console.log("hit");
    console.log("=====");
  }


  if(selectors.indexOf(".ball") > -1 && selectors.indexOf(".endzone.one") > -1) {
    game.playerScored(1);
    scored = true;
  }

  if(selectors.indexOf(".ball") > -1 && selectors.indexOf(".endzone.two") > -1) {
    game.playerScored(2);
    scored = true;
  }

  if(scored){
    for(var i = 0; i < selectors.length; i++) {
      var selector = selectors[i];
      if(selector.indexOf("endzone") > -1){
        var endzone = objects[i];
        endzone.lightUp();
      }
    }
  }
}
