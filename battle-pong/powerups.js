var powerUp;

function addPowerup(){
  powerUp = createPowerup();
  playSound("bonus");
}

function createPowerup(){

  return createObject({

    className : "powerup",
    innerHTML : "<div class='shadow'></div><div class='body'>P</div>",
    properties : {
      width: 50,
      height: 50,
      x: getRandom(50,700),
      y: getRandom(30, 450)
    },

    physicsOptions : {
      isSensor: true,
      isStatic: true
    },

    hit: function(obj){
      if(obj == ball) {
        if(obj.lastHitBy == 0) {
          paddleOne.powerup();
        }
        if(obj.lastHitBy == 1) {
          paddleTwo.powerup();
        }
        removalList.push(this);
        playSound("coin");
      }

    }
  });
}
