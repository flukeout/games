var paddleKeyboardActionMapping = {
  "up": "up",
  "down": "down",
  "left": "left",
  "right": "right",
  "a": "spinCounterClockwise",
  "s": "spinClockwise"
};
  
var paddleGamepadActionMapping = {
  buttons: {
    "dPadUp": "up", // Just to try it :)
    "dPadDown": "down",
    "dPadLeft": "left",
    "dPadRight": "right",
    "bumperLeft": "spinCounterClockwise",
    "bumperRight": "spinClockwise"
  },
  axes: {
    "leftX": "moveX",
    "leftY": "moveY",
    "rightX": "spin"
  }
};

document.addEventListener('DOMContentLoaded', function () {

  function createPaddle(options) {
    var maxForce = 0.004;

    return createObject({
      selector: options.selector,
      player: options.player,
      physicsOptions : {
        frictionAir: 0.1
      },
      actions: [
        // for buttons
        'spinClockwise','spinCounterClockwise','up','down','left','right',
        
        // for more fluid options that can use floats instead of booleans (e.g. joysticks)
        'moveX', 'moveY', 'spin'
      ],
      force: function (x, y) {
        Matter.Body.applyForce(this.physics, this.physics.position, {
          x: x,
          y: y
        });
      },
      spin: function (v) {
        Matter.Body.setAngularVelocity(this.physics, v);
      },
      update(){
        this.updateActionsFromInputComponents();

        if(this.actions.spinClockwise)          this.spin(.2);
        if(this.actions.spinCounterClockwise)   this.spin(-.2);
        if(this.actions.up)                     this.force(0, -maxForce);
        if(this.actions.down)                   this.force(0, maxForce);
        if(this.actions.left)                   this.force(-maxForce, 0);
        if(this.actions.right)                  this.force(maxForce, 0);
        if(this.actions.moveX)                  this.force(maxForce* this.actions.moveX, 0);
        if(this.actions.moveY)                  this.force(0, maxForce * this.actions.moveY);
        if(this.actions.spin)                   this.spin(this.actions.spin * .2);
      }
    })
  }
  
  var paddles = [
    createPaddle({
      selector: ".paddle.one",
      player: 0
    }),
    createPaddle({
      selector: ".paddle.two",
      player: 1
    })
  ];

  // See what gamepads are up for grabs
  var gamepads = navigator.getGamepads ? navigator.getGamepads() : (navigator.webkitGetGamepads ? navigator.webkitGetGamepads : []);

  // Let the first paddle use the keyboard regardless
  paddles[0].addInputComponent(createKeyboardInputComponent(paddleKeyboardActionMapping));

  var connectedGamePads = 0;

  function connectGamepad(newGamepad) {
    // Start from the last paddle and work backwards
    paddles[paddles.length - connectedGamePads - 1].addInputComponent(createGamepadInputComponent(newGamepad, paddleGamepadActionMapping));
    ++connectedGamePads;
  }

  window.addEventListener('gamepadconnected', function (e) {
    connectGamepad(e.gamepad);
  });

  // If there are more than 0 and less than 2 gamepads, hook them up to paddles!
  for (var i = 0; i < gamepads.length && i < 2; ++i) {
    connectGamepad(gamepads[i]);
  }


});
