// Much gleaned from http://beej.us/blog/data/javascript-gamepad/
// and https://w3c.github.io/gamepad/#widl-Gamepad-mapping

var axisThreshold = 0.1;


window.InputManager = function (onInputChanged) {
  let maintainedObjects = [];

  let savedInputLabelToActionMappings = localStorage.getItem('inputLabelToActionMappings');
  if (savedInputLabelToActionMappings) {
    savedInputLabelToActionMappings = JSON.parse(savedInputLabelToActionMappings);
    keyboardInputLabelToActionMappings = savedInputLabelToActionMappings.keyboard;
    gamepadInputLabelToActionMapping = savedInputLabelToActionMappings.gamepad;
  }

  this.setupInputForObject = function (object) {
    object.setInputComponent(this.getComponentForNextAvailableInput());
    maintainedObjects.push(object);
    onInputChanged(object);
  };

  this.resetManagedObjects = function () {
    maintainedObjects.forEach(o => {
      o.setInputComponent(null);
    });
  };

  this.forgetManagedObjects = function () {
    maintainedObjects = [];
  };

  this.createInputComponentFromConfigIndex = function (type, index) {
    let manager = (type === 'gamepad' ? GamepadManager : KeyboardManager);
    let createFunction = (type === 'gamepad' ? createGamepadInputComponent : createKeyboardInputComponent);
    return createFunction(manager.getConfigByIndex(index));
  };

  this.getComponentForNextAvailableInput = function() {
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
    checkForNewGamepads();
  }

  function checkForNewGamepads() {
    if (maintainedObjects.length === 0) return;
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

  setInterval(function () {
    checkForNewGamepads();
  }, 500);

  window.addEventListener("gamepadconnected", onGamepadConnected);
  window.addEventListener("gamepaddisconnected", (e) => {
    console.log('Gamepad Disconnected');
    // If one of the controllers was connected to paddle, we have to remove it and use the keyboard instead
    maintainedObjects.forEach((object) => {
      console.log(object.inputComponent.type);
      if (object.inputComponent.type === 'gamepad') {
        let gamepadId = e.gamepad.id + e.gamepad.index;
        console.log(gamepadId, object.inputComponent.config.id);
        if (object.inputComponent.config.id === gamepadId) {
          object.setInputComponent(this.getComponentForNextAvailableInput());
          onInputChanged(object);
          return;
        }
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
    getAllConfigs: function () {
      return configs;
    },
    getConfigByIndex: function (configIndex) {
      return new Config(configIndex);
    },
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

InputManager.GamepadEventManager = function () {
  let buttonCallbacks = {up: {}, down: {}};
  let configs = [];

  let buttonsDown = {};
  let buttonsToCheck = [];

  let pauseFlag = false;

  function gamepadCheckLoop() {
    // Make sure gamepads are refreshed. If they aren't, we don't really know if this frame is aligned with gamepad inputs
    GamepadManager.refreshGamepads();

    let buttonsDownThisTime = {};

    configs.forEach(gamepadConfig => {
      buttonsToCheck.forEach(button => {
        if(gamepadConfig.gamepad.buttons[gamepadConfig.inverseInputLabelMapping.buttons[button]]){
          if (gamepadConfig.gamepad.buttons[gamepadConfig.inverseInputLabelMapping.buttons[button]].pressed) {
            buttonsDownThisTime[button] = true;
          }
        }
      });
    });

    buttonsToCheck.forEach(button => {
      // Wasn't stored before, but was pressed now!
      if (!buttonsDown[button] && buttonsDownThisTime[button]) {
        buttonsDown[button] = Date.now() + 250;
        setTimeout(() => sendButtonDownEvent(button), 10);
      }
      // STILL held down (wow)!
      else if (buttonsDown[button] && buttonsDownThisTime[button]) {
        let now = Date.now();
        if (now > buttonsDown[button]) {
          buttonsDown[button] = now + 50;
          setTimeout(() => sendButtonDownEvent(button), 10);
        }
      }
      // Let go
      else if (buttonsDown[button] && !buttonsDownThisTime[button]) {
        delete buttonsDown[button];
        setTimeout(() => sendButtonUpEvent(button), 10);
      }
    });

    if (!pauseFlag) requestAnimationFrame(gamepadCheckLoop);
  }

  function resetButtonsToCheck() {
    let upButtonsToCheck = Object.keys(buttonCallbacks.up);
    let downButtonsToCheck = Object.keys(buttonCallbacks.down);
    buttonsToCheck = downButtonsToCheck.concat(upButtonsToCheck.filter(button => {
      return downButtonsToCheck.indexOf(button) === -1;
    }));
  }

  function sendButtonDownEvent(button) {
    buttonCallbacks.down[button] && buttonCallbacks.down[button].forEach(f => f());
  }

  function sendButtonUpEvent(button) {
    buttonCallbacks.up[button] && buttonCallbacks.up[button].forEach(f => f());
  }

  this.onGamepadButtonDown = function (button, callbackFunction) {
    if (Array.isArray(button)) {
      button.forEach(b => this.onGamepadButtonDown(b, callbackFunction));
    }
    else {
      buttonCallbacks.down[button] = buttonCallbacks.down[button] || [];
      buttonCallbacks.down[button].push(callbackFunction);
      resetButtonsToCheck();
    }
  };

  this.onGamepadButtonUp = function (button, callbackFunction) {
    if (Array.isArray(button)) {
      button.forEach(b => this.onGamepadButtonDown(b, callbackFunction));
    }
    else {
      buttonCallbacks.up[button] = buttonCallbacks.up[button] || [];
      buttonCallbacks.up[button].push(callbackFunction);
      resetButtonsToCheck();
    }
  };

  this.addButtonListener = function (button, state, callbackFunction) {
    if (state === 'up') {
      this.onGamepadButtonUp(button, callbackFunction);
    }
    else if (state === 'down') {
      this.onGamepadButtonDown(button, callbackFunction);
    }
    else {
      throw new Error('You can\'t do that.');
    }
  };

  this.removeButtonListener = function (button, state, callbackFunction) {
    if (Array.isArray(button)) {
      button.forEach(b => this.removeButtonListener(b, state, callbackFunction));
    }
    else {
      if (buttonCallbacks[state][button]) {
        buttonCallbacks[state][button] = buttonCallbacks[state][button].filter(cb => {
          return cb !== callbackFunction;
        });
        resetButtonsToCheck();
      }
    }
  };

  this.start = function () {
    gamepadCheckLoop();

    this.connectAllGamepads();

    window.addEventListener("gamepadconnected", e => {
      this.connectAllGamepads();
    });
    window.addEventListener("gamepaddisconnected", e => {
      this.connectAllGamepads();
    });
  };

  this.pause = function () {
    pauseFlag = true;
  };

  this.resume = function () {
    pauseFlag = false;
    gamepadCheckLoop();
  };

  this.connectAllGamepads = function () {
    let gamepads = GamepadManager.getGamepads();
    configs = GamepadManager.getConfigs(true);
  };
};

window.GamepadManager = (function () {
  let gamepads;
  let gamepadsInUse = [];

  function Config(gamepad, leaveUnused) {

    let inputMappingLabelType = 'standard';

    if (gamepad.mapping) {
      inputMappingLabelType = gamepad.mapping;
    } else if (gamepad.id.toLowerCase().indexOf('xbox') > -1) {
      inputMappingLabelType = 'xbox';
    }

    let inputLabelSet = gamepadInputLabels[inputMappingLabelType];
    let inputLabelToActionMappingKeys = Object.keys(gamepadInputLabelToActionMapping);
    let inputToActionMapping = {buttons: {}, axes: {}};

    Object.keys(inputLabelSet.buttons).forEach(function (inputNumber) {
      let inputLabel = inputLabelSet.buttons[inputNumber];
      if (inputLabelToActionMappingKeys.indexOf(inputLabel) > -1) {
        let action = gamepadInputLabelToActionMapping[inputLabel];
        inputToActionMapping.buttons[inputNumber] = action;
      }
    });

    Object.keys(inputLabelSet.axes).forEach(function (inputNumber) {
      let inputLabel = inputLabelSet.axes[inputNumber];
      if (inputLabelToActionMappingKeys.indexOf(inputLabel) > -1) {
        let action = gamepadInputLabelToActionMapping[inputLabel];
        inputToActionMapping.axes[inputNumber] = action;
      }
    });

    let gamepadID = gamepad.id + gamepad.index;

    this.inputLabelMapping = inputLabelSet;
    this.inverseInputLabelMapping = inverseGamepadInputLabels[inputMappingLabelType];
    this.inputToActionMapping = inputToActionMapping;
    this.id = gamepadID;
    this.type = inputMappingLabelType;
    this.gamepad = gamepad;
    this.use = function () {
      gamepadsInUse.push(this);
    };
    this.release = function () {
      releaseGamepad(this);
    };

    if (!leaveUnused) {
      this.use();
    }
  }

  function isGamepadInUse(gamepad) {
    let gamepadHandle = gamepad.id + gamepad.index;

    for (let i = 0; i < gamepadsInUse.length; ++i) {
      if (gamepadsInUse[i].id === gamepadHandle) {
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
    let index = gamepadsInUse.indexOf(config);
    if (index > -1) {
      gamepadsInUse.splice(index, 1);
    }
  }

  function getGamepads() {
    let gamepadList = [];

    refreshGamepads();

    for (let i = 0; i < gamepads.length; ++i) {
      if (gamepads[i]) {
        gamepadList.push(gamepads[i]);
      }
    }

    return gamepadList;
  }

  return {
    refreshGamepads: refreshGamepads,
    getGamepads: getGamepads,
    getConfigs: function (leaveUnused) {
      return getGamepads().map(g => { return new Config(g, leaveUnused)});
    },
    getConfigsInUse: function () {
      return gamepadsInUse;
    },
    getConfigByIndex: function (gamepadIndex) {
      return new Config(gamepads[gamepadIndex]);
    },
    getUnusedGamepad: function () {
      refreshGamepads();
      for (let i = 0; i < gamepads.length; ++i) {
        if (gamepads[i] && !isGamepadInUse(gamepads[i])) {
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
  
  console.log('%cInitializing Gamepad Input Component', 'color: blue');
  console.log('  ID: ' + config.id);
  console.log('  Interpretted Type: %c' + config.type, 'background: #222; color: #bada55');
  // console.log('  Input->Action Mapping: ', config.inputToActionMapping);

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
      console.log('%cDestroying Gamepad Input Component', 'color: red');
      // console.log('  ID: ' + this.config.id);
      this.config.release();
    }
  });

  return component;
}

function createKeyboardInputComponent(config) {
  console.log('%cInitializing Keyboard Input Component', 'color: blue');
  // console.log('  ID: ', config.id);
  // console.log('  Input->Action Mapping: ', config.inputToActionMapping);

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
      console.log('%cDestroying Keyboard Input Component', 'color: red');
      // console.log('  ID: ' + this.config.id);
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