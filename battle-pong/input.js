// Much gleaned from http://beej.us/blog/data/javascript-gamepad/
// and https://w3c.github.io/gamepad/#widl-Gamepad-mapping

var axisThreshold = 0.1;

window.InputManager = function (onInputChanged) {
  var savedInputLabelToActionMappings = localStorage.getItem('inputLabelToActionMappings');

  if (savedInputLabelToActionMappings) {
    savedInputLabelToActionMappings = JSON.parse(savedInputLabelToActionMappings);
    keyboardInputLabelToActionMappings = savedInputLabelToActionMappings.keyboard;
    gamepadInputLabelToActionMappings = savedInputLabelToActionMappings.gamepad;
  }

  var maintainedObjects = [];

  this.setupInputForObject = function (object) {
    object.setInputComponent(this.getComponentForNextAvailableInput());
    maintainedObjects.push(object);
    onInputChanged(object);
  };

  this.getComponentForNextAvailableInput = function(playerNumber) {
    var unusedGamepad = GamepadManager.getUnusedGamepad();
    if (unusedGamepad) {
      return createGamepadInputComponent(unusedGamepad);
    }
    else {
      return createKeyboardInputComponent(KeyboardManager.getUnusedConfig());
    }
  };

  function onGamepadConnected(e) {
    console.log('Gamepad Connected: ', e);
  }

  function checkGamepads() {
    var unusedGamepad = GamepadManager.getUnusedGamepad();
    if (unusedGamepad) {
      for (var i = 0; i < maintainedObjects.length; ++i) {
        let object = maintainedObjects[i];
        if (object.inputComponent.type === 'keyboard') {
          object.setInputComponent(createGamepadInputComponent(unusedGamepad));
          onInputChanged(object);
          return;
        }
      }
    }
  }

  var gamepadCheckInterval = setInterval(function () {
    checkGamepads();
  }, 500);

  window.addEventListener("gamepadconnected", onGamepadConnected);
  window.addEventListener("gamepaddisconnected", (e) => {
    // If one of the controllers was connected to paddle, we have to remove it and use the keyboard instead
    maintainedObjects.forEach((object) => {
      if (object.inputComponent.type === 'gamepad' && object.inputComponent.gamepad.id === e.gamepad.id) {
        object.setInputComponent(this.getComponentForNextAvailableInput());
        onInputChanged(object);
        return;
      }
    });
  });
};

window.KeyboardManager = (function() {
  var configs = keyboardInputLabelToActionMappings;
  var configsInUse = [];

  function Config(configIndex) {
    this.inputToActionMapping = keyboardInputLabelToActionMappings[configIndex];
    this.id = configIndex;
    this.release = function () {
      releaseConfig(this);
    };

    configsInUse.push(this);
  }

  function isConfigInUse(configIndex) {
    for (var i = 0; i < configsInUse.length; ++i) {
      if (configsInUse[i].id === configIndex) {
        return true;
      }
    }
    return false;
  }

  function releaseConfig(config) {
    var index = configsInUse.indexOf(config);
    if (index > -1) {
      configsInUse.splice(index, 1);
    }
  }

  return {
    getUnusedConfig: function () {
      for (var i = 0; i < configs.length; ++i) {
        if (!isConfigInUse(i)) {
          return new Config(i);
        }
      }
      return null;
    }
  };
})();

window.GamepadManager = (function () {
  var gamepads;
  var gamepadsInUse = [];

  function Config(gamepad) {
    var inputMappingLabelType = gamepad.mapping === 'standard' ? 'standard' : 'xbox';
    var inputLabelSet = gamepadInputLabels[inputMappingLabelType];
    var inputLabelToActionMappingKeys = Object.keys(gamepadInputLabelToActionMapping);
    var inputToActionMapping = {buttons: {}, axes: {}};
    
    Object.keys(inputLabelSet.buttons).forEach(function (inputNumber) {
      var inputLabel = inputLabelSet.buttons[inputNumber];
      if (inputLabelToActionMappingKeys.indexOf(inputLabel) > -1) {
        var action = gamepadInputLabelToActionMapping[inputLabel];
        inputToActionMapping.buttons[inputNumber] = action;
      }
    });

    Object.keys(inputLabelSet.axes).forEach(function (inputNumber) {
      var inputLabel = inputLabelSet.axes[inputNumber];
      if (inputLabelToActionMappingKeys.indexOf(inputLabel) > -1) {
        var action = gamepadInputLabelToActionMapping[inputLabel];
        inputToActionMapping.axes[inputNumber] = action;
      }
    });

    var gamepadID = gamepad.id;

    this.inputToActionMapping = inputToActionMapping;
    this.id = gamepadID;
    this.type = inputMappingLabelType;
    this.gamepad = gamepad;
    this.release = function () {
      releaseGamepad(this);
    };

    gamepadsInUse.push(this);
  }

  function isGamepadInUse(id) {
    for (var i = 0; i < gamepadsInUse.length; ++i) {
      if (gamepadsInUse[i].id === id) {
        return true;
      }
    }
    return false;
  }

  // This seems to fix a weird bug where values aren't actually updated if this isn't called each frame.
  // Pretty annoying.
  // TODO: Investigate or maybe file a bug on Chrome or something.
  function refreshGamepads() {
    gamepads = navigator.getGamepads ? navigator.getGamepads() : (navigator.webkitGetGamepads ? navigator.webkitGetGamepads : []);
  }

  function releaseGamepad(config) {
    var index = gamepadsInUse.indexOf(config);
    if (index > -1) {
      gamepadsInUse.splice(index, 1);
    }
  }

  function getGamepads() {
    var gamepadList = [];
    
    refreshGamepads();

    for (var i = 0; i < gamepads.length; ++i) {
      if (gamepads[i]) {
        gamepadList.push(gamepads[i]);
      }
    }

    return gamepadList;
  }

  return {
    refreshGamepads: refreshGamepads,
    getGamepads: getGamepads,
    getUnusedGamepad: function () {
      refreshGamepads();
      for (var i = 0; i < gamepads.length; ++i) {
        if (gamepads[i] && !isGamepadInUse(gamepads[i].id)) {
          return new Config(gamepads[i]);
        }
      }
      return null;
    }
  };
})();

function createInputComponent(inputToActionMapping, options) {
  if (!inputToActionMapping) {
    throw 'inputToActionMapping is required to create an input component';
  }

  var component = {
    inputToActionMapping: inputToActionMapping,
    actions: {},
    update: function (actions) {},
    register: function (actions) {
      this.actions = actions;
      options.register && options.register.call(this, actions);
    },
    remove: function () {
      options.remove && options.remove.call(this);
    }
  };

  for(var k in options){
    if (k === 'register' || k === 'remove') continue;
    component[k] = options[k];
  }

  return component;
}

function createGamepadInputComponent(config) {
  console.log('%cInitializing Gamepad Input Component:', 'color: blue');
  console.log('  ID: ' + config.id);
  console.log('  Interpretted Type: %c' + config.type, 'background: #222; color: #bada55');
  console.log('  Input->Action Mapping: ', config.inputToActionMapping);

  var component = createInputComponent(config.inputToActionMapping, {
    type: 'gamepad',
    config: config,
    gamepad: config.gamepad,
    update: function () {
      if (!this.gamepad) return {};

      var tempActions = {};

      // TODO: investigate why this is necessary
      // It *looks* like there's a browser bug here, because without this line, no gamepad is detected, even though
      // we've already stored a reference to it...
      GamepadManager.refreshGamepads();

      // check buttons
      for (var i = 0; i < this.gamepad.buttons.length; ++i) {
        var buttonValue = this.gamepad.buttons[i].pressed ? 1 : 0;
        var action = this.inputToActionMapping.buttons[i];
        tempActions[action] = buttonValue;
      }

      // check axes
      for (var i = 0; i < this.gamepad.axes.length; ++i) {
        var axisValue = this.gamepad.axes[i];
        var action = this.inputToActionMapping.axes[i];

        // if the actionMapping cares about this button...
        if (action) {
          if (Math.abs(axisValue) > axisThreshold) {
            tempActions[action] = axisValue;
          }
          else {
            tempActions[action] = 0;
          }
        }
      }

      return tempActions;
    },
    remove: function () {
      console.log('%cDestroying Gamepad Input Component:', 'color: red');
      console.log('  ID: ' + this.config.id);
      this.config.release();
    }
  });

  return component;
}

function createKeyboardInputComponent(config) {
  console.log('%cInitializing Keyboard Input Component:', 'color: blue');
  console.log('  ID: ', config.id);
  console.log('  Input->Action Mapping: ', config.inputToActionMapping);

  var component = createInputComponent(config.inputToActionMapping, {
    type: 'keyboard',
    config: config,
    register: function () {
      document.addEventListener("keydown", onKeyDown);
      document.addEventListener("keyup", onKeyUp);
    },
    update: function (actions) {
      return tempActions;
    },
    remove: function () {
      console.log('%cDestroying Keyboard Input Component:', 'color: red');
      console.log('  ID: ' + this.config.id);
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("keyup", onKeyUp);
      this.config.release();
    }
  });

  var tempActions = {};

  function onKeyDown(e) {
    // If the user pushed a key we know about...
    if (e.code in component.inputToActionMapping)
      // ...then actions[mapping[keyCode]] = ...
      tempActions[component.inputToActionMapping[e.code]] = true;
  }

  function onKeyUp(e) {
    // If the user pushed a key we know about...
    if (e.code in component.inputToActionMapping)
      // ...then actions[mapping[keyCode]] = ...
      tempActions[component.inputToActionMapping[e.code]] = false;
  }

  return component;
}