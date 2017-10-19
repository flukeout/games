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


function connectPaddlesToControls(){


  // Let the first paddle use the keyboard regardless
  paddles[0].addInputComponent(createKeyboardInputComponent(paddleKeyboardActionMapping));
  // paddles[1].addInputComponent(createKeyboardInputComponent(paddleKeyboardActionMapping));
  // paddles[2].addInputComponent(createKeyboardInputComponent(paddleKeyboardActionMapping));
  // paddles[3].addInputComponent(createKeyboardInputComponent(paddleKeyboardActionMapping));
  // If there are more than 0 and less than 2 gamepads, hook them up to paddles!
  for (var i = 0; i < gamepads.length && i < 2; ++i) {
    connectGamepad(gamepads[i]);
  }
}


function createPaddle(options) {
  var maxForce = 0.004;

  var options = options || {};

  return createObject({
    selector: options.selector,
    player: options.player,

    properties: {
      x: options.x || 0,
      y: options.y || 0,
      width: options.width || 0,
      height: options.height || 0,
      classNames : options.classNames || []
    },


    reset: function(){
      this.element.classList.remove("dead");
      this.element.classList.remove("loser");
      this.element.classList.remove("shaking");
      this.mode = "normal";
      this.targetHeight = this.baseHeight;
    },

    physicsOptions : {
      mass : 2,
      frictionAir: 0.1,
      label: 'paddle-' + (['one', 'two'][options.player])
      // hahaha i didn't know you could do this inline array creation + lookup in javascript syntax <3 (ha sic)
    },

    mode: "normal",

    powerupDuration : 5500, // How long powerups last
    targetHeight : options.height,          // Powerups affect this, then the paddle grows / shrinks
    baseHeight : parseInt(options.height),  // Paddle resets to this after powerups
    baseMass : 2,                           // After resizing, we use this to keep the mass the same

    // Keeps track of movement bounds based on the terrain the paddle occupies.
    maxX: false,
    minX: false,

    setTimeout: false,  // Keeps track of the swish soudn timeout
    swishTimeoutMS : 260, // Delay between playing the swish sound
    actions: [
      // Discrete on/off buttons
      'spinClockwise','spinCounterClockwise','up','down','left','right',

      // Fluid options that can use floats instead of booleans (e.g. joysticks)
      'moveX', 'moveY', 'spin'
    ],

    force: function (x, y) {
      Matter.Body.applyForce(this.physics, this.physics.position, { x: x, y: y });
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

    hit: function(obj) {
      // If I'm a ghost and I get hit by a ball I die (at the end of a game)
      if(this.mode == "ghost" && obj == ball) {
        if(obj == ball){
          this.element.classList.add("dead");
          this.element.classList.remove("shaking");
          explodePaddle(this.physics);
          showMessage({
            text: "T_T",
            x: this.physics.position.x,
            y: this.physics.position.y,
            fontSize : 40,
            timeout: 1000,
          });
          game.loserDied(); // TODO - emit an event instead
        }
      }
    },

    // When we have to grow or shrink a paddle after getting a powerup
    changeHeight(type){

      var modifier = .05;

      if(type == "shrink"){
        modifier = modifier * -1;
      }

      var angle = JSON.parse(JSON.stringify(this.physics.angle));
      Matter.Body.setAngle(this.physics, 0);
      Matter.Body.scale(this.physics, 1, 1 + modifier, this.physics.position);

      this.height = this.height + (this.height * modifier);
      this.element.style.height = this.height + "px";

      Matter.Body.setAngle(this.physics, angle);

      this.physics.mass = this.baseMass;
    },

    // When we get a powerup
    powerup(){

      this.targetHeight = this.height * 1.5;
      this.element.classList.add("powerup-hit");

      var that = this;

      setTimeout(function(){
        that.targetHeight = that.targetHeight * 1/1.5;
        if(that.targetHeight < that.baseHeight) {
          that.targetHeight = that.baseHeight;
        }
      }, this.powerupDuration);

    },

    // This gets called every frame of the game
    update(){

      if(this.height < this.targetHeight) {
        this.changeHeight("grow");
        if(this.height > this.targetHeight) {
          this.targetHeight = this.height;
        }
      } else if (this.height > this.targetHeight) {
        this.changeHeight("shrink");
        if(this.height < this.targetHeight) {
          this.targetHeight = this.height;
        }
      }

      if(this.mode != "ghost") {
        this.updateActionsFromInputComponents();
      } else {
        // Set all actions to false
        this.actions.up = false;
        this.actions.down = false;
        this.actions.left = false;
        this.actions.right = false;
        this.actions.spinClockwise = false;
        this.actions.spinCounterClockwise = false;
      }

      // We want to calculate a movement angle based on
      // the directional inputs.
      var xDelta = 0,
          yDelta = 0;

      if(this.actions.left)   xDelta--;
      if(this.actions.right)  xDelta++;

      if(this.actions.up)     yDelta++;
      if(this.actions.down)   yDelta--;

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

      var forceModifier = 1.25;

      // Movement bounds - keep the paddle in its zone
      if(this.physics.position.x > this.maxX && this.maxX) {
        this.force(-maxForce * forceModifier, 0);
      }

      if(this.physics.position.x < this.minX && this.minX) {
        this.force(maxForce * forceModifier, 0);
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