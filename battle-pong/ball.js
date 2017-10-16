function createBall(options){

  var options = options || {};

  return createObject({
    ignoreRotation: true, // This means when we update the DOM x,y we don't also rotate this.
    // selector: ".ball",
    innerHTML : "<div class='shadow'></div><div class='body'></div>",
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
    lastHitBy : "",
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

    run: function() {

      if(this.resolvePaddleHitFlag) {
        this.resolvePaddleHit();
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

      if(game.mode == "finish" && obj.name == "wall") {
        game.loserLived();
      }

      if(obj && obj.hasOwnProperty("player")){
        this.lastHitBy = obj.player;
      }

      this.gotHit = true;
      this.oldVelocity = JSON.stringify(this.physics.velocity);
    },

    paddleHit : function(){
      this.speedWhenHit = JSON.parse(JSON.stringify(this.physics.speed));
      this.angleWhenHit = Math.atan2(this.physics.velocity.x,this.physics.velocity.y) * 180/Math.PI;
      this.gotPaddleHit = true;
    },

    hitSoundTimeout: false,
    hitSoundTimeoutMS: 100,

    resolveHit : function(){

      this.gotHit = false;

      var start = JSON.parse(this.oldVelocity);
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
