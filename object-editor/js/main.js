(function () {

  var animationTimingFunctions = ['linear', 'ease', 'ease-in', 'ease-out', 'ease-in-out', 'step-start', 'step-end'];

  function getXHR(url, callback) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.onload = function (e) {
      callback(xhr.response);
    };
    xhr.send();
  }

  function getMultipleXHRs(urls, callback) {
    var done = 0;
    var results = {};
    urls.forEach(function (url) {
      getXHR(url, function (data) {
        results[url] = data;
        ++done;
        if (done === urls.length) {
          // console.log(results);
          setTimeout(function () {
            callback(results);
          }, 0);
        }
      });
    });
  }

  function AnimationCompiler() {
    var _sass = new Sass();
    var _currentJob = null; 

    function Job(jobSpec, finishedCallback) {
      var _canceled = false;
      var _done = 0;
      var _results = {};
      
      var animations = Object.keys(jobSpec.animations);

      animations.forEach(function (animationName) {
        _sass.compile(jobSpec.animations[animationName], function (result) {
          if (_canceled) return;
          _results[animationName] = result.text;
          ++_done;
          if (_done == animations.length) {
            finishedCallback(_results);
          }
        });
      });

      this.cancel = function () {
        _canceled = true;
      };
    }

    this.compile = function (job, callback) {
      if (_currentJob) {
        _currentJob.cancel();
      }
      _currentJob = new Job(job, callback);
    };
  }

  function ready(animationDefinitions, animationFilesData, objectModel) {
    var animationCompiler = new AnimationCompiler();

    objectModel.save = function () {
      var tempResult = JSON.parse(JSON.stringify(objectModel));

      Object.keys(tempResult.animations).forEach(function (state) {
        Object.keys(tempResult.animations[state]).forEach(function (animation) {
          if (tempResult.animations[state][animation].enabled === false) {
            delete tempResult.animations[state][animation];
          }
        });
      });

      delete tempResult.currentState;

      console.log('save: ', tempResult);
      console.log(JSON.stringify(tempResult, true, 2));
    };

    objectModel.currentState = Object.keys(objectModel.states)[0];

    var gui = new dat.GUI();

    var object = document.querySelector('.object');
    var objectContent = object.querySelector('.content');

    function changeAnimation(animations) {
      var job = {
        animations: []
      };

      Object.keys(animations).forEach(function (animationName) {
        var properties = animations[animationName];
        if (properties.enabled) {
          var sassString = '';
          var animationFile = animationFilesData[animationName + '.scss'];
          Object.keys(properties).forEach(function (property) {
            if (property !== 'enabled') {              
              sassString += '$' + property + ': ' + animations[animationName][property] + ';\n';
            }
          });

          sassString += animationFile;          
          job.animations[animationName] = sassString;
        }
      });

      console.log('compiling animations', job);

      function compiled(results) {
        var lastTransform = object;
        objectContent.parentNode.removeChild(objectContent);
        object.innerHTML = '';

        Object.keys(job.animations).forEach(function (animationName) {
          var properties = animations[animationName];

          var existingStyle = document.querySelector('style[data-animation="' + animationName + '"]');
          if (existingStyle) existingStyle.parentNode.removeChild(existingStyle);
          var newStyle = document.createElement('style');
          newStyle.innerHTML = results[animationName];
          newStyle.setAttribute('data-animation', animationName);
          document.head.appendChild(newStyle);

          var transform = document.createElement('div');
          transform.classList.add('transform');
          transform.classList.add(animationName);
          transform.style.animation = animationName + ' ' + [
            properties.duration + 's',
            properties.timing,
            (properties.iteration === -1 ? 'infinite' : properties.iteration)].join(' ');
          lastTransform.appendChild(transform);
          lastTransform = transform;
        });

        lastTransform.appendChild(objectContent);
        console.log('animations compiled');
      }

      if (Object.keys(job.animations).length > 0) {
        animationCompiler.compile(job, compiled);
      }
      else {
        compiled();
      }
    }


    var animationsModel = {};

    gui.add(objectModel, 'currentState', Object.keys(objectModel.states)).onChange(loadAnimationState).listen();

    var animationsFolder = gui.addFolder('Animations');

    function saveAnimationState() {
      console.log('saving animations model to state', objectModel.currentState);
      objectModel.animations[objectModel.currentState] = JSON.parse(JSON.stringify(animationsModel));
    }

    function loadAnimationState() {
      var state = objectModel.animations[objectModel.currentState];
      Object.keys(animationsModel).forEach(function (animationName) {
        Object.keys(animationsModel[animationName]).forEach(function (property) {
          if (state[animationName] && state[animationName][property]) {
            animationsModel[animationName][property] = state[animationName][property];
          }
          else {
            animationsModel[animationName].enabled = false;
          }
        });
      });
      changeAnimation(animationsModel);
    }

    Object.keys(animationDefinitions).forEach(function (animationName) {
      var folder = animationsFolder.addFolder(animationName);
      animationsModel[animationName] = {
        enabled: false,
        iteration: -1,
        timing: 'linear'
      };

      folder.add(animationsModel[animationName], 'enabled').onChange(function (value) {
        if (value) object.classList.add(animationName);
        else object.classList.remove(animationName);
        saveAnimationState();
        changeAnimation(animationsModel);
      }).listen();

      folder.add(animationsModel[animationName], 'iteration', -1, 100).step(1).onChange(function (value) {
        saveAnimationState();
        changeAnimation(animationsModel);
      }).listen();

      folder.add(animationsModel[animationName], 'timing', animationTimingFunctions).onChange(function (value) {
        saveAnimationState();
        changeAnimation(animationsModel);
      }).listen();

      Object.keys(animationDefinitions[animationName]).forEach(function (param) {
        var paramDefinition = animationDefinitions[animationName][param];
        var max = paramDefinition.max;
        var min = paramDefinition.min;
        var value = paramDefinition.value || ((max + min) / 2);
        var step = paramDefinition.step || ((max - min) / 50);

        animationsModel[animationName][param] = value;
        
        folder.add(animationsModel[animationName], param, min, max).step(step).onFinishChange(function (value) {
          saveAnimationState();
          changeAnimation(animationsModel);
        }).listen();
      });
    });

    gui.add(objectModel, 'save');

    loadAnimationState();
  }

  document.addEventListener('DOMContentLoaded', function (e) {

    getMultipleXHRs([
      '../style/animations/animations.json',
      '../style/animations/definitions.json',
      '../objects/dummy.json'
      ], function (results) {
        var animationFiles = JSON.parse(results['../style/animations/animations.json']);
        var animationDefinitions = JSON.parse(results['../style/animations/definitions.json']);
        var dummyObjectDefinition = JSON.parse(results['../objects/dummy.json']);

        var mapping = {};
        var reverseMapping = {};
        var animationFileList = [];

        Object.keys(animationFiles).map(function (animationFile) {
          mapping[animationFile] = '../style/animations/' + animationFile;
          reverseMapping['../style/animations/' + animationFile] = animationFile;
          animationFileList.push('../style/animations/' + animationFile);
        });

        getMultipleXHRs(animationFileList, function (animationFilesData) {
          Object.keys(animationFilesData).map(function (url) {
            mapping[reverseMapping[url]] = animationFilesData[url];
          });

          ready(animationDefinitions, mapping, dummyObjectDefinition);
        });
    });

  });

})();