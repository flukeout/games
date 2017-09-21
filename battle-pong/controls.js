// Controller data that is consumed by the paddle
// Is updated via gamepad[0] if connected, or keyboard if not
var controllers = [
  {
    up: false,
    down: false,
    left: false,
    right: false,
    a: false,
    b: false
  },
  {
    up: false,
    down: false,
    left: false,
    right: false,
    a: false,
    b: false
  }
]

// Commented out for now
// var gotControllers = false;

// window.addEventListener("gamepadconnected", function(e) {
//   gotControllers = true;
// });

// window.addEventListener("gamepaddisconnected", function(e) {
//   console.log("Gamepad disconnected from index %d: %s",
//   e.gamepad.index, e.gamepad.id);
// });


function checkControllers(){
  var gamepads = navigator.getGamepads ? navigator.getGamepads() : (navigator.webkitGetGamepads ? navigator.webkitGetGamepads : []);

  for(var i = 0; i < gamepads.length; i++) {
    var gp = gamepads[i];

    if (gp) {
      controllers[i].up = gp.buttons[11].pressed;     // Up D-pad
      controllers[i].down = gp.buttons[12].pressed;   // Down D-pad
      controllers[i].left = gp.buttons[13].pressed;   // Left D-pad
      controllers[i].right = gp.buttons[14].pressed;  // Right D-pad
      controllers[i].b = gp.buttons[4].pressed;       // Left Shoulder
      controllers[i].a = gp.buttons[5].pressed;       // Right Shoulder
    }
  }
}



// Keyboard stuff starts here

document.addEventListener("keydown",function(e){
  keyAction(e, "press", 0);
});

document.addEventListener("keyup",function(e){
  keyAction(e, "release", 0);
});


function keyAction(e, actionType, controllerId){

  if(actionType == "press") {
    actionType = true;
  } else {
    actionType = false;
  }

  if(e.keyCode == 83) {
    controllers[controllerId].b = actionType;
  }

  if(e.keyCode == 65) {
    controllers[controllerId].a = actionType;
  }

  if(e.keyCode == 38) {
    controllers[controllerId].up = actionType;
  }

  if(e.keyCode == 40) {
    controllers[controllerId].down = actionType;
  }

  if(e.keyCode == 37) {
    controllers[controllerId].left = actionType;
  }

  if(e.keyCode == 39) {
    controllers[controllerId].right = actionType;
  }
}
