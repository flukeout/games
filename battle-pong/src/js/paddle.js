const paddleKeyboardActions = [
  // Discrete on/off buttons
  'up','left','down','right','spinClockwise','spinCounterClockwise', 'dash'
];

const paddleGamepadActions = [
  // Fluid options that can use floats instead of booleans (e.g. joysticks)
  'moveX', 'moveY', 'spinX', 'spinY'
];

const paddleActions = paddleKeyboardActions.concat(paddleGamepadActions);

const maxForce = 0.004;
const HALF_PI = Math.PI / 2;
const QUARTER_PI = Math.PI / 4;
const spinSpeed = .2;
const spinVelocity = spinSpeed / game.physicsSamplingRatio;
const maxSpinVelocity = 0.05235987755982988 / 0.7853981633974483 * 25; // From (3 / 180 * Math.PI) * (Math.PI / 4 * 25) <--- Not sacred. Go ahead and change.
const maxAngularVelocity = .0905;
const angularSpeedThreshold = .02;
const spinDeltaThreshold = 0.03490658503988659; // From 2 / 180 * Math.PI
const maxSnapSpinSpeedBoost = 3;
const snapSpinSpeedBoostReductionFactor = 0.25;

const updateFunctions = {
  moveXY: function (paddle) {
    // We want to calculate a movement angle based on
    // the directional inputs.
    let xDelta = 0,
        yDelta = 0;

    if(paddle.actions.left)   xDelta--;
    if(paddle.actions.right)  xDelta++;

    if(paddle.actions.up)     yDelta++;
    if(paddle.actions.down)   yDelta--;

    let angleRad = Math.atan2(xDelta, yDelta);

    if(xDelta != 0 || yDelta != 0) {
      let xForce = Math.sin(angleRad) * maxForce * game.physicsSamplingRatio;
      let yForce = Math.cos(angleRad) * -maxForce * game.physicsSamplingRatio;  // Have to reverse Y axis
      paddle.force(xForce, yForce);

      //TODO: see if this is needed elsewhere
      paddle.physics.frictionAir = 0.1 / game.physicsSamplingRatio;  
    }
  },
  dashing: function (paddle) {
    paddle.dashDelay = paddle.dashDelay - paddle.dt;

    if(paddle.dashDelay < 0) {
      paddle.dashDelay = 0;
      paddle.updateRoute = 'default';

      // Don't bother dashing anymore
      return;
    }

    if(paddle.dashDelay > 0 && paddle.frameTicks % 1 == 0 && paddle.physics.speed > 1) {
      let options = {
        x : paddle.physics.position.x - 10,
        y : paddle.physics.position.y - 50,
        width : 20,
        height: 100,
        zR : paddle.currentAngle,
        // oV: -.02,
        // scaleV: -.02,
        className : 'paddleTrail',
        lifespan: 20
      }

      makeParticle(options);
    }
  },
  dashStart: function (paddle) {
    if(paddle.actions.dash) {

      // We want to calculate a movement angle based on
      // the directional inputs.
      var xDelta = 0,
          yDelta = 0;

      if(paddle.actions.left)   xDelta--;
      if(paddle.actions.right)  xDelta++;

      if(paddle.actions.up)     yDelta++;
      if(paddle.actions.down)   yDelta--;

      var angleRad = Math.atan2(xDelta,yDelta);

      if(xDelta != 0 || yDelta != 0) {
        var xForce = Math.sin(angleRad) * maxForce * game.physicsSamplingRatio;
        var yForce = Math.cos(angleRad) * -maxForce * game.physicsSamplingRatio;  // Have to reverse Y axis

        paddle.dashDelay = 750;
        xForce = xForce * 20;
        yForce = yForce * 20;
        paddle.force(xForce, yForce);

        paddle.updateRoute = 'dashing';
      }
    }
  },
  stagedSpin: function (paddle) {
    if (paddle.spinLockAngle !== false) return;

    let spinDirection = 0;

    // See if there was any actionable input
    if (paddle.actions.spinClockwise)         spinDirection =  1;
    if (paddle.actions.spinCounterClockwise)  spinDirection = -1;

    // If there was...
    if (spinDirection !== 0) {

      // Set the angular velocity of the paddle
      let angularVelocity = spinDirection * spinVelocity;
      paddle.spin(angularVelocity);

      if(angularVelocity >= 0) {
        // If there is enough velocity to jump to the next 90° (half PI)...
        paddle.targetAngle = (Math.ceil(paddle.physics.angle / HALF_PI) * HALF_PI);
      } else {
        // And if not, settle back to the original state
        paddle.targetAngle = (Math.floor(paddle.physics.angle / HALF_PI) * HALF_PI);
      }
    }
  },
  snapBackSpinCheck: function (paddle) {
    // Only activate this if there's a real desire to do so :)
    if (Math.abs(paddle.actions.spinX) > 0.2) {
      paddle.updateRoute = 'snapBack';
    }
  },
  snapBackSpin: function (paddle) {
    // If this feature isn't already happening, start it by remembering the last known angle
    if (paddle.spinLockAngle === false) {

      // Save the angle the paddle should snap back to
      paddle.spinLockAngle = paddle.targetAngle;
    }

    // Set the target angle to 90° (half PI) forward or backward, waiting for the user to let go...
    paddle.targetAngle = paddle.spinLockAngle + paddle.actions.spinX * HALF_PI;

    // If the user has let go...
    if (Math.abs(paddle.actions.spinX) < 0.2) {
      // Roll back to the original angle
      paddle.targetAngle = paddle.spinLockAngle;

      // Telle everything else that we're not in this state anymore
      paddle.spinLockAngle = false;

      // Boost the angular speed temporarily
      paddle.snapSpinSpeedBoost = maxSnapSpinSpeedBoost;

      // Avoid calling this function by switching back to original input driver stream
      paddle.updateRoute = 'default';
    }
  },
  limitXY: function (paddle) {
    // Analog movement
    var xDelta = paddle.actions.moveX,
        yDelta = paddle.actions.moveY;

    // If we are close to the edge, push it to max
    if (xDelta > .9)    xDelta =  1;
    if (xDelta < -.9)   xDelta = -1;
    if (yDelta > .9)    yDelta =  1;
    if (yDelta < -.9)   yDelta = -1;

    var angleRad = Math.atan2(xDelta,yDelta);

    // Here we limit the total force that can be applied to the paddle
    var totalPowerRatio = Math.sqrt(Math.pow(Math.abs(xDelta),2) + Math.pow(Math.abs(yDelta),2)) || 1;
    if(totalPowerRatio > 1) {
      totalPowerRatio = 1;
    }

    var newForce = totalPowerRatio * maxForce;

    if(xDelta != 0 || yDelta != 0) {
      var xForce = Math.sin(angleRad) * newForce * game.physicsSamplingRatio * paddle.movementRatio;
      var yForce = Math.cos(angleRad) * newForce * game.physicsSamplingRatio * paddle.movementRatio;
      paddle.force(xForce, yForce);
    }

    // Movement bounds - keep the paddle in its zone
    var forceModifier = 1.25 * game.physicsSamplingRatio;

    if(paddle.physics.position.x > paddle.maxX && paddle.maxX) {
      paddle.force(-maxForce * forceModifier, 0);
    }

    if(paddle.physics.position.x < paddle.minX && paddle.minX) {
      paddle.force(maxForce * forceModifier, 0);
    }
  },
  spinToTarget: function (paddle) {
    let currentAngle = paddle.physics.angle;
    let delta = (currentAngle - paddle.targetAngle);
    let torque = -maxSpinVelocity * delta;

    torque = Math.min(torque, maxSpinVelocity) * paddle.snapSpinSpeedBoost;

    if (paddle.spinLockAngle === false)
      paddle.snapSpinSpeedBoost -= (paddle.snapSpinSpeedBoost - 1) * snapSpinSpeedBoostReductionFactor;

    if(paddle.type == "player") {
      if(delta !== 0) {
        paddle.physics.torque = torque;

        if(delta > -spinDeltaThreshold && delta < spinDeltaThreshold) {
          if(paddle.physics.angularSpeed < angularSpeedThreshold) {
            Matter.Body.setAngle(paddle.physics, paddle.targetAngle);
            Matter.Body.setAngularVelocity(paddle.physics, 0);
          }
        }
      }
    }
  },
  capAngularVelocity: function (paddle) {
    if(paddle.physics.angularVelocity > maxAngularVelocity) {
      Matter.Body.setAngularVelocity(paddle.physics, maxAngularVelocity);
    }
    else if(paddle.physics.angularVelocity < -maxAngularVelocity) {
      Matter.Body.setAngularVelocity(paddle.physics, -maxAngularVelocity);
    }
  },
  spinPowerup: function (paddle) {
    if(paddle.spinPowerupRemaining > 0) {
      paddle.spinPowerupRemaining = paddle.spinPowerupRemaining - paddle.dt;
    }

    if(paddle.spinPowerupRemaining > 0) {
      if(paddle.hasSpinPowerup == false) {
        paddle.element.classList.add("powerup-spin");
      }
      paddle.hasSpinPowerup = true;
    }

    if(paddle.spinPowerupRemaining <= 0) {
      paddle.spinPowerupRemaining = 0;
      paddle.hasSpinPowerup = false;
      paddle.spinPowerupCountdown = false;
      paddle.element.classList.remove("powerup-spin");
    }
  },
  expandPowerup: function (paddle) {
    if(paddle.height < paddle.targetHeight) {
      paddle.changeHeight("grow");
      if(paddle.height > paddle.targetHeight) {
        paddle.targetHeight = paddle.height;
      }
    } else if (paddle.height > paddle.targetHeight) {
      paddle.changeHeight("shrink");
      if(paddle.height < paddle.targetHeight) {
        paddle.targetHeight = paddle.height;
      }
    }
  }
};

function createPaddle(options) {
  var options = options || {};

  return createObject({
    selector: options.selector,
    player: options.player,
    targetAngle : 0,
    lifeSpan : options.lifeSpan || "infinite",

    movementRatio: options.movementRatio || 1,
    innerHTML : "<div class='body'><div class='bone'></div></div>",

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
      this.element.classList.remove("powerup-spin");
      this.mode = "normal";
      this.targetHeight = this.baseHeight;
      this.hasSpinPowerup = false;
      this.spinPowerupRemaining = 0;
      this.spinPowerupCountdown = false;
    },

    physicsOptions : {
      mass : 2,
      frictionAir: 0.1 / game.physicsSamplingRatio,
      label: 'paddle-' + (['one', 'two'][options.player])
      // hahaha i didn't know you could do this inline array creation + lookup in javascript syntax <3 (ha sic)
    },

    mode: "normal",
    type: options.type || "player",

    powerupDuration : 5500, // How long powerups last
    targetHeight : options.height,          // Powerups affect this, then the paddle grows / shrinks
    baseHeight : parseInt(options.height),  // Paddle resets to this after powerups
    baseMass : 2,                           // After resizing, we use this to keep the mass the same

    // Keeps track of movement bounds based on the terrain the paddle occupies.
    maxX: false,
    minX: false,

    setTimeout: false,  // Keeps track of the swish soudn timeout
    swishTimeoutMS : 260, // Delay between playing the swish sound
    actions: paddleActions.concat(paddleGamepadActions),

    // Regulates whether or not we should try to spin back to targetAngle
    spinLockAngle: false,
    snapSpinSpeedBoost: 1,

    force: function (x, y) {
      Matter.Body.applyForce(this.physics, this.physics.position, { x: x * this.movementRatio, y: y * this.movementRatio});
    },

    spin: function (v) {
      Matter.Body.setAngularVelocity(this.physics, v);

      if(!this.swishTimeout && this.type == "player") {
        playSound("swish");
        this.swishTimeout = setTimeout(() => {
          this.swishTimeout = false;
        }, this.swishTimeoutMS);
      }
    },

    hit: function(obj) {
      // If I'm a ghost and I get hit by a ball I die (at the end of a game)

      // if(obj.name == "ball" && this.spinPowerupRemaining > 0 && this.spinPowerupCountdown == false) {
        // this.spinPowerupCountdown = true;
      // }

      // If this is a clone (bone)
      if (this.cloneIndex) {
        playRandomSoundFromBank("bones-collide");
      }

      if(this.mode == "ghost" && obj.label.indexOf("ball") > -1) {
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
        game.loserDied(); // TODO - emit an event instead?
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

    hasSpinPowerup : false,
    spinPowerupRemaining : 0,
    spinPowerupCountdown: false,
    spinPowerupTime : 5500,

    // When we get a powerup
    powerup(type){

      if(type == "grow") {
        this.targetHeight = this.height * 1.5;
        this.element.classList.add("powerup-hit");
        game.showMessage("ENHANCE!", 1500);

        var that = this;

        setTimeout(function(){
          that.targetHeight = that.targetHeight * 1/1.5;
          if(that.targetHeight < that.baseHeight) {
            that.targetHeight = that.baseHeight;
          }
        }, this.powerupDuration);
      }

      // For this powerup, we treat it as having a 'time remaining'
      // Gets reduced every frame, and added to when we hit a powerup.
      if(type == "spin") {
        for(var i = 0; i < paddles.length; i++) {
          var p = paddles[i];
          p.hasSpinPowerup = false;
          p.spinPowerupRemaining = 0;
        }
        this.spinPowerupRemaining = this.spinPowerupRemaining + this.spinPowerupTime;
      }

      if(type == "clone") {
        game.showMessage("SPOOOOKY!", 1500);
        this.clonePaddle();
        game.updateBounds();
      }
    },

    clonePaddle(){

      var playerNum = this.player;
      var numClones = getRandom(3,6);

      for(var i = 0; i <= numClones; i++) {

        var minX, maxX;

        if(this.player == 0) {
          minX = 0;
          maxX = 150;
        } else {
          minX = game.boardWidth - 150;
          maxX = game.boardWidth;
        }

        var x = getRandom(minX, maxX);
        var y = getRandom(50, game.boardHeight - 50);

        var newPaddle = createPaddle({
          player: this.player,
          x : x,
          y : y,
          height : 65,
          width: 20,
          classNames : ["paddle", "skeleton"],
          lifeSpan: getRandom(3500, 5500),
          movementRatio : 1.2,
          type: "clone"
        });

        paddles.push(newPaddle);
        popPaddle(newPaddle.physics);
        newPaddle.setInputComponent(this.inputComponent);

        // Used for bone cleanup
        newPaddle.cloneIndex = i;
      }

    },

    init: function(){
      // This ends the spin powerup when a ball hits the endzone
      // var that = this;

      // document.addEventListener("ballHitEndzone", function(e) {
        // if(that.spinPowerupRemaining <= 0 && that.hasSpinPowerup) {
          // that.spinPowerupRemaining = 0;
          // that.hasSpinPowerup = false;
          // that.spinPowerupCountdown = false;
        // }
      // });
    },

    dashDelay : 0,
    // This gets called every frame of the game
    frameTicks: 0,
    update(delta){
      this.dt = delta;

      this.frameTicks++;

      if(this.lifeSpan != "infinite") {
        this.lifeSpan = this.lifeSpan - delta;

        if(this.lifeSpan < 0) {
          popPaddle(this.physics);
          removalList.push(this);
  
          // If lifeSpan is being used, we're assuming that it's a clone (a bone)
          if (this.cloneIndex) {
            playSound('Powerup_Bones_Disapear_' + this.cloneIndex);
          }
        }
      }

      if(this.mode != "ghost") {
        this.updateActionsFromInputComponents();
      } else {
        // Set all actions to false
        for (let key in this.actions) {
          this.actions[key] = 0;
        }
      }

      // Run whichever driver route is currently assigned
      this.updateRoutes[this.updateRoute](this);
    },
    
    // These routes let you programmatically insert or omit stages that govern the movement
    // of the paddle. By switching between them, you can cleanly decide which features
    // are available for paddle movement at any one time.
    updateRoutes: {
      default: function(paddle) {
        // Maintenance for powerups
        updateFunctions.expandPowerup(paddle);
        updateFunctions.spinPowerup(paddle);

        // Move
        updateFunctions.moveXY(paddle);

        // See if we're about to start a dash        
        updateFunctions.dashStart(paddle);

        // See if we're going to be snapping *next* frame
        updateFunctions.snapBackSpinCheck(paddle);

        // Spin the paddle 90 degrees
        updateFunctions.stagedSpin(paddle);

        // Make sure the paddle stays in bounds
        updateFunctions.limitXY(paddle);

        // Resolve the paddle's rotation to the specified targetAngle
        updateFunctions.spinToTarget(paddle);

        // Make sure the paddle's spin speed isn't insane
        updateFunctions.capAngularVelocity(paddle);
      },
      snapBack: function (paddle) {
        updateFunctions.expandPowerup(paddle);
        updateFunctions.spinPowerup(paddle);
        
        updateFunctions.moveXY(paddle);

        // Listen to gamepad for amount of winding up to do, and prepare to unleash fury!
        updateFunctions.snapBackSpin(paddle);

        updateFunctions.limitXY(paddle);
        updateFunctions.spinToTarget(paddle);
      },
      dashing: function (paddle) {
        updateFunctions.expandPowerup(paddle);
        updateFunctions.spinPowerup(paddle);
        updateFunctions.dashing(paddle);
      }
    },
    updateRoute: 'default'
  });
}

