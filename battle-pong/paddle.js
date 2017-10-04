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
    // "leftX": "moveX",
    // "leftY": "moveY",
    // "rightX": "spin"
  }
};


var paddles = []; // Keeps an array of paddles for connecting to controllers

function connectPaddlesToControls(){

  paddles[0] = paddleOne;
  paddles[1] = paddleTwo

  // Let the first paddle use the keyboard regardless
  paddleOne.addInputComponent(createKeyboardInputComponent(paddleKeyboardActionMapping));
  // paddleTwo.addInputComponent(createKeyboardInputComponent(paddleKeyboardActionMapping));
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

    physicsOptions : {
      frictionAir: 0.1
    },

    mode: "normal",

    // Keeps track of movement bounds based on the terrain the paddle occupies.
    maxX: false,
    minX: false,

    hasPowerup: false,

    setTimeout: false,  // Keeps track of the swish soudn timeout
    swishTimeoutMS : 260, // Delay between playing the swish sound
    actions: [
      // for buttons
      'spinClockwise','spinCounterClockwise','up','down','left','right',

      // for more fluid options that can use floats instead of booleans (e.g. joysticks)
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
      // If I'm a ghost and I get hit by a ball I die
      if(this.mode == "ghost" && obj == ball) {
        if(obj == ball){

          for(var i = 0; i < 15; i++) {
            var options = {
              x : getRandom(this.physics.bounds.min.x, this.physics.bounds.max.x),
              y : getRandom(this.physics.bounds.min.y, this.physics.bounds.max.y),
              zR : getRandom(-5,5),
              zRv : getRandom(-5,5),
              scaleV : -.005,
              height: 20,
              width: 20,
              lifespan: 100,
              xV : getRandom(-5,5),
              yV : getRandom(-5,5),
              className : "paddleChunk"
            }

            makeParticle(options);
          }

          var paddleX = this.physics.position.x;
          var paddleY = this.physics.position.y;
          makeExplosion(paddleX, paddleY, 75);

          // Add a message near the impact that indicates
          // the force of the hit (in percentage points)
          var messageEl = document.createElement("div");
          messageEl.classList.add("message");
          var messageBody = document.createElement("div");
          messageBody.classList.add("body");
          messageBody.innerText = "T_T";
          messageBody.style.fontSize = 40 + "px";
          messageEl.appendChild(messageBody);
          messageEl.style.transform = "translateX("+ paddleX +"px) translateY(" + paddleY +"px)";
          document.querySelector(".world").appendChild(messageEl);

          setTimeout(function(el) {
            return function() {
              el.remove();
            };
          }(messageEl), 1000);

          shakeScreen();

          this.element.classList.add("dead");
          this.element.classList.remove("shaking");
          removalList.push(ball);

          game.loserDied();
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

      this.physics.mass = 2;

      this.height = this.height + (this.height * modifier);
      this.element.style.height = this.height + "px";

      Matter.Body.setAngle(this.physics, angle);
    },

    // When we get a powerup
    powerup(){
      this.hasPowerup = true;
      this.targetHeight = this.height * 1.5;
      this.element.classList.add("powerup-hit");

      var that = this;
      setTimeout(function(){
        that.targetHeight = that.targetHeight * 1/1.5;
        if(that.targetHeight < 100) {
          that.targetHeight = 100;
        }
        that.hasPowerup = false;
      }, 5500);

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
        this.actions.up = false;
        this.actions.down = false;
        this.actions.left = false;
        this.actions.right = false;
        this.actions.spinClockwise = false;
        this.actions.spinCounterClockwise = false;
      }


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
        this.force(maxForce * 1.25, 0);
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
