var powerUp;

function addPowerup(){
  powerUp = createPowerup();
  powerUp.physics.mass = 2;
  powerUp.launch(getRandom(-.01,.01),getRandom(-.01,.01));
  playSound("bonus");
}

function createPowerup(){

  return createObject({
    // ignoreRotation: true,
    className : "powerup",
    innerHTML : "<div class='shadow'></div><div class='body'></div>",
    properties : {
      width: 30,
      height: 30,
      x: getRandom(50,700),
      y: getRandom(30, 450)
    },
    launch : function(x,y){
      Matter.Body.applyForce(this.physics, this.physics.position, {x: x,y:y});
    },
    physicsOptions : {
      // isSensor: true,
      // isStatic: true

      frictionAir: 0.001,
      restitution: 1

    },

    hit: function(obj){
      var hit = false;

      if(obj == endzoneTwo) {
        paddleTwo.powerup();
        hit = true;
      }

      if(obj == endzoneOne) {
        paddleOne.powerup();
        hit = true;
      }

      if(hit) {
        var options = {
          x : this.physics.position.x - 15,
          y : this.physics.position.y - 15,
          o : 1,
          oV : -.02,
          zR : this.physics.angle * 180/Math.PI,
          zV : 6,
          gravity : .1,
          z : 20,
          height: 30,
          width: 30,
          lifespan : 100,
          className : "star",
        }

        makeParticle(options);

        removalList.push(this);
        playSound("coin");

      }

    }
  });
}
