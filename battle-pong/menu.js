window.MenuMachine = function (game) {

  var menuWrapper = document.querySelector('.menu-wrapper');
  var header = document.querySelector('.header');
  var headerTitle = document.querySelector('.header .title');

  var sections = Array.prototype.slice.call(menuWrapper.querySelectorAll('section'));

  var mainSection = menuWrapper.querySelector('section[data-name="main"]');
  var activeSection = mainSection;
  var activeSectionDriver;

  var numPlayers = 2;

  var sectionLogic = {
    main: function () {
      // This is a hack because I didn't feel like re-scoping everything after writing this code.
      // This method felt easier. I'm sorry to whoever is reading this note.
      var anonymousFunctionListeners = [];

      var sectionElement = menuWrapper.querySelector('section[data-name="main"]');
      sectionElement.querySelectorAll('ul li[data-goto]').forEach(function (menuListItem) {
        function fn () {
          var newMenuName = menuListItem.getAttribute('data-goto');
          if (newMenuName === 'exit') {
            hideMenu();
          }
          else {
            var newMenu = menuWrapper.querySelector('section[data-name="' + newMenuName + '"]');
            showSection(newMenu);
          }
        }
        menuListItem.addEventListener('click', fn);
        anonymousFunctionListeners.push({object: menuListItem, event: 'click', fn: fn});
      });

      this.close = function () {
        anonymousFunctionListeners.forEach((couple) => {
          couple.object.removeEventListener(couple.event, couple.fn);
        });
      };
    },
    controls: function () {
      var sectionElement = menuWrapper.querySelector('section[data-name="controls"]');
      var playerIndicator = sectionElement.querySelector('.player-indicator');
      var playerNumber = playerIndicator.querySelector('.player-number');
      var leftSwitcher = playerIndicator.querySelector('.switcher[data-direction="left"]');
      var rightSwitcher = playerIndicator.querySelector('.switcher[data-direction="right"]');
      var inputSwitcherContainer = sectionElement.querySelector('.input-type');
      var inputSwitcher = inputSwitcherContainer.querySelector('input');
      var setAllButton = sectionElement.querySelector('button.set-all');
      var doneButton = sectionElement.querySelector('button.done');

      var activeLogician = null;
      
      rightSwitcher.addEventListener('click', nextPlayer);
      leftSwitcher.addEventListener('click', lastPlayer);
      
      var inputLogicians = {

        // Keyboard Logician for configuring keyboard controls
        'keyboard': function () {
          var playerControls = sectionElement.querySelector('.player-controls[data-input-type="keyboard"]');
          var paddle = paddles[currentPlayer];
          var keyActionMap = paddle.inputComponent.getInverseActionMapping();
          
          // For keeping track if we're editing a key now or not
          var currentControlEditing = null;
          var currentControlKeyEditing = null;

          var controlQueue = [];

          playerControls.classList.add('show');

          function translateKey (key) {
            key = key.replace(/(Key|Digit|Arrow)/g, '');
            return key;
          }

          function startEditingControl (container) {
            currentControlEditing = container;
            currentControlKeyEditing = currentControlEditing.querySelector('.control-key');
            currentControlKeyEditing.innerHTML = '';
            currentControlKeyEditing.classList.add('editing');
            window.addEventListener('keydown', onKeyDownWhileEditing);
          }

          function stopEditingCurrentControl () {
            if (currentControlEditing) {
              var key = keyActionMap[currentControlEditing.getAttribute('data-name')];

              currentControlKeyEditing.classList.remove('editing');
              currentControlEditing = null;

              populate();
            }
          }

          function onKeyDownWhileEditing (e) {
            var action = currentControlEditing.getAttribute('data-name');
            var key = e.code;

            // Abort! Bail! Ahhhh!
            if (key === 'Escape') {
              controlQueue = [];
              stopEditingCurrentControl();
              window.removeEventListener('keydown', onKeyDownWhileEditing);
              return;
            }

            // Get rid of any keys that were pointing to this action already
            paddle.inputComponent.clearMappingForAction(action);

            // Save a new key for this action (e.g. key: KeyW => action: 'up')
            paddle.inputComponent.setMappingForAction(action, key);

            // Needs to be refreshed for reverse lookup again
            keyActionMap = paddle.inputComponent.getInverseActionMapping();
            
            localStorage.setItem('paddle' + currentPlayer + 'KeyboardActionMapping',
              JSON.stringify(paddle.inputComponent.actionMapping));

            stopEditingCurrentControl();
            window.removeEventListener('keydown', onKeyDownWhileEditing);

            if (controlQueue.length > 0) {
              startEditingControl(controlQueue.shift());
            }
          }

          function onControlContainerClick (e) {
            var container = e.target.parentNode;

            if (currentControlEditing !== container) {
              if (currentControlEditing) {
                stopEditingCurrentControl();
              }
              startEditingControl(container);
            }            
          }

          function onSetAllButtonClicked() {
            controlQueue = Array.prototype.slice.call(playerControls.querySelectorAll('li[data-name]'));
            startEditingControl(controlQueue.shift());
          }

          function populate() {
            paddleActions.forEach((action) => {
              var container = playerControls.querySelector('li[data-name="' + action + '"]');

              if (container) {
                var controlKey = container.querySelector('.control-key');

                if (paddle.inputComponent) {
                  controlKey.innerHTML = keyActionMap[action] ? translateKey(keyActionMap[action]) : '???';
                }
              }            
            });
          }

          setAllButton.addEventListener('click', onSetAllButtonClicked);

          // TODO: It's not cool that paddleActions is so global
          paddleKeyboardActions.forEach((action) => {
            var container = playerControls.querySelector('li[data-name="' + action + '"]');
            var controlKey = container.querySelector('.control-key');

            container.addEventListener('click', onControlContainerClick);
          });

          populate();

          return {
            destroy: function () {
              playerControls.classList.remove('show');
              stopEditingCurrentControl();
              window.removeEventListener('keydown', onKeyDownWhileEditing);

              setAllButton.removeEventListener('click', onSetAllButtonClicked);
              
              paddleKeyboardActions.forEach((action) => {
                var container = playerControls.querySelector('li[data-name="' + action + '"]');
                container.removeEventListener('click', onControlContainerClick);
              });
            }
          }
        },

        // Gamepad logician for configuring gamepad controls
        gamepad: function () {
          var playerControls = sectionElement.querySelector('.player-controls[data-input-type="gamepad"]');
          var gamepadsList = playerControls.querySelector('.gamepads');

          var paddle = paddles[currentPlayer];
          var keyActionMap = paddle.inputComponent.getInverseActionMapping();

          var gamepads = GamepadManager.getGamepads();
          var gamepadIndicators = [];
          
          var controlQueue = [];
          var currentControlEditing = null;

          playerControls.classList.add('show');

          gamepads.forEach((gamepad) => {
            var span = document.createElement('span');
            span.classList.add('connected');
            
            gamepadsList.appendChild(span);
            gamepadIndicators.push(span);
          });

          var currentGamepadIndicator = gamepadIndicators[gamepads.indexOf(paddle.inputComponent.gamepad)];
          currentGamepadIndicator.classList.add('in-use');

          var gamepadInputWaitInterval;
          function waitForGamepadInput (gamepadInputWaitType) {
            var action = currentControlEditing.getAttribute('data-name');
            gamepadInputWaitInterval = setInterval(() => {

              // See input.js for weirdness about needing to call this function each frame
              GamepadManager.refreshGamepads();

              var gamepad = paddle.inputComponent.gamepad;

              if (gamepadInputWaitType === 'button') {
                for (var i = 0; i < gamepad.buttons.length; ++i) {
                  if (gamepad.buttons[i].pressed) {
                    // Get rid of any keys that were pointing to this action already
                    paddle.inputComponent.clearMappingForAction(action);

                    // Save a new key for this action (e.g. key: KeyW => action: 'up')
                    paddle.inputComponent.setMappingForAction(action, gamepadInputMappings[gamepad.mapping].buttons[i]);

                    // Needs to be refreshed for reverse lookup again
                    keyActionMap = paddle.inputComponent.getInverseActionMapping();
                    
                    localStorage.setItem('paddle' + currentPlayer + 'KeyboardActionMapping',
                      JSON.stringify(paddle.inputComponent.actionMapping));

                    clearInterval(gamepadInputWaitInterval);
                    stopEditingCurrentControl();
                    if (controlQueue.length > 0) {

                      // TODO: Tighten this up
                      setTimeout(function () {
                        startEditingControl(controlQueue.shift());  
                      }, 500);
                    }
                  }
                }
              }
              else if (gamepadInputWaitType === 'analog') {
                // TODO: This might need to be a "difference" rather than a magnitude from 0, since
                // analog sticks tend to drift.

                // check axes
                for (var i = 0; i < gamepad.axes.length; ++i) {
                  var axisValue = gamepad.axes[i];
                  // axisThreshol from input.js
                  if (Math.abs(axisValue) > axisThreshold) {
                    // Get rid of any keys that were pointing to this action already
                    paddle.inputComponent.clearMappingForAction(action);

                    // Save a new key for this action (e.g. key: KeyW => action: 'up')
                    paddle.inputComponent.setMappingForAction(action, gamepadInputMappings[gamepad.mapping].axes[i]);

                    // Needs to be refreshed for reverse lookup again
                    keyActionMap = paddle.inputComponent.getInverseActionMapping();
                    
                    localStorage.setItem('paddle' + currentPlayer + 'KeyboardActionMapping',
                      JSON.stringify(paddle.inputComponent.actionMapping));

                    clearInterval(gamepadInputWaitInterval);
                    stopEditingCurrentControl();
                    if (controlQueue.length > 0) {

                      // TODO: Tighten this up
                      setTimeout(function () {
                        startEditingControl(controlQueue.shift());  
                      }, 500);
                    }
                  }
                }  
              }
            }, 50);

          }

          function onKeyDownWhileEditing (e) {
            // Abort! Bail! Ahhhh!
            if (e.code === 'Escape') {
              controlQueue = [];
              stopEditingCurrentControl();
              window.removeEventListener('keydown', onKeyDownWhileEditing);
            }
          }

          function startEditingControl (container) {
            currentControlEditing = container;
            currentControlKeyEditing = currentControlEditing.querySelector('.control-key');
            currentControlKeyEditing.innerHTML = '';
            currentControlKeyEditing.classList.add('editing');
            waitForGamepadInput(currentControlEditing.getAttribute('data-type'));
            window.addEventListener('keydown', onKeyDownWhileEditing);
          }

          function stopEditingCurrentControl () {
            if (currentControlEditing) {
              var key = keyActionMap[currentControlEditing.getAttribute('data-name')];

              currentControlKeyEditing.classList.remove('editing');
              currentControlEditing = null;

              populate();
            }
            window.removeEventListener('keydown', onKeyDownWhileEditing);
          }

          function onControlContainerClick (e) {
            var container = e.target.parentNode;

            if (currentControlEditing !== container) {
              if (currentControlEditing) {
                controlQueue = [];
                stopEditingCurrentControl();
              }
              startEditingControl(container);
            }            

          }

          function onSetAllButtonClicked() {
            controlQueue = Array.prototype.slice.call(playerControls.querySelectorAll('li[data-name]'));
            startEditingControl(controlQueue.shift());
          }

          function populate() {
            paddleActions.forEach((action) => {
              var container = playerControls.querySelector('li[data-name="' + action + '"]');

              if (container) {
                var controlKey = container.querySelector('.control-key');

                if (paddle.inputComponent) {
                  controlKey.innerHTML = keyActionMap[action] || '???';
                }
              }            
            });
          }

          // TODO: It's not cool that paddleActions is so global
          // Buttons first
          paddleActions.forEach((action) => {
            var container = playerControls.querySelector('li[data-name="' + action + '"]');
            if (container) {
              var controlKey = container.querySelector('.control-key');
              container.addEventListener('click', onControlContainerClick);
            }
          });

          populate();

          setAllButton.addEventListener('click', onSetAllButtonClicked);

          return {
            destroy: function () {
              gamepadsList.innerHTML = '';
              playerControls.classList.remove('show');
              stopEditingCurrentControl(); 
              setAllButton.removeEventListener('click', onSetAllButtonClicked);

              paddleActions.forEach((action) => {
                var container = playerControls.querySelector('li[data-name="' + action + '"]');

                if (container) {
                  container.removeEventListener('click', onControlContainerClick);
                }
              });
            }
          }
        }
      };

      function activateInputLogician (type) {
        if (activeLogician)
          activeLogician.destroy();

        activeLogician = new inputLogicians[type]();
      }

      function setInputMode(mode) {
        var paddle = paddles[currentPlayer];

        if (mode === 'gamepad') {
          var actionMapping = JSON.parse(localStorage.getItem('paddle' + currentPlayer + 'GamepadActionMapping'));
          var nextGamepad = GamepadManager.getUnusedGamepad();
          paddle.setInputComponent(createGamepadInputComponent(nextGamepad, actionMapping));
          localStorage.setItem('paddle' + currentPlayer + 'InputType', 'gamepad');
          activateInputLogician('gamepad');
        }
        else if (mode === 'keyboard') {
          var actionMapping = JSON.parse(localStorage.getItem('paddle' + currentPlayer + 'KeyboardActionMapping'));
          paddle.setInputComponent(createKeyboardInputComponent(actionMapping));
          localStorage.setItem('paddle' + currentPlayer + 'InputType', 'keyboard');
          activateInputLogician('keyboard');
        }
      }

      function onInputSwitcherChanged() {
        if (inputSwitcher.checked === true) {
          setInputMode('gamepad');
        }
        else {
          setInputMode('keyboard');
        }
      }

      function showPlayer(number) {
        currentPlayer = number;
        playerNumber.innerHTML = currentPlayer + 1;

        var paddle = paddles[currentPlayer];

        // Gamepad
        if (paddle.inputComponent.type === 'gamepad') {
          inputSwitcher.checked = true;
          activateInputLogician('gamepad');
        }

        // Keyboard
        else {
          inputSwitcher.checked = false;
          activateInputLogician('keyboard');
        }

        checkGamepads();
      }

      function doneButtonClicked() {
        doneButton.removeEventListener('click', doneButtonClicked);
        hideMenu();
      }

      doneButton.addEventListener('click', doneButtonClicked);
      inputSwitcher.addEventListener('change', onInputSwitcherChanged);

      function nextPlayer() {
        showPlayer((currentPlayer + 1) % numPlayers);
      }

      function lastPlayer() {
        showPlayer((((currentPlayer - 1) % numPlayers) + numPlayers) % numPlayers);
      }


      function checkGamepads() {
        if (GamepadManager.getUnusedGamepad()) {
          // Disable the gamepad switch
          inputSwitcherContainer.classList.remove('disabled');
          inputSwitcher.disabled = false;
        }
        else {
          // Enable the gamepad switch
          inputSwitcherContainer.classList.add('disabled');
          inputSwitcher.disabled = true;
        }
      }

      function onInputComponentChanged(e) {
        var player = paddles.indexOf(e.detail.object);
        if (player > -1 && player === currentPlayer) {
          console.log(e.detail, 'yay!');
        }
      }

      showPlayer(0);

      // gamepadconnected event doesn't fire reliably in chrome, so using this...
      var gamepadCheckInterval = setInterval(function () {
        checkGamepads();
      }, 1000);

      window.addEventListener('gamepaddisconnected', checkGamepads);
      document.addEventListener('inputcomponentchanged', onInputComponentChanged);

      this.close = function () {
        clearInterval(gamepadCheckInterval);
        activeLogician && activeLogician.destroy();
        doneButton.removeEventListener('click', doneButtonClicked);
        rightSwitcher.removeEventListener('click', nextPlayer);
        leftSwitcher.removeEventListener('click', lastPlayer);
        inputSwitcher.removeEventListener('change', onInputSwitcherChanged);
        window.removeEventListener('gamepaddisconnected', checkGamepads);
        document.removeEventListener('inputcomponentchanged', onInputComponentChanged);
      };
    }
  };

  function showSection (section) {
    var sectionName = section.getAttribute('data-name');

    if (activeSection) {
      hideActiveSection();
    }

    activeSection = section;
    activeSection.classList.add('show');

    if (sectionLogic[sectionName]) {
      activeSectionDriver = new sectionLogic[sectionName]();
    }
  }

  function hideActiveSection () {
    if (activeSection) {
      var sectionName = activeSection.getAttribute('data-name');
      activeSection.classList.remove('show');

      if (activeSectionDriver && activeSectionDriver.close) {
        activeSectionDriver.close();
      }

      activeSection = null;
    }
  }

  function showMenu() {
    showSection(mainSection);

    game.pause();
    
    document.removeEventListener('keydown', onKeyDownWhileWaiting);
    headerTitle.removeEventListener('click', onHeaderClickWhileWaiting);
    menuWrapper.classList.add('show');
    header.classList.remove('show');
  }

  function hideMenu() {
    hideActiveSection();

    document.addEventListener('keydown', onKeyDownWhileWaiting);
    headerTitle.addEventListener('click', onHeaderClickWhileWaiting);
    menuWrapper.classList.remove('show');
    header.classList.add('show');

    game.run();
  }

  function onHeaderClickWhileWaiting (e) {
    showMenu();
  }

  function onKeyDownWhileWaiting (e) {
    // User pressed ESC
    if (e.keyCode === 27) {
      showMenu();
    }
  }

  var machine = {
    waitToBeSummoned: function () {

      headerTitle.addEventListener('click', onHeaderClickWhileWaiting);
      document.addEventListener('keydown', onKeyDownWhileWaiting);
    },
    show: function () {
      showMenu();
    },
    hide: function () {
      hideMenu();
    }
  };

  return machine;

};