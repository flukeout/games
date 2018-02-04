document.addEventListener('DOMContentLoaded', function(){
  canvas = document.querySelector(".canvas-stars canvas");
  canvasHeight = canvas.height = window.innerHeight;
  canvasWidth = canvas.width = window.innerWidth;
  ctx = canvas.getContext("2d");
  makeStars(50);
  window.requestAnimationFrame(drawStars);
});

let canvas, ctx, canvasHeight, canvasWidth;
let stars = [];

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

  for(var i = 0; i < stars.length; i++) {
    let star = stars[i];
    ctx.beginPath();
    ctx.fillStyle = "rgba(255, 255, 255, "+star.opacity+")";
    ctx.arc(star.x, star.y, star.radius, 0, 2 * Math.PI, false);
    ctx.fill();

    // Move the star, and reset if it goes too far
    star.x = star.x + star.speed;
    if(star.x > canvasWidth) {
      star.x = 0;
    }
  }

  window.requestAnimationFrame(drawStars);
}
