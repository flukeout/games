(function () {

    document.addEventListener('DOMContentLoaded', function () {

      setTimeout(function(){
        document.querySelector(".world").style.transform = "rotateX(40deg)";
      },1000);

    var Engine = Matter.Engine,
        World = Matter.World,
        Bodies = Matter.Bodies,
        Render = Matter.Render,
        Runner = Matter.Runner,
        Constraint = Matter.Constraint;

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


      if(element.classList.contains("controller")) {
        console.log("controller",element);
        var object = Bodies.rectangle(props.x, props.y, props.width, props.height, {
          isStatic: false,
          isSensor: true,
          angle: props.angle,
          frictionAir: 0.00001,
          restitution: 1,

          collisionFilter: {
            mask: 0x0001
          }

        });
      } else if(props.bodyType == "rectangle") {
        var object = Bodies.rectangle(props.x, props.y, props.width, props.height, {
          isStatic: static,
          angle: props.angle,
          frictionAir: 0.1,
          restitution: 1,

          collisionFilter: {
            category: 0x0002
          }

        });
      } else {
        var object = Bodies.circle(props.x, props.y, props.width/2,  {
          isStatic: static,
          angle: props.angle,
          frictionAir: 0.00001,
          restitution: 1,
          collisionFilter: {
            category: 0x0002
          }

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

      // if (element.getAttribute('data-static') !== "true") {
        objectsToRender.push(element);
      // }

      World.add(engine.world, [object]);
    });

    // console.log(objectsToRender);

    var controllerBox = objectsToRender[0];
    var ball = objectsToRender[1];
    var paddle = objectsToRender[2];

    Matter.Body.applyForce(ball.physics, ball.physics.position, {
      x: 0,
      y: 0.02
    });

    // var constraint = Constraint.create({
    //     bodyA: controllerBox.physics,
    //     pointA: { x: 0, y: 0},
    //     bodyB: paddle.physics,
    //     pointB: { x: 0, y: 0},
    //     length: 0,
    //     stiffness : 0.05
    //     // damping: .1
    // });

    // World.add(world, [controllerBox.physics, paddle.physics, constraint]);

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
          var angV = element.physics.angularVelocity;
          var angle = element.physics.angle;


          var torquePower = .05;

          // if(angle < 0) {
          //   if(angV > Math.abs(angle)){
          //     element.physics.angle = 0;
          //     Matter.Body.setAngularVelocity(element.physics, 0);
          //   } else {
          //     Matter.Body.setAngularVelocity(element.physics, angV * .9);
          //     element.physics.torque = Math.abs(angle) * torquePower;
          //   }
          // }  else  if (angle > 0) {
          //   if(angV > Math.abs(angle)){
          //     element.physics.angle = 0;
          //     Matter.Body.setAngularVelocity(element.physics, 0);
          //   } else {
          //     Matter.Body.setAngularVelocity(element.physics, angV * .9);
          //     element.physics.torque = -angle * torquePower;
          //   }
          // }
        }

        if(element.classList.contains("paddle")) {

          // Matter.Body.setAngularVelocity(element.physics, angV * .9);

          var x = element.physics.position.x;
          var y = element.physics.position.y;


          if(y < 425) {
            Matter.Body.applyForce(element.physics, element.physics.position, {
              x: 0,
              y : .005
            })
          }

          if(y > 525) {
            Matter.Body.applyForce(element.physics, element.physics.position, {
              x: 0,
              y : -.005
            })
          }


          if(controller.a) {
            Matter.Body.setAngularVelocity(element.physics, .2);
          }
          if(controller.b) {
            Matter.Body.setAngularVelocity(element.physics, -.2);
          }


          if(controller.up) {
              Matter.Body.applyForce(element.physics, element.physics.position, {
                x: 0,
                y: -.004
              });
              // paddle.physics.torque = -2;
          }
          if(controller.down) {
            Matter.Body.applyForce(element.physics, element.physics.position, {
              x: 0,
              y: .004
            });
          }
          if(controller.left) {
            Matter.Body.applyForce(element.physics, element.physics.position, {
              x: -0.004,
              y: 0
            });
          }
          if(controller.right) {
            Matter.Body.applyForce(element.physics, element.physics.position, {
              x: 0.004,
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
