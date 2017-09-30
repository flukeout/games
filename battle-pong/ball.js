function createBall(){

  return createObject({
    selector: ".ball",
    physicsOptions : {
      frictionAir: 0.00001,
      restitution: 1
    },
    launch : function(x,y){
      Matter.Body.applyForce(this.physics, this.physics.position, {x: x,y:y});
    },
    gotHit : false,
    gotPaddleHit : false,
    phrases : [
      "BOOOOOM",
      "THHHHHWAP",
      "POW",
      "OH-SHIT",
      "UWOT",
      "o=={===>"
    ],
    wordInProgress : false,
    wordString : false,
    wordDirection : "",
    letterIndex : 0,
    startedGoingFast : false,
    frameTick: 0,
    resolvePaddleHitFlag : false,

    // Checks the speed of the ball right after a paddle hit
    checkSpeed: function(){
      if(this.physics.speed > 10 && !this.wordInProgress) {
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

      if(this.frameTick > 2) {
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
          angle : -movementAngle,
          speed: .2,
          lifespan : 100,
          className : "speed",
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

    hit : function(){
      this.gotHit = true;
      this.oldVelocity = JSON.stringify(this.physics.velocity);
    },

    paddleHit : function(){
      this.gotPaddleHit = true;
    },


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
      }

      if(percentage < .5) {
        percentage = .5;
      }

      var pan = .8 * (-400 + this.physics.position.x) / 400;

      playSound("hit", { volume: percentage, pan : pan });
    }
  });

}
