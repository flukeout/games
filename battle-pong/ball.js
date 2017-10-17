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
    wordSpeed : 12,
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

    // After a paddle hit, we want to check if the ball is going
    // fast enough, and if the hit imparted it with more speed.
    // If so, we'll draw out a word.
    checkSpeed: function(){

      if(this.speedWhenHit > this.physics.speed) {
        return;
      }

      if(this.physics.speed > this.wordSpeed && !this.wordInProgress) {
        this.startWord();
      }
    },

    displayAngle: 0,
    rotationVelocity: 0,
    rotationVelocityMax: 15,
    rotationAccel: .5,
    canSpin: false,

    // This slows the ball down after it is going too fast for too long
    goingFast: false,
    timeGoingFastMS: 0,
    timeAllowedGoingFastMS : 1000,
    goingFastSpeedThreshold: 5,
    slowdownRatio: .995,

    run: function(delta) {

      // console.log(delta);

      if(this.physics.speed > this.goingFastSpeedThreshold) {
        this.timeGoingFastMS = this.timeGoingFastMS + delta;
      } else {
        this.timeGoingFastMS = 0
      }

      if(this.timeGoingFastMS > this.timeAllowedGoingFastMS && this.physics.speed > this.goingFastSpeedThreshold) {
        Matter.Body.setVelocity(this.physics, {
          x : this.physics.velocity.x * this.slowdownRatio,
          y : this.physics.velocity.y * this.slowdownRatio
        });
      }





      if(this.resolvePaddleHitFlag) {
        this.resolvePaddleHit();
      }

      var xV = this.physics.velocity.x;
      var yV = -this.physics.velocity.y;

      var movementAngle = Math.atan2(xV, yV);

      document.querySelector(".arrow-1").style.transform = "rotate("+ movementAngle +"rad)";

      var rotating = false;
      var direction;


      if (paddles[0].physics.angularVelocity > .1) {
        // Clockwise
        var a = movementAngle + Math.PI / 2;
        rotating = true;
        this.rotationVelocity = this.rotationVelocity + this.rotationAccel;

        if(this.rotationVelocity > this.rotationVelocityMax){
          this.rotationVelocity = this.rotationVelocityMax;
        }
      } else if (paddles[0].physics.angularVelocity < -.1) {
        // Counter-clockwise
        var a = movementAngle - Math.PI / 2;
        rotating = true;
        this.rotationVelocity = this.rotationVelocity - this.rotationAccel;

        if(this.rotationVelocity < -this.rotationVelocityMax){
          this.rotationVelocity = -this.rotationVelocityMax;
        }
      } else {
        if(this.rotationVelocity > 0) {
          this.rotationVelocity = this.rotationVelocity - this.rotationAccel;
        }

        if(this.rotationVelocity < 0) {
          this.rotationVelocity = this.rotationVelocity + this.rotationAccel;
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

      var modifier = 1; // Reverses the rotation

      if(this.rotationVelocity < 0) {
        modifier = modifier * -1;
      }

      this.element.querySelector(".spinny").style.transform = "rotate("+ this.displayAngle +"deg) scaleX(" + (scale * modifier) + ") scaleY("+scale+")";
      this.element.querySelector(".spinny").style.opacity = opacity;

      document.querySelector(".arrow-2").style.transform = "rotate("+ a +"rad)";

      var newX = Math.sin(a) *  .00005 * this.physics.speed * rotationRatio;
      var newY = Math.cos(a) * -.00005 * this.physics.speed * rotationRatio;

      if(rotating && this.physics.speed > 2) {
        Matter.Body.applyForce(this.physics, this.physics.position, { x: newX, y: newY });
      }

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

    updateSpiningAnimation() {

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
          // angle : -movementAngle,
          // speed: .2,
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

    hit : function(obj){

      if(game.mode == "finish" && obj.name.indexOf("wall") > -1) {
        game.loserLived();
      }

      // if(obj && obj.hasOwnProperty("player")){
      //   this.lastHitBy = obj.player;
      // }

      this.velocityWhenHit = JSON.parse(JSON.stringify(this.physics.velocity));

      if(obj.name.indexOf("paddle") > -1) {
        this.paddleHit();
      }

      this.gotHit = true;
    },

    paddleHit : function(){
      this.speedWhenHit = JSON.parse(JSON.stringify(this.physics.speed));
      this.angleWhenHit = Math.atan2(this.physics.velocity.x,this.physics.velocity.y) * 180/Math.PI;
      this.gotPaddleHit = true;
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
