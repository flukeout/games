// Game components

var ball,
    paddleOne,
    paddleTwo;


document.addEventListener('DOMContentLoaded', function () {

  initParticleEngine();

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
