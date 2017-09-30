// Adds a bomb to the board at x,y
// Pixel position, not grid position

function makeExplosion(xposition, yposition, size){

  playSound("boom");
  shakeScreen();

  // Adds the orange blast

  var blastOffset = (size - 20) / 2;
  var x = xposition - blastOffset;
  var y = yposition - blastOffset;

  var particle = {};

  particle.el = document.createElement("div");
  particle.el.classList.add("boom");

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

  // Make smoke puffs around the explosion
  for(var i = 0; i < 8; i++){

    var options = {
      x : xposition,
      y : yposition,
      angle: getRandom(0,359),
      zR : getRandom(-15,15),
      oV : -.008,
      width : getRandom(20,55),
      className : 'puff',
      lifespan: 125
    }

    options.x = options.x - (options.width/2) + 10;
    options.y = options.y - (options.width/2) + 10;
    options.height = options.width;
    options.speed = 1 + (2 * (1 - options.width / 50)); // The bigger the particle, the lower the speed
    // makeParticle(options);
  }

  // Blast lines that eminate from the center of the bomb
  for(var i = 0; i < getRandom(8,12); i++){
    var options = {
      x : xposition + 8,
      y : yposition + 8,
      zR : getRandom(0,360),
      width: 4,
      height: getRandom(60,100),
      className : 'blast-line',
      lifespan: 200,
      o: .4,
      oV: -.01
    }

    var percentage = 100 * 15 / options.height; // Percent along blast line where the white should start.
    options.color = "linear-gradient(rgba(0,0,0,0) "+percentage+"%, rgba(255,255,255,.6) "+ percentage + 3 +"%, rgba(255,255,255,.6) 60%, rgba(0,0,0,0)";
    makeParticle(options);
  }
}



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

  document.querySelector(".world").style.animation = "shake-one .2s ease-out";

  setTimeout(function(styleTag,shakeEl) {
    return function(){
      styleTag.remove();
      document.querySelector.style.animation = "";
    };
  }(styleTag),250);

}