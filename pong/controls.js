var controller = {
  up: false,
  down: false,
  left: false,
  right: false
}


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

  if(e.keyCode == 38) {
    controller.up = actionType;
  }

  if(e.keyCode == 40) {
    controller.down = actionType;
  }

  if(e.keyCode == 37 || e.keyCode == 65) {
    controller.left = actionType;
  }

  if(e.keyCode == 39 || e.keyCode == 68) {
    controller.right = actionType;
  }
}