// The ball

var ball;

document.addEventListener('DOMContentLoaded', function () {

  ball = createObject({
    selector: ".ball",
    physicsOptions : {
      frictionAir: 0.00001,
      restitution: 1
    },
    launch : function(x,y){
      Matter.Body.applyForce(this.physics, this.physics.position, {x: x,y:y});
    },
    gotHit : false,
    hit : function(){
      this.gotHit = true;
      this.oldVelocity = JSON.stringify(this.physics.velocity);
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

      // for(var i = 0; i < 10; i++) {
      //
      //   var options = {
      //     x : ball.physics.position.x,
      //     y : ball.physics.position.y,
      //     angle : getRandom(0,359),
      //     speed : getRandom(1,2),
      //     zRv : getRandom(0,3),
      //     // oV : -.01,
      //     height: 5,
      //     width: 5,
      //     gravity : 0,
      //     lifespan : 100,
      //     className : "speed"
      //   }
      //   makeParticle(options);
      // }
    }

  });

  ball.launch(0, .02);

});
