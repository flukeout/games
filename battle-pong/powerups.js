var powerUp;

var powerUpTypes = window.Settings.powerUpTypes;
// var powerUpTypes = ["spin"];

// Adds a random powerup
function addPowerup(x, y){
  var type = powerUpTypes[Math.floor(Math.random() * powerUpTypes.length)];
  powerUp = createPowerup(x, y, type);
  powerUp.element.classList.add(type);
  powerUp.launch(getRandom(-.01,.01),getRandom(-.01,.01));
  playSound("bonus");
}

function createPowerup(x, y, type){

  return createObject({
    className : "powerup",
    innerHTML : "<div class='shadow'></div><div class='body'></div>",
    gotHit : false,
    gotHitFlag : false,
    hitBy : "",
    type : type,

    properties : {
      width : 30,
      height : 30,
      x : x - 15,
      y : y
    },

    launch : function(x,y){
      Matter.Body.applyForce(this.physics, this.physics.position, {x: x, y: y});
    },

    physicsOptions : {
      frictionAir: 0.015 / game.physicsSamplingRatio,
      restitution: 1
    },

    hit : function(obj){

      var playerHit = false;

      if(obj.name == "wall-right") {
        playerAffected = 0;
        playerHit = true;
      }

      if(obj.name == "wall-left") {
        playerAffected = 1;
        playerHit = true;
      }

      if(playerHit){

        for(var i = 0; i < paddles.length; i++){
          var paddle = paddles[i];
          if(paddle.player == playerAffected) {
            paddle.powerup(this.type);
          }
        }

        removalList.push(this);
        playSound("coin");
        hasPowerup = false;

        var angle = Math.atan2(this.physics.velocity.x, this.physics.velocity.y) * 180 / Math.PI;

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
