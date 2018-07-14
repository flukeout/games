function PauseManager (game, inputManager, menuControls) {
  let gamepadEventManager = new InputManager.GamepadEventManager();

  gamepadEventManager.addButtonListener(['start', 'home'], 'down', toggleRules);
  gamepadEventManager.start();

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

  window.addEventListener("keydown", function(e){
    if(e.key === "Escape"){
      displayingRules ? resumeGame() : pauseGame();
    }
  });

  function toggleRules () {
    displayingRules ? resumeGame() : pauseGame();
  };

  document.querySelector(".menu-toggle").addEventListener("click",function(){
    displayingRules ? resumeGame() : pauseGame();
    SoundManager.playSound("Menu_Select");
  });

  document.querySelector(".button.restart").addEventListener("click",function(e){
    menuControls.clearSelectedButton();
    game.rematch();
    addTemporaryClassName(e.target, "poke", 250);
    buttonGleam(e.target);
    SoundManager.playSound("Menu_Select");
  });

  document.querySelector(".button.settings").addEventListener("click",function(){
    navigate("splash");
    SoundManager.playSound("Menu_Select");
  });

  document.querySelectorAll("[nav]").forEach(function(el){
    el.addEventListener("click",function(e){
      addTemporaryClassName(e.target, "poke", 250);
      SoundManager.playSound("Menu_Select");
      buttonGleam(e.target);
      navigate(this.getAttribute("nav"));
    });
  });

  document.querySelector(".resume").addEventListener("click", function(el){
    SoundManager.playSound("Menu_Select");
    addTemporaryClassName(el.target, "poke", 250);
    buttonGleam(el.target);
    resumeGame();
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
    menuControls.disconnect();
    gamepadEventManager.pause(); 
  };
}
