function createBall(options){

  var options = options || {};

  return createObject({
    ignoreRotation: true, // This means when we update the DOM x,y we don't also rotate this.
    innerHTML : "<div class='spinny'></div><div class='shadow'></div><div class='body'></div>",
    className: "ball",
    classNames : ["ball"],

    properties : {
      x: options.x || 0,
      y: options.y || 0,
      height: 30,
      width: 30,
      classNames : options.classNames || []
    },

    lastStepSpeed : 0,

    physicsOptions : {
      frictionAir: 0.00001 / game.physicsSamplingRatio,
      restitution: 1,
      label: "ball",
      collisionFilter : {
        category : 0x0001,
        mask : 0x0001
      }
    },

    timeSinceHit : 0,
    gotPaddleHit : false,

    maxSpeed: 16 / game.physicsSamplingRatio, // 16
    maxSpeedSlowdownRatio : .99, // .99

    hardHitVelocityIncreaseRatio: 1.25,

    wordSpeed : 13 / game.physicsSamplingRatio,    // TODO - update // used to be 14
    minWordSpeed : 10 / game.physicsSamplingRatio, // TODO - update

    phrases : [
      "BOOOOOOOOM",
      "THHHHHWAP",
      "KA-JAAAAAAAAANG",
      "BA-DOOOM",
      "KA-BLAAAAM",
      "FWOOOSH",
      "WHAAAAAAM",
      "KA-POOOOOOOW",
    ],

    wordInProgress : false,

    wordString : false,
    wordDirection : "",
    letterIndex : 0,
    startedGoingFast : false,
    frameTick: 0,

    // TODO - what are these for?
    displayAngle: 0,
    rotationVelocity: 0,
    rotationVelocityMax: 20,  // TODO - update
    rotationAccel: 2,         // TODO - update

    // This slows the ball down after it is going too fast for too long
    goingFast: false,
    timeSpentGoingFastMS: 0,
    timeAllowedGoingFastMS : 5000, // max time to have spinmode

    // For slowing things down

    brakesModeEnabled : window.Settings.brakesModeEnabled,
    // brakesModeEnabled : true,
    slowSpeedTarget: 9 / game.physicsSamplingRatio,

    applyBrakes : false,
    brakesModeRatio: .985,

    goalsWhileFastAllowed: 2,
    goalsWhileFast : 0,
    goingFastSpeedThreshold: 11 / game.physicsSamplingRatio,

    hasTargetSpeed : false,
    targetSpeed : false,
    
    prepSpin: false,
    canSpin : false, 
    spinDirection : false,

    lastHitPaddle : false, // The paddle that holds influence over the ball (for spinning)
    lastTouchedPaddle: false,

    wooshPlayed: false,
    wasRotating: false,

    wasSpinning: false,

    frameTicks : 0,

    spinSoundSequenceManager: new SoundManager.sequences.Powerup_Spin(),

    changeVelocityRatio: function(ratio) {
      Matter.Body.setVelocity(this.physics, {
        x : this.physics.velocity.x * ratio,
        y : this.physics.velocity.y * ratio
      });
    },

    launch : function(x,y){
      this.element.classList.add('show');
      Matter.Body.applyForce(this.physics, this.physics.position, {x : x, y : y});
    },

    setTargetSpeed: function(speed){
        this.targetSpeed = speed || 0;
        this.element.classList.add("sticky");
        this.hasTargetSpeed = true;
    },

    removeTargetSpeed: function(){
        this.element.classList.remove("sticky");
        this.hasTargetSpeed = false;
    },


    run : function(delta) {
      
      // Populates elements so we don't have to reselect all the time
      // would be nice to have an init to do this in.
      if(!this.bodyEl) {
        this.bodyEl = this.element.querySelector(".body");
      }

      if(!this.spinnyEl){
        this.spinnyEl = this.element.querySelector(".spinny");
      }

      if(this.hasTargetSpeed) {
        if(this.physics.speed > this.targetSpeed) {
          this.changeVelocityRatio(.9);
          if(Math.abs(this.physics.speed - this.targetSpeed) < .1) {
            this.removeTargetSpeed();
          }
        }
      }

      if(this.physics.speed < this.slowSpeedTarget && this.applyBrakes) {
        this.applyBrakes = false;
        this.goalsWhileFast = 0;
      }

      if(this.applyBrakes && this.brakesModeEnabled) {
        this.changeVelocityRatio(this.brakesModeRatio);
      }

      // Reduce ball rotation speed
      if(this.physics.angularSpeed > 0) {
        Matter.Body.setAngularVelocity(this.physics, this.physics.angularVelocity * .95 );
      }

      // If it's going too fast, slow it down
      if(this.physics.speed > this.maxSpeed) {
        this.changeVelocityRatio(this.maxSpeedSlowdownRatio);
      }

      // All this crap below just relates to curving the ball
      // and adding the spinning animation.

      var xV = this.physics.velocity.x;
      var yV = -this.physics.velocity.y;

      var movementAngle = Math.atan2(xV, yV);

      var stretchScale = 1;
      var maxStretch = 1.5;

      var squashScale = 1;
      var minSquash = .75;

      var minStretchSpeed = 6;

      var exceededBy = this.physics.speed - minStretchSpeed;
      var exceedRatio = 0;

      if(exceededBy > 0) {
        exceedRatio = exceededBy / 5;
        stretchScale = 1 + exceedRatio * .5;
        squashScale = 1 - exceedRatio * .5;
      }

      if(stretchScale > maxStretch) {
        stretchScale = maxStretch
      }

      if(squashScale < minSquash) {
        squashScale = minSquash
      }
      
      this.bodyEl.style.transform = "rotate("+ movementAngle +"rad) scaleX(" + squashScale + ") scaleY(" + stretchScale + ")";

      var rotating = false;

      if(this.canSpin) {  
        if(this.spinDirection == "cw") {
          var a = movementAngle + Math.PI / 2;
          this.rotationVelocity = this.rotationVelocity + this.rotationAccel;
          if(this.rotationVelocity > this.rotationVelocityMax){
            this.rotationVelocity = this.rotationVelocityMax;
          }
        } else {
          var a = movementAngle - Math.PI / 2;
          this.rotationVelocity = this.rotationVelocity - this.rotationAccel;
          if(this.rotationVelocity < -this.rotationVelocityMax){
            this.rotationVelocity = -this.rotationVelocityMax;
          }
        }
        rotating = true;      
      }

      if(rotating == false) {
        if(this.rotationVelocity > 0) {
          this.rotationVelocity = this.rotationVelocity - this.rotationAccel;
        }
        if(this.rotationVelocity < 0) {
          this.rotationVelocity = this.rotationVelocity + this.rotationAccel;
        }
        this.wooshPlayed = false;
      } else {

        // Increase the speed of the ball if it's going too slow while spinning
        // TODO - make a separate function for decreasing / increasing velocity that accepts
        // a percentage?

        // While spinning...
        if((this.physics.speed * game.physicsSamplingRatio) < 9) {
          Matter.Body.setVelocity(this.physics, {
            x : this.physics.velocity.x * 1.06,  // TODO - fix this
            y : this.physics.velocity.y * 1.06   // TODO - fix this
          });
        }

        if(this.wooshPlayed == false && Math.abs(this.rotationVelocity) == this.rotationVelocityMax){
          this.spinSoundSequenceManager.start();
          this.wooshPlayed = true;
        }
      }

      // Adds trails after the ball when it's goign fast enough
      if(this.frameTicks > 1 & this.physics.speed * game.physicsSamplingRatio > 7) {
        if(Math.abs(this.rotationVelocity / game.physicsSamplingRatio) > 0 || rotating){
          addBallTrail(this.physics.position.x, this.physics.position.y);
        }
        this.frameTicks = 0;
      } else {
        this.frameTicks++;
      }

      this.displayAngle = this.displayAngle + this.rotationVelocity; // What we show the ball doing

      var rotationRatio = Math.abs(this.rotationVelocity) / this.rotationVelocityMax;

      var scaleMin = .5;
      var scaleMax = 1.2;
      var scale = scaleMin + (scaleMax - scaleMin) * rotationRatio;

      var oMin = -.2;
      var oMax = .35;
      var opacity = oMin + (oMax - oMin) * rotationRatio;

      var modifier = 1; // Reverses the rotation

      if(this.rotationVelocity < 0) {
        modifier = modifier * -1;
      }

      this.spinnyEl.style.transform = "rotate("+ this.displayAngle +"deg) scaleX(" + (scale * modifier) + ") scaleY("+scale+")";
      this.spinnyEl.style.opacity = opacity;

      var newX = Math.sin(a) *  .00015 * game.physicsSamplingRatio* this.physics.speed * game.physicsSamplingRatio * rotationRatio; //.00005
      var newY = Math.cos(a) * -.00015 * game.physicsSamplingRatio * this.physics.speed * game.physicsSamplingRatio * rotationRatio; //.00005

      if(rotating && this.physics.speed * game.physicsSamplingRatio > 2) {
        Matter.Body.applyForce(this.physics, this.physics.position, {
          x : newX,
          y : newY
        });
      }

      // TODO: fix this so it doesn't happen every frame
      // if(this.canSpin || this.prepSpin){
      //   this.element.classList.add("canSpin");
      // } else {
      //   this.element.classList.remove("canSpin");
      // }

      // --Spinning ball garbage ends here.

      // The paddle hit stuff needs a one frame delay before taking effect seemingly.
      // This is the way around that. Should be easier?
      if(this.gotPaddleHit) {
        this.gotPaddleHit = false;
        this.timeSinceHit = 0;
      }

      if(this.wordInProgress){
        if(this.physics.speed > this.minWordSpeed) {
          this.drawLetter();
        } else {
          this.endWord();
        }
      }

      this.lastStepSpeed = JSON.parse(JSON.stringify(this.physics.speed));

      if (this.wasRotating && !rotating) {
        this.spinSoundSequenceManager.stop();
      }
      this.wasRotating = rotating;
    },

    startWord: function(){
      if(game.mode != "running") {
        return;
      }

      this.wordInProgress = true;
      this.letterIndex = -1;
      var wordIndex = Math.floor(getRandom(0,this.phrases.length));
      this.wordString = JSON.parse(JSON.stringify(this.phrases[wordIndex]));
    },

    drawLetter : function(){
      var movementAngle = 180 + -Math.atan2(this.physics.velocity.x, this.physics.velocity.y) * 180/Math.PI;

      if(movementAngle >= 360) {
        movementAngle = movementAngle - 360;
      }

      if(this.frameTick > 1) {
        var letter = this.wordString.charAt(this.letterIndex);

        drawLetter(this.physics.position.x, this.physics.position.y, movementAngle, letter);

        this.letterIndex++;
        this.frameTick = 0;
        if(this.letterIndex >= this.wordString.length) {
          this.endWord();
        }
      }

      this.frameTick++;
    },

    endWord : function(){
      this.letterIndex = 0;
      this.wordInProgress = false;
    },

    hit : function(obj){

      if(obj.label.indexOf("wall-right") > -1 || obj.label.indexOf("wall-left") > -1) {
        if(this.physics.speed > this.goingFastSpeedThreshold) {
          this.goalsWhileFast++;
        } else {
          this.goalsWhileFast = 0;
        }
        if(this.goalsWhileFast >= this.goalsWhileFastAllowed) {
          this.applyBrakes = true;
        }
      }

      if(obj.label.indexOf("wall-left") > -1 && this.lastTouchedPaddle === 2) {
        this.endSpin();
      }

      if(obj.label.indexOf("wall-right") > -1 && this.lastTouchedPaddle === 1) {
        this.endSpin();
      }

      if(obj.label.indexOf("wall-top") > -1 || obj.label.indexOf("wall-bottom") > -1) {

        let xV = this.physics.velocity.x;
        let yV = this.physics.velocity.y;

        var movementAngle = Math.atan2(xV, yV);

        let ratio = Math.abs(xV) / Math.abs(yV);
        let totalVelocity = Math.abs(xV) + Math.abs(yV);

        if(totalVelocity < 6) {
          totalVelocity = 6;
        }

        let xRatio = .65;
        let yRatio = .45;

        

        if(this.lastTouchedPaddle === 1) {
          // If the right-side player touched it, it goes to the left
          if(yV < 0) {
            // Going Down
            this.spinDirection = "cw";
            if(this.prepSpin && !this.canSpin) {
      
              Matter.Body.setVelocity(this.physics, {
                x: totalVelocity * xRatio,
                y: -totalVelocity * yRatio
              });
            }
          } else {
            // Going Up
            this.spinDirection = "ccw";
            if(this.prepSpin && !this.canSpin) {
              Matter.Body.setVelocity(this.physics, {
                x: totalVelocity * xRatio,
                y: totalVelocity * yRatio
              });              
            }
          }
        } else {
          // Otherwise, it goes to the right
          if(yV < 0) {
            this.spinDirection = "ccw";
            if(this.prepSpin && !this.canSpin) {
              Matter.Body.setVelocity(this.physics, {
                x: -totalVelocity * xRatio,
                y: -totalVelocity * yRatio
              });
            }
          } else {
            this.spinDirection = "cw";
            if(this.prepSpin && !this.canSpin) {
              Matter.Body.setVelocity(this.physics, {
                x: -totalVelocity * xRatio,
                y: totalVelocity * yRatio
              });
            }
          }
        }

        if(this.prepSpin) {
          this.prepSpin = false;
          this.canSpin = true;
        }
      }

      if(obj.label.indexOf("powerup") > -1) {
        this.endSpin();
      }
      
      // TODO - WTF
      if(obj.label.indexOf("paddle") > -1) {
        
        if(obj.label.indexOf("one") > -1) {
          this.lastTouchedPaddle = 1;
        }

        if(obj.label.indexOf("two") > -1) {
          this.lastTouchedPaddle = 2;
        }

        game.ballHitPaddle(this.lastTouchedPaddle);

        if(game.paddles[this.lastTouchedPaddle - 1].hasSpinPowerup === true) {
          this.prepToSpin();
        } else {
          this.endSpin();
        }

        // Sticky powerup test
        if(game.paddles[this.lastTouchedPaddle - 1].hasMagnetPowerup === true) {
          var p = game.paddles[this.lastTouchedPaddle - 1];
          if(p.physics.angularSpeed < .04) {
            this.setTargetSpeed(0);
          } else {
            this.removeTargetSpeed();
          }
        }

        this.checkSpeed();
        this.applyBrakes = false;
        this.goalsWhileFast = 0;
      }

      if(game.mode == "finish" && obj.label.indexOf("wall") > -1) {
        game.loserLived();
      }

      // Percentage of the volume sound
      var percentage = this.physics.speed / 20;

      if(percentage > 1) {
        percentage = 1;
      } else if (percentage < .5) {
        percentage = .5;
      }

      var pan = .8 * (-game.boardWidth/2 + this.physics.position.x) / game.boardWidth/2;

      if (obj.label.indexOf("wall") > -1) {
        SoundManager.playSound("Ball_Bounce_Wall", null, { volume: percentage, pan : pan });
      }
      else {
        SoundManager.playSound("Ball_Bounce_Paddle", null, { volume: percentage, pan : pan });
      }
    },


    prepToSpin: function(){
      this.canSpin = false;
      this.prepSpin = true;
      this.element.classList.add("canSpin");
    },

    endSpin: function(){
      this.canSpin = false;
      this.prepSpin = false;
      this.element.classList.remove("canSpin");
    },

    // After a paddle hit, we want to check if the ball is going
    // fast enough, and if the hit imparted it with more speed.
    // If so, we'll draw out a word.
    checkSpeed: function(){
      if(this.physics.speed > this.lastStepSpeed) {
        this.lastPaddleHitHard = true;
      } else {
        this.lastPaddleHitHard = false;
      }

      if(this.lastPaddleHitHard){
        if(this.physics.speed > this.wordSpeed) {

          // We want to make sure that the paddle is rotating before
          // we allow firing the gun.
          var hitPaddleObj = game.paddles[this.lastTouchedPaddle - 1];
          let isSpinning = hitPaddleObj.checkIsPlayerSpinning();

          if(!isSpinning) {
            return;
          }

          if(!this.wordInProgress) {
            this.startWord();
          }

          var xDelta = this.physics.velocity.x;
          var yDelta = this.physics.velocity.y;
          var degAngle = Math.atan2(xDelta,yDelta) * 180/ Math.PI;

          fireGun(this.physics.position.x, this.physics.position.y, degAngle, this.lastTouchedPaddle);
          game.freezeFrames = 20;
          this.changeVelocityRatio(this.hardHitVelocityIncreaseRatio);
        }
      }
    },

    destroy: function () {
      this.spinSoundSequenceManager.stop();
    }
  });
}
