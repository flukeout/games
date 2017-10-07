var powerUp;

function addPowerup(x,y){
  powerUp = createPowerup(x,y);
  powerUp.physics.mass = 2;
  powerUp.launch(getRandom(-.01,.01),getRandom(-.01,.01));
  playSound("bonus");
}

function createPowerup(x,y){

  return createObject({
    className : "powerup",
    innerHTML : "<div class='shadow'></div><div class='body'></div>",
    gotHit : false,
    gotHitFlag : false,
    hitBy : "",
    properties : {
      width: 30,
      height: 30,
      x: x - 15,
      y: y
    },

    launch : function(x,y){
      Matter.Body.applyForce(this.physics, this.physics.position, {x: x,y:y});
    },

    physicsOptions : {
      frictionAir: 0.015,
      restitution: 1
    },

    hit : function(obj){
      var hit = false;

      if(obj == endzoneTwo) {
        paddleOne.powerup();
        hit = true;
      }

      if(obj == endzoneOne) {
        paddleTwo.powerup();
        hit = true;
      }

      if(hit){
        removalList.push(this);
        playSound("coin");
        hasPowerup = false;
      }

      var angle = Math.atan2(this.physics.velocity.x, this.physics.velocity.y) * 180 / Math.PI;

      if(hit) {
        for(var i = 0; i < 5; i++) {
          var options = {
            x : this.physics.position.x - 15,
            y : this.physics.position.y - 15,
            o : 1,
            scaleV : -.05,
            angle : getRandom(0,360),
            speed:  this.physics.speed * .5,
            height: 30,
            width: 30,
            lifespan : 100,
            className : "star",
          }

          makeParticle(options);

        }
      }
    }
  });
}
