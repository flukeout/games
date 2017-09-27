
var paddleKeyboardActionMapping = {
  "up": "up",
  "down": "down",
  "left": "left",
  "right": "right",
  "a": "spinCounterClockwise",
  "s": "spinClockwise",
  "d": "spinCounterClockwise"
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

var paddleOne;
var paddleTwo;


document.addEventListener('DOMContentLoaded', function () {


  paddles = [
    createPaddle({
      selector: ".paddle.one",
      player: 0
    }),
    createPaddle({
      selector: ".paddle.two",
      player: 1
    })
  ];


  paddleOne = paddles[0];
  paddleTwo = paddles[1];

  // Let the first paddle use the keyboard regardless
  paddleOne.addInputComponent(createKeyboardInputComponent(paddleKeyboardActionMapping));

  // If there are more than 0 and less than 2 gamepads, hook them up to paddles!
  for (var i = 0; i < gamepads.length && i < 2; ++i) {
    connectGamepad(gamepads[i]);
  }

});

var paddles;

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

      var diagonalRatio = .851;
      var x = 0
      var y = 0;

      if(this.actions.spinClockwise)          this.spin(.2);
      if(this.actions.spinCounterClockwise)   this.spin(-.2);

      if(this.actions.up)                     y++;
      if(this.actions.down)                   y--;
      if(this.actions.left)                   x--;
      if(this.actions.right)                  x++;

      var angleRad = Math.atan2(x,y);

      if(x == 0 && y == 0) {

      } else {
        var xForce = Math.sin(angleRad) * maxForce;
        var yForce = Math.cos(angleRad) * -maxForce;
        this.force(xForce, yForce);
      }

      if(this.actions.moveX)                  this.force(maxForce* this.actions.moveX, 0);
      if(this.actions.moveY)                  this.force(0, maxForce * this.actions.moveY);
      if(this.actions.spin)                   this.spin(this.actions.spin * .2);
    }
  })
}


// See what gamepads are up for grabs
var gamepads = navigator.getGamepads ? navigator.getGamepads() : (navigator.webkitGetGamepads ? navigator.webkitGetGamepads : []);


var connectedGamePads = 0;

function connectGamepad(newGamepad) {
  // Start from the last paddle and work backwards
  paddles[paddles.length - connectedGamePads - 1].addInputComponent(createGamepadInputComponent(newGamepad, paddleGamepadActionMapping));
  ++connectedGamePads;
}

window.addEventListener('gamepadconnected', function (e) {
  connectGamepad(e.gamepad);
});

