const paddleKeyboardActions = [
  // Discrete on/off buttons
  'up','left','down','right',
  'spinClockwise','spinCounterClockwise',
  'dash',
];

const paddleGamepadActions = [
  // Fluid options that can use floats instead of booleans (e.g. joysticks)
  'moveX', 'moveY', 'spinX', 'spinY'
];

const paddleActions = paddleKeyboardActions.concat(paddleGamepadActions);

// Tweak these three
const frictionAir = .2;  // .01
const maxForce = 0.016;   // .004
const spinSpeed = .2; // .2
const maxSpinVelocity = 2.7;
const dashVelocityMaximum = 450;

const HALF_PI = Math.PI / 2;
const EIGHTH_PI = Math.PI / 8;
const spinVelocity = spinSpeed / game.physicsSamplingRatio;

const maxAngularVelocity = .0905;
const angularSpeedThreshold = .02;
const spinDeltaThreshold = 0.03490658503988659; // From 2 / 180 * Math.PI

const slowerSpinDampeningFactor = 0.5;

const boneDisappearSounds = SoundManager.findSounds('Powerup_Bones_Disapear_');

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
      
      if(paddle.dashDelay > 0) {
        yForce = yForce * mapScale(paddle.dashDelay, 0, 650, .1, .3);
        xForce = xForce * mapScale(paddle.dashDelay, 0, 650, .1, .3);
      }

      paddle.force(xForce, yForce);

      //TODO: see if this is needed elsewhere
      paddle.physics.frictionAir = frictionAir / game.physicsSamplingRatio;
    }
  },
  dashing: function (paddle) {
    paddle.dashDelay = paddle.dashDelay - paddle.dt;

    if(paddle.dashDelay < 0) {
      paddle.dashDelay = 0;
      paddle.element.classList.remove("dashing");
      paddle.updateRoute = 'default';
      // Don't bother dashing anymore
      return;
    }

    // End of dashing paticles
  },
  dashStart: function (paddle) {
    return; // NO DASHING

    if(paddle.actions.dash && paddle.type == "player") {

      // We want to calculate a movement angle based on
      // the directional inputs.
      // Directional Movement...
      var xDelta = 0,
          yDelta = 0,
          hasMovement = false;

      if(paddle.actions.left) {
        xDelta--;
        hasMovement = true;
      }
      if(paddle.actions.right) {
        xDelta++;
        hasMovement = true;
      }
      if(paddle.actions.up){
        yDelta--;
        hasMovement = true;
      }
      if(paddle.actions.down){
        yDelta++;
        hasMovement = true;
      }

      var angleRad = Math.atan2(xDelta,yDelta);

      if(hasMovement == false) {
        // Analog movement
        xDelta = paddle.actions.moveX,
        yDelta = paddle.actions.moveY;

        // If we are close to the edge, push it to max
        if (xDelta > .9)    xDelta =  1;
        if (xDelta < -.9)   xDelta = -1;
        if (yDelta > .9)    yDelta =  1;
        if (yDelta < -.9)   yDelta = -1;

        angleRad = Math.atan2(xDelta,yDelta);
      }

      // Calculuating how different the orientation of the paddle is
      // from it's movement direction to see how hard we can dash.

      // Movement
      let angle = Math.atan2(paddle.physics.velocity.x, paddle.physics.velocity.y) * 180 / Math.PI;

      angle = Math.abs(angle);
      if(angle > 180) {
        angle = angle % 180;
      }

      var horizontalMovementRatio = (90 - Math.abs(angle - 90)) / 90

      // Orientation
      var orientationAngle = Math.abs(paddle.physics.angle * 180 / Math.PI);

      if(orientationAngle > 180) {
        orientationAngle = orientationAngle % 180;
      }

      var horizontalOrientationRatio = (90 - Math.abs(orientationAngle - 90)) / 90

      // This is how hard we can boost the dash based on the orientation and movement...
      var slidePowerPercent = 1 - Math.abs(horizontalOrientationRatio - horizontalMovementRatio);

      if(xDelta != 0 || yDelta != 0) {

        SoundManager.playRandomSoundFromBank('dash');

        var xForce = Math.sin(angleRad) * maxForce * game.physicsSamplingRatio;
        var yForce = Math.cos(angleRad) * maxForce * game.physicsSamplingRatio;  // Have to reverse Y axis

        paddle.dashDelay = 650;
        
        xForce = xForce * (10 + (10 * slidePowerPercent));
        yForce = yForce * (10 + (10 * slidePowerPercent));

        paddle.force(xForce, yForce);

        paddle.updateRoute = 'dashing';
      }
    }
  },
  
  stagedSpin: function (paddle) {
    let spinDirection = 0;

    // See if there was any actionable input
    if (paddle.actions.spinClockwise)         spinDirection =  1;
    if (paddle.actions.spinCounterClockwise)  spinDirection = -1;

    // If there was spinning input...
    if (spinDirection !== 0) {

      // Set the angular velocity of the paddle
      let angularVelocity = spinDirection * spinVelocity;
      
      if(paddle.dashDelay > 0) {
        angularVelocity = angularVelocity * mapScale(paddle.dashDelay, 0, 450, .5, 1);
      }
  
      paddle.spin(angularVelocity);

      // Sets the destination angle for the paddle for when the player stops spinning
      // - If it's a short spin duration (less than 100ms), snap to next 90 deg
      // - If it's a long spin, snap to the next vertical orientation

      if(angularVelocity > 0) {
        // Clockwise
        paddle.targetAngle = (Math.ceil(paddle.physics.angle / HALF_PI) * HALF_PI);
      }
      else if (angularVelocity < 0) {
        // Counter-clockwise
        paddle.targetAngle = (Math.floor(paddle.physics.angle / HALF_PI) * HALF_PI);
      }
    }
  },
  analogSpin: function (paddle) {

    let dominantAngle = Math.abs(paddle.actions.spinX) >
                        Math.abs(paddle.actions.spinY) ? "X" : "Y";

    // Only activate this if there's a real desire to do so :)
    if (Math.abs(paddle.actions.spinX) > 0.4 && dominantAngle == "X") {
      
      let modifier = paddle.actions.spinX > 0 ? 1 : -1;
      let angularVelocity = spinVelocity * modifier;
        
      paddle.spin(angularVelocity);

      if(angularVelocity >= 0) {
        // If there is enough velocity to jump to the next 90° (half PI)...
        paddle.targetAngle = (Math.ceil(paddle.physics.angle / HALF_PI) * HALF_PI);
      } else {
        // And if not, settle back to the original state
        paddle.targetAngle = (Math.floor(paddle.physics.angle / HALF_PI) * HALF_PI);
      }
    }
    
    if (Math.abs(paddle.actions.spinY) > 0.4 && dominantAngle == "Y") {

      let modifier = paddle.actions.spinY > 0 ? -1 : 1;
      let angularVelocity = spinVelocity * modifier;

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
  moveAnalog : function(paddle) {
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
  },
  limitXY: function (paddle) {

    // Movement bounds - keep the paddle in its zone
    var forceModifier = 1.25 * game.physicsSamplingRatio;

    if (paddle.maxX) {
      if (paddle.physics.position.x > paddle.maxX) {
        if(paddle.hasNoclipPowerup) {
          if (!paddle.inEnemyTerritory) {
            paddle.inEnemyTerritory = true;
            SoundManager.fireEvent('Ghost_Enters_Paddle_Enemy_Territory');
          }
          return;
        }
        else {
          paddle.force(-maxForce * forceModifier, 0);
        }
      }
      else if (paddle.inEnemyTerritory) {
        paddle.inEnemyTerritory = false;
        SoundManager.fireEvent('Ghost_Leaves_Paddle_Enemy_Territory');
      }
    }

    if (paddle.minX) {
      if(paddle.physics.position.x < paddle.minX) {
        if(paddle.hasNoclipPowerup) {
          if (!paddle.inEnemyTerritory) {
            paddle.inEnemyTerritory = true;
            SoundManager.fireEvent('Ghost_Enters_Paddle_Enemy_Territory');
          }
          return;
        }
        else {
          paddle.force(maxForce * forceModifier, 0);
        }
      }
      else if (paddle.inEnemyTerritory) {
        paddle.inEnemyTerritory = false;
        SoundManager.fireEvent('Ghost_Leaves_Paddle_Enemy_Territory');
      }
    }
  },
  spinToTarget: function (paddle) {
    let currentAngle = paddle.physics.angle;
    let delta = (currentAngle - paddle.targetAngle);
    let torque = -maxSpinVelocity * delta;

    torque = Math.min(torque, maxSpinVelocity);

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

    paddle.angularVelocityHistory.push(paddle.physics.angularVelocity);
    if (paddle.angularVelocityHistory.length > 50) {
      paddle.angularVelocityHistory.shift();
    }
    paddle.averageAngularVelocity = paddle.angularVelocityHistory.reduce((acc, curr) => acc + curr)/paddle.angularVelocityHistory.length;
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

    if(paddle.hasSpinPowerup && paddle.spinPowerupRemaining <= 0) {
      paddle.spinPowerupRemaining = 0;
      paddle.hasSpinPowerup = false;
      paddle.element.classList.remove("powerup-spin");
      SoundManager.playSound('Powerup_Spin_WareOff');
      game.lostPowerup(paddle.player, "spin");
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
      SoundManager.playSound('Powerup_Enhance_WareOff');
      if(paddle.height < paddle.targetHeight) {
        paddle.targetHeight = paddle.height;
      }
    }
  },
  cloneCleanup: function (paddle) {
    if(paddle.lifeSpan != "infinite") {
      paddle.lifeSpan = paddle.lifeSpan - paddle.dt;

      if(paddle.lifeSpan < 0) {
        popPaddle(paddle.physics);
        removalList.push(paddle);

        // If lifeSpan is being used, we're assuming that it's a clone (a bone)
        if (paddle.cloneIndex !== undefined) {
          let soundIndex = Math.min(boneDisappearSounds.length, paddle.cloneIndex + 1);
          SoundManager.playSound('Powerup_Bones_Disapear_' + soundIndex);
        }
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
    innerHTML : "<div class='dash-indicator'></div><div class='body'><div class='bone'></div></div>",

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
      game.lostPowerup(this.player, "spin");
      this.spinPowerupRemaining = 0;
    },

    physicsOptions : {
      mass : 2,
      frictionAir: frictionAir / game.physicsSamplingRatio,
      label: 'paddle-' + (['one', 'two'][options.player]),
      collisionFilter : {
        category : 0x0001
      }
      // hahaha i didn't know you could do this inline array creation + lookup in javascript syntax <3 (ha sic)
    },

    mode: "normal",
    type: options.type || "player",

    powerupDuration : 5500, // How long powerups last
    targetHeight : options.height,          // Powerups affect this, then the paddle grows / shrinks
    baseHeight : parseInt(options.height),  // Paddle resets to this after powerups
    baseMass : 2,                           // After resizing, we use this to keep the mass the same
    baseInertia : 6933.333333333333,

    // Keeps track of movement bounds based on the terrain the paddle occupies.
    maxX: false,
    minX: false,

    setTimeout: false,  // Keeps track of the swish soudn timeout
    swishTimeoutMS : 260, // Delay between playing the swish sound
    actions: paddleActions.concat(paddleGamepadActions),

    force: function (x, y) {
      Matter.Body.applyForce(this.physics, this.physics.position, { x: x * this.movementRatio, y: y * this.movementRatio});
    },

    checkIsPlayerSpinning: function(){
      let a = this.actions;
      if(
        a.spinClockwise ||
        a.spinCounterClockwise ||
        Math.abs(a.spinX) > .4 ||
        Math.abs(a.spinY) > .4
      ) {
        return true;
      } else {
        return false;
      }
    },


    spin: function (v) {

      Matter.Body.setAngularVelocity(this.physics, v);

      if(!this.swishTimeout && this.type == "player") {
        SoundManager.playRandomSoundFromBank("swish");
        this.swishTimeout = setTimeout(() => {
          this.swishTimeout = false;
        }, this.swishTimeoutMS);
      }
    },

    hit: function(obj) {

      // If this is a clone (bone)
      if (this.cloneIndex) {
        SoundManager.playRandomSoundFromBank("bones-collide");
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
      Matter.Body.setInertia(this.physics,this.baseInertia);
    },

    hasSpinPowerup : false,
    spinPowerupRemaining : 0,
    spinPowerupTime : 7500,
    
    hasMagnetPowerup : false,
    magnetTimeout: false,
    magnetDuration : 7500,
    
    noclipDuration : 5000,
    noclipTimeout: false,

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

      if(type == "magnet") {
        this.hasMagnetPowerup = true;
        this.element.classList.add("powerup-magnet");
        game.showMessage("STICKY!", 1500);
        
        clearTimeout(this.magnetTimeout);
        
        var that = this;
        this.magnetTimeout = window.setTimeout(function(){
          that.element.classList.remove("powerup-magnet");
          that.hasMagnetPowerup = false;
          SoundManager.playSound('Powerup_Sticky_WareOff');
        }, this.magnetDuration); 
      }

      if(type == "noclip") {
        console.log('NOCLIP!!');
        this.hasNoclipPowerup = true;
        this.inEnemyTerritory = false;
        this.element.classList.add("powerup-noclip");
        game.showMessage("NOCLIP!", 1500);
        clearTimeout(this.noclipTimeout);
        
        var that = this;
        this.noclipTimeout = window.setTimeout(function(){
          that.element.classList.remove("powerup-noclip");
          that.hasNoclipPowerup = false;
          SoundManager.fireEvent('Ghost_Leaves_Paddle_Enemy_Territory');

          SoundManager.playSound('Powerup_Ghost_WareOff');
        }, this.noclipDuration); 
      }

      // For this powerup, we treat it as having a 'time remaining'
      // Gets reduced every frame, and added to when we hit a powerup.
      if(type == "spin") {
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

      let clones = [];

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

        game.paddles.push(newPaddle);
        popPaddle(newPaddle.physics);
        newPaddle.setInputComponent(this.inputComponent);

        clones.push(newPaddle);
      }

      // Sort the clones to give an index for disappearing which will play their
      // hilarious bone disappearing noise in the right order.
      clones = clones.sort((a, b) => {
        if (a.lifeSpan > b.lifeSpan) return 1;
        if (a.lifeSpan < b.lifeSpan) return -1;
        return 0;
      });

      clones.forEach((c, i) => c.cloneIndex = i);
    },

    init: function(){
      // Reverse the calculations for analog spinning if player is on the right side.
      this.analogSpinDirection = this.player === 0 ? 1 : -1;
    },

        // This gets called every frame of the game
    dashDelay : 0,
    frameTicks: 0,

    analogSpinDirection: 1,
    averageAngularVelocity: 0,
    angularVelocityHistory: [],
    
    update(delta){
      // Save these on the object so that they're accessible to update functions
      this.dt = delta;
      this.frameTicks++;

      // Ghosts are just there to be scared and die. They can't move.
      if(this.mode != "ghost") {
        this.updateActionsFromInputComponents();
      } else {
        // Set all actions to false because ghosts can't move.
        for (let key in this.actions) {
          this.actions[key] = 0;
        }
      }

      // Run whichever driver route is currently assigned
      this.updateRoutes[this.updateRoute].forEach(fn => fn(this));
    },

    // TODO: this would be better as a series of "channels" so that you can flip them on & off
    // depending on the overall feature. e.g. during a dash, you could just prevent more dashing by
    // switching off the "dash" channel. Then, updateFunctions registered under "dash" wouldn't run.
    // During a route-switch (i.e. updateRoute = XXXX), compile a new routing function to avoid lots of
    // if statements! 

    // These routes let you programmatically insert or omit stages that govern the movement
    // of the paddle. By switching between them, you can cleanly decide which features
    // are available for paddle movement at any one time.
    updateRoutes: {
      default: [
        // Maintenance for powerups
        updateFunctions.expandPowerup,
        updateFunctions.spinPowerup,
        updateFunctions.moveXY,
        updateFunctions.moveAnalog,

        // See if we're about to start a dash
        updateFunctions.dashStart,

        updateFunctions.analogSpin,

        // Spin the paddle 90 degrees
        updateFunctions.stagedSpin,

        // Make sure the paddle stays in bounds
        updateFunctions.limitXY,

        // Resolve the paddle's rotation to the specified targetAngle
        updateFunctions.spinToTarget,

        // Make sure the paddle's spin speed isn't insane
        updateFunctions.capAngularVelocity,

        // Check if this is a clone and remove it if necessary
        updateFunctions.cloneCleanup,
      ],
      dashing: [
        updateFunctions.expandPowerup,
        updateFunctions.spinToTarget,
        updateFunctions.stagedSpin,
        updateFunctions.analogSpin,
        updateFunctions.moveXY,
        updateFunctions.limitXY,
        updateFunctions.spinPowerup,
        updateFunctions.dashing
      ]
    },
    updateRoute: 'default'
  });
}

