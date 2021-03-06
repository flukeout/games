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
      0: "leftX",
      1: "leftY",
      2: "rightX",
      3: "rightY"
    }
  }
};

var keyboardInputMappings = {
  standard: {
    65: 'a',
    83: 's',
    38: 'up',
    40: 'down',
    37: 'left',
    39: 'right'
  }
};

function createInputComponent(actionMapping, options) {
  if (!actionMapping) {
    throw 'actionMapping is required to create an input component';
  }

  var component = {
    actionMapping: {},
    actions: {},
    update: function () {},
    register: function (actions) {
      this.actions = actions;
    }
  };

  // Cheeky...
  // Make a copy of this object for later use
  component.actionMapping = JSON.parse(JSON.stringify(actionMapping));

  for(var k in options){
    component[k] = options[k];
  }

  return component;
}

function createGamepadInputComponent(gamepad, actionMapping) {
  var component = createInputComponent(actionMapping, {
    inputMapping: gamepadInputMappings['standard'],
    gamepad: gamepad,
    update: function () {
      if (!this.gamepad) return {};

      var tempActions = {};

      // TODO: investigate why this is necessary
      // It *looks* like there's a browser bug here, because without this line, no gamepad is detected, even though
      // we've already stored a reference to it...
      var gamepads = navigator.getGamepads ? navigator.getGamepads() : (navigator.webkitGetGamepads ? navigator.webkitGetGamepads : []);

      var gamepad = this.gamepad;

      // check buttons
      for (var i = 0; i < gamepad.buttons.length; ++i) {
        var buttonValue = gamepad.buttons[i].pressed ? 1 : 0;
        var action = this.actionMapping.buttons[this.inputMapping.buttons[i]];
        tempActions[action] = buttonValue;
      }

      // check axes
      for (var i = 0; i < gamepad.axes.length; ++i) {
        var axisValue = gamepad.axes[i];
        var action = this.actionMapping.axes[this.inputMapping.axes[i]];

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

    }
  });

  actionMapping.buttons = actionMapping.buttons || {};
  actionMapping.axes = actionMapping.axes || {};

  return component;
}

function createKeyboardInputComponent(actionMapping) {
  var component = createInputComponent(actionMapping, {
    inputMapping: keyboardInputMappings['standard'],
    update: function () {
      return tempActions;
    }
  });

  var tempActions = {};

  document.addEventListener("keydown",function(e){
    // If the user pushed a key we know about...
    // ...that we know about
    if (component.inputMapping[e.keyCode]
      // ...and which is part of actionMapping
      && component.inputMapping[e.keyCode] in component.actionMapping)
      // ...then actions[mapping[keyCode]] = ...
      tempActions[component.actionMapping[component.inputMapping[e.keyCode]]] = true;
  });

  document.addEventListener("keyup",function(e){
    // If the user pushed a key...

    // ...that we know about
    if (component.inputMapping[e.keyCode]
      // ...and which is part of actionMapping
      && component.inputMapping[e.keyCode] in component.actionMapping)
      // ...then actions[mapping[keyCode]] = ...
      tempActions[component.actionMapping[component.inputMapping[e.keyCode]]] = false;
  });

  return component;
}