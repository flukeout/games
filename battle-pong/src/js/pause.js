function PauseManager (game, inputManager, menuControls) {
  let gamepadEventManager = new InputManager.GamepadEventManager();

  gamepadEventManager.addButtonListener(['start', 'home'], 'down', toggleRules);
  gamepadEventManager.start();

  let listeners = [];

  let preTitles = [
    'Watch out for',
    'You can rely on',
    'Space is no limit for',
    'There\'s always time for',
    'Make way for',
    'Real soldiers are forged by',
    'Hopes and dreams rely on'
  ];
  
  let displayingRules = false;

  function toggleRules () {
    displayingRules ? resumeGame() : pauseGame();
  };

  addFancyListener(window, "keydown", e => {
    if(e.key === "Escape"){
      toggleRules();
    }
  }, listeners);
  

  const toggleMenu = () => {
    displayingRules ? resumeGame() : pauseGame();
    SoundManager.playSound("Menu_Select");
  }
  addFancyListener(dQ(".menu-toggle"), "click", toggleMenu, listeners);

  const restartGame = e => {
    menuControls.clearSelectedButton();
    game.rematch();
    addTemporaryClassName(e.target, "poke", 250);
    buttonGleam(e.target);
    SoundManager.playSound("Menu_Select");
  }
  addFancyListener(dQ(".button.restart"), "click", restartGame, listeners);
 
  const navigateSplash = () => {
    navigate("splash");
    SoundManager.playSound("Menu_Select");
  }
  addFancyListener(dQ(".button.settings"), "click", navigateSplash, listeners);

  const clickNav = e => {
    addTemporaryClassName(e.target, "poke", 250);
    SoundManager.playSound("Menu_Select");
    buttonGleam(e.target);
    navigate(e.target.getAttribute("nav"));
  }

  document.querySelectorAll("[nav]").forEach(function(el){
    addFancyListener(el, "click", clickNav, listeners);
  });

  

  const clickResumeButton = e => {
    SoundManager.playSound("Menu_Select");
    addTemporaryClassName(e.target, "poke", 250);
    buttonGleam(e.target);
    resumeGame();
  }
  addFancyListener(dQ(".resume"), "click", clickResumeButton, listeners);

  function resumeGame(){
    menuControls.disconnect();
    document.querySelector(".pause-screen").classList.remove("visible");
    displayingRules = false;
    game.resume();
    deselectAllButtons();
    SoundManager.fireEvent('Resume_Game');
  }

  function pauseGame(){
    if(game.mode != "running") {
      return;
    }

    document.querySelector('#pause-pre-title').textContent = preTitles[Math.floor(preTitles.length * Math.random())] + '...';

    document.querySelector(".pause-screen").classList.add("visible");
    game.pause();
    displayingRules = true;
    selectButtonByIndex(2);

    SoundManager.fireEvent('Pause_Game');

    menuControls.connect();
  }

  function navigate(destination){
    ScreenManager.transitionToScreen(destination);
  }

  this.destroy = function () {
    listeners.map(l => {
      let eventType = l.type || "click";
      l.el.removeEventListener(eventType, l.function);
    });

    destroyFancyListeners(listeners);
    listeners = [];

    document.querySelector(".pause-screen").classList.remove("visible");
    displayingRules = false;
    deselectAllButtons();
    menuControls.disconnect();
    gamepadEventManager.pause(); 
  };
}

const addFancyListener = (el, type, fn, accumulator) => {
  el.addEventListener(type, fn);
  accumulator.push({
    el: el,
    type: type,
    fn: fn
  });
}

const destroyFancyListeners = accumulator => {
  console.log("destroyFancyListeners()");
  accumulator.map(listener => {
    let eventType = listener.type || "click";
    listener.el.removeEventListener(eventType, listener.fn);
  });
}

const dQ = selector => {
  return document.querySelector(selector);
}
