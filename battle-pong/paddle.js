
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
    maxX: false,
    minX: false,
    swishTimeout: false,  // Keeps track of the swish soudn timeout
    swishTimeoutMS : 260, // Delay between playing the swish sound
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

      if(!this.swishTimeout) {
        playSound("swish");
        var that = this;
        this.swishTimeout = setTimeout(function(){
          that.swishTimeout = false;
        }, this.swishTimeoutMS);
      }
    },
    update(){
      this.updateActionsFromInputComponents();


      // We want to calculate a movement angle based on
      // the directional inputs.
      var xDelta = 0
      var yDelta = 0;

      if(this.actions.up)     yDelta++;
      if(this.actions.down)   yDelta--;
      if(this.actions.left)   xDelta--;
      if(this.actions.right)  xDelta++;

      var angleRad = Math.atan2(xDelta,yDelta);

      // Only move if there is an input
      if(xDelta != 0 || yDelta != 0) {
        var xForce = Math.sin(angleRad) * maxForce;
        var yForce = Math.cos(angleRad) * -maxForce;  // Have to reverse Y axis
        this.force(xForce, yForce);
      }

      if(this.actions.spinClockwise)          this.spin(.2);
      if(this.actions.spinCounterClockwise)   this.spin(-.2);

      // Analog actions
      if(this.actions.moveX)                  this.force(maxForce* this.actions.moveX, 0);
      if(this.actions.moveY)                  this.force(0, maxForce * this.actions.moveY);
      if(this.actions.spin)                   this.spin(this.actions.spin * .2);

      // Movement bounds - keep the paddle in its zone
      if(this.physics.position.x > this.maxX && this.maxX) {
        this.force(-maxForce * 1.25, 0);
      }

      if(this.physics.position.x < this.minX && this.minX) {
        this.force(-maxForce * 1.25, 0);
      }

    }
  });
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
