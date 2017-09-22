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
    }
  });

  ball.launch(0, .02);

});
