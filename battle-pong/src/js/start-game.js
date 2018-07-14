(function () {
  let menuControls;
  let pauseManager;

  // Sizes the width of the board to fill up the available
  // space in the window.
  function resizeBoard(){
    
    let boardHeight = 540;
    let boardWidth = 1200;
    let boardAspect = boardWidth / boardHeight;

    var windowWidth = window.innerWidth;
    let windowHeight = window.innerHeight - 150;

    let windowAspect = windowWidth / windowHeight;
    let ratio;

    if(boardAspect > windowAspect) {
      ratio = windowWidth / boardWidth;
    } else {
      ratio = windowHeight / boardHeight;
    }

    document.querySelector(".board-wrapper").style.transform = "scale(" + ratio + ")";
    document.querySelector(".board-shadow-wrapper").style.transform = "scale(" + ratio + ")";

    var boardPosition = document.querySelector(".tilt-wrapper").getBoundingClientRect();
    var boardTop = boardPosition.top;
    var boardTopPercent =  (boardTop /  window.innerHeight) + .1;
    
    document.querySelector(".surface").style.top = parseFloat(boardTopPercent) * 100 + "vh";
  }

  ScreenManager.addScreen('game', {
    init: () => {

    },
    start: () => {
      return new Promise((resolve, reject) => {
        document.querySelector('.screen.game').classList.remove('fade-out');
        window.addEventListener("resize", resizeBoard);

        resizeBoard();
        game.setupGameEnvironment(".world");

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

        if (Settings.showFrameRate) {
          var frameRateMonitor  = new FrameRateMonitor();
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
        
        if (Settings.music) SoundManager.musicEngine.playSongChain('gameplay');

        menuControls = setupInputButtons(true);

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

        pauseManager = new PauseManager(game, inputManager, menuControls);

        // Iterate once to grab the objects, put them in the engine, and place them in the DOM correctly
        game.step();

        setTimeout(function(){
          document.querySelector('.screen.game').classList.add('ready');
          document.querySelector('.board-wrapper').classList.remove('hide');
          document.querySelector('.score-wrapper').classList.add('show');
        }, 300);
        
        game.restart(2200);
        game.run();

        resolve();
      });
    },
    stop: () => {
      return new Promise((resolve, reject) => {
        pauseManager.destroy();
        menuControls.disconnect();

        pauseManager = null;
        menuControls = null;

        game.destroy();

        document.querySelector('.screen.game').classList.add('fade-out');
        window.removeEventListener("resize", resizeBoard);

        if (Settings.music) SoundManager.musicEngine.fadeOut(2);

        setTimeout(resolve, 2000);
      });
    }
  });
})();
