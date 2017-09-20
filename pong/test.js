// (function () {

document.addEventListener('DOMContentLoaded', function () {
  var sBox = document.querySelector(worldSelector);
  var sBoxDim = sBox.getBoundingClientRect();

  addWalls(World, sBoxDim.width, sBoxDim.height);

  // create renderer
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

});

// setTimeout(function(){
//   document.querySelector(".world").style.transform = "rotateX(40deg)";
// },1000);

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

var worldSelector = ".world";


// Adds 4 walls to the World to surround it
function addWalls(World, width, height){

  var thickness = 100;
  // x, y, width, height

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

// After we add a physics element to the simulation, we need to strip its original CSS positioning
// and let the engine handle it all via it's own X,Y coords.
function resetElementPosition(element) {
  element.style.top = 0;
  element.style.left = 0;
  element.style.bottom = "";
  element.style.right = "";
}

// var controllerBox = objectsToRender[0];
// var ball = objectsToRender[1];
// var paddle = objectsToRender[2];


// The main game engine, moves things around
(function run() {
  // TODO - should we base the engine update tick based on elapsed time since last frame?
  Engine.update(engine, 1000 / 60);

  checkControllers();

  var removalList = [];

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

  removalList.forEach(function (element) {
    element.parentNode.removeChild(element);
    World.remove(engine.world, element.physics);
    objectsToRender.splice(objectsToRender.indexOf(element), 1);
  });

  requestAnimationFrame(run);
})();
