document.addEventListener('DOMContentLoaded', function(){

  initParticleEngine(".stars", 50);
  starsHeight = document.querySelector(".stars").getBoundingClientRect().height;

  loop(); // Start the particle loop
  
  prepTitle();

  bestOfEls = document.querySelectorAll(".best-of .option");
  setupBestOf();

  powerupEls = document.querySelectorAll(".powerups .powerup");
  setupPowerups(powerupEls);

  toggleEls = document.querySelectorAll(".option-toggle");
  setupToggles(toggleEls);

  setupStartButton();
});

let bestOfEls, 
    powerupEls,
    toggleEls;

let timeoutAccumulator = 0;
function timeoutClass(selector, className, timeout){
  timeoutAccumulator = timeoutAccumulator + timeout || 0;
  setTimeout(function(){
    document.querySelector(selector).classList.add(className);
  },timeoutAccumulator)
}

function setupStartButton(){
  var button = document.querySelector(".start-game");
  button.addEventListener("click", function(e){
    
    // Apply transitions one at a time, the number is a delay from the last time it was called
    // so it's cumulative...
    timeoutClass(".content", "transition-out")
    timeoutClass(".paddle-guy", "transition-out", 250);
    timeoutClass(".surface", "transition-out", 200);
    timeoutClass(".overlay", "transition-out");
    timeoutClass(".credits", "transition-out");
    timeoutClass(".large-moon", "transition-out", 200);

    e.preventDefault();
    setTimeout(function(){
      window.location.href = "../index.html";
    },3200);
  })
}


// Sets up the music & sound toggle click handlers
function setupToggles(els){
  els.forEach(function(el){
    el.querySelector(".value").addEventListener("click",function(el){
      console.log(this);
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

// Saves an individual setting
// and pushes it to localStorage as well
function saveSetting(setting, value){
  window.Settings[setting] = value;
  window.localStorage.setItem("settings", JSON.stringify(window.Settings));
}


// Best Of Options
function setupBestOf(){
  bestOfEls.forEach(function(option){
    option.addEventListener("click",function(){
      addTemporaryClassName(option, "pop", 500);
      var value = parseInt(this.getAttribute("data-value"));
      saveSetting("playTo", value);
      updateBestOf();
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
  var titleEl =document.querySelector(".game-title")
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
var frameTicker = 0;
var addPaddle = false;

// Runs the animation loop for the particle starfield
function loop() {

  frameTicker++;
  
  // Makes a paddle every once in a while
  var rando = getRandom(0, 75);
  if(Math.round(rando) ==  75) {
    makePaddle();
  }    
  
  drawParticles();

  requestAnimationFrame(loop);
}

// Add a paddle particle to the background
function makePaddle(){
  var length = getRandom(15,40);
  var width = length / 5;

  var options = {
    x : -50,
    y : getRandom(0, starsHeight),
    xV : getRandom(2,3),
    yV : getRandom(-.5,.5),
    zRv : getRandom(-2,2),
    width : width,
    height: length,
    className : 'floating-paddle',
    lifespan: 1000
  }

  makeParticle(options);
}

// This shouldn't be in here, we should just import it from effects.js
function addTemporaryClassName(element, className, durationMS){
  element.classList.remove(className);
  element.style.width = element.clientWidth;
  element.classList.add(className);
  setTimeout(function(){
    element.classList.remove(className);
  }, durationMS || 1000);
}
