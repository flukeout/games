var controller = {
  up: false,
  down: false,
  left: false,
  right: false,
  a: false,
  b: false
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

  console.log(e.keyCode);
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