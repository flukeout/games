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

  var properties = {
    width : 30,
    height : 30,
    x : x - 15,
    y : y
  }

  var physicsOptions = {
    frictionAir: 0.015 / game.physicsSamplingRatio,
    restitution: 1,
    label: "powerup-" + type
  }

  if(type == "bomb") {
    properties.width = 50;
    properties.lifeSpan = 10000;
    properties.height = 50;
    physicsOptions.frictionAir = 0.035 / game.physicsSamplingRatio;
    properties.innerHTML = `
    <div class='shadow'></div>
    <div class='body'>
      <div class='wick'></div>
      <div class='bomb-body'>
        <div class='spark'>
          <div class='flame'></div>
        </div>
      </div>
    </div>`;
  }

  if(type == "mine") {
    properties.width = 50;
    properties.lifeSpan = 1000;
    properties.height = 50;
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
    ignoreRotation: true, // This means when we update the DOM x,y we don't also rotate this.

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
      }

      game.moveTerrain(scoringPlayer, 20);

      makeExplosion(this.physics.position.x, this.physics.position.y, 80);

        var mineOptions = {
          y : this.physics.position.y - 40,
          x : this.physics.position.x - 30,

          width: 60,
          height: 60,
          zV : 11,
          yV : 0,
          xV : 0,
          gravity : .2,
          yRv : getRandom(-2,2),
          xRv : getRandom(12,18),
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

        makeParticle(options);

        // var options = {
       //    x : this.physics.position.x - 20,
       //    y : this.physics.position.y - 20,
       //    width: 40,
       //    height: 40,
       //    zV : 16,
       //    yV : getRandom(-4,4),
       //    xV : getRandom(-4,4),
       //    gravity : .3,
       //    yRv : getRandom(-4,4),
       //    xRv : getRandom(-4,4),
       //    oV: -.02,
       //    lifespan: 200,
       //    o: 1,
       //    className: "mine-chunk-two"
       //  }
       //
       //  makeParticle(options);
       //
       //  var options = {
       //    x : this.physics.position.x - 5,
       //    y : this.physics.position.y - 5,
       //    width: 10,
       //    height: 10,
       //    zV : 18,
       //    yV : getRandom(-4,4),
       //    xV : getRandom(-4,4),
       //    gravity : .3,
       //    yRv : getRandom(-4,4),
       //    xRv : getRandom(-4,4),
       //    oV: -.02,
       //    lifespan: 200,
       //    o: 1,
       //    className: "mine-chunk-three"
       //  }
       //
       //  makeParticle(options);



        removalList.push(this);


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

      if(obj.name.indexOf("paddle") > -1 || obj.name.indexOf("ball") > -1 ){
        playSound("star-hit");
      }

      if(playerHit){

        for(var i = 0; i < 2; i++){
          var paddle = paddles[i];
          if(paddle.player == playerAffected) {
            paddles[0].powerup(this.type);
          }
        }

        removalList.push(this);
        playSound("coin");

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
