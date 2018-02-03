(function () {
  const powerUpTypes = Settings.powerUpTypes;
  const mineSpeedVolumeMultiplier = 0.5;
  
  const powerUpScoreSoundNames = {
    clone: 'Powerup_Bones_Score',
    grow: 'Powerup_Enhance_Score',
    spin: 'Powerup_Spin_Score'
  };
  
  const powerupSpawnNames = {
    default: 'Powerup_Spawn',
    mine: 'Bomb_Spawn'
  };

  const powerupFrequency = Settings.powerupFrequency || 300; // A powerup appears once in every X frames
  const maxPowerupCount = Settings.maxPowerupCount || 2;

  function PowerupManager(game) {
    let activePowerups = [];
    
    this.automaticSpawning = true;

    Object.defineProperty(this, 'activePowerups', {
      get: () => {return activePowerups;}
    });

    this.update = () => {
      if (this.automaticSpawning) {
        let chance = getRandom(0, powerupFrequency);

        if(chance < 1 && activePowerups.length < maxPowerupCount) {
          var x = game.boardWidth * game.terrainLinePercent/100;

          if(x < 50) {
            x = 50;
          } else if ( x > game.boardWidth - 50) {
            x = game.boardWidth - 50;
          }

          var y = getRandom(50, game.boardHeight - 50);

          this.addPowerup(x, y);
          activePowerups.push(this);
        }
      }
    }

    // Adds a random powerup
    this.addPowerup = (x, y) => {
      if(powerUpTypes.length === 0) {
        return;
      }
      let type = powerUpTypes[Math.floor(Math.random() * powerUpTypes.length)];

      let powerUp = this.createPowerup(x, y, type);
      powerUp.element.classList.add(type);

      // powerUp.launch(getRandom(-.01,.01),getRandom(-.01,.01));
      playSound(powerupSpawnNames[type] || powerupSpawnNames.default);
    };

    this.createPowerup = (x, y, type) => {
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

          // TODO: clean up this variable declaration
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

          game.removeObject(this);
          activePowerups.splice(activePowerups.indexOf(this), 1);
        },

        hit : function(obj) {
          var playerHit = false;
          var playerAffected = false;

          if(obj.label == "wall-right") {
            playerAffected = 0;
            playerHit = true;
          }

          else if(obj.label == "wall-left") {
            playerAffected = 1;
            playerHit = true;
          }

          else if(obj.label.indexOf('wall-') > -1) {
            playLimitedSound('Powerup_Bounce_Wall');
          }

          else if(obj.label.indexOf("paddle") > -1 || obj.label.indexOf("ball") > -1 ){
            if(this.type == "mine") {
              let ds = Math.abs(this.physics.speed - obj.speed);
              let volume = Math.min(1, Math.log(1 + ds * mineSpeedVolumeMultiplier));
              
              // TODO: take angular velocity into account because paddles can hit with higher speed by spinning
              playLimitedRandomSoundFromBank("mine-collision", {volume: volume});
            } else {
              if      (obj.label.indexOf("paddle") > -1) playLimitedSound('Powerup_Bounce_Paddle');
              else if (obj.label.indexOf("ball") > -1) playLimitedSound('Powerup_Bounce_Paddle');
            }
          }

          if(playerHit && this.type != "mine"){

            if(this.type == "clone" || this.type == "grow" || this.type == "spin") {
              for(var i = 0; i < 2; i++){
                var paddle = game.paddles[i];
                if(paddle.player == playerAffected) {
                  game.paddles[i].powerup(this.type);
                }
              }
            }

            if(this.type == "multiball") {
              game.cloneBall();
            }

            game.removeObject(this);
            activePowerups.splice(activePowerups.indexOf(this), 1);

            playSound(powerUpScoreSoundNames[this.type] || "coin");
          }
        }
      });
    };
  }

  window.PowerupManager = PowerupManager;
})();