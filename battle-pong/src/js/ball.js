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

    lifeSpan : options.lifeSpan || "infinite",
    lastStepSpeed : 0,
    bodyEL : false,

    physicsOptions : {
      frictionAir: 0.00001 / game.physicsSamplingRatio,
      restitution: 1,
      label: "ball"
    },

    launch : function(x,y){
      Matter.Body.applyForce(this.physics, this.physics.position, {x : x, y : y});
    },

    timeSinceHit : 0,
    gotPaddleHit : false,

    maxSpeed: 16 / game.physicsSamplingRatio,
    maxSpeedSlowdownRatio : .99,

    minSpeed: 4 / game.physicsSamplingRatio,
    minSpeedSlowdownRatio : .96,

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

    goalsBeforeSlowdown: 1,
    goalsWhileFast : 0,

    // TODO - what are these for?
    displayAngle: 0,
    rotationVelocity: 0,
    rotationVelocityMax: 20,  // TODO - update
    rotationAccel: 2,         // TODO - update
    canSpin: false,

    // This slows the ball down after it is going too fast for too long
    goingFast: false,
    timeSpentGoingFastMS: 0,
    timeAllowedGoingFastMS : 5000, // max time to have spinmode

    // For slowing things down
    // TODO / remove
    slowdownRatio: .985,
    slowSpeedTarget: 7 / game.physicsSamplingRatio,

    applyBrakes : false,
    brakesModeEnabled : window.Settings.brakesModeEnabled,

    delayBeforeCanSpinMS : 100,
    goingFastSpeedThreshold: 11 / game.physicsSamplingRatio,

    lastHitPaddle : false, // The paddle that holds influence over the ball (for spinning)
    // lastTouchedBy : false,
    lastTouchedPaddle: false,

    wooshPlayed: false,

    frameTicks : 0,

    changeVelocityRatio: function(ratio) {
      Matter.Body.setVelocity(this.physics, {
        x : this.physics.velocity.x * ratio,
        y : this.physics.velocity.y * ratio
      });
    },

    run : function(delta) {

      if(this.lifeSpan != "infinite") {
        this.lifeSpan--;

        if(this.lifeSpan < 75) {
          this.element.classList.add("blinkBall");
        }

        if(this.lifeSpan < 0) {
          popBall(this.physics);
          removalList.push(this);
        }
      }

      if(this.physics.speed < this.slowSpeedTarget && this.applyBrakes) {
        this.applyBrakes = false;
      }

      if(this.applyBrakes && this.brakesModeEnabled) {
        // who knows?
      }

      // If it's going too fast, slow it down
      if(this.physics.speed > this.maxSpeed) {
        this.changeVelocityRatio(this.maxSpeedSlowdownRatio);
      }

      // If it's going too slow, slow it down
      if(this.physics.speed < this.minSpeed) {
        // this.changeVelocityRatio(this.minSpeedSlowdownRatio);
        // TODO - this slows id down if you want it back
      }

      // TODO - fix how this is added / removed, we don't want to do it every frame
      if(this.canSpin){
        this.element.classList.add("canSpin");
      } else {
        this.element.classList.remove("canSpin");
      }

      // All this crap below just relates to curving the ball
      // and adding the spinning animation.

      var xV = this.physics.velocity.x;
      var yV = -this.physics.velocity.y;

      var movementAngle = Math.atan2(xV, yV);

      // TODO - do these better
      var stretchScale = 1;
      var maxStretch = 1.3;
      var squashScale = 1;
      var minSquash = .8;

      var minStretchSpeed = 6;

      var exceededBy = this.physics.speed - minStretchSpeed;
      var exceedRatio = 0;
      if(exceededBy > 0) {
        exceedRatio = exceededBy / 5;
        stretchScale = 1 + exceedRatio * .5;
        squashScale = 1 - exceedRatio * .5;
      }

      this.element.querySelector(".body").style.transform = "rotate("+ movementAngle +"rad) scaleX(" + squashScale + ") scaleY("+stretchScale+")";

      var rotating = false;
      var direction;

      this.canSpin = false;

      // this.lastHitPaddle = 1;

      var controlPaddle = false;

      for(var i = 0; i < paddles.length; i++) {
        var p = paddles[i];
        if(p.hasSpinPowerup == true) {
          this.canSpin = true;
          controlPaddle = p;
        }
      }

      if(this.canSpin) {

        if (controlPaddle.physics.angularVelocity * game.physicsSamplingRatio > .1) {
          var a = movementAngle + Math.PI / 2;
          rotating = true;
          this.rotationVelocity = this.rotationVelocity + this.rotationAccel;
          if(this.rotationVelocity > this.rotationVelocityMax){
            this.rotationVelocity = this.rotationVelocityMax;
          }
        } else if (controlPaddle.physics.angularVelocity * game.physicsSamplingRatio < -.1) {
          var a = movementAngle - Math.PI / 2;
          rotating = true;
          this.rotationVelocity = this.rotationVelocity - this.rotationAccel;
          if(this.rotationVelocity < -this.rotationVelocityMax){
            this.rotationVelocity = -this.rotationVelocityMax;
          }
        }
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
          playSound("woosh");
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

      this.element.querySelector(".spinny").style.transform = "rotate("+ this.displayAngle +"deg) scaleX(" + (scale * modifier) + ") scaleY("+scale+")";

      // this.element.querySelector(".body").style.transform = "rotate("+ this.displayAngle +"deg)";

      this.element.querySelector(".spinny").style.opacity = opacity;

      // For debugging, displays the angle of the ball movement and 'curve force'
      // document.querySelector(".arrow-1").style.transform = "rotate("+ movementAngle +"rad)";
      // document.querySelector(".arrow-2").style.transform = "rotate("+ a +"rad)";

      var newX = Math.sin(a) *  .000075 * game.physicsSamplingRatio* this.physics.speed * game.physicsSamplingRatio * rotationRatio; //.00005
      var newY = Math.cos(a) * -.000075 * game.physicsSamplingRatio * this.physics.speed * game.physicsSamplingRatio * rotationRatio; //.00005

      if(rotating && this.physics.speed * game.physicsSamplingRatio > 2) {
        Matter.Body.applyForce(this.physics, this.physics.position, {
          x : newX,
          y : newY
        });
      }

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
          console.log("ended word early");
          this.endWord();
        }


      }

      this.lastStepSpeed = JSON.parse(JSON.stringify(this.physics.speed));
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

    hit: function(obj){

      if(obj.name.indexOf("wall-right") > -1 || obj.name.indexOf("wall-left") > -1) {
        if(this.physics.speed > this.goingFastSpeedThreshold) {
          this.goalsWhileFast++;
        } else {
          this.goalsWhileFast = 0;
        }
        if(this.goalsWhileFast > 0) {
          this.applyBrakes = true;
        }
      }


      // TODO - WTF
      if(obj.name.indexOf("paddle") > -1) {
        if(obj.name.indexOf("one") > -1) {
          this.lastTouchedPaddle = 1;
        }

        if(obj.name.indexOf("two") > -1) {
          this.lastTouchedPaddle = 2;
        }

        // this.gotPaddleHit = true;
        this.checkSpeed();
        this.applyBrakes = false;
      }

      if(game.mode == "finish" && obj.name.indexOf("wall") > -1) {
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

      if(!this.hitSoundTimeout) {
        playSound("hit", { volume: percentage, pan : pan });
        var that = this;
        this.hitSoundTimeout = setTimeout(function(){
          that.hitSoundTimeout = false;
        }, this.hitSoundTimeoutMS);
      }

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
        if(this.physics.speed > this.wordSpeed && !this.wordInProgress) {
          this.startWord();

          var xDelta = this.physics.velocity.x;
          var yDelta = this.physics.velocity.y;
          var degAngle = Math.atan2(xDelta,yDelta) * 180/ Math.PI;

          fireGun(this.physics.position.x, this.physics.position.y, degAngle, this.lastTouchedPaddle);
          game.freezeFrames = 20;
          this.changeVelocityRatio(this.hardHitVelocityIncreaseRatio);
        }
      }
    },

    // This makes it so that the hit sound can't play in rapid crazy succession.
    hitSoundTimeout: false,
    hitSoundTimeoutMS: 100
  });

}