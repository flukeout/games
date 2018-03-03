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
      6: "analogLeft",
      7: "analogLeft",
      8: "start",
      9: "select",
      10: "home",
      11: "dPadUp",
      12: "dPadDown",
      13: "dPadLeft",
      14: "dPadRight"
    },
    axes: {
      0: "analogLeftX",
      1: "analogLeftY",
      2: "triggerLeft",
      3: "analogRightX",
      4: "analogRightY",
      5: "triggerRight"
    }
  }
};

var keyboardInputLabelToActionMappings = [
  {
    "KeyW":       "up",
    "KeyS":       "down",
    "KeyA":       "left",
    "KeyD":       "right",
    "KeyC":       "spinCounterClockwise",
    "KeyV":       "spinClockwise",
    "KeyB":       "dash",
    "KeyF":       "nudgeCounterClockwise",
    "KeyG":       "nudgeClockwise"
  },
  {
    "ArrowUp":    "up",
    "ArrowDown":  "down",
    "ArrowLeft":  "left",
    "ArrowRight": "right",
    "Comma":      "spinCounterClockwise",
    "Period":     "spinClockwise",
    "KeyM":       "dash",
    "KeyJ":       "nudgeCounterClockwise",
    "KeyK":       "nudgeClockwise"
  }
];

var gamepadInputLabelToActionMapping = {
  "dPadUp": "up",
  "dPadDown": "down",
  "dPadLeft": "left",
  "dPadRight": "right",
  "bumperLeft": "spinCounterClockwise",
  "bumperRight": "spinClockwise",
  "triggerLeft": "nudgeCounterClockwise",
  "triggerRight": "nudgeClockwise",
  "analogLeftX": "moveX",
  "analogLeftY": "moveY",
  "analogRightX": "spinX",
  "analogRightY": "spinY",
  "actionLeft": "dash"
};
