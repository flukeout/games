// Much gleaned from http://beej.us/blog/data/javascript-gamepad/
// and https://w3c.github.io/gamepad/#widl-Gamepad-mapping

var axisThreshold = 0.1;

var gamepadInputMappings = {
  standard: {
    buttons: {
      0: "actionDown",
      1: "actionRight",
      2: "actionLeft",
      3: "actionUp",
      4: "bumperLeft",
      5: "bumperRight",
      6: "triggerLeft",
      7: "triggerRight",
      8: "select",
      9: "start",
      10: "analogLeft",
      11: "analogRight",
      12: "dPadUp",
      13: "dPadDown",
      14: "dPadLeft",
      15: "dPadRight",
      16: "home"
    },
    axes: {
      0: "analogLeftX",
      1: "analogLeftY",
      2: "analogRightX",
      3: "analogRightY"
    }
  }
};

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
      getGamepads();
      for (var i = 0; i < gamepads.length; ++i) {
        if (!isGamepadInUse(gamepads[i])) {
          return gamepads[i];
        }
      }
      return null;
    },
    isGamepadInUse: isGamepadInUse
  };

  gamepads = this.getGamepads();
})();

function createInputComponent(actionMapping, options) {
  if (!actionMapping) {
    throw 'actionMapping is required to create an input component';
  }

  var component = {
    actionMapping: {},
    actions: {},
    update: function () {},
    clearMappingForAction: function (action) {
      Object.keys(this.actionMapping).forEach((key) => {
        if (this.actionMapping[key] === action) {
          delete this.actionMapping[key];
        }
      });
    },
    setMappingForAction: function (action, key) {
      this.actionMapping[key] = action;
    },
    getInverseActionMapping: function () {
      var inverseActionMapping = {};
      Object.keys(this.actionMapping).forEach((key) => {
        inverseActionMapping[this.actionMapping[key]] = key;
      });
      return inverseActionMapping;
    },
    register: function (actions) {
      this.actions = actions;
      options.register && options.register.call(this, actions);
    },
    remove: function () {
      options.remove && options.remove.call(this);
    }
  };

  // Cheeky...
  // Make a copy of this object for later use
  component.actionMapping = JSON.parse(JSON.stringify(actionMapping));

  for(var k in options){
    if (k === 'register' || k === 'remove') continue;
    component[k] = options[k];
  }

  return component;
}

function createGamepadInputComponent(gamepad, actionMapping) {
  var component = createInputComponent(actionMapping, {
    type: 'gamepad',
    inputMapping: gamepadInputMappings['standard'],
    gamepad: null,
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
      var gamepads = GamepadManager.getGamepads();

      var gamepad = this.gamepad;

      // check buttons
      for (var i = 0; i < gamepad.buttons.length; ++i) {
        var buttonValue = gamepad.buttons[i].pressed ? 1 : 0;
        var action = this.actionMapping[this.inputMapping.buttons[i]];
        tempActions[action] = buttonValue;
      }

      // check axes
      for (var i = 0; i < gamepad.axes.length; ++i) {
        var axisValue = gamepad.axes[i];
        var action = this.actionMapping[this.inputMapping.axes[i]];

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
      GamepadManager.releaseGamepad(gamepad.id);
    }
  });

  component.setGamepad(gamepad);

  actionMapping.buttons = actionMapping.buttons || {};
  actionMapping.axes = actionMapping.axes || {};

  return component;
}

function createKeyboardInputComponent(actionMapping) {
  var component = createInputComponent(actionMapping, {
    type: 'keyboard',
    register: function () {
      document.addEventListener("keydown", onKeyDown);
      document.addEventListener("keyup", onKeyUp);
    },
    update: function () {
      return tempActions;
    },
    remove: function () {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("keyup", onKeyUp);
    }
  });

  var tempActions = {};

  function onKeyDown(e) {
    // If the user pushed a key we know about...
    if (e.code in component.actionMapping)
      // ...then actions[mapping[keyCode]] = ...
      tempActions[component.actionMapping[e.code]] = true;
  }

  function onKeyUp(e) {
    // If the user pushed a key we know about...
    if (e.code in component.actionMapping)
      // ...then actions[mapping[keyCode]] = ...
      tempActions[component.actionMapping[e.code]] = false;
  }

  return component;
}