// Game components

var ball;
var paddles = [];
var numPaddles = 2;
var paddleDetails;

function connectPaddlesToControls(){
  // Let the first paddle use the keyboard regardless
  paddles[0].setInputComponent(createKeyboardInputComponent(defaultPaddle1KeyboardActionMapping));
  paddles[1].setInputComponent(createKeyboardInputComponent(defaultPaddle2KeyboardActionMapping));
  // paddles[2].setInputComponent(createKeyboardInputComponent(paddleKeyboardActionMapping));
  // paddles[3].setInputComponent(createKeyboardInputComponent(paddleKeyboardActionMapping));
  // If there are more than 0 and less than 2 gamepads, hook them up to paddles!
  // for (var i = 0; i < gamepads.length && i < numPaddles; ++i) {
  //   connectGamepad(gamepads[i]);
  // }
}

// See what gamepads are up for grabs
var gamepads = navigator.getGamepads ? navigator.getGamepads() : (navigator.webkitGetGamepads ? navigator.webkitGetGamepads : []);

var connectedGamePads = 0;

function connectGamepad(newGamepad) {
  // Start from the last paddle and work backwards

  paddles[paddles.length - connectedGamePads - 1].setInputComponent(createGamepadInputComponent(newGamepad, paddleGamepadActionMapping));
  ++connectedGamePads;
}

window.addEventListener('gamepadconnected', function (e) {
  connectGamepad(e.gamepad);
});

document.addEventListener('DOMContentLoaded', function () {

  paddleDetails = [
    {
      player : 0,
      x: 80,
      y: 200,
      height: 100
    },
    {
      player: 1,
      x : game.boardWidth - 100,
      y : 200
    },
    {
      player : 0,
      x: 40,
      y: 200
    },
    {
      player: 1,
      x : game.boardWidth - 60,
      y : 200
    }

  ];

  initParticleEngine();

  for(var i = 0; i < numPaddles; i++) {
    paddles[i] = createPaddle({
      player: paddleDetails[i].player,
      x : paddleDetails[i].x,
      y : paddleDetails[i].y,
      height : paddleDetails[i].height || 100,
      width: 20,
      classNames : ["paddle"]
    });
  }

  connectPaddlesToControls();

  game.init();

  // Iterate once to grab the objects, put them in the engine, and place them in the DOM correctly
  game.step();

  var menu = new MenuMachine(game);

  function startGame () {
    document.querySelector('.header').classList.add('show');

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
