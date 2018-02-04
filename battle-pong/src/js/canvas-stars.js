let canvas, ctx, canvasHeight, canvasWidth;
let stars = [];

function startStars(starCount, width, height){
  canvas = document.querySelector(".canvas-stars canvas");
  canvasWidth = canvas.width = width;
  canvasHeight = canvas.height = height;
  
  ctx = canvas.getContext("2d");
  makeStars(starCount);
  window.requestAnimationFrame(drawStars);
}

function makeStars(starCount){
  for(var i = 0; i < starCount; i++) {
    console.log(canvasHeight);
    stars.push({
      x: getRandom(0, canvasWidth),
      y: getRandom(0, canvasHeight),
      radius: getRandom(2,3),
      opacity: getRandom(.1,.7),    
      speed: getRandom(5, 20)
    })
  }
}

function drawStars() { 
  ctx.globalCompositeOperation = 'destination-over';
  ctx.clearRect(0, 0, canvasWidth, canvasHeight); // clear canvas

  var driftFactor = .5;

  if(typeof game != "undefined") {
    let percent = game.terrainLinePercent || 50;
    driftFactor = (-50 + percent) / 50;
  }

  for(var i = 0; i < stars.length; i++) {
    let star = stars[i];
    ctx.beginPath();
    ctx.fillStyle = "rgba(255, 255, 255, "+star.opacity+")";
    ctx.arc(star.x, star.y, star.radius, 0, 2 * Math.PI, false);
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

  window.requestAnimationFrame(drawStars);
}
