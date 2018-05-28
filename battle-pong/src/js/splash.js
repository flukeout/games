(function () {
const CREDITS_DELAY = 3000;

let paddles = [];
let bestOfEls, 
    powerupEls,
    toggleEls,
    playerOptionEls;

let timeoutAccumulator = 0;

let menuControls;

document.addEventListener('DOMContentLoaded', function () {

  SoundManager.init().then(() => {
    document.querySelector("#loading").classList.add("hide-loading");

    SoundManager.resumeAudioContext();
    document.querySelector(".splash").classList.add("appear");
    SoundManager.musicEngine.cueSong('menu');
    if (Settings.music) SoundManager.musicEngine.fadeIn( 2, {loop: true} );
    startCredits(CREDITS_DELAY);

    menuControls = setupInputButtons();
    menuControls.connect();

    selectButtonBySelector(".start-game");

    inputManager = new InputManager((paddle) => {
      updatePlayerOptions(playerOptionEls);
    });

    initParticleEngine("#content .scene", 5);
    loop();

    prepTitle();

    paddles.push(createObject({noBody: true}));
    paddles.push(createObject({noBody: true}));

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

    setupInputs();
  });
});

function setupInputs() {
  inputManager.resetManagedObjects();
  inputManager.forgetManagedObjects();

  if (Settings.player1Control !== 'AI') {
    inputManager.setupInputForObject(paddles[0]);
  }
  if (Settings.player2Control !== 'AI') {
    inputManager.setupInputForObject(paddles[1]);
  }
}

function loop(){
  drawParticles();
  requestAnimationFrame(loop);
}

// Sets up the music & sound toggle click handlers
function setupPlayerOptionss(els){
  els.forEach(function(el){
    el.addEventListener("click",function(el){
      var playerNum = this.getAttribute("player");
      addTemporaryClassName(this, "poke", 250); 
      SoundManager.playSound("Menu_Select");
      var key = "player" + playerNum + "Control";
      var currentSetting = window.Settings[key];
      if(currentSetting === "player") {
        saveSetting(key, "AI");
      } else {
        saveSetting(key, "player");
      }
      setupInputs();
      
      updatePlayerOptions(els);
      buttonGleam(el.target);
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

    el.classList.remove('ai');
    el.classList.remove('keyboard');
    el.classList.remove('gamepad');

    if(setting === "AI") {
      el.classList.add('ai');
      el.innerHTML = "CPU";
    } else {
      if (paddles[playerNum - 1].inputComponent) {
        if (paddles[playerNum - 1].inputComponent.type === 'gamepad') el.classList.add('gamepad');
        else el.classList.add('keyboard');
      }
      else {
        console.warn('Paddle ' + playerNum + ' has no input component. Can\'t perform detection.');
      }
      
      el.innerHTML = "&nbsp;";
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

    SoundManager.playSound("Menu_Start&Blastoff");
    SoundManager.playSound("Power_Shot_V1");
    button.style.opacity = 0;

    fadeOutScene();

    buttonGleam(button);

    e.preventDefault();

    SoundManager.musicEngine.fadeOut(2);
    
    menuControls.disconnect();

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

function setupRulesButton(){
  return;
  var button = document.querySelector(".rules-button");
  
  button.addEventListener("click", function(e){
    menuControls.disconnect();

    addTemporaryClassName(e.target, "poke", 250);
    fadeOutScene();
    buttonGleam(e.target);
    SoundManager.playSound("Menu_Select");
    SoundManager.musicEngine.fadeOut(2);
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
      addTemporaryClassName(this, "poke", 250); 
      var toggle = this.parentNode;
      var toggleType = toggle.getAttribute("data-type");
      var settingEnabled = window.Settings[toggleType];
      if(settingEnabled) {
        saveSetting(toggleType, false);
      } else {
        saveSetting(toggleType, true);
        buttonGleam(this);
      }
      updateToggles(els);
      SoundManager.playSound("Menu_Select");

      if (toggleType === 'music') {
        if (Settings[toggleType]) {
          SoundManager.musicEngine.fadeIn(2, {loop: true});
        }
        else {
          SoundManager.musicEngine.stop();
        }
      }
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

const powerupOn = {
  clone: 'Powerup_Bones_Score',
  grow: 'Powerup_Enhance_Score',
  spin: 'Powerup_Spin_Score',
  mine: 'Bomb_Spawn',
  noclip: 'Powerup_Ghost_Score',
  magnet: 'Powerup_Sticky_Score'
};

const powerupOff = {
  clone: 'Powerup_Bones_Deselect',
  grow: 'Powerup_Enhance_WareOff',
  spin: 'Powerup_Spin_WareOff',
  noclip: 'Powerup_Ghost_WareOff',
  magnet: 'Powerup_Sticky_WareOff',
  mine: 'Bomb_Disable'
};


// Best Of Options
function setupPowerups(els){
  els.forEach(function(el){
    el.addEventListener("click",function(){
      var powerupType = this.getAttribute("data-powerup");
      var isEnabled = this.classList.contains("enabled");

      if(isEnabled){
        powerupToggle(powerupType, "disable");
        let soundName = powerupOff[powerupType] || "Menu_Select";
        SoundManager.playSound(soundName);
      } else {
        let soundName = powerupOn[powerupType] || "Menu_Select";
        SoundManager.playSound(soundName);
        powerupToggle(powerupType, "enable");
      }
      addTemporaryClassName(this, "poke", 250);
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

// Best Of Options
function setupBestOf(){
  bestOfEls.forEach(function(option){
    option.addEventListener("click",function(){
      addTemporaryClassName(option, "poke", 250);
      buttonGleam(option);
      var value = parseInt(this.getAttribute("data-value"));
      saveSetting("playTo", value);
      updateBestOf();
      SoundManager.playSound("Menu_Select");
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

function startCredits(timeoutDelay) {
  let creditsContainer = document.querySelector('.credits');
  let realCredits = Array.prototype.slice.call(creditsContainer.querySelectorAll('.credit'));
  let creditsToShow = [];
  let lastCredit = null;
  let creditToRemove = null;

  let bonusFirstWords = [
    'Executive',
    'Assistant',
    'Planetary',
    'Visual',
    'Monetary'
  ];

  let fistWords = [
    'User',
    'Cinematic',
    'Effect',
    'Wildlife',
    'Robot',
    'Pong',
    'Genetic',
    'Spatial',
    'Quantum',
    'Vacation',
    'Vacuum',
    'Masonic',
    'Geographic',
    'Geological',
    'Mathematics',
    'Financial',
    'Morphology',
    'Destruction',
    'Paddle',
    'Physics',
    'Pentatonic',
    'Flux'
  ];

  let secondWords = [
    'Programming',
    'Assessment',
    'Science',
    'Forecasting',
    'Design',
    'Inquiry',
    'Research',
    'Arbitration',
    'Collection',
    'Verification',
    'Taxation',
    'Molding',
    'Crafting',
    'Production',
    'Appreciation',
    'Accounting',
    'Intake',
    'Organization'
  ];

  let bonusSecondWords = [
    'Lead',
    'Carrier',
    'Consultant',
    'Assistant',
    'Support',
    'Tailor',
    'Expert',
    'Professor',
    'Researcher',
    'Manager',
    'Painter',
    'Franchising',
    'Manufacturing'
  ];

  let realPeople = [
    'Bobby Richter',
    'Luke Pacholski'
  ];

  function creditsLoop() {
    if (creditToRemove) {
      creditsContainer.removeChild(creditToRemove);
      creditToRemove = null;
    }

    if (lastCredit) {
      lastCredit.classList.remove('show');
      lastCredit.classList.add('after-show');
      creditToRemove = lastCredit;
      lastCredit = null;
    }

    if (creditsToShow.length === 0) {
      let fakeCredits = [];

      for (let i = 0, r = Math.round(5 + Math.random() * 10); i < r; ++i) {
        let credit = realPeople[Math.floor(Math.random() * realPeople.length)];


        let firstWord = fistWords[Math.floor(Math.random() * fistWords.length)];
        let secondWord = secondWords[Math.floor(Math.random() * secondWords.length)];

        let title = firstWord + ' ' + secondWord;

        if (Math.random() < 0.4) {
          title = bonusFirstWords[Math.floor(Math.random() * bonusFirstWords.length)] + ' ' + title;
        }

        if (Math.random() < 0.5) {
          title += ' ' + bonusSecondWords[Math.floor(Math.random() * bonusSecondWords.length)];
        }

        title += ': ';

        let fakeCredit = document.createElement('div');
        fakeCredit.classList.add('credit');

        let titleNode = document.createElement('span');
        titleNode.classList.add('title');
        titleNode.textContent = title;

        let nameNode = document.createElement('span');
        nameNode.classList.add('name');
        nameNode.textContent = credit;

        fakeCredit.appendChild(titleNode);
        fakeCredit.appendChild(nameNode);
        fakeCredits.push(fakeCredit);
      }

      creditsToShow = realCredits.map(c => { return c.cloneNode(true); }).concat(fakeCredits);

      creditsToShow.forEach(c => {
        c.classList.add('before-show');
        creditsContainer.appendChild(c);
      });
    }
    else {
      let nextCredit = creditsToShow.shift();
      
      nextCredit.classList.remove('before-show');
      nextCredit.classList.add('show');

      lastCredit = nextCredit;
    }

    setTimeout(creditsLoop, timeoutDelay);
  }

  creditsLoop();

  realCredits.forEach(c => { creditsContainer.removeChild(c); });

  creditsContainer.classList.add('show');
}

})();