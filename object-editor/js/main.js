(function () {

  document.addEventListener('DOMContentLoaded', function (e) {
    var animationDefinitions = {
      "wobble" : {
        "duration" : {
          "min" : .01,
          "max" : 2,
        },
        "distance" : {
          "min" : 10,
          "max" : 200,
          "value" : 50
        }
      },
      "bounce" : {
        "duration" : {
          "min" : .01,
          "max" : 2,
        }
      },
      "spin" : {
        "duration" : {
          "min" : .01,
          "max" : 2,
        }
      },
      "spinY" : {
        "duration" : {
          "min" : .01,
          "max" : 2,
        }
      },
      "spinX" : {
        "duration" : {
          "min" : .01,
          "max" : 2,
        }
      },
      "dance" : {
        "duration" : {
          "min" : .01,
          "max" : 2,
        }
      },
      "pulse" : {
        "duration" : {
          "min" : .01,
          "max" : 1,
        },
        "scale" : {
          "min" : 1.1,
          "max" : 2,
        }
      }
    };


    var animationModel = {};

    var gui = new dat.GUI();

    var object = document.querySelector('.object');
    var objectContent = object.querySelector('.content');

    function changeAnimation() {
      objectContent.parentNode.removeChild(objectContent);
      object.innerHTML = '';

      var lastTransform = object;

      Object.keys(animationModel).forEach(function (animationName) {
        var properties = animationModel[animationName];
        if (properties.enabled) {
          var transform = document.createElement('div');
          transform.classList.add('transform');
          transform.classList.add(animationName);
          transform.style.animation = animationName + ' ' + properties.duration + 's' + ' linear infinite';
          lastTransform.appendChild(transform);
          lastTransform = transform;
        }
      });

      lastTransform.appendChild(objectContent);
    }

    Object.keys(animationDefinitions).forEach(function (animationName) {
      var folder = gui.addFolder(animationName);
      animationModel[animationName] = {};
      animationModel[animationName].enabled = false;

      folder.add(animationModel[animationName], 'enabled').onChange(function (value) {
        if (value) object.classList.add(animationName);
        else object.classList.remove(animationName);
        changeAnimation();
      });

      Object.keys(animationDefinitions[animationName]).forEach(function (param) {
        var paramDefinition = animationDefinitions[animationName][param];
        var max = paramDefinition.max;
        var min = paramDefinition.min;
        var value = paramDefinition.value || ((max + min) / 2);
        var step = paramDefinition.step || ((max - min) / 50);

        animationModel[animationName][param] = value;
        
        folder.add(animationModel[animationName], param, min, max).step(step).onChange(function (value) {
          changeAnimation();
        });
      });


    });

  });

})();