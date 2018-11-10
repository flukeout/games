let effectsElements = {};

function initEffects() {
  effectsElements.body = document.querySelector("body");
  effectsElements.world = document.querySelector(".world");
  effectsElements.blastZone = document.querySelector(".blast-zone");
  effectsElements.shakeWrapper = document.querySelector(".shake-wrapper");
  effectsElements.scene = document.querySelector(".scene");

  startStars('.screen.game', 30, window.innerWidth, 400, true);
  BallTrailManager.startBallTrail();
}

// Flashes board border when a powerup scores
// and adds some little particles
function powerupScored(x, y, type) {

  for(var i = 0; i < 4; i++) {
    var options = {
      x : x,
      y : y - 15,
      width : 20,
      height: 20,
      speed: getRandom(3,5),
      speedA: -.075,
      scaleV: -.02,
      classList : ['powerup-scored-particle', type],
      lifespan: 125
    }

    if(x > 450) {
      options.angle = getRandom(20,160)
      options.x = options.x + 10;
    } else {
      options.angle = getRandom(200,340);
      options.x = options.x - 20;
    }
    makeParticle(options);
  }

  var options = {
    x : 0,
    y : y,
    width : 20,
    height: 200,
    classList : ['powerup-scored-beam', type],
    lifespan: 40
  }

  if(x > 450) {
    options.x = 850;
  } else {
    options.x = -20;
  }

  makeParticle(options);

  var el = document.createElement("div");
  el.classList.add("powerup-scored");

  if(x < 445) {
    el.classList.add("left");
  } else {
    el.classList.add("right");
  }

  el.classList.add(type || "grow");
  
  effectsElements.world.appendChild(el);

  setTimeout(function(el) {
    return function(){
      el.remove();
    };
  }(el), 500);
}

function mineExplosion(xposition, yposition, size){

  shakeScreen();

  // Adds the orange blast

  var blastOffset = size / 2;
  var x = xposition - blastOffset;
  var y = yposition - blastOffset;

  var particle = {};

  particle.el = document.createElement("div");
  particle.el.classList.add("boom");
  particle.el.classList.add("round");


  var shock = document.createElement("div");
  shock.classList.add("shock");
  particle.el.classList.add("round");

  var body = document.createElement("div");
  body.classList.add("body");

  particle.el.appendChild(shock);
  particle.el.appendChild(body);

  particle.el.style.height = size + "px";
  particle.el.style.width = size + "px";
  particle.el.style.transform = "translate3d("+x+"px,"+y+"px,0)";

  setTimeout(function(el) {
    return function(){
      el.remove();
    };
  }(particle.el),500);

  effectsElements.world.appendChild(particle.el);

  SoundManager.fireEvent('Mine_Explosion');
}


function makeCracks(x, y){
  var cracks = document.createElement("div");
  var size = getRandom(200,300);

  cracks.classList.add("cracks");
  cracks.style.width = size + "px";
  cracks.style.height = size + "px";
  cracks.style.transform = "translate3d(" + (x - size/2) + "px, " + (y - size/2) + "px , 0) rotate("+getRandom(0,360)+"deg)";

  effectsElements.blastZone.appendChild(cracks);

  setTimeout(function(el) {
    return function(){
      el.remove();
    };
  }(cracks),1500);
}

// Adds a bomb to the board at x,y
// Pixel position, not grid position

function makeExplosion(xposition, yposition, size, blastDirection, type){

  makeCracks(xposition,yposition);

  if(!blastDirection) {
    blastDirection = "all";
  }

  // playSound("boom");
  shakeScreen();

  // Adds the orange blast
  var blastOffset = size / 2;
  var x = xposition - blastOffset;
  var y = yposition - blastOffset;

  var particle = {};

  particle.el = document.createElement("div");
  particle.el.classList.add("boom");
  particle.el.innerHTML = `<div class="shock"></div><div class="body"></div>`

  particle.el.style.height = size + "px";
  particle.el.style.width = size + "px";
  particle.el.style.transform = "translate3d("+x+"px,"+y+"px,0)";

  setTimeout(function(el) {
    return function(){
      el.remove();
    };
  }(particle.el),500);
  effectsElements.world.appendChild(particle.el);
}


// This is such garbage....
// TODO - make more of this dynamically generated
// * Loop over the percentages and generate the values?
// * Then we can add more steps
function shakeScreen(){
  let tD = 40;  // Max translate delta
  let rD = 2;   // Max rotate delta 
  let keyframes = [];

  let options = {
    duration: 300,
    easing: "ease-out"
  }

  let direction = Math.random() >= .5 ? 1 : -1;

  // translateY(${ xD * getRandom(.5 * tran, tran) }px)
  // rotate(${ xD * getRandom(0,rot) }deg)

  for(var i = 0; i < 4; i++){
    let frame = {
      transform: `
        translateX(${ direction * getRandom(.5 * tD, tD) }px)
        rotate(${ direction * getRandom(.5 * rD, rD) }deg)`
    }
    direction = direction * -1;
    tD = tD * .75;
    tD = rD * .75;
    keyframes.push(frame);
  }

  // Final untransformed keyframe.
  keyframes.push({ transform: "rotate(0) translateX(0) translateY(0)" });

  effectsElements.shakeWrapper.animate(keyframes, options);
}


// Used to add animations by applying a class, then removing it
// If this happens in rapid succession (less than 1000ms apart,
// we'll have to do the width trick.
// TODO - fix the timeout

function addTemporaryClassName(element, className, durationMS) {
  element.classList.remove(className);

  // Putting in this method instead of the width trick which was
  // causing some problems i think.
  setTimeout(function(){
    element.classList.add(className);
  }, 1);
  
  setTimeout(function(){
    element.classList.remove(className);
  }, durationMS || 1000);
}

function addBallTrail(x,y){
  var options = {
    x : x - 15,
    y : y - 15,
    width : 30,
    oV: -.02,
    scaleV: -.01,
    height: 30,
    className : 'spinSquare',
    lifespan: 125
  }
  makeParticle(options);
}

// When you blast a ball really hard
function fireGun(x, y, angle, player) {

  // This is the front blast!
  var options = {
    x : x - 50,
    y : y - 240,
    zR: -angle + 180,
    width : 100,
    height: 240,
    oV: -.05,
    className : 'fire',
  }
  
  makeParticle(options);

  // This is the back blast!
  var options = {
    x : x - 30,
    y : y - 100,
    zR: -angle,
    width : 60,
    height: 100,
    oV: -.05,
    className : 'back-fire'
  }

  makeParticle(options);

  let aplayer = 1;
  addTemporaryClassName(effectsElements.body, "team-" + aplayer + "-scored-flash", 500);
  
  shakeScreen();

  SoundManager.fireEvent('Super_Hard_Shot');

  document.dispatchEvent(new CustomEvent("emotion", {detail: {
    player: player,
    type: "strong"
  }}));
}

function drawLetter(x, y, angle, letter) {

  var options = {
    x : x - 15,
    y : y - 15,
    o : 6,
    oV : -.1,
    height: 30,
    width: 30,
    scaleV : -.002,
    zR: angle - 90,
    lifespan : 100,
    className : "speedLetter",
    text : letter
  }

  makeParticle(options);
}

function popPaddle(physics){

  for(var i = 0; i < 5; i++) {
    var options = {
      x : getRandom(physics.bounds.min.x, physics.bounds.max.x) - 5,
      y : getRandom(physics.bounds.min.y, physics.bounds.max.y) - 5,
      zR : 0,
      zRv : 0,
      height: 10,
      width: 10,
      o: 1,
      oV: -.03,
      lifespan: 500,
      speed: getRandom(4,6),
      speedA : -.1,
      angle: 1 +i * 360/5,
      className : "paddleChunk"
    }
    makeParticle(options);
  }
}

function popBall(physics){

  for(var i = 0; i < 5; i++) {
    var options = {
      x : physics.position.x,
      y : physics.position.y,
      zR : 0,
      zRv : 0,
      height: 10,
      width: 10,
      o: 1,
      oV: -.02,
      lifespan: 500,
      speed: 4,
      speedA : -.1,
      angle: 1 +i * 360/5,
      className : "ballCloneChunk"
    }
    makeParticle(options);
  }
}


// Ball breaks through the wall on a hard shot...
function addFakeBall(ballPhysics) {

  var direction = "right";
  var baseX = game.boardWidth;
  var patchColor = "pink";

  if(ballPhysics.position.x < game.boardWidth / 2) {
    direction = "left";
    baseX = -20;
    patchColor = "green";
  }

  var lifeSpan = 120;

  var movementAngle = -(Math.atan2(ballPhysics.velocity.x, ballPhysics.velocity.y) * 180/Math.PI + 180);
  if(movementAngle < 0) {
    movementAngle = movementAngle + 360;
  }

  // Add teh ball
  var options = {
    x : ballPhysics.position.x - 15,
    y : ballPhysics.position.y - 15,
    height: 30,
    width: 30,
    lifespan: 20000,
    angle: movementAngle,
    speed: ballPhysics.speed * 2,
    className : "fake-ball"
  }

  makeParticle(options);

  // Add board chunks
  for(var i = 0; i < 5; i++) {
    var options = {
      x : baseX,
      y : ballPhysics.position.y - 15 + getRandom(-20,20),
      height: 20,
      width: 20,
      lifespan: 20000,
      angle: movementAngle + getRandom(-25,25),
      speed: ballPhysics.speed + getRandom(-2,2),
      className : "boardChunk"
    }

    makeParticle(options);
  }


  // Add a patch
  var options = {
    x : baseX,
    y : ballPhysics.position.y - 30,
    width: 20,
    height: 60,
    lifespan: lifeSpan,
    className : patchColor + "Patch"
  }

  makeParticle(options);

  // Top Shrapnel
  var options = {
    x : baseX,
    y : ballPhysics.position.y - 50,
    width: 120,
    height: 40,
    lifespan: lifeSpan,
    className : patchColor + "Shrapnel",
    zR: -(movementAngle - 90) + 180 - 10
  }

  if(direction == "left") {
    options.x = -120;
    options.zR = options.zR - 180 + 20;
  }

  makeParticle(options);

  // Bottom Shrapnel
  var options = {
    x : baseX,
    y : ballPhysics.position.y + 10,
    width: 120,
    height: 40,
    lifespan: lifeSpan,
    className : patchColor + "Shrapnel",
    zR: -(movementAngle - 90) + 180 + 10
  }

  if(direction == "left") {
    options.x = -120;
    options.zR = options.zR - 180 - 20;
  }

  makeParticle(options);

}


function explodePaddle(physics){

  for(var i = 0; i < 15; i++) {
    var options = {
      x : getRandom(physics.bounds.min.x, physics.bounds.max.x),
      y : getRandom(physics.bounds.min.y, physics.bounds.max.y),
      zR : getRandom(-5,5),
      zRv : getRandom(-5,5),
      scaleV : -.005,
      height: 20,
      width: 20,
      lifespan: 100,
      xV : getRandom(-5,5),
      yV : getRandom(-5,5),
      className : "paddleChunk"
    }
    makeParticle(options);
  }

  makeExplosion(physics.position.x, physics.position.y, 75);
  shakeScreen();
}


// Adds a message to the game board
function showMessage(options){

  var messageEl = document.createElement("div");
  messageEl.classList.add("message");

  var messageBody = document.createElement("div");
  messageBody.classList.add("body");

  messageBody.innerText = options.text;
  messageBody.style.fontSize = options.fontSize + "px";
  messageEl.appendChild(messageBody);

  messageEl.style.transform = "translateX("+ options.x +"px) translateY(" + options.y +"px)";
  effectsElements.world.appendChild(messageEl);

  setTimeout(function(el) {
    return function() {
      el.remove();
    };
  }(messageEl), options.timeout);
}

// When terrain moves, add some chunks
function makeTerrainChunks(terrainLine, modifier, className, boardWidth, boardHeight){

  var maxSize = 65;

  for(var i = 0; i < 10; i++) {
    var options = {
      zR : getRandom(-5,5),
      scaleV : -.02,
      height: getRandom(25, maxSize),
      lifespan: 100,
      xV : getRandom(modifier * 15, modifier * 20),
      minX : 0
    }

    options.maxX = boardWidth - options.height;
    options.x = terrainLine/100 * boardWidth - (modifier * options.height),
    options.xV = options.xV - ((options.height / maxSize) * options.xV * .5);
    options.xVa = -options.xV / 40;
    options.y  = getRandom(0, boardHeight - options.height);
    options.className = className;
    options.width = options.height;
    options.x = options.x - options.width / 2;

    makeParticle(options);
  }
}

function buttonGleam(element) {
  let gleam = document.createElement("div");
  gleam.classList.add("gleam");
  element.appendChild(gleam);

  let width = element.getBoundingClientRect().width;
  let duration = mapScale(width, 50, 180, 300, 350);

  let options = {
    duration: duration,
    easing: "ease-in-out"
  }

  let keyframes = [
    {
      transform: "scaleX(0)",
      transformOrigin: "left",
      opacity: .4,
      offet: 0
    },
    {
      transform: "scaleX(1)",
      transformOrigin: "left",
      opacity: .5,
      offset: .3
    },
    {
      transformOrigin: "right",
      transform: "scaleX(1)",
      opacity: .5,
      offset: .7
    },
    {
      opacity: .4,
      transform: "scaleX(0)",
      transformOrigin: "right",
      offset: 1
    }
  ]
  
  let gleamAnimation = gleam.animate(keyframes, options);
  gleamAnimation.onfinish = function(e){
    gleam.remove();
  }
}

function addChangeAnim(element){
  let options = {
    duration: 300,
    easing: "ease-in-out"
  }

  let keyframes = [
    {
      transform: "scale(.6)",
      offet: 0
    },
    {
      transform: "scale(1.1)",
      offset: .3
    },
    {
      transform: "scale(1)",
      offset: 1
    }
  ]
  
  let thisAnim = element.animate(keyframes, options);
}
