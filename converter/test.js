(function () {

    document.addEventListener('DOMContentLoaded', function () {

    var Engine = Matter.Engine,
        World = Matter.World,
        Bodies = Matter.Bodies,
        Render = Matter.Render,
        Runner = Matter.Runner;

    var engine = Engine.create(),
        world = engine.world;

    var objectsToRender = [];
    var realBoxes = [];

    var sBox = document.querySelector(".sandbox");
    var sBoxDim = sBox.getBoundingClientRect();

    // create renderer
    var render = Render.create({
      element: document.body,
      engine: engine,
      options: {
        width: sBoxDim.width,
        height: sBoxDim.height,
        showVelocity: true,
        showAngleIndicator: true
      }
    });

    Render.run(render);

    function turnDOMElementIntoPhysicsObject(element) {
      var static = element.hasAttribute('data-static') ? element.getAttribute('data-static') : false;

      var props = getElementProperties(element);

      var object = Bodies.rectangle(props.x, props.y, props.width, props.height, {
        isStatic: static,
        angle: props.angle,
      });

      element.physics = object;

      if (!static) resetElementPosition(element);
      return object;
    }

    // After we add a physics element to the simulation, we need to strip its original CSS positioning
    // and let the engine handle it all via it's own X,Y coords.
    function resetElementPosition(element) {
      element.style.top = 0;
      element.style.left = 0;
      element.style.bottom = "";
      element.style.right = "";
    }

    Array.prototype.slice.call(document.querySelectorAll('.sandbox [data-physics]')).forEach(function (element) {
      var object = turnDOMElementIntoPhysicsObject(element);
      if (element.getAttribute('data-static') !== "true") {
        objectsToRender.push(element);
      }
      World.add(engine.world, [object]);
    });

    (function run() {
      // TODO - should we base the engine update tick based on elapsed time since last frame?
      Engine.update(engine, 1000 / 60);

      var removalList = [];

      objectsToRender.forEach(function (element) {
        var x = (element.physics.position.x - element.clientWidth / 2);
        var y = (element.physics.position.y - element.clientHeight / 2);
        var angle = element.physics.angle;

        element.style.transform = 'translateX('+ x + 'px) translateY(' + y + 'px) rotate(' + angle + 'rad)';

        if (element.physics.position.y > window.innerHeight + 100) {
          removalList.push(element);
        }
      });

      removalList.forEach(function (element) {
        element.parentNode.removeChild(element);
        World.remove(engine.world, element.physics);
        objectsToRender.splice(objectsToRender.indexOf(element), 1);
      });

      requestAnimationFrame(run);
    })();
  });
})();
