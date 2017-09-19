// Controller data that is consumed by the paddle
// Is updated via gamepad[0] if connected, or keyboard if not
var controller = {
  up: false,
  down: false,
  left: false,
  right: false,
  a: false,
  b: false
}


// Commented out for now
// var gotControllers = false;

// window.addEventListener("gamepadconnected", function(e) {
//   gotControllers = true;
// });

// window.addEventListener("gamepaddisconnected", function(e) {
//   console.log("Gamepad disconnected from index %d: %s",
//   e.gamepad.index, e.gamepad.id);
// });

// This needs to run Every frame!
// Also we should include this in the actual gameloop, not run a
function checkControllers(){
  var gamepads = navigator.getGamepads ? navigator.getGamepads() : (navigator.webkitGetGamepads ? navigator.webkitGetGamepads : []);

  var gp = gamepads[0];
  if (gp) {
    controller.up = gp.buttons[11].pressed;     // Up D-pad
    controller.down = gp.buttons[12].pressed;   // Down D-pad
    controller.left = gp.buttons[13].pressed;   // Left D-pad
    controller.right = gp.buttons[14].pressed;  // Right D-pad
    controller.b = gp.buttons[4].pressed;       // Left Shoulder
    controller.a = gp.buttons[5].pressed;       // Right Shoulder
  }
  window.requestAnimationFrame(checkControllers);
}
checkControllers();


// Keyboard stuff starts here

document.addEventListener("keydown",function(e){
  keyAction(e, "press");
});

document.addEventListener("keyup",function(e){
  keyAction(e, "release");
});


function keyAction(e, actionType){

  if(actionType == "press") {
    actionType = true;
  } else {
    actionType = false;
  }

  if(e.keyCode == 83) {
    controller.b = actionType;
  }

  if(e.keyCode == 65) {
    controller.a = actionType;
  }

  if(e.keyCode == 38) {
    controller.up = actionType;
  }

  if(e.keyCode == 40) {
    controller.down = actionType;
  }

  if(e.keyCode == 37) {
    controller.left = actionType;
  }

  if(e.keyCode == 39) {
    controller.right = actionType;
  }
}
