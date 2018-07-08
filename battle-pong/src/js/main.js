(function () {

  const screens = {};
  let currentScreen = null;
  window.ScreenManager = {
    initScreens: () => {
      for (let screenName in screens) {
        screens[screenName].element = document.querySelector('.screen.' + screenName);
        screens[screenName].init && screens[screenName].init(screens[screenName]);
      }
    },
    addScreen: (name, screenDefinition) => {
      screens[name] = screenDefinition;
    },
    transitionToScreen: (name) => {
      return new Promise((transitionPromiseResolve, transitionPromiseReject) => {
        if (screens[name]) {

          function goToNextScreen () {
            if (currentScreen) {
              currentScreen.element.classList.remove('show');
            }

            currentScreen = screens[name];
            currentScreen.element.classList.add('show');
            if (currentScreen.start) {
              currentScreen.start().then(() => {
                transitionPromiseResolve();
              });
            }
            else {
              transitionPromiseResolve();
            }
          }

          if (currentScreen) {
            if (currentScreen.stop) {
              currentScreen.stop().then(goToNextScreen);
            }
            else {
              goToNextScreen();
            }
          }
          else {
            goToNextScreen();
          }

        }
        else {
          throw new Error('No screen with name "' + name + '".');
        }
      });
    }
  };

	document.addEventListener('DOMContentLoaded', (e) => {
    ScreenManager.addScreen('loading', {
      stop: () => {
        return new Promise((resolve, reject) => {
          screens['loading'].element.querySelector(".loading-modal").classList.add('hide-loading');
          setTimeout(resolve, 1000);
        });
      }
    });

    ScreenManager.initScreens();

    ScreenManager.transitionToScreen('loading').then(() => {
      SoundManager.init({
        dontWorryAboutWebAudioAutoplayPolicy: true,
        progress: function (total, loaded) {
          screens['loading'].element.querySelector('.loading-modal .percent').textContent = Math.floor(loaded/total*100) + '%';
        }
      }).then(() => {
        ScreenManager.transitionToScreen('story').then(() => {
          screens['loading'].element.querySelector(".loading-modal").classList.add('hide-loading');
        });
      });
    });
	});

})();