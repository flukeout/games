let windCanvas, windCtx, windCanvasHeight, windCanvasWidth;
let windChunks = [];


function startWind(windCount, width, height){
  
  windCanvas = document.querySelector(".board-canvas");
  windCanvasHeight = 500;
  windCanvasWidth = 850;
  
  windCtx = windCanvas.getContext("2d");
  makeWindParticles(20);
  window.requestAnimationFrame(drawWind);
}

function makeWindParticles(particleCount){

  for(var i = 0; i < particleCount; i++) {
  var depth = getRandom(1,10);

    windChunks.push({
      x: getRandom(0, windCanvasWidth),
      y: getRandom(0, windCanvasHeight),
      opacity: 1,
      speed: getRandom(15,20),
      length: getRandom(50,100)
    })
  }
}

function drawWind() {
  
  windCtx.globalCompositeOperation = 'destination-over';
  windCtx.clearRect(0, 0, windCanvasWidth, windCanvasHeight); // clear canvas

  var driftFactor = -1;

    var grd = windCtx.createLinearGradient(0, 0, 850, 500);
    grd.addColorStop(.1, "rgba(0,0,0,.0)");
    grd.addColorStop(.5, "rgba(0,0,0,.2)");
    grd.addColorStop(.9, "rgba(0,0,0,.0)");


  for(var i = 0; i < windChunks.length; i++) {
    let star = windChunks[i];

    windCtx.beginPath();
    windCtx.fillStyle = "rgba(255, 255, 255, "+star.opacity+")";
    // windCtx.arc(star.x, star.y, star.radius, 0, 2 * Math.PI, false);
    

    windCtx.fillStyle = grd;

    windCtx.rect(star.x, star.y, star.length, 3);
    

    windCtx.fill();

    // Move the star, and reset if it goes too far
    star.x = star.x + driftFactor * star.speed;


    if(star.x > windCanvasWidth + 100) {
      star.x = 0;
    } else if (star.x < -100) {
      star.x = windCanvasWidth;
    }
    
    if(star.y > windCanvasHeight) {
      star.y = 0;
    }
  }

  window.requestAnimationFrame(drawWind);
}
