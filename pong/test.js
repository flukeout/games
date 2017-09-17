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

    var worldSelector = ".world";

    var sBox = document.querySelector(worldSelector);
    var sBoxDim = sBox.getBoundingClientRect();

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

    // Bounds for collision detection
    // This keeps it inside the world DIV / area
    world.bounds.min.x = 0;
    world.bounds.max.x = sBoxDim.width;
    world.bounds.min.y = 0;
    world.bounds.max.y = sBoxDim.height;


    world.gravity.y = 0;

    Render.run(render);

    // Bottom
    var bounds = Bodies.rectangle(0 + sBoxDim.width/2, sBoxDim.height + 50, sBoxDim.width, 100, { isStatic: true });
    World.add(engine.world, bounds);

    var bounds = Bodies.rectangle(0 + sBoxDim.width/2, -50, sBoxDim.width, 100, { isStatic: true });
    World.add(engine.world, bounds);

    var bounds = Bodies.rectangle(0, sBoxDim.height/2, 20, sBoxDim.height, { isStatic: true });
    World.add(engine.world, bounds);

    var bounds = Bodies.rectangle(sBoxDim.width, sBoxDim.height/2, 20, sBoxDim.height, { isStatic: true });
    World.add(engine.world, bounds);


    function turnDOMElementIntoPhysicsObject(element) {
      var static = element.hasAttribute('data-static') ? element.getAttribute('data-static') : false;

      var props = getElementProperties(element);

      if(props.bodyType == "rectangle") {
        var object = Bodies.rectangle(props.x, props.y, props.width, props.height, {
          isStatic: static,
          angle: props.angle,
          frictionAir: 0.00001,
          restitution: 1
        });
      } else {
        var object = Bodies.circle(props.x, props.y, props.width/2,  {
          isStatic: static,
          angle: props.angle,
          frictionAir: 0.00001,
          restitution: 1
        });
      }

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

    // Add everything that exists in the world on pageload to the simulation
    Array.prototype.slice.call(document.querySelectorAll(worldSelector + ' [data-physics]')).forEach(function (element) {
      var object = turnDOMElementIntoPhysicsObject(element);
      if (element.getAttribute('data-static') !== "true") {
        objectsToRender.push(element);
      }

      World.add(engine.world, [object]);
    });

    var ball = objectsToRender[0];

    Matter.Body.applyForce(ball.physics, ball.physics.position, {
      x: 0,
      y: 0.01
    });


    // The main game engine, moves things around
    (function run() {
      // TODO - should we base the engine update tick based on elapsed time since last frame?
      Engine.update(engine, 1000 / 60);

      var removalList = [];

      objectsToRender.forEach(function (element) {
        var x = (element.physics.position.x - element.clientWidth / 2);
        var y = (element.physics.position.y - element.clientHeight / 2);
        var angle = element.physics.angle;

        element.style.transform = 'translateX('+ x + 'px) translateY(' + y + 'px) rotate(' + angle + 'rad)';

        if(element.classList.contains("paddle")) {

          // var angleVel = element.physics.angularVelocity ;
          // Matter.Body.setAngularVelocity(element.physics, angleVel * .9);

          if(element.physics.angle > 1) {
            console.log(">1");
            element.physics.torque = -.2;
          } else if(element.physics.angle < -1) {
            console.log("<1");
            element.physics.torque = .2;
          }

          //  else {
          //   console.log("set to zero-----------");
          //   Matter.Body.setAngle(element.physics, 0);

          // }

          // if(Math.abs(element.physics.angularVelocity) > 0) {
          //   element.physics.torque = - 4 * element.physics.angularVelocity;
          // }

          if(controller.up) {
            Matter.Body.applyForce(element.physics, element.physics.position, {
              x: 0,
              y: -0.001
            });
          }
          if(controller.down) {
            Matter.Body.applyForce(element.physics, element.physics.position, {
              x: 0,
              y: .001
            });
          }
          if(controller.left) {
            Matter.Body.applyForce(element.physics, element.physics.position, {
              x: -0.001,
              y: 0
            });
          }
          if(controller.right) {
            Matter.Body.applyForce(element.physics, element.physics.position, {
              x: 0.001,
              y: 0
            });
          }
        }

        // if (element.physics.position.y > window.innerHeight + 100) {
        //   removalList.push(element);
        // }
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
