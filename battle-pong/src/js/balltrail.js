document.addEventListener('DOMContentLoaded', function () {
  startTrail()
});

let trailCanvas, trailCtx, trailCanvasHeigth, trailCanvasWidth;
// let stars = [];

function startTrail(){
  trailCanvas = document.querySelector(".particle-canvas");

  trailCanvasWidth = 890;
  trailCanvasHeigth = 540;

  trailCanvas.width = 850;
  trailCanvas.height = 500;

  console.log(trailCanvasWidth, trailCanvasHeigth);
  
  trailCtx = trailCanvas.getContext("2d");
  
  window.requestAnimationFrame(drawTrail);
}

let ballPosition = [];
let frames = 0;

function drawTrail() { 
    
    frames++;
    let pushing = false;
    


    if(game.balls[0]) {
      if(game.balls[0].physics.speed > game.balls[0].wordSpeed) {
        pushing = true;
        ballPosition.push({
          x : parseFloat(game.balls[0].physics.position.x),
          y : parseFloat(game.balls[0].physics.position.y),
          speed : parseFloat(game.balls[0].physics.speed)
        });
      }
    }

    if(ballPosition.length > 80) {
      ballPosition.shift();
    }

    if(pushing == false && ballPosition.length > 1) {
     ballPosition.shift();
     ballPosition.shift();
     ballPosition.shift(); 
    }

    // console.log(ballPosition.length);

    // let pos = ballPosition[0];
    // trailCtx.globalCompositeOperation = 'destination-over';
    trailCtx.clearRect(0, 0, trailCanvasWidth, trailCanvasHeigth); // clear canvas

    for(var i = 0; i < ballPosition.length; i++) {
      let pos = ballPosition[i];
      trailCtx.beginPath();
      trailCtx.fillStyle = "#fff";
      let sizeMult = EasingFunctions.easeInQuad(i/ballPosition.length);
      trailCtx.arc(pos.x, pos.y, 25 * sizeMult, 0, 2 * Math.PI, false);
      trailCtx.fill();
    }



  window.requestAnimationFrame(drawTrail);
}


EasingFunctions = {
  // no easing, no acceleration
  linear: function (t) { return t },
  // accelerating from zero velocity
  easeInQuad: function (t) { return t*t },
  // decelerating to zero velocity
  easeOutQuad: function (t) { return t*(2-t) },
  // acceleration until halfway, then deceleration
  easeInOutQuad: function (t) { return t<.5 ? 2*t*t : -1+(4-2*t)*t },
  // accelerating from zero velocity 
  easeInCubic: function (t) { return t*t*t },
  // decelerating to zero velocity 
  easeOutCubic: function (t) { return (--t)*t*t+1 },
  // acceleration until halfway, then deceleration 
  easeInOutCubic: function (t) { return t<.5 ? 4*t*t*t : (t-1)*(2*t-2)*(2*t-2)+1 },
  // accelerating from zero velocity 
  easeInQuart: function (t) { return t*t*t*t },
  // decelerating to zero velocity 
  easeOutQuart: function (t) { return 1-(--t)*t*t*t },
  // acceleration until halfway, then deceleration
  easeInOutQuart: function (t) { return t<.5 ? 8*t*t*t*t : 1-8*(--t)*t*t*t },
  // accelerating from zero velocity
  easeInQuint: function (t) { return t*t*t*t*t },
  // decelerating to zero velocity
  easeOutQuint: function (t) { return 1+(--t)*t*t*t*t },
  // acceleration until halfway, then deceleration 
  easeInOutQuint: function (t) { return t<.5 ? 16*t*t*t*t*t : 1+16*(--t)*t*t*t*t }
}