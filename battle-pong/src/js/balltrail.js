document.addEventListener('DOMContentLoaded', function () {
  startTrail()
});

let trailStarted = false;

let trailCanvas,
    trailCtx,
    trailCanvasHeigth,
    trailCanvasWidth;

function startTrail(){
  trailCanvas = document.querySelector(".particle-canvas");
  trailCanvasWidth = 890;
  trailCanvasHeigth = 540;
  trailCanvas.width = 850;
  trailCanvas.height = 500;
  trailCtx = trailCanvas.getContext("2d");
  trailStarted = true;
}

let ballPosition = [];
let lastPos = {};
let ticks = 0;
let maxTrailLength = 20;
let maxDisplayRatio = 1;
let frames = 0;
let lastColor = false;
let cutoffSpeed = 4;
let displaySteps;
let desiredDisplaySteps;
let actualDisplaySteps = 0;

function drawTrail() {
    frames++;
    let ball = game.balls[0];
    let touchedAnything = false;
    let pushing = false;
    
    if(ball) {
      touchedAnything = ball.lastTouchedPaddle === 1 || ball.lastTouchedPaddle === 2 ? true : false;
      maxDisplayRatio = mapScale(ball.physics.speed, 2, 10, 0, 1);
    }

    if(ball && touchedAnything) {

      if(ball.lastTouchedPaddle === 1) {
        lastColor = "#c15db5";
      }
      
      if(ball.lastTouchedPaddle === 2) {
        lastColor = "#4dc18f";
      }

      if(ball.isSpinning) {
        lastColor = "#39f6ff"
      }

      if(ball.hasTrail) {
        pushing = true;
        ballPosition.push({
          x : parseFloat(game.balls[0].physics.position.x),
          y : parseFloat(game.balls[0].physics.position.y),
          speed : parseFloat(game.balls[0].physics.speed),
          frame : parseInt(frames),
          color : lastColor
        });
      }
    }

    if(ballPosition.length > maxTrailLength) {
      ballPosition.shift();
    }


    if(pushing == false && ballPosition.length > 0) {
      ballPosition.shift(); 
    }
    
    trailCtx.clearRect(0, 0, trailCanvasWidth, trailCanvasHeigth); // Clear canvas

    let displaySteps = parseInt(ballPosition.length * maxDisplayRatio);

    let maxDisplaySteps = parseInt(maxDisplayRatio * ballPosition.length);
    let j = 1;


    if(ball) {
      if(ball.isSpinning) {
        maxDisplaySteps = 20;
      }
    }


    if(actualDisplaySteps < maxDisplaySteps) {
      actualDisplaySteps++;
    } else if (actualDisplaySteps > maxDisplaySteps) {
      actualDisplaySteps--;
    }


    for(var i = (ballPosition.length - actualDisplaySteps) + 1; i < ballPosition.length; i++) {

      // Gets drawn from end tip to ball.

      let pos = ballPosition[i];
      let prevPos = ballPosition[i-1];

      trailCtx.lineJoin = trailCtx.lineCap = 'round';
      trailCtx.beginPath();
      trailCtx.strokeStyle = pos.color;
      trailCtx.moveTo(prevPos.x, prevPos.y);
      
      // let progress = i / (ballPosition.length - 1);
      let progress = j / actualDisplaySteps;
      j++;
      let sizeMult = EasingFunctions.easeOutQuart(progress);

      trailCtx.lineTo(pos.x, pos.y);
      trailCtx.lineWidth = 36 * sizeMult;

      if(lastColor) {
        trailCtx.stroke();
      }
    }

    // Glowy outline duder
    if(ball && touchedAnything){
      if(ball.physics.speed < cutoffSpeed) {
        let sinMult = Math.sin(frames/6);
        let radius = 30 + (sinMult * 4);
        trailCtx.beginPath();
        trailCtx.arc(ball.physics.position.x, ball.physics.position.y, radius, 0, 2 * Math.PI, false);
        trailCtx.fillStyle = lastColor;
        trailCtx.fill();
      }
    }
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
