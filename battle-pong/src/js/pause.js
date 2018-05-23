function PauseManager (game, inputManager) {
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

  this.toggleRules = function () {
    displayingRules ? resumeGame() : pauseGame();
  };

  document.querySelector(".menu-toggle").addEventListener("click",function(){
    displayingRules ? resumeGame() : pauseGame();
    SoundManager.playSound("ui");
  });

  document.querySelector(".button.restart").addEventListener("click",function(e){
    game.rematch();
    addTemporaryClassName(e.target, "poke", 250);
    buttonGleam(e.target);
    SoundManager.playSound("ui");
  });

  document.querySelector(".button.settings").addEventListener("click",function(){
    navigate("index");
    SoundManager.playSound("ui");
  });

  document.querySelectorAll("[nav]").forEach(function(el){
    el.addEventListener("click",function(e){
      addTemporaryClassName(e.target, "poke", 250);
      SoundManager.playSound("ui");
      buttonGleam(e.target);
      navigate(this.getAttribute("nav"));
    });
  });

  document.querySelector(".resume").addEventListener("click", function(el){
    SoundManager.playSound("ui");
    addTemporaryClassName(el.target, "poke", 250);
    buttonGleam(el.target);
    resumeGame();
  });

  function resumeGame(){
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
  }

  function navigate(destination){
    let url = destination + ".html";
    
    fadeOutScene();
  
    if (document.baseURI.indexOf('src/') === document.baseURI.length - 4) {
      url = "../" + url;
    }
  
    setTimeout(function(){
      window.location.href = url;
    }, 1000);
  }

  function fadeOutScene(){
    document.querySelector("body").classList.add("fade-out");
  }

  setupInputButtons(this);
}
