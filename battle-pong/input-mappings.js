var gamepadInputLabels = {
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
  },
  xbox: {
    buttons: {
      0: "actionDown",
      1: "actionRight",
      2: "actionLeft",
      3: "actionUp",
      4: "bumperLeft",
      5: "bumperRight",
      6: "start",
      7: "select",
      8: "analogLeft",
      9: "analogRight",
      10: "dPadUp",
      11: "dPadDown",
      12: "dPadLeft",
      13: "dPadRight",
      14: "home"
    },
    axes: {
      0: "analogLeftX",
      1: "analogLeftY",
      2: "triggerLeft",
      3: "analogRightX",
      4: "analogRightY",
      5: "triggerRight"
    },
    ignoreAxes: [2, 5]
  }
};

var keyboardInputLabelToActionMappings = [
  {
    "KeyW": "up",
    "KeyS": "down",
    "KeyA": "left",
    "KeyD": "right",
    "KeyC": "spinCounterClockwise",
    "KeyV": "spinClockwise"
  },
  {
    "ArrowUp":    "up",
    "ArrowDown":  "down",
    "ArrowLeft":  "left",
    "ArrowRight": "right",
    "Comma":      "spinCounterClockwise",
    "Period":     "spinClockwise"
  }
];

var gamepadInputLabelToActionMapping = {
  "dPadUp": "up",
  "dPadDown": "down",
  "dPadLeft": "left",
  "dPadRight": "right",
  "bumperLeft": "spinCounterClockwise",
  "bumperRight": "spinClockwise",
  "analogLeftX": "moveX",
  "analogLeftY": "moveY",
  "analogRightX": "spin"
};
