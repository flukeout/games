function createBall(options){

  var options = options || {};

  return createObject({
    ignoreRotation: true, // This means when we update the DOM x,y we don't also rotate this.
    // selector: ".ball",
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
    bodyEL : false,
    physicsOptions : {
      frictionAir: 0.00001,
      restitution: 1,
      label: "ball"
    },
    launch : function(x,y){
      Matter.Body.applyForce(this.physics, this.physics.position, {x: x,y:y});
    },
    gotHit : false,
    gotPaddleHit : false,
    wordSpeed : 11,
    phrases : [
      "BOOOOOM",
      "THHHHHWAP",
      "BA-DOOOM",
      "BLAM!!!",
      "FWOOOSH",
      "WHAAAAAAM",
      "KA-POW!",
      "BOOP!"
    ],
    wordInProgress : false,
    // lastHitBy : "",
    wordString : false,
    wordDirection : "",
    letterIndex : 0,
    startedGoingFast : false,
    frameTick: 0,
    resolvePaddleHitFlag : false,

    displayAngle: 0,
    rotationVelocity: 0,
    rotationVelocityMax: 20,
    rotationAccel: 2,
    canSpin: false,

    // This slows the ball down after it is going too fast for too long
    goingFast: false,
    timeSpentGoingFastMS: 0,
    timeAllowedGoingFastMS : 2000,
    delayBeforeCanSpinMS : 200,

    goingFastSpeedThreshold: 11,
    slowdownRatio: .995,

    lastHitPaddle : false,
    lastHitPaddleTimestamp: 0,

    wooshPlayed: false,

    // Checks all the conditions for the ball to be allowed to spin
    checkSpinConditions : function(delta){

      // These are all of the conditions required for the ball to be able to spin

      // Was the ball last hit by a paddle
      // We should give the ball a bit of time, if you hit the wall right away, i think it's OK
      var paddleHitCondition = false;

      this.lastHitPaddleTimestamp = Date.now();
      if(this.lastHitPaddle) {
        paddleHitCondition = true;
      }

      // We should give the ball a bit of time, if you hit the wall right away, i think it's OK
      var hitHardCondition = false;
      if(this.lastPaddleHitHard) {
        hitHardCondition = true;
      }

      // Is the ball moving fast enough?
      var speedCondition = false;
      if(this.physics.speed > this.goingFastSpeedThreshold) {
        this.timeSpentGoingFastMS = this.timeSpentGoingFastMS + delta;
        speedCondition = true;
      } else {
        this.timeSpentGoingFastMS = 0;
      }

      // Has the ball been traveling long enough?
      var delayCondition = false;
      if(this.timeSpentGoingFastMS > this.delayBeforeCanSpinMS) {
        delayCondition = true;
      }

      // Has the ball been spinning less than the max amount of time it can spin?
      var timeoutCondition = false;
      if(this.timeSpentGoingFastMS < this.timeAllowedGoingFastMS - this.delayBeforeCanSpinMS) {
        timeoutCondition = true;
      }

      // console.log("paddleHitCondition",paddleHitCondition);
      // console.log("hitHardCondition",hitHardCondition);
      // console.log("speedCondition",speedCondition);
      // console.log("delayCondition",delayCondition);
      // console.log("timeoutCondition",timeoutCondition);

      if(paddleHitCondition && speedCondition && delayCondition && timeoutCondition && hitHardCondition){
        return true;
      }

      return false;

    },

    run: function(delta) {

      this.canSpin = this.checkSpinConditions(delta);

      if(this.canSpin){
        this.element.querySelector(".body").classList.add("canSpin-" + this.lastHitPaddle);
      } else {
        this.element.querySelector(".body").classList.remove("canSpin-1");
        this.element.querySelector(".body").classList.remove("canSpin-2");
      }

      if(this.resolvePaddleHitFlag) {
        this.resolvePaddleHit();
      }

      // Slowdown
      // Matter.Body.setVelocity(this.physics, {
      //   x : this.physics.velocity.x * this.slowdownRatio,
      //   y : this.physics.velocity.y * this.slowdownRatio
      // });


      // All this crap below just relates to curving the ball
      // and adding the spinning animation.

      var xV = this.physics.velocity.x;
      var yV = -this.physics.velocity.y;

      var movementAngle = Math.atan2(xV, yV);

      var rotating = false;
      var direction;

      if(this.canSpin) {
        if (paddles[this.lastHitPaddle - 1].physics.angularVelocity > .1) {
          // Clockwise
          var a = movementAngle + Math.PI / 2;
          rotating = true;
          this.rotationVelocity = this.rotationVelocity + this.rotationAccel;
          if(this.rotationVelocity > this.rotationVelocityMax){
            this.rotationVelocity = this.rotationVelocityMax;
          }
        } else if (paddles[this.lastHitPaddle - 1].physics.angularVelocity < -.1) {
          // Counter-clockwise
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
        if(this.wooshPlayed == false && Math.abs(this.rotationVelocity) == this.rotationVelocityMax){
          playSound("woosh");
          this.wooshPlayed = true;
        }
      }

        this.displayAngle = this.displayAngle + this.rotationVelocity; // What we show the ball doing

        var rotationRatio = Math.abs(this.rotationVelocity) / this.rotationVelocityMax;

        var scaleMin = .5;
        var scaleMax = 1.2;
        var scale = scaleMin + (scaleMax - scaleMin) * rotationRatio;

        var oMin = -.2;
        var oMax = .35;
        var opacity = oMin + (oMax - oMin) * rotationRatio;
        //opacity = 1;

        var modifier = 1; // Reverses the rotation

        if(this.rotationVelocity < 0) {
          modifier = modifier * -1;
        }

        this.element.querySelector(".spinny").style.transform = "rotate("+ this.displayAngle +"deg) scaleX(" + (scale * modifier) + ") scaleY("+scale+")";
        this.element.querySelector(".body").style.transform = "rotate("+ this.displayAngle +"deg)";
        this.element.querySelector(".spinny").style.opacity = opacity;

        // For debugging, displays the angle of the ball movement and 'curve force'
        document.querySelector(".arrow-1").style.transform = "rotate("+ movementAngle +"rad)";
        document.querySelector(".arrow-2").style.transform = "rotate("+ a +"rad)";

        var newX = Math.sin(a) *  .00005 * this.physics.speed * rotationRatio;
        var newY = Math.cos(a) * -.00005 * this.physics.speed * rotationRatio;

        if(rotating && this.physics.speed > 2) {
          Matter.Body.applyForce(this.physics, this.physics.position, { x: newX, y: newY });
        }

      // --Spinning ball garbage ends here.


      // The paddle hit stuff needs a one frame delay before taking effect seemingly.
      // This is the way around that. Should be easier?
      if(this.gotPaddleHit) {
        this.resolvePaddleHitFlag = true;
        this.gotPaddleHit = false;
      }

      if(this.wordInProgress){
        this.drawLetter();
      }
    },

    resolvePaddleHit: function(){
      this.checkSpeed();
      this.resolvePaddleHitFlag = false;
    },

    startWord: function(){
      if(game.mode != "running") {
        return;
      }

      this.wordInProgress = true;
      this.letterIndex = 0;
      var wordIndex = Math.floor(getRandom(0,this.phrases.length));
      this.wordString = JSON.parse(JSON.stringify(this.phrases[wordIndex]));

      // In case we want to reverse the word letters...
      // if(this.physics.velocity.x < 0) {
      //   this.wordString = this.wordString.split("").reverse().join("");
      //   console.log(this.wordString);
      // }
    },

    drawLetter : function(){

      var movementAngle = 180 + -Math.atan2(ball.physics.velocity.x, ball.physics.velocity.y) * 180/Math.PI;

      if(movementAngle >= 360) {
        movementAngle = movementAngle - 360;
      }

      if(this.frameTick > 1) {
        var options = {
          x : this.physics.position.x - 15,
          y : this.physics.position.y - 15,
          o : 6,
          oV : -.1,
          height: 30,
          // zV : 2,
          width: 30,
          scaleV : -.002,
          zR: movementAngle - 90,
          lifespan : 100,
          className : "speedLetter",
          text : this.wordString.charAt(this.letterIndex)
        }

        makeParticle(options);
        this.letterIndex++;
        this.frameTick = 0;
        if(this.letterIndex >= this.wordString.length) {
          this.letterIndex = 0;
          this.wordInProgress = false;
        }
      }

      this.frameTick++;
    },

    hit: function(obj){

      if(game.mode == "finish" && obj.name.indexOf("wall") > -1) {
        game.loserLived();
      }

      this.velocityWhenHit = JSON.parse(JSON.stringify(this.physics.velocity));

      if(obj.name.indexOf("paddle") > -1) {
        this.lastHitPaddleTimestamp = Date.now();


        if(obj.name.indexOf("one") > -1) {
          this.lastHitPaddle = 1; // This relates to the spinning business
        }

        if(obj.name.indexOf("two") > -1) {
          this.lastHitPaddle = 2; // This relates to the spinning business
        }

        this.speedWhenHit = JSON.parse(JSON.stringify(this.physics.speed));
        this.gotPaddleHit = true;
        this.timeSpentGoingFastMS = 0; // Reset the counter
      } else {
        this.lastHitPaddle = false;
      }

      if(game.mode == "finish" && obj.name.indexOf("wall") > -1) {
        game.loserLived();
      }

      this.gotHit = true;
    },


    // After a paddle hit, we want to check if the ball is going
    // fast enough, and if the hit imparted it with more speed.
    // If so, we'll draw out a word.
    checkSpeed: function(){

      if(this.physics.speed > this.speedWhenHit) {
        this.lastPaddleHitHard = true;
      } else {
        this.lastPaddleHitHard = false;
      }

      if(this.lastPaddleHitHard){
        if(this.physics.speed > this.wordSpeed && !this.wordInProgress) {
          this.startWord();
        }
      }
    },

    // This makes it so that the hit sound can't play in rapid crazy succession.
    hitSoundTimeout: false,
    hitSoundTimeoutMS: 100,

    resolveHit : function(){

      this.gotHit = false;

      var start = this.velocityWhenHit;
      var end = this.physics.velocity;

      var deltaX = Math.abs(start.x - end.x);
      var deltaY = Math.abs(start.y - end.y);

      var totalDelta = deltaX + deltaY;

      var percentage = totalDelta / 20; // Volume percentage

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
    }
  });

}
