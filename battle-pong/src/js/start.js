window.addEventListener("resize", resizeBoard);

document.addEventListener('DOMContentLoaded', function () {

  resizeBoard();
  setupRenderer(".world");

  const numPaddles = 2;

  let paddleDetails = [
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

  initParticleEngine(".world");

  for(var i = 0; i < numPaddles; i++) {
    game.paddles[i] = createPaddle({
      player: paddleDetails[i].player,
      x : paddleDetails[i].x,
      y : paddleDetails[i].y,
      height : paddleDetails[i].height || 100,
      width: 20,
      classNames : ["paddle", "paddle-" + i]
    });

    game.paddles[i].init();
  }

  var inputManager = new InputManager((paddle) => {
    var playerNumber = game.paddles.indexOf(paddle);
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

  if (Settings.showFrameRate) {
    var frameRateMonitor  = new FrameRateMonitor();
  }

  // Make sure sounds & music are loaded before everything else starts
  SoundManager.init().then(() => {
    if (Settings.music) SoundManager.musicEngine.playSongChain('gameplay');

    let menuControls = setupInputButtons(true);

    game.init(menuControls);

    let leftPaddle = game.paddles[0];
    let rightPaddle = game.paddles[1];

    if (Settings.player1Control === 'AI') {
      leftPaddle.setInputComponent(game.aiManager.createPaddleAIInputComponent(leftPaddle, 'left'));
    }
    else {
      inputManager.setupInputForObject(leftPaddle);
    }

    if (Settings.player2Control === 'AI') {
      rightPaddle.setInputComponent(game.aiManager.createPaddleAIInputComponent(rightPaddle, 'right'));
    }
    else {
      inputManager.setupInputForObject(rightPaddle);
    }

    let pauseManager = new PauseManager(game, inputManager, menuControls);

    // Iterate once to grab the objects, put them in the engine, and place them in the DOM correctly
    game.step();

    document.querySelector("#loading").classList.add("hide-loading");

    setTimeout(function(){
      document.body.classList.remove('loading');
      document.body.classList.add('ready');
      document.querySelector('.board-wrapper').classList.remove('hide');
      document.querySelector('.score-wrapper').classList.add('show');
    }, 300);
    
    game.restart(2200);
    game.run();
  }).catch(() => {
    // We need to go back to index.html to capture a user gesture because Chrome has an autoplay policy...
    // See https://developers.google.com/web/updates/2017/09/autoplay-policy-changes#webaudio for more
    window.location.href = "../index.html";
  });
});

// Sizes the width of the board to fill up the available
// space in the window.
function resizeBoard(){
  var windowWidth = window.innerWidth;
  var boardWidth = 1200;
  var ratio =  windowWidth / boardWidth;
  document.querySelector(".board-wrapper").style.transform = "scale(" + ratio + ")";
  document.querySelector(".board-shadow-wrapper").style.transform = "scale(" + ratio + ")";

  var boardPosition = document.querySelector(".tilt-wrapper").getBoundingClientRect();
  var boardTop = boardPosition.top;
  var boardTopPercent =  (boardTop /  window.innerHeight) + .1;
  
  document.querySelector(".surface").style.top = parseFloat(boardTopPercent) * 100 + "vh";
}

