document.addEventListener('DOMContentLoaded', makeStars);

function makeStars() {
  var stars = document.querySelector(".stars svg");

  for(var i = 0; i < 300; i++) {
    var svg = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    svg.setAttribute('fill', '#fff');
    svg.setAttribute('fill-opacity', getRandom(.2,.6));
    svg.setAttribute('cx', getRandom(0,1200));
    svg.setAttribute('cy', getRandom(0,400));
    svg.setAttribute('r', getRandom(1.5,2.5));
    stars.appendChild(svg);
  }
}

function mineExplosion(xposition, yposition, size){

  playRandomSoundFromBank("mine-explosion", {excludeFromLowPassFilter: true});
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

  document.querySelector(".world").appendChild(particle.el);

  temporaryLowPass();
}


function makeCracks(x, y){
  var cracks = document.createElement("div");
  cracks.classList.add("cracks");
  cracks.style.width = "300px";
  cracks.style.height = "300px";
  cracks.style.transform = "translate3d(" + (x - 150) + "px, " + (y - 150) + "px , 0) rotate("+getRandom(0,360)+"deg)";

  document.querySelector(".blast-zone").appendChild(cracks);

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

  if(type == "round") {
    particle.el.classList.add("round");
  }


  var shock = document.createElement("div");
  shock.classList.add("shock");

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

  document.querySelector(".world").appendChild(particle.el);




  // Blast lines that eminate from the center of the bomb
  for(var i = 0; i < getRandom(8,12); i++){
    var options = {
      x : xposition,
      y : yposition,
      zR : getRandom(0,360),
      width: 4,
      height: getRandom(60,120),
      className : 'blast-line',
      lifespan: 200,
      o: .4,
      oV: -.01
    }

    if(blastDirection == "left") {
      options.zR = getRandom(30, 150);
      options.x = options.x + 10;
    }

    if(blastDirection == "right") {
      options.zR = getRandom(210, 330);
      options.x = options.x - 10;
    }

    var percentage = 5; // Percent along blast line where the white should start.
    options.color = "linear-gradient(rgba(0,0,0,0) "+percentage+"%, rgba(255,255,255,.6) "+ percentage + 3 +"%, rgba(255,255,255,.6) 60%, rgba(0,0,0,0)";
    // makeParticle(options); TODO - temporarily removing blast lines from scoring
  }
}


// This is such garbage....
// TODO - make more of this dynamically generated
// * Loop over the percentages and generate the values?
// * Then we can add more steps?

function shakeScreen(){

  var styleTag = document.createElement("style");
  document.head.appendChild(styleTag);

  styleTag.innerHTML = `
    @keyframes shake-one {
      0% {
        transform: translateX(`+ getRandom(-20,-10)+ `px) translateY(`+ getRandom(-20,-10)+ `px);
      }
      25% {
        transform: translateX(`+ getRandom(10,15)+ `px) translateY(`+ getRandom(10,15)+ `px) rotate(`+getRandom(1,4)+`deg);
      }
      50% {
        transform: translateX(`+ getRandom(-10,-5)+ `px) translateY(`+ getRandom(-10,-5)+ `px);
      }
      75% {
        transform: translateX(`+ getRandom(5,10)+ `px) translateY(`+ getRandom(5,10)+ `px) rotate(`+getRandom(-1,-3)+`deg);
      }
    }`;

  document.querySelector(".shake-wrapper").style.animation = "shake-one .2s ease-out";

  setTimeout(function(styleTag,shakeEl) {
    return function(){
      styleTag.remove();
      document.querySelector(".shake-wrapper").style.animation = "";
    };
  }(styleTag),250);

}


function bumpScreen(direction){

  var styleTag = document.createElement("style");
  document.head.appendChild(styleTag);

  var distance = -5;
  if(direction == "down") {
    distance = 5;
  }

  styleTag.innerHTML = `
    @keyframes shake-one {
      30% {
        transform: translateY(`+ distance + `px);
        transition-timing-function: ease-out;
      }
    }`;

  document.querySelector(".shake-wrapper").style.transitionTimingFunction = "ease-out";
  document.querySelector(".shake-wrapper").style.animation = "shake-one .2s ease-out";

  setTimeout(function(styleTag,shakeEl) {
    return function(){
      styleTag.remove();
      document.querySelector(".shake-wrapper").style.animation = "";
    };
  }(styleTag),250);

}

// Used to add animations by applying a class, then removing it
// If this happens in rapid succession (less than 1000ms apart,
// we'll have to do the width trick.
// TODO - fix the timeout

function addTemporaryClassName(element, className, durationMS){


  element.classList.remove(className);
  element.style.width = element.clientWidth;
  element.classList.add(className);

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
function fireGun(x, y, angle, player){

  for(var i = 0; i < 8; i++){

    var options = {
      x : x - 3,
      y : y - 3,
      angle: angle + 180,
      zRv : getRandom(-5,5),
      speedA: -.06,
      oV : -.04,
      o: 3,
      width : 6,
      height: 6,
      className : 'puff'
    }

    var angleMod = getRandom(-20,20);
    options.angle = options.angle + angleMod;
    options.speed = 6 - 2 * (Math.abs(angleMod) / 20);

    makeParticle(options);
  }

  // This is the front blast!
  var options = {
    x : x - 50,
    y : y - 240,
    zR: -angle + 180,
    width : 100,
    height: 240,
    oV: -.05,
    className : 'fire'
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

  addTemporaryClassName(document.querySelector("body"), "team-" + player + "-scored-flash", 500);
  shakeScreen();

  playRandomSoundFromBank("super-hard-shot");

  music.setMoodTemporarily('intense');

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

  if(game.ball.physics.position.x < game.boardWidth / 2) {
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
  document.querySelector(".world").appendChild(messageEl);

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

document.addEventListener('DOMContentLoaded', e => {
  if (Settings.showBackground === false) {
    document.querySelector('.scene').style.display = 'none';
  }
});
