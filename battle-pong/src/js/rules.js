const rulenames = [];

let ruleNavEls;

let menuControls;

window.initRules = function () {
  switchScreen('rules');
 
  let leftPaddle = createObject({noBody: true});
  let rightPaddle = createObject({noBody: true});

  var inputManager = new InputManager((paddle) => {
    let selector = (paddle === leftPaddle ? '.player-one-controls' : '.player-two-controls')
    let displayType = paddle.inputComponent.type;
    if(paddle.inputComponent.type === "keyboard") {
      displayType = paddle.inputComponent.inputToActionMapping.KeyA ? "keyboard-left" : "keyboard-right";
    }
    document.querySelector(selector).setAttribute('data-type', displayType);
  });

  if (Settings.player1Control === 'AI') {
    document.querySelector('.player-one-controls').setAttribute('data-type', 'ai');
  }
  else {
    inputManager.setupInputForObject(leftPaddle);
  }

  if (Settings.player2Control === 'AI') {
    document.querySelector('.player-two-controls').setAttribute('data-type', 'ai');
  }
  else {
    inputManager.setupInputForObject(rightPaddle);
  }

  document.querySelector(".screen.rules").classList.add("ready");

  setupNavButtons();

  ruleNavEls = document.querySelectorAll(".rules-nav a");
  ruleNavEls.forEach(function(el){
    let type = el.getAttribute("nav");
    rulenames.push(type);

    el.addEventListener("click",function(e){
      let type = this.getAttribute("nav");
      showRule(type);
      SoundManager.playSound("Menu_Select");
      addTemporaryClassName(e.target, "poke", 250);
      e.preventDefault();
    })
  });

  ruleEls = document.querySelectorAll(".rule-box");

  document.querySelector(".button.previous").addEventListener("click",function(){
    previousRule();
    SoundManager.playSound("Menu_Select");
    addTemporaryClassName(this, "poke", 250);
  })
  
  document.querySelector(".button.next").addEventListener("click",function(){
    addTemporaryClassName(this, "poke", 250);
    SoundManager.playSound("Menu_Select");
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
      SoundManager.playSound("Menu_Select");
    });
  })

  showPowerup(powerupnames[0]);
  
  currentRule = rulenames[0];
  
  if (window.location.hash) {
    let prospectiveRule = window.location.hash.substr(1);
    if (rulenames.indexOf(prospectiveRule) > -1) {
      currentRule = prospectiveRule;
    }
  }
  showRule(currentRule);

  menuControls = setupInputButtons();
  menuControls.connect();

  selectButtonByIndex(12);

  if (Settings.music) {
    SoundManager.musicEngine.cueSong('menu');
    SoundManager.musicEngine.fadeIn( 2, {loop: true} );
  }

  initParticleEngine(".scene", 5);
  loop();

  startStars('.screen.rules', 50, window.innerWidth, window.innerHeight);
};

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


function loop(){
  drawParticles();
  requestAnimationFrame(loop);
}

let timeoutAccumulator = 0;

function timeoutClass(selector, className, timeout){
  timeoutAccumulator = timeoutAccumulator + (timeout || 0);
  setTimeout(function(){
    document.querySelector(selector).classList.add(className);
  }, timeoutAccumulator)
}

function fadeOutScene(){
  timeoutClass(".rules-nav", "transition-out", 100);
  timeoutClass(".rules", "transition-out", 100);
  timeoutClass(".buttons", "transition-out", 100);
  timeoutClass(".sky", "transition-out", 200);
  timeoutClass(".canvas-stars", "transition-out", 200);
}

function setupNavButtons(){
  var buttons = document.querySelectorAll(".nav-button");
  buttons.forEach(function(el){
    el.addEventListener("click", function(e){
      
      SoundManager.playSound("Menu_Select");
      let navTo = this.getAttribute("to");
      addTemporaryClassName(this, "poke", 250);
      if(navTo === "game") {
        buttonGleam(e.target);
        startGame();

      } else if(navTo === "splash"){
        goBack();
      }
    })
  });
}

function goBack(){
  initSplash();

  SoundManager.musicEngine.fadeOut(2);
  
  menuControls.disconnect();

  setTimeout(function(){
    window.location.href = url;
  }, 2500);
}


function startGame(){
  let url = "game.html";
  fadeOutScene();
  if (document.baseURI.indexOf('src/') === document.baseURI.length - 4) {
    url = "../" + url;
  }

  SoundManager.musicEngine.fadeOut(2);
  
  menuControls.disconnect();

  setTimeout(function(){
    window.location.href = url;
  }, 2500);
}


// Separates the letters in the title into individual elements
// to be animated.

// This shouldn't be in here, we should just import it from effects.js
function addTemporaryClassName(element, className, durationMS){
  element.classList.remove(className);
  element.classList.add(className);
  setTimeout(function(){
    element.classList.remove(className);
  }, durationMS || 1000);
}
