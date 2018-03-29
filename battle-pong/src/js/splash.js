document.addEventListener('DOMContentLoaded', function(){

  initParticleEngine(".scene", 5);
  loop();
  
  prepTitle();

  bestOfEls = document.querySelectorAll(".best-of .option");
  setupBestOf();

  powerupEls = document.querySelectorAll(".powerups .powerup");
  setupPowerups(powerupEls);

  toggleEls = document.querySelectorAll(".option-toggle");
  setupToggles(toggleEls);

  playerOptionEls = document.querySelectorAll(".player-options .player-option");
  setupPlayerOptionss(playerOptionEls);

  setupStartButton();
  setupRulesButton();

  starsHeight = document.querySelector(".canvas-stars").getBoundingClientRect().height;
  startStars(50, window.innerWidth, window.innerHeight);

  SoundManager.init();
  SoundManager.loadSettingsFromLocalStorage();

  document.querySelector(".splash").classList.add("appear");

  setupInputButtons();
  selectButton(0);

});

function loop(){
  drawParticles();
  requestAnimationFrame(loop);
}


let bestOfEls, 
    powerupEls,
    toggleEls,
    playerOptionEls;

let timeoutAccumulator = 0;

// Sets up the music & sound toggle click handlers
function setupPlayerOptionss(els){
  els.forEach(function(el){
    el.addEventListener("click",function(el){
      var playerNum = this.getAttribute("player");
      addTemporaryClassName(this, "pop", 500); 
      SoundManager.playSound("ui");
      var key = "player" + playerNum + "Control";
      var currentSetting = window.Settings[key];
      if(currentSetting === "player") {
        saveSetting(key, "AI");
      } else {
        saveSetting(key, "player");
      }
      updatePlayerOptions(els);
    });
  });
  updatePlayerOptions(els);
}
// Updates state of the music & sound toggles
function updatePlayerOptions(els){
  els.forEach(function(el){
    var playerNum = el.getAttribute("player");
    var key = "player" + playerNum + "Control";
    var setting =window.Settings[key];
    if(setting === "AI") {
      el.innerHTML = "CPU";
    } else {
      el.innerHTML = "P" + playerNum;
    }
  });
}

// Saves an individual setting
// and pushes it to localStorage as well
function saveSetting(setting, value){
  window.Settings[setting] = value;
  window.localStorage.setItem("settings", JSON.stringify(window.Settings));
}




function timeoutClass(selector, className, timeout){
  timeoutAccumulator = timeoutAccumulator + (timeout || 0);
  setTimeout(function(){
    document.querySelector(selector).classList.add(className);
  },timeoutAccumulator)
}


function fadeOutScene(){
  timeoutClass(".content", "transition-out", 100)
  timeoutClass(".paddle-guy", "transition-out", 250);
  timeoutClass(".surface", "transition-out", 200);
  timeoutClass(".overlay", "transition-out");
  timeoutClass(".credits", "transition-out");
  timeoutClass(".large-moon", "transition-out", 200);
  timeoutClass(".sky", "transition-out", 200);
  timeoutClass(".canvas-stars", "transition-out", 200);
}



function setupStartButton(){
  
  var button = document.querySelector(".start-game");
  
  button.addEventListener("click", function(e){
    
    // Apply transitions one at a time, the number is a delay from the last time it was called
    // so it's cumulative...
    var button = e.target;
    var buttonPosition = button.getBoundingClientRect();

    var options = {
      x : buttonPosition.x,
      y : buttonPosition.y,
      zR : getRandom(-8,8),
      xRv : getRandom(12,20),    
      yV : 7,
      zV : -40,
      xV : getRandom(-5,5),
      oV: -.02,
      width : 20,
      height: 50,
      className : 'start-game-particle',
      lifespan: 1000
    }

    makeParticle(options);

    SoundManager.playSound("Power_Shot_V1");
    button.style.opacity = 0;

    fadeOutScene();
    
    e.preventDefault();
    setTimeout(function(){
      if (document.baseURI.indexOf('src/') === document.baseURI.length - 4) {
        window.location.href = "../game.html";
      }
      else {
        window.location.href = "game.html";
      }
    }, 4000);
  })
}

function setupRulesButton(){
  var button = document.querySelector(".rules-button");
  button.addEventListener("click", function(e){
    
    // Apply transitions one at a time, the number is a delay from the last time it was called
    // so it's cumulative...

    fadeOutScene();
    
    e.preventDefault();
    setTimeout(function(){
      if (document.baseURI.indexOf('src/') === document.baseURI.length - 4) {
        window.location.href = "../rules.html";
      }
      else {
        window.location.href = "rules.html";
      }
    }, 4000);
  })
}


// Sets up the music & sound toggle click handlers
function setupToggles(els){
  els.forEach(function(el){
    el.querySelector(".value").addEventListener("click",function(el){
      var toggle = this.parentNode;
      var toggleType = toggle.getAttribute("data-type");
      var settingEnabled = window.Settings[toggleType];
      addTemporaryClassName(this, "pop", 500);
      if(settingEnabled) {
        saveSetting(toggleType, false);
      } else {
        saveSetting(toggleType, true);
      }
      updateToggles(els);
      SoundManager.playSound("ui");
    });
  });
  updateToggles(els);
}

// Updates state of the music & sound toggles
function updateToggles(els){
  els.forEach(function(el){
    var toggleType = el.getAttribute("data-type");
    var settingEnabled = window.Settings[toggleType];
    if(settingEnabled) {
      el.classList.add("enabled");
    } else {
      el.classList.remove("enabled");
    }
  });
}

// Best Of Options
function setupPowerups(els){
  els.forEach(function(el){
    el.addEventListener("click",function(){
      var powerupType = this.getAttribute("data-powerup");
      var isEnabled = this.classList.contains("enabled");
      if(isEnabled){
        powerupToggle(powerupType, "disable");       
      } else {
        powerupToggle(powerupType, "enable");
      }
      addTemporaryClassName(this, "pop", 500);
      updatePowerups(els);
      SoundManager.playSound("ui");
    });
  });
  updatePowerups(els);
}


function powerupToggle(type, action) {
  if(action === "disable"){
    var itemIndex = window.Settings.powerUpTypes.indexOf(type);
    if(itemIndex > -1) {
      window.Settings.powerUpTypes.splice(itemIndex, 1);
    }
  } else if (action == "enable") {
    if(window.Settings.powerUpTypes.indexOf(type) === -1) {
      window.Settings.powerUpTypes.push(type);
    }
  }
  window.localStorage.setItem("settings", JSON.stringify(window.Settings));
}


// Update display of powerup items
function updatePowerups(els){
  var enabledPowerups = window.Settings.powerUpTypes;
  els.forEach(function(el){
    var powerupType = el.getAttribute("data-powerup");
    if(enabledPowerups.indexOf(powerupType) > -1){
      el.classList.add("enabled");
    } else {
      el.classList.remove("enabled");
    }
  });
}

// Best Of Options
function setupBestOf(){
  bestOfEls.forEach(function(option){
    option.addEventListener("click",function(){
      addTemporaryClassName(option, "pop", 500);
      var value = parseInt(this.getAttribute("data-value"));
      saveSetting("playTo", value);
      updateBestOf();
      SoundManager.playSound("ui");
    });
  });
  updateBestOf();
}

// Updates the selected state for the best of options
function updateBestOf(){  
  var currentBestOf = parseInt(window.Settings.playTo) || 2;  
  bestOfEls.forEach(function(option){
    var value = parseInt(option.getAttribute("data-value"));
    value === currentBestOf ? option.classList.add("selected") : option.classList.remove("selected");
  });
}

// Separates the letters in the title into individual elements
// to be animated.
function prepTitle(){
  // return;
  var titleEl = document.querySelector(".game-title .actual-title")
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

// Variables for the particle loop
var starsHeight;

// This shouldn't be in here, we should just import it from effects.js
function addTemporaryClassName(element, className, durationMS){
  element.classList.remove(className);
  element.style.width = element.clientWidth;
  element.classList.add(className);
  setTimeout(function(){
    element.classList.remove(className);
  }, durationMS || 1000);
}
