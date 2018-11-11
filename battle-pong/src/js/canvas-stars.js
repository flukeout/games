let canvas, ctx, canvasHeight, canvasWidth;
let stars = [];
let starsRadiusModifier = 0;
let maxStarsRadiusModifier = 1;


function startStars(parentSelector, starCount, width, height, useGameTerrain){
  stars = [];

  canvas = document.querySelector(parentSelector + " .canvas-stars canvas");

  resizeStarsCanvas();

  ctx = canvas.getContext("2d");
  makeStars(starCount);
  
  window.addEventListener("resize", () => {
    resizeStarsCanvas();
  });
  
  let stopFlag = false;

  function drawStars() { 
    starsRadiusModifier = starsRadiusModifier * .9;
    if(starsRadiusModifier < 0) {
      starsRadiusModifier = 0;
    }
    ctx.globalCompositeOperation = 'destination-over';
    ctx.clearRect(0, 0, canvasWidth, canvasHeight); // clear canvas

    var driftFactor = .5;

    if(useGameTerrain) {
      let percent = game.terrainLinePercent || 50;
      driftFactor = (-50 + percent) / 50;
    }

    for(var i = 0; i < stars.length; i++) {
      let star = stars[i];
      ctx.beginPath();
      ctx.fillStyle = "rgba(255, 255, 255, "+ (star.opacity + (starsRadiusModifier * .15)) +")";
      ctx.arc(star.x, star.y, star.radius + (starsRadiusModifier * star.radius), 0, 2 * Math.PI, false);
      ctx.fill();

      // Move the star, and reset if it goes too far
      star.x = star.x + driftFactor * star.speed;
      
      if(driftFactor === 0) {
        star.y = star.y + star.speed / 40;  
      }
      
      if(star.x > canvasWidth + 100) {
        star.x = 0;
      } else if (star.x < -100) {
        star.x = canvasWidth;
      }
      
      if(star.y > canvasHeight) {
        star.y = 0;
      }
    }
  }

  (function loop () {
    drawStars();
    if (!stopFlag) window.requestAnimationFrame(loop);
  })();

  return {
    stop: () => {
      stopFlag = true;
    }
  }
}

function resizeStarsCanvas(){
  canvasWidth = canvas.width = window.innerWidth;
  canvasHeight = canvas.height = window.innerHeight;
  
  stars.forEach(function(star){
    star.y = getRandom(0, canvasHeight);
  });
}

function makeStars(starCount){
  for(var i = 0; i < starCount; i++) {
    stars.push({
      x: getRandom(0, canvasWidth),
      y: getRandom(0, canvasHeight),
      radius: getRandom(2,3),
      opacity: getRandom(.1,.5),
      speed: getRandom(5, 20)
    })
  }
}
