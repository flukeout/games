// Game components

var ball;
var paddles = [];
var numPaddles = 2;
var paddleDetails;

document.addEventListener('DOMContentLoaded', function () {

  paddleDetails = [
    {
      player : 0,
      x: 50,
      y: 200
    },
    {
      player: 1,
      x : game.boardWidth - 120,
      y : 200
    }
  ];

  initParticleEngine();

  for(var i = 0; i < numPaddles; i++) {
    paddles[i] = createPaddle({
      player: paddleDetails[i].player,
      x : paddleDetails[i].x,
      y : paddleDetails[i].y,
      height: 100,
      width: 20,
      classNames : ["paddle"]
    });
  }

  connectPaddlesToControls();

  game.init();

  // Iterate once to grab the objects, put them in the engine, and place them in the DOM correctly
  game.step();

  var menu = new MenuMachine();

  function startGame () {
    game.restart();
    game.run();
    menu.waitToBeSummoned();
  }

  if (Settings.showIntro) {
    var introMachine = new IntroMachine();
    introMachine.start(function () {
      startGame();
    });
  }
  else {
    document.querySelector('.board-wrapper').classList.remove('hide');
    startGame();
  }


});
