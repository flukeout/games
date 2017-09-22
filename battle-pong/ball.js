// The ball

document.addEventListener('DOMContentLoaded', function () {

  var ball = createObject({
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

      var percentage = totalDelta / 40; // Volume percentage

      if(percentage > 1) {
        percentage = 1;
      }

      if(percentage < .2) {
        percentage = .2;
      }

      playSound("hit", { volume: percentage });
    }

  });

  ball.launch(0, .02);

});
