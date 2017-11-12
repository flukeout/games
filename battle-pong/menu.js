window.MenuMachine = function (game) {

  var menuWrapper = document.querySelector('.menu-wrapper');
  var header = document.querySelector('.header');
  var headerTitle = document.querySelector('.header .title');

  var sections = Array.prototype.slice.call(menuWrapper.querySelectorAll('section'));

  var mainSection = menuWrapper.querySelector('section[data-name="main"]');
  var activeSection = mainSection;

  var numPlayers = 2;

  function Section (sectionName, options) {
    this.sectionElement = menuWrapper.querySelector('section[data-name="' + sectionName + '"]')
    this.open = options.open || function () {};
    this.close = options.close || function () {};

    options.init && options.init.call(this);

    for (var key in options) {
      if (['open', 'close', 'init'].indexOf(key) === -1) {
        this[key] = options[key];
      }
    }
  }

  var sectionLogic = {
    main: new Section('main', {
      init: function () {
        Array.prototype.forEach.call(this.sectionElement.querySelectorAll('ul li[data-goto]'), function (menuListItem) {
          menuListItem.addEventListener('click', function () {
            var newMenuName = menuListItem.getAttribute('data-goto');
            if (newMenuName === 'exit') {
              hideMenu();
            }
            else {
              var newMenu = menuWrapper.querySelector('section[data-name="' + newMenuName + '"]');
              showSection(newMenu);
            }
          });
        });
      },
      onKeyDown: function (e) {
        // if (e.code === 'Escape') {
        //   window.removeEventListener('keydown', this.onKeyDown);
        //   hideMenu();
        // }
      },
      open : function () {
        // console.log('opening');
        // window.addEventListener('keydown', this.onKeyDown);
      },
      close: function () {
        // TODO: This event listening doesn't let go for some reason. Need to investigate to make it work.

        // console.log('closing', this.onKeyDown);
        // window.removeEventListener('keydown', this.onKeyDown);
      }
    }),
    controls: new Section('controls', {
      init: function () {
        this.playerIndicator = this.sectionElement.querySelector('.player-indicator');
        this.playerNumber = this.playerIndicator.querySelector('.player-number');
        this.leftSwitcher = this.playerIndicator.querySelector('.switcher[data-direction="left"]');
        this.rightSwitcher = this.playerIndicator.querySelector('.switcher[data-direction="right"]');

        this.inputSwitcher = this.playerIndicator.querySelector('.input-type');
        this.playerControls = this.sectionElement.querySelector('.player-controls');

        this.setAllButton = this.sectionElement.querySelector('button.set-all');
        this.doneButton = this.sectionElement.querySelector('button.done');

        this.rightSwitcher.addEventListener('click', () => {
          this.nextPlayer();
        });

        this.leftSwitcher.addEventListener('click', () => {
          this.lastPlayer();
        });
      },
      showPlayer: function (number) {
        this.currentPlayer = number;
        this.playerNumber.innerHTML = this.currentPlayer + 1;

        var paddle = paddles[this.currentPlayer];
        var keyActionMap = paddle.inputComponent.getInverseActionMapping();

        // For keeping track if we're editing a key now or not
        var currentControlEditing = null;
        var currentControlKeyEditing = null;

        var controlQueue = [];

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
          var key = keyActionMap[currentControlEditing.getAttribute('data-name')];


          currentControlKeyEditing.innerHTML = translateKey(key);
          currentControlKeyEditing.classList.remove('editing');
        }

        function onKeyDownWhileEditing (e) {
          var action = currentControlEditing.getAttribute('data-name');
          var key = e.code;

          paddle.inputComponent.setMappingForAction(action, key);

          // Needs to be refreshed for reverse lookup again
          keyActionMap = paddle.inputComponent.getInverseActionMapping();

          console.log(action, key, keyActionMap);

          stopEditingCurrentControl();
          window.removeEventListener('keydown', onKeyDownWhileEditing);

          if (controlQueue.length > 0) {
            startEditingControl(controlQueue.shift());
          }
        }


        // TODO: It's not cool that paddleActions is so global
        paddleActions.forEach((action) => {
          var container = this.playerControls.querySelector('li[data-name="' + action + '"]');
          var controlKey = container.querySelector('.control-key');

          container.addEventListener('click', () => {
            if (currentControlEditing !== container) {
              if (currentControlEditing) {
                stopEditingCurrentControl();
              }
              startEditingControl(container);
            }
          });

          if (paddle.inputComponent) {
            controlKey.innerHTML = translateKey(keyActionMap[action]);
          }
        });

        this.setAllButton.addEventListener('click', () => {
          controlQueue = Array.prototype.slice.call(this.playerControls.querySelectorAll('li[data-name]'));
          startEditingControl(controlQueue.shift());
        });

        this.doneButton.addEventListener('click', () => {
          hideMenu();
        });
      },
      nextPlayer: function () {
        this.showPlayer((this.currentPlayer + 1) % numPlayers);
      },
      lastPlayer: function () {
        this.showPlayer((((this.currentPlayer - 1)%numPlayers)+numPlayers)%numPlayers);
      },
      open: function () {
        this.showPlayer(0);
      },
      close: function () {
      }
    })
  };

  function showSection (section) {
    var sectionName = section.getAttribute('data-name');

    if (activeSection) {
      hideActiveSection();
    }

    activeSection = section;
    activeSection.classList.add('show');

    if (sectionLogic[sectionName]) {
      sectionLogic[sectionName].open();
    }
  }

  function hideActiveSection () {
    if (activeSection) {
      var sectionName = activeSection.getAttribute('data-name');
      activeSection.classList.remove('show');

      if (sectionLogic[sectionName]) {
        sectionLogic[sectionName].close();
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
    // header.classList.remove('show');
  }

  function hideMenu() {
    hideActiveSection();

    document.addEventListener('keydown', onKeyDownWhileWaiting);
    headerTitle.addEventListener('click', onHeaderClickWhileWaiting);
    menuWrapper.classList.remove('show');
    // header.classList.add('show');

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