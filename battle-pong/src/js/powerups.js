var powerUp;

var powerUpTypes = window.Settings.powerUpTypes;
// var powerUpTypes = ["spin"];

const mineSpeedVolumeMultiplier = 0.5;

const powerUpScoreSoundNames = {
  clone: 'Powerup_Bones_Score',
  grow: 'Powerup_Enhance_Score'
};

// Adds a random powerup
function addPowerup(x, y){

  var type = powerUpTypes[Math.floor(Math.random() * powerUpTypes.length)];

  powerUp = createPowerup(x, y, type);
  powerUp.element.classList.add(type);

  // powerUp.launch(getRandom(-.01,.01),getRandom(-.01,.01));
  playSound("bonus");
}

function createPowerup(x, y, type){

  // var x = getRandom(50, game.boardWidth - 50);
  // var y = getRandom(0, game.boardHeight);

  var properties = {
    width : 30,
    height : 30,
    x : x - 15,
    y : y
  }

  var physicsOptions = {
    frictionAir: 0.0075 / game.physicsSamplingRatio,
    restitution: 1,
    label: "powerup-" + type
  }

  if(type == "mine") {
    properties.width = 56;
    properties.height = 56;
    properties.lifeSpan = getRandom(150, 350);
    properties.ignoreRotation = true;

    properties.x = x - properties.width/2;

    physicsOptions.frictionAir = 0.035 / game.physicsSamplingRatio;

    properties.innerHTML = `
    <div class='shadow'></div>
    <div class='body'>
      <div class='light'></div>
    </div>`;
  }

  return createObject({
    className : "powerup",
    innerHTML : properties.innerHTML || "<div class='shadow'></div><div class='body'></div>",
    gotHit : false,
    gotHitFlag : false,
    hitBy : "",
    type : type,
    lifeSpan : properties.lifeSpan || "infinite",
    ignoreRotation: properties.ignoreRotation || false, // This means when we update the DOM x,y we don't also rotate this.

    beepTimeoutMS : 325, // Delay between playing the swish sound
    beepTimeout: false,

    properties: properties,
    physicsOptions : physicsOptions,

    launch : function(x,y){
      Matter.Body.applyForce(this.physics, this.physics.position, {x: x, y: y});
    },

    // Runs every frame
    // angle : 0,
    run : function(){
      if(this.lifeSpan != "infinite") {
        this.lifeSpan--;

        if(this.lifeSpan < 125) {

          if(!this.beepTimeout) {
            playSound("beep");
            var that = this;
            this.beepTimeout = setTimeout(function(){
              that.beepTimeout = false;
            }, this.beepTimeoutMS);
          }

          this.element.querySelector(".light").classList.add("fastBlink");
        }

        if(this.lifeSpan < 0) {
          this.explode();
        }
      }


    },

    // Explode this, if it is a mine!
    explode : function(){

      var boardMiddle = game.boardWidth * game.terrainLinePercent / 100;
      var thisX = this.physics.position.x;
      var scoringPlayer;

      if(thisX > boardMiddle) {
        scoringPlayer = 1;
      } else if(thisX < boardMiddle) {
        scoringPlayer = 2;
      } else {
        scoringPlayer = Math.round(Math.random()) + 1;
      }

      game.moveTerrain(scoringPlayer, 20);

      objectsToRender.forEach((obj) => {
        if (obj === this) return;

        var distanceX = obj.physics.position.x - this.physics.position.x;
        var distanceY = obj.physics.position.y - this.physics.position.y;

        var radius = window.Settings.mineForceRadius || 175;

        if (distanceX * distanceX + distanceY * distanceY > radius*radius) return;

        distanceX *= (window.Settings.mineForceMultiplier || 0.0005) * obj.physics.mass;
        distanceY *= (window.Settings.mineForceMultiplier || 0.0005) * obj.physics.mass;

        Matter.Body.applyForce(obj.physics, obj.physics.position, {x: distanceX, y: distanceY});
      });

      mineExplosion(this.physics.position.x, this.physics.position.y, 100);

        var mineOptions = {
          y : this.physics.position.y - 40,
          x : this.physics.position.x - 30,

          width: 60,
          height: 60,
          zV : 3,
          yV : -3,
          xV : 0,
          gravity : .2,
          yRv : getRandom(-1,1),
          xRv : getRandom(10,16),
          oV: -.05,
          lifespan: 230,
          o: 2,
          className: "mine-chunk"
        }

        makeParticle(mineOptions);

        var options = {
          x : this.physics.position.x - 30,
          y : this.physics.position.y - 30,
          width: 60,
          height: 60,
          yV : mineOptions.xV,
          xV : mineOptions.yV,
          oV: -.02,
          scaleV: -.005,
          lifespan: 230,
          className: "mine-shadow"
        }

        // makeParticle(options);

        var options = {
          x : this.physics.position.x - 8,
          y : this.physics.position.y - 8,
          width: 16,
          height: 16,
          zV : 5,
          gravity : .2,
          // yRv : getRandom(-4,4),
          yV : -3,
          xV : getRandom(-2,2),
          xRv : getRandom(10,14),
          lifespan: 40,
          o: 1,
          className: "mine-chunk-light"
        }

        makeParticle(options);
        makeCracks(this.physics.position.x, this.physics.position.y);

        removalList.push(this);
        game.activePowerupCount--;


    },

    hit : function(obj){
      var playerHit = false;
      var playerAffected = false;

      if(obj.label == "wall-right") {
        playerAffected = 0;
        playerHit = true;
      }

      if(obj.label == "wall-left") {
        playerAffected = 1;
        playerHit = true;
      }

      var sound = false;

      if(obj.label.indexOf("paddle") > -1 || obj.label.indexOf("ball") > -1 ){
        if(this.type == "mine") {
          let ds = Math.abs(this.physics.speed - obj.speed);
          let volume = Math.min(1, Math.log(1 + ds * mineSpeedVolumeMultiplier));
          
          // TODO: take angular velocity into account because paddles can hit with higher speed by spinning
          playLimitedRandomSoundFromBank("mine-collision", {volume: volume});
        } else {
          playLimitedSound("star-hit");
        }
      }

      if(playerHit && this.type != "mine"){

        if(this.type == "clone" || this.type == "grow" || this.type == "spin") {
          for(var i = 0; i < 2; i++){
            var paddle = paddles[i];
            if(paddle.player == playerAffected) {
              paddles[i].powerup(this.type);
            }
          }
        }

        if(this.type == "multiball") {
          game.cloneBall();
        }

        game.activePowerupCount--;
        removalList.push(this);
        
        playSound(powerUpScoreSoundNames[this.type] || "coin");
      }
    }
  });
}
