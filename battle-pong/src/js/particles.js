var particles = [];         // Holds all particle objects
var blankParticles = [];    // Holdes reference to pre-appended particle elements

function initParticleEngine(selector, maxParticlecount) {
  var maxParticleCount = maxParticleCount || 50; 

  for(var i = 0; i < maxParticleCount; i++){

    var blankParticle = document.createElement("div");
    blankParticle.classList.add("blank-particle");

    document.querySelector(selector).appendChild(blankParticle);

    blankParticles.push({
      active: false,
      el: blankParticle
    });
  }
}


// Makes a particle

function makeParticle(options){

  var particle = {
    x :     options.x || 0,
    xV :    options.xV || 0,
    xVa :   options.xVa || 0,
    maxX :  options.maxX || false,
    minX :  options.minX || false,

    y :     options.y || 0,
    yV :    options.yV || 0,
    yVa :   options.yVa || 0,
    maxY :  options.maxY || false,
    minY :  options.minY || false,

    z :     options.z || 0,
    zV :    options.zV || 0,

    xR : options.xR || 0,
    xRv : options.xRv || 0,

    yR : options.yR || 0,
    yRv : options.yRv || 0,

    zR : options.zR || 0,
    zRv : options.zRv || 0,

    o : options.o || 1,
    oV : options.oV || 0,

    scale : options.scale || 1,
    scaleV : options.scaleV || 0,
    scaleVa : options.scaleVa || 0,

    text : options.text || false,

    speed : options.speed || false,
    speedA : options.speedA || 0,
    angle : options.angle || false,

    color:  options.color || false,
    width : options.width || 20,
    height: options.height || 20,

    gravity : options.gravity || 0,
    className : options.className || false,
    classList : options.classList || [],

    lifespan : options.lifespan || 200,
    delay : options.delay || 0,
  };

  if(particle.angle) {
    particle.angle =  particle.angle - 180;
    particle.xV = Math.sin(particle.angle * (Math.PI/180)) * particle.speed;
    particle.yV = Math.cos(particle.angle * (Math.PI/180)) * particle.speed;

    particle.xVa = Math.sin(particle.angle * (Math.PI/180)) * particle.speedA;
    particle.yVa = Math.cos(particle.angle * (Math.PI/180)) * particle.speedA;
  }

  for(var i = 0; i < blankParticles.length; i++){
    var blankParticle = blankParticles[i];
    if(blankParticle.active == false) {
      blankParticle.active = true;
      particle.referenceParticle = blankParticle;
      particle.el = blankParticle.el;
      break;
    }
  }

  if(!particle.el){
    return;
  }

  // Grabs an available particle from the blankParticles array
  particle.referenceParticle = blankParticle;

  particle.el.style.height = particle.height + "px";
  particle.el.style.width = particle.width + "px";
  particle.el.classList.add(particle.className);
  
  for(var i = 0; i < particle.classList.length; i++) {
    particle.el.classList.add(particle.classList[i]);
  }

  particle.el.style.background = particle.color;

  if(particle.text) {
    particle.el.innerText = options.text;
  }


  particle.move = function(){
    var p = this;

    if(p.delay > 0) {
      p.delay--;
      return;
    }

    p.lifespan--;

    if(p.lifespan < 0 || p.o < 0) {
      p.referenceParticle.active = false;
      p.el.removeAttribute("style");
      p.el.removeAttribute("class");
      p.el.classList.add("blank-particle");
      p.el.style.display = "none";
      p.el.innerText = "";

      for(var i = 0; i < particles.length; i++){
        if(p == particles[i]){
          particles.splice(i, 1);
        }
      }
    }

    p.x = p.x + p.xV;
    p.y = p.y + p.yV;
    p.xV = p.xV + p.xVa;
    p.yV = p.yV + p.yVa;

    if(p.xV < 0 && p.x < p.minX) {
      // p.xV = p.xV * -1; //Bounce
      // p.xVa = p.xVa * -1; //Bounce
    }


    if(p.xV < 0 && p.x < p.minX) {
      // p.xV = p.xV * -1; //Bounce
      // p.xVa = p.xVa * -1; //Bounce
    }

    if(p.xV > 0 && p.x > p.maxX) {
      // p.xV = p.xV * -1; //Bounce
      // p.xVa = p.xVa * -1; //Bounce
    }

    p.o = p.o + p.oV;

    // If the particle opacity drops below 0 and won't get above 0, get rid of it
    if(p.o <= 0 && p.oV <= 0) {
      p.lifespan = 0;
    }


    if(p.xV < 0 && p.xVa < 0) {
      p.xVa = 0;
      p.xV = 0;
    } else if (p.xV > 0 && p.xVa > 0) {
      p.xVa = 0;
      p.xV = 0;
    }

    if(p.yV < 0 && p.yVa < 0) {
      p.yVa = 0;
      p.yV = 0;
    } else if (p.yV > 0 && p.yVa > 0) {
      p.yVa = 0;
      p.yV = 0;
    }


    if(p.scale <= 0 && p.scaleV <= 0) {
      p.lifespan = 0;
    }

    p.z = p.z + p.zV;
    p.zV = p.zV - p.gravity

    p.scale = p.scale + p.scaleV;
    p.scaleV = p.scaleV + p.scaleVa;

    p.xR = p.xR + p.xRv;
    p.zR = p.zR + p.zRv;
    p.yR = p.yR + p.yRv;

    p.el.style.transform = "translate3d("+p.x+"px,"+p.y+"px,"+p.z+"px) rotateX("+p.xR+"deg) rotateZ("+p.zR+"deg) rotateY("+p.yR+"deg) scale("+p.scale+")";
    p.el.style.opacity = p.o;
  } // particle.move()

  particles.push(particle);
  particle.el.style.display = "block";
  particle.el.style.opacity = 0;
}


// Animation loop for the Particle Effects

function drawParticles(){
  for(var i = 0; i < particles.length; i++){
    var p = particles[i];
    p.move();
  }
}


function getRandom(min, max){
  return min + Math.random() * (max-min);
}

function constrain(value, min, max) {
  if(value <= min) {
    return min;
  } else if (value >= max) {
    return max;
  } else {
    return value;
  }

}

function mapScale(value, min, max, newMin, newMax) {
  
  // Set to min or max if value is outside of bounds
  if(value >= max) {
    value = max;
  } else if (value <= min) {
    value = min;
  }

  var delta = value - min;
  var percent = delta / (max - min);
  
  var newRangeDelta = newMax - newMin;
  var newValue = newMin + (newRangeDelta * percent);
  
  return newValue;
}
