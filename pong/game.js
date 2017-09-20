// Beginning of game object
var score = {
  player1: 0,
  player2: 0
}


// Sets up the world
document.addEventListener('DOMContentLoaded', function () {

  // Build a renderer based on an element
  setupRenderer(".world");

  // Wait until DOM is parsed and measured,
  // Then tilt it for a cool effect.
  setTimeout(function(){
    document.querySelector(".world").style.transform = "rotateX(40deg)";
  },1000);


});


function setupRenderer(worldSelector){

  var sBox = document.querySelector(worldSelector);
  var sBoxDim = sBox.getBoundingClientRect();

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
  var bounds = Bodies.rectangle(width/2, -50, width, thickness, { isStatic: true });
  World.add(engine.world, bounds);

  // Left
  var bounds = Bodies.rectangle(0 - thickness/2, height/2, thickness, height, { isStatic: true });
  World.add(engine.world, bounds);

  // Right
  var bounds = Bodies.rectangle(width + thickness/2, height/2, thickness, height, { isStatic: true });
  World.add(engine.world, bounds);

  // Bottom
  var bounds = Bodies.rectangle(width/2, height + 50, width, thickness, { isStatic: true });
  World.add(engine.world, bounds);

}


// Bounds for collision detection
// This keeps it inside the world DIV / area



// The main game engine, moves things around
(function run() {
  // TODO - should we base the engine update tick based on elapsed time since last frame?
  Engine.update(engine, 1000 / 60);

  objectsToRender.forEach(function (obj) {

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

    if(objA && objB){
      collisionManager(objA,objB);
    }
  }
});


// Runs collision stuff!
// Should we build a Game object that has this and all of the states?
function collisionManager(a,b){
  console.log("======= COLLISION ========");

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

  if(selectors.indexOf(".ball") > -1 && selectors.indexOf(".endzone.two") > -1) {
    score.player1++;
    scored = true;
  }

  if(selectors.indexOf(".ball") > -1 && selectors.indexOf(".endzone.one") > -1) {
    score.player2++;
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

  // Update the score after any collision
  // Should move to a functoin on the game object
  document.querySelector(".score-display").innerText = score.player1 + " : " + score.player2;
}