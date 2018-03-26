function PauseManager (game, inputManager) {
  
  let displayingRules = false;

  window.addEventListener("keydown", function(e){
    if(e.key === "Escape"){
      displayingRules ? resumeGame() : pauseGame();
    }
  });

  document.querySelectorAll("[nav]").forEach(function(el){
    el.addEventListener("click",function(){
      navigate(this.getAttribute("nav"));
    });
  })

  document.querySelector(".resume").addEventListener("click", function(){
    resumeGame();
  });

  inputManager.waitForGamepadStartButtonPress(() => {
    displayingRules ? resumeGame() : pauseGame();
  });

  function resumeGame(){
  document.querySelector(".pause-screen").classList.remove("visible");
  displayingRules = false;
  game.resume();
}

  function pauseGame(){
    document.querySelector(".pause-screen").classList.add("visible");
    game.pause();
    displayingRules = true;
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
}
