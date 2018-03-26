function RulesManager (game, inputManager) {
  
  let displayingRules = false;

  window.addEventListener("keydown", function(e){
    if(e.key === "Escape"){
      if (displayingRules) {
        document.querySelector(".pause-screen").classList.remove("visible");
        game.resume();
      }
      else {
        document.querySelector(".pause-screen").classList.add("visible");
        game.pause();
      }
      displayingRules = !displayingRules;
    }
  });

  document.querySelectorAll("[nav]").forEach(function(el){
    el.addEventListener("click",function(){
      navigate(this.getAttribute("nav"));
    });
    
  })

  inputManager.waitForGamepadStartButtonPress(() => {
    if (displayingRules) {
      document.querySelector(".pause-screen").classList.remove("visible");
      game.resume();
    }
    else {
      document.querySelector(".pause-screen").classList.add("visible");
      game.pause();
    }
    displayingRules = !displayingRules;
  });



  
}


function navigate(destination){
  let url = destination + ".html";
  
  // fadeOutScene();
  if (document.baseURI.indexOf('src/') === document.baseURI.length - 4) {
    url = "../" + url;
  }
  setTimeout(function(){
      window.location.href = url;
  }, 0);
}



