(function () {

	document.addEventListener('DOMContentLoaded', (e) => {
    let storyScreen = document.querySelector('.screen.story');
    let currentScreen = null;

    storyScreen.classList.add('show');

    window.switchScreen = function (nextScreenName) {
      let nextScreen = document.querySelector('.screen.' + nextScreenName)

      if (currentScreen) {
        currentScreen.classList.remove('show');
      }

      nextScreen.classList.add('show');

      currentScreen = nextScreen;
    };

	  SoundManager.init({
	    dontWorryAboutWebAudioAutoplayPolicy: true,
	    progress: function (total, loaded) {
	      storyScreen.querySelector('.loading-modal .percent').textContent = Math.floor(loaded/total*100) + '%';
	    }
	  }).then(() => {
      document.querySelector(".screen.story .loading-modal").classList.add('hide-loading');
	  	initStory();
	  });
	});

})();