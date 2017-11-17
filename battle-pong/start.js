// Game components

var ball;
var paddles = [];
var numPaddles = 2;
var paddleDetails;

document.addEventListener('DOMContentLoaded', function () {

  paddleDetails = [
    {
      player : 0,
      x: 80,
      y: 200
    },
    {
      player: 1,
      x : game.boardWidth - 100,
      y : 200
    },
    {
      player: 0,
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

    paddles[i].init();
  }

  var inputManager = new InputManager((paddle) => {
    var playerNumber = paddles.indexOf(paddle);
    var inputDisplayElement = document.querySelector('.score-wrapper .input[data-player="' + (playerNumber + 1) + '"]');
    var helpElement = inputDisplayElement.querySelector('.help');
    inputDisplayElement.setAttribute('data-type', paddle.inputComponent.type);

    if (paddle.inputComponent.type === 'keyboard') {
      helpElement.innerHTML = Object.keys(paddle.inputComponent.inputToActionMapping).map(function (key) {
        return key
              .replace('Key', '')
              .replace('ArrowUp', '↑')
              .replace('ArrowDown', '↓')
              .replace('ArrowLeft', '←')
              .replace('ArrowRight', '→')
              .replace('Comma', ',')
              .replace('Period', '.')
      }).join('');
    }
    else {
      helpElement.innerHTML = '';
    }

    console.log('%cInput Changed:', 'color: green', playerNumber, paddle.inputComponent.type);
  });

  for (var i = 0; i < numPaddles; ++i) {
    inputManager.setupInputForObject(paddles[i]);
  }

  game.init();

  // Iterate once to grab the objects, put them in the engine, and place them in the DOM correctly
  game.step();

  // var menu = new MenuMachine(game);

  function startGame () {
    // document.querySelector('.header').classList.add('show');
    document.querySelector('.score-wrapper').classList.add('show');
    game.restart();
    game.run();
    // menu.waitToBeSummoned();
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
