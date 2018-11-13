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
  window.addEventListener("keydown", toggleRules);
  listeners.push({
    el : window,
    type : "keydown",
    function : toggleRules
  });


  let menuToggleEl = document.querySelector(".menu-toggle")
  const toggleMenu = () => {
    displayingRules ? resumeGame() : pauseGame();
    SoundManager.playSound("Menu_Select");
  }
  menuToggleEl.addEventListener("click", toggleMenu);
  listeners.push({
    el : menuToggleEl,
    function : toggleMenu
  });


  let restartButtonEl = document.querySelector(".button.restart");
  const restartGame = e => {
    menuControls.clearSelectedButton();
    game.rematch();
    addTemporaryClassName(e.target, "poke", 250);
    buttonGleam(e.target);
    SoundManager.playSound("Menu_Select");
  }
  restartButtonEl.addEventListener("click", restartGame);
  listeners.push({
    el : restartButtonEl,
    function : restartGame
  });


  let settingsButtonEl = document.querySelector(".button.settings")
  const navigateSplash = () => {
    navigate("splash");
    SoundManager.playSound("Menu_Select");
  }
  settingsButtonEl.addEventListener("click", navigateSplash);
  listeners.push({
    el : settingsButtonEl,
    function : navigateSplash
  });

  const clickNav = e => {
    addTemporaryClassName(e.target, "poke", 250);
    SoundManager.playSound("Menu_Select");
    buttonGleam(e.target);
    navigate(e.target.getAttribute("nav"));
  }

  document.querySelectorAll("[nav]").forEach(function(el){
    el.addEventListener("click", clickNav);
    listeners.push({
      el : el,
      function : clickNav
    });
  });

  let resumeButtonEl = document.querySelector(".resume");

  const clickResumeButton = e => {
    SoundManager.playSound("Menu_Select");
    addTemporaryClassName(e.target, "poke", 250);
    buttonGleam(e.target);
    resumeGame();
  }
  resumeButtonEl.addEventListener("click", clickResumeButton);
  listeners.push({
      el : resumeButtonEl,
      function : clickResumeButton
  });

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
    document.querySelector(".pause-screen").classList.remove("visible");
    displayingRules = false;
    deselectAllButtons();
    menuControls.disconnect();
    gamepadEventManager.pause(); 
  };
}

