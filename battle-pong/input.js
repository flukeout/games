// Much gleaned from http://beej.us/blog/data/javascript-gamepad/
// and https://w3c.github.io/gamepad/#widl-Gamepad-mapping

var axisThreshold = 0.1;

window.InputManager = function (onInputChanged) {
  // keyboardInputLabelToActionMappings.forEach(function (defaultKeyboardActionMapping, index) {
  //   if (window.Settings.clearSavedControlSettings || !localStorage.getItem('paddle' + index + 'KeyboardActionMapping')) {
  //     localStorage.setItem('paddle' + index + 'KeyboardActionMapping', JSON.stringify(defaultKeyboardActionMapping));
  //   }
  // });

  // gamepadInputMappings.forEach(function (defaultGamepadActionMapping, index) {
  //   if (window.Settings.clearSavedControlSettings || !localStorage.getItem('paddle' + index + 'GamepadActionMapping')) {
  //     localStorage.setItem('paddle' + index + 'GamepadActionMapping', JSON.stringify(defaultGamepadActionMapping));
  //   }
  // });

  var maintainedObjects = [];

  this.setupInputForObject = function (object) {
    object.setInputComponent(this.getComponentForNextAvailableInput());
    maintainedObjects.push(object);
    onInputChanged(object);
  };

  this.getComponentForNextAvailableInput = function(playerNumber) {
    var unusedGamepad = GamepadManager.getUnusedGamepad();
    var unusedKeyboardConfig = KeyboardManager.getUnusedConfig();

    if (unusedGamepad) {
      return createGamepadInputComponent(unusedGamepad);
    }
    else {
      return createKeyboardInputComponent(unusedKeyboardConfig);
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

  function isConfigInUse(config) {
    return configsInUse.indexOf(config) > -1;
  }

  return {
    useConfig: function(config) {
      configsInUse.push(config);
    },
    releaseConfig: function(config) {
      if (isConfigInUse(config)) {
        configsInUse.splice(configsInUse.indexOf(config), 1);
      }
    },
    getUnusedConfig: function () {
      for (var i = 0; i < configs.length; ++i) {
        if (!isConfigInUse(i)) {
          return i;
        }
      }
      return null;
    }
  };
})();

window.GamepadManager = (function () {
  var gamepads;
  var gamepadsInUse = [];

  function isGamepadInUse(id) {
    return gamepadsInUse.indexOf(id) > -1;
  }

  // This seems to fix a weird bug where values aren't actually updated if this isn't called each frame.
  // Pretty annoying.
  // TODO: Investigate or maybe file a bug on Chrome or something.
  function refreshGamepads() {
    gamepads = navigator.getGamepads ? navigator.getGamepads() : (navigator.webkitGetGamepads ? navigator.webkitGetGamepads : []);
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
    useGamepad: function(id) {
      gamepadsInUse.push(id);
    },
    releaseGamepad: function(id) {
      if (isGamepadInUse(id)) {
        gamepadsInUse.splice(gamepadsInUse.indexOf(id), 1);
      }
    },
    getGamepads: getGamepads,
    getUnusedGamepad: function () {
      refreshGamepads();
      for (var i = 0; i < gamepads.length; ++i) {
        if (gamepads[i] && !isGamepadInUse(gamepads[i].id)) {
          return gamepads[i];
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

function createGamepadInputComponent(gamepad) {
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

  console.log('%cInitializing Gamepad Input Component:', 'color: blue');
  console.log('  ID: ' + gamepad.id);
  console.log('  Interpretted Type: %c' + inputMappingLabelType, 'background: #222; color: #bada55');
  console.log('  Input->Action Mapping: ', inputToActionMapping);

  var component = createInputComponent(inputToActionMapping, {
    type: 'gamepad',
    gamepad: null,
    gamepadID: gamepad.id,
    setGamepad: function (gamepad) {
      this.gamepad = gamepad;
      GamepadManager.useGamepad(gamepad.id);
    },
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
        var action = inputToActionMapping.buttons[i];
        tempActions[action] = buttonValue;
      }

      // check axes
      for (var i = 0; i < this.gamepad.axes.length; ++i) {
        var axisValue = this.gamepad.axes[i];
        var action = inputToActionMapping.axes[i];

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
      GamepadManager.releaseGamepad(this.gamepad.id);
    }
  });

  component.setGamepad(gamepad);

  return component;
}

function createKeyboardInputComponent(config) {
  var inputToActionMapping = keyboardInputLabelToActionMappings[config];

  console.log('%cInitializing Keyboard Input Component:', 'color: red');
  console.log('  Config: ', config);
  console.log('  Input->Action Mapping: ', inputToActionMapping);

  var component = createInputComponent(inputToActionMapping, {
    type: 'keyboard',
    setConfig: function (config) {
      this.config = config;
      KeyboardManager.useConfig(config);
    },
    register: function () {
      document.addEventListener("keydown", onKeyDown);
      document.addEventListener("keyup", onKeyUp);
    },
    update: function (actions) {
      return tempActions;
    },
    remove: function () {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("keyup", onKeyUp);
      KeyboardManager.releaseConfig(this.config);
    }
  });

  component.setConfig(config);

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