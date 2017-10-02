// Game components

var endzoneOne,
    endzoneTwo,
    ball,
    paddleOne,
    paddleTwo;


document.addEventListener('DOMContentLoaded', function () {

  // Create the Paddles

  paddleOne = createPaddle({
    player: 0,
    x : 50,
    y : 200,
    height: 100,
    width: 20,
    classNames : ["paddle","two"]
  });

  paddleTwo = createPaddle({
    player: 1,
    x : game.boardWidth - 120,
    y : 200,
    height: 100,
    width: 20,
    classNames : ["paddle","one"]
  });

  connectPaddlesToControls();

  // Create the endzones - just using the generic createObject

  endzoneOne = createObject({
    selector: ".endzone.one",
    physicsOptions : {
      isSensor: true,
      isStatic: true
    }
  });

  endzoneTwo = createObject({
    selector: ".endzone.two",
    physicsOptions : {
      isSensor: true,
      isStatic: true
    }
  });

  game.init();
});
