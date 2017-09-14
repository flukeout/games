(function () {

  document.addEventListener('DOMContentLoaded', function () {
    var Engine = Matter.Engine,
        World = Matter.World,
        Bodies = Matter.Bodies;

    var engine = Engine.create(),
        world = engine.world;

    var objectsToRender = [];
    var realBoxes = [];

    function turnDOMElementIntoPhysicsObject(element) {
      var static = element.hasAttribute('data-static') ? element.getAttribute('data-static') : false;
      var rect = element.getBoundingClientRect();
      var width = rect.width;
      var height = rect.height;
      var x = rect.left + width / 2;
      var y = rect.top + height / 2;
      var object = Bodies.rectangle(x, y, width, height, { isStatic: static });
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

    Array.prototype.slice.call(document.querySelectorAll('[data-physics]')).forEach(function (element) {
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

    var fakeBox = document.querySelector('#fake-box');
    document.addEventListener('mousemove', function (e) {
      fakeBox.style.transform = 'translate(' + (e.clientX - fakeBox.clientWidth / 2) + 'px' + ',' + (e.clientY - fakeBox.clientHeight / 2) + 'px)';
    });

    fakeBox.addEventListener('click', function (e) {
      var realBox = fakeBox.cloneNode(true);
      realBox.id = '';
      realBox.classList.add('real-box');

      if (Math.random() > 0.5) realBox.classList.add('flip');

      realBox.classList.add('hide');
      document.body.appendChild(realBox);

      objectsToRender.push(realBox);
      World.add(engine.world, [turnDOMElementIntoPhysicsObject(realBox)]);

      realBox.physics.render.visible = false;

      realBox.style.left = 0;
      realBox.style.top = 0;

      var x = (realBox.physics.position.x - realBox.clientWidth / 2);
      var y = (realBox.physics.position.y - realBox.clientHeight / 2);
      realBox.style.transform = 'translate(' + x + 'px,' + y + 'px)';

      realBox.classList.remove('hide');

      realBox.onclick = function (e) {
        Matter.Body.applyForce(realBox.physics, realBox.physics.position, {
          x: (Math.random() - 0.5) * 0.1,
          y: -(Math.random()) * 0.3
        });
      };

      realBoxes.push(realBox);
    });

    var wind = document.querySelector('#wind');

    function randomWind () {
      var windInterval;

      function windHai () {
        wind.classList.add('hai');
        windInterval = setInterval(function () {
          realBoxes.forEach(function (realBox) {
            Matter.Body.applyForce(realBox.physics, realBox.physics.position, {
              x: 0.01,
              y: 0
            });
          });
        }, 100);

        setTimeout(windBai, Math.random() * 5000 + 1000);
      }

      function windBai () {
        wind.classList.remove('hai');
        setTimeout(function () {
          clearInterval(windInterval);
          randomWind();
        }, 2000);
      }

      setTimeout(windHai, Math.random() * 3000 + 1000);
    }

    randomWind();

  });

})();
