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

  ball.launch(0, .02);

});
