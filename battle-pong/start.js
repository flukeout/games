// Game components

var ball;
var paddles = [];
var numPaddles = 2;
var paddleDetails;

[
  {
    "KeyW": "up",
    "KeyS": "down",
    "KeyA": "left",
    "KeyD": "right",
    "KeyC": "spinCounterClockwise",
    "KeyV": "spinClockwise"
  },
  {
    "ArrowUp":    "up",
    "ArrowDown":  "down",
    "ArrowLeft":  "left",
    "ArrowRight": "right",
    "Comma":      "spinCounterClockwise",
    "Period":     "spinClockwise"
  }
].forEach(function (defaultKeyboardActionMapping, index) {
  if (window.Settings.clearSavedControlSettings || !localStorage.getItem('paddle' + index + 'KeyboardActionMapping')) {
    localStorage.setItem('paddle' + index + 'KeyboardActionMapping', JSON.stringify(defaultKeyboardActionMapping));
  }
});

[
  {
    "dPadUp": "up",
    "dPadDown": "down",
    "dPadLeft": "left",
    "dPadRight": "right",
    "bumperLeft": "spinCounterClockwise",
    "bumperRight": "spinClockwise",
    "analogLeftX": "moveX",
    "analogLeftY": "moveY",
    "analogRightX": "spin"
  },
  {
    "dPadUp": "up",
    "dPadDown": "down",
    "dPadLeft": "left",
    "dPadRight": "right",
    "bumperLeft": "spinCounterClockwise",
    "bumperRight": "spinClockwise",
    "analogLeftX": "moveX",
    "analogLeftY": "moveY",
    "analogRightX": "spin"
  }
].forEach(function (defaultGamepadActionMapping, index) {
  if (window.Settings.clearSavedControlSettings || !localStorage.getItem('paddle' + index + 'GamepadActionMapping')) {
    localStorage.setItem('paddle' + index + 'GamepadActionMapping', JSON.stringify(defaultGamepadActionMapping));
  }
});

[
  'keyboard',
  'keyboard'
].forEach(function (defaultInputType, index) {
  if (window.Settings.clearSavedControlSettings || !localStorage.getItem('paddle' + index + 'InputType')) {
    localStorage.setItem('paddle' + index + 'InputType', defaultInputType);
  }
});

function connectPaddlesToControls(){
  var gamepads = GamepadManager.getGamepads();

  for (var i = 0; i < numPaddles; ++i) {

    // Load settings are that were saved in localStorage
    var type = localStorage.getItem('paddle' + i + 'InputType');
    var savedGamepadActionMapping = JSON.parse(localStorage.getItem('paddle' + i + 'GamepadActionMapping'));
    var savedKeyboardActionMapping = JSON.parse(localStorage.getItem('paddle' + i + 'KeyboardActionMapping'));

    // If the saved input type is 'keyboard', or if there isn't a gamepad where there should be...
    if (type === 'keyboard' || !gamepads[i]) {
      // Plug in a keyboard input component
      paddles[i].setInputComponent(createKeyboardInputComponent(savedKeyboardActionMapping));
    }
    else {
      // Otherwise, plug in a gamepad input component
      paddles[i].setInputComponent(createGamepadInputComponent(gamepads[i], savedGamepadActionMapping));
    }
  }
}


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
