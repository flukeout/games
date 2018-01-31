document.addEventListener('DOMContentLoaded', function(){

  initParticleEngine(".stars", 200);
  starsHeight = document.querySelector(".stars").getBoundingClientRect().height;
  loop(); // Start the particle loop
  prepTitle();

  loadSettings();

  bestOfEls = document.querySelectorAll(".best-of .option");
  setupBestOf();

  powerupEls = document.querySelectorAll(".powerups .powerup");
  setupPowerups(powerupEls);

  toggleEls = document.querySelectorAll(".option-toggle");
  setupToggles(toggleEls);

});

var bestOfEls, 
    powerupEls,
    toggleEls;


function setupToggles(els){
  els.forEach(function(el){
    el.addEventListener("click",function(el){
      var toggleType = this.getAttribute("data-type");
      var settingEnabled = window.Settings[toggleType];
      addTemporaryClassName(this.querySelector(".value"), "pop", 500);
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
  console.log(enabledPowerups);
  els.forEach(function(el){
    var powerupType = el.getAttribute("data-powerup");
    if(enabledPowerups.indexOf(powerupType) > -1){
      el.classList.add("enabled");
    } else {
      el.classList.remove("enabled");
    }
  });
}


// Grab saved settings from localStorage
// If there are none, then we overwrite them with the
// defaults in settings.js
function loadSettings(){

  var savedSettings = JSON.parse(window.localStorage.getItem("settings"));
  
  if(!savedSettings) {
    window.localStorage.setItem("settings", JSON.stringify(window.Settings));
  } else {
    window.Settings = savedSettings;  
  }
}

// Saves an individual setting
// and pushes it to localStorage as well
function saveSetting(setting, value){
  window.Settings[setting] = value;
  window.localStorage.setItem("settings", JSON.stringify(window.Settings));
}


// Best Of Options
var bestOfEls;
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

  if(frameTicker % 2 == 0) {
   makeStar();
  }
  
  // Makes a paddle every once in a while
  var rando = getRandom(0, 75);
  if(Math.round(rando) ==  75) {
    makePaddle();
  }    
  

  drawParticles();

  requestAnimationFrame(loop);
  

  
}


// Add a star particle to the background
function makeStar() {
  var size = getRandom(3,5);

  var options = {
    x: -50,
    y: getRandom(0, starsHeight),
    xV: getRandom(4,10),
    width: size,
    height: size,
    o: getRandom(.2,.5),
    className : 'star',
    lifespan: 200
  }

  makeParticle(options);
}

// Add a paddle particle to the background
function makePaddle(){
  var length = getRandom(30,60);
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

// This shouldn't be in here, we should just import it
// from effects.js
function addTemporaryClassName(element, className, durationMS){

  element.classList.remove(className);
  element.style.width = element.clientWidth;
  element.classList.add(className);

  setTimeout(function(){
    element.classList.remove(className);
  }, durationMS || 1000);
}


