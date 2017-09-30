// The ball

document.addEventListener('DOMContentLoaded', function () {

  ball = createObject({
    selector: ".ball",
    physicsOptions : {
      frictionAir: 0.00001,
      restitution: 1
    },
    showLetter: function() {

      var options = {
        x : this.physics.position.x - 15,
        y : this.physics.position.y - 15,
        o : 6,
        // zR : angle,
        oV : -.2,
        height: 30,
        width: 30,
        // scaleV : -.01,
        lifespan : 100,
        className : "speed",
        // text : boom.charAt(letterIndex)
        text : "A"
      }

      makeParticle(options);
      // frameTick = 0;
      // letterIndex++;
      // if(letterIndex >= boom.length) {
      //   letterIndex = 0;
      // }


    },
    launch : function(x,y){
      Matter.Body.applyForce(this.physics, this.physics.position, {x: x,y:y});
    }
  });

ball.launch(0, .02);

});
