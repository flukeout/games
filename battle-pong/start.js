// Game components

var ball,
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

  game.init();
});
