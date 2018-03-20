const rulenames = [];

let ruleNavEls;

document.addEventListener('DOMContentLoaded', function () {

  ruleNavEls = document.querySelectorAll(".rules-nav a");
  ruleNavEls.forEach(function(el){
    let type = el.getAttribute("nav");
    rulenames.push(type);

    el.addEventListener("click",function(e){
      let type = this.getAttribute("nav");
      showRule(type);
      e.preventDefault();
    })
  });

  
  ruleEls = document.querySelectorAll(".rule-box");

  document.querySelector(".button.previous").addEventListener("click",function(){
    previousRule();
  })

  
  document.querySelector(".button.next").addEventListener("click",function(){
    nextRule();
  })

  numRules = ruleEls.length;

  powerupEls = document.querySelectorAll(".powerup-row .icon");

  powerupEls.forEach(function(el){
    let type = el.getAttribute("type");
    powerupnames.push(type);
    el.addEventListener("click", function(el){
      let type = this.getAttribute("type");
      showPowerup(type);
    });
  })

  showPowerup(powerupnames[0]);
  currentRule = rulenames[0];
  showRule(currentRule);
});


const showPowerup = type => {
  currentPowerup = type;
  
  powerupEls.forEach(function(el){
    el.classList.remove("selected");
  });
  
  // Select the icon
  document.querySelector(".powerup-row .icon[type="+type+"]").classList.add("selected");

  // Hide all videos
  document.querySelectorAll(".powerups video").forEach(function(el){
    el.style.display = "none";
    el.pause();
    el.currentTime = 0;
  });

  // Show the proper video
  let video = document.querySelector("video." + type);
  

  video.style.display = "block";

  addTemporaryClassName(video, "videoPop", 250); 
  
  video.play();

  // Display the rule text
  let ruletext = powerupExplanations[type];
  document.querySelector(".powerup-explanation .powerup-name").innerText = type;
  document.querySelector(".powerup-explanation .powerup-effect").innerText = powerupExplanations[type];
}

let powerupExplanations = {
  "grow" : "Bigger Paddle",
  "ghost" : "Go into enemy territory!",
  "spin" : "Hit the side for a spinshot!",
  "sticky" : "Slow down the ball!",
  "bones" : "A paddle army to help you!",
  "mine" : "Hit it to the other side!"
}

let currentRule;
let numRules;
let ruleEls;
let nextButton;
let powerupEls;

const powerupnames = [];


// Shows top level rule (rules, powerups, controls)



const showRule = type => {

  ruleNavEls.forEach((el, i) => {
    let thisType = el.getAttribute("nav");
    el.classList.remove("selected")
    if(type === thisType) {
      el.classList.add("selected")
    }
  });

  ruleEls.forEach((el, i) => {
    let thisType = el.getAttribute("rule");
    el.style.display = "none";
    if(type === thisType) {
      el.style.display = "block";
    }
  });
}


const nextRule = () => {
  
  if(currentRule === "powerups") {
    let currentPowerupIndex = powerupnames.indexOf(currentPowerup);
    currentPowerupIndex++;
    let nextPowerup = powerupnames[currentPowerupIndex];
    if(currentPowerupIndex < powerupnames.length) {
      showPowerup(nextPowerup);
      return;
    }
  }

  let currentIndex = rulenames.indexOf(currentRule);
  currentIndex++;
  if(currentIndex >= rulenames.length) {
    currentIndex = 0;
  }
  let nextRule = rulenames[currentIndex];
  currentRule = nextRule;
  
  if(currentRule === "powerups") {
    let nextPowerup = powerupnames[0];
    showPowerup(nextPowerup);
  }

  showRule(nextRule);
}

const previousRule = () => {
  
  if(currentRule === "powerups") {
    let currentPowerupIndex = powerupnames.indexOf(currentPowerup);
    currentPowerupIndex--;
    let nextPowerup = powerupnames[currentPowerupIndex];
    if(currentPowerupIndex >= 0) {
      showPowerup(nextPowerup);
      return;
    }  
  }

  let currentIndex = rulenames.indexOf(currentRule);
  currentIndex--;
  if(currentIndex < 0) {
    currentIndex = rulenames.length - 1;
  }
  let nextRule = rulenames[currentIndex];
  currentRule = nextRule;

  if(currentRule === "powerups") {
    let nextPowerup = powerupnames[powerupnames.length - 1];
    showPowerup(nextPowerup);
  }

  showRule(nextRule);
}


window.addEventListener("keydown", function(e){
  // if(e.key === "Escape"){
    // if (displayingRules) {
      // document.querySelector(".rules").classList.remove("visible");
    // }
    // else {
      // document.querySelector(".rules").classList.add("visible");
      // nextStep();
    // }
    // displayingRules = !displayingRules;
  // }
});

let stepList = [
  {
    step : "shoulder-left",
    duration: 1000,
    breakAfter : 250
  },
  {
    step : "shoulder-right",
    duration: 1000,
    breakAfter : 500
  },
  {
    step : "analog-move-x",
    duration: 1000,
    breakAfter : 0
  },
  {
    step : "analog-move-y",
    duration: 1000,
    breakAfter : 250
  },
  {
    step : "analog-spin-right",
    duration: 1000,
    breakAfter : 250
  },
  {
    step : "analog-spin-left",
    duration: 1000,
    breakAfter : 250
  }
]

let currentStepNumber = 0;

const nextStep = () => {
  currentStep = stepList[currentStepNumber];

  document.querySelector(".controls").classList.add(currentStep.step);

  currentStepNumber++;

  if(currentStepNumber >= stepList.length) {
    currentStepNumber = 0;
  }

  setTimeout(function(){
    if(currentStep) {
     document.querySelector(".controls").classList.remove(currentStep.step);
   }
  }, currentStep.duration);

  setTimeout(function(){
    nextStep();
  }, currentStep.duration + currentStep.breakAfter);
};





document.addEventListener('DOMContentLoaded', function(){

  initParticleEngine(".scene", 5);
  loop();
  
  // setupStartButton();

  starsHeight = document.querySelector(".canvas-stars").getBoundingClientRect().height;
  startStars(50, window.innerWidth, window.innerHeight);

  SoundManager.init();
  SoundManager.loadSettingsFromLocalStorage();

});

function loop(){
  drawParticles();
  requestAnimationFrame(loop);
}



let timeoutAccumulator = 0;



function timeoutClass(selector, className, timeout){
  timeoutAccumulator = timeoutAccumulator + (timeout || 0);
  setTimeout(function(){
    document.querySelector(selector).classList.add(className);
  },timeoutAccumulator)
}

function setupStartButton(){
  var button = document.querySelector(".next");
  button.addEventListener("click", function(e){
    
    // Apply transitions one at a time, the number is a delay from the last time it was called
    // so it's cumulative...
    var button = e.target;
    var buttonPosition = button.getBoundingClientRect();

    var options = {
      x : buttonPosition.x,
      y : buttonPosition.y - 60,
      zR : getRandom(-8,8),
      xRv : getRandom(12,20),    
      yV : 7,
      zV : -40,
      xV : getRandom(-5,5),
      oV: -.02,
      width : 210,
      height: 50,
      className : 'start-game-particle',
      lifespan: 1000
    }

    makeParticle(options);

    SoundManager.playSound("Power_Shot_V1");
    button.style.display = "none";

    timeoutClass(".content", "transition-out", 100)
    timeoutClass(".paddle-guy", "transition-out", 250);
    timeoutClass(".surface", "transition-out", 200);
    timeoutClass(".overlay", "transition-out");
    timeoutClass(".credits", "transition-out");
    timeoutClass(".large-moon", "transition-out", 200);
    timeoutClass(".sky", "transition-out", 200);
    timeoutClass(".canvas-stars", "transition-out", 200);
    
    e.preventDefault();
    setTimeout(function(){
      if (document.baseURI.indexOf('src/') === document.baseURI.length - 4) {
        window.location.href = "../index.html";
      }
      else {
        window.location.href = "index.html";
      }
    }, 4000);
  })
}



// Separates the letters in the title into individual elements
// to be animated.

// Variables for the particle loop
var starsHeight;

// This shouldn't be in here, we should just import it from effects.js
function addTemporaryClassName(element, className, durationMS){
  element.classList.remove(className);
  element.classList.add(className);
  setTimeout(function(){
    element.classList.remove(className);
  }, durationMS || 1000);
}
