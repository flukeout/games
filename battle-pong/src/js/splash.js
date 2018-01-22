document.addEventListener('DOMContentLoaded', function(){
  initParticleEngine(".stars", 200);
  starsHeight = document.querySelector(".stars").getBoundingClientRect().height;
  loop();

  prepTitle();
});

function prepTitle(){
  var titleEl =document.querySelector(".game-title")
  var titleString = titleEl.innerText;
  titleEl.innerText = "";
  
  console.log(titleString);
  var animationDelay = .1;

  for(var i = 0; i < titleString.length; i++) {
    var letterText = titleString.charAt(i);
    if(letterText == " ") {
      letterText = "&nbsp;&nbsp;";
    }
    var letterEl = document.createElement("span");
    letterEl.classList.add("letter");
    letterEl.innerHTML = letterText;
    letterEl.style.animationDelay = animationDelay + "s";
    animationDelay = animationDelay + .1;
    titleEl.append(letterEl);
  }



}



var starsHeight;
var frameTicker = 0;
var addPaddle = false;

function loop() {

  frameTicker++;

  if(frameTicker % 2 == 0) { 
    
    var size = getRandom(3,5);

    var options = {
      x : -50,
      y : getRandom(0, starsHeight),
      xV : getRandom(4,10),
      width : size,
      height: size,
      o: getRandom(.2,.5),
      className : 'star',
      lifespan: 200
    }

    makeParticle(options);

  }
  
  var rando = getRandom(0, 75);
  
  if(Math.round(rando) ==  75) {
    var length = getRandom(30,60);
    var width = length / 5;

    var options = {
      x : -50,
      y : getRandom(0, starsHeight),
      xV : getRandom(2,3),
      yV : getRandom(-.5,.5),
      zRv : getRandom(-2,2),
      width : width,
      height: length,
      className : 'floating-paddle',
      lifespan: 1000
    }

    makeParticle(options);
}    
  


  drawParticles();

  requestAnimationFrame(loop);
  

  
}

function makeStars() {
  var stars = document.querySelector(".stars svg");
  console.log(stars.getBoundingClientRect());

  for(var i = 0; i < 300; i++) {
    var svg = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    svg.setAttribute('fill', '#fff');
    svg.setAttribute('fill-opacity', getRandom(.2,.6));
    svg.setAttribute('cx', getRandom(0,1000));
    svg.setAttribute('cy', getRandom(0,1000));
    svg.setAttribute('r', getRandom(1.5,2.5));
    stars.appendChild(svg);
  }
}


