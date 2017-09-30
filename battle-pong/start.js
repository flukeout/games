// Game components

var endzoneOne,
    endzoneTwo,
    ball,
    paddleOne,
    paddleTwo;


document.addEventListener('DOMContentLoaded', function () {

  // Create the Paddles

  paddleOne = createPaddle({
    selector: ".paddle.one",
    player: 0
  });

  paddleTwo = createPaddle({
    selector: ".paddle.two",
    player: 1
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

  // Create the ball
  ball = createBall();

  game.init();
});
