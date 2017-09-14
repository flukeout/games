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
      return object;
    }

    Array.prototype.slice.call(document.querySelectorAll('[data-physics]')).forEach(function (element) {
      var object = turnDOMElementIntoPhysicsObject(element);
      objectsToRender.push(element);
      World.add(engine.world, [object]);
    });


    (function run() {
      window.requestAnimationFrame(run);
      Engine.update(engine, 1000 / 60);
      objectsToRender.forEach(function (object) {
        object.style.left = (object.physics.position.x - object.clientWidth / 2) + 'px';
        object.style.top = (object.physics.position.y - object.clientHeight / 2) + 'px';
      });
    })();

    var fakeBox = document.querySelector('#fake-box');
    document.addEventListener('mousemove', function (e) {
      fakeBox.style.left = (e.clientX - fakeBox.clientWidth / 2) + 'px';
      fakeBox.style.top = (e.clientY - fakeBox.clientHeight / 2) + 'px';
    });

    fakeBox.addEventListener('click', function (e) {
      var realBox = fakeBox.cloneNode(true);
      realBox.id = '';
      realBox.classList.add('real-box');

      if (Math.random() > 0.5) realBox.classList.add('flip');

      document.body.appendChild(realBox);
      objectsToRender.push(realBox);
      World.add(engine.world, [turnDOMElementIntoPhysicsObject(realBox)]);

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
