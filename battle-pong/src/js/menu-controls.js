let buttons;
let selectedButton;
let selectedIndex;

const selectButton = num => {
  selectedIndex = num || 0;
  selectedButton = buttons[num];
  selectedButton.classList.add('input-selected');
}

const deselectAllButtons = () => {
  buttons.forEach(button => {
    button.classList.remove('input-selected');
  });
  selectedButton = false;
}

const setupInputButtons = defaultButtonNum => {
  
  buttons = Array.prototype.slice.call(document.querySelectorAll('.gamepad-button'));
  buttons.forEach(button => {
    button.onmouseover = e => {
      buttons.forEach(otherButton => {
        otherButton.classList.remove('input-selected');
      });
    };
  });

  let gamepadManager = new InputManager.GamepadEventManager();

  gamepadManager.onGamepadButtonDown('dPadLeft', function () {
    moveCursor('left');
  });

  gamepadManager.onGamepadButtonDown('dPadRight', function () {
    moveCursor('right');
  });

  gamepadManager.onGamepadButtonDown(['start', 'home', 'actionUp', 'actionDown', 'actionLeft', 'actionRight'], function () {
    moveCursor('go');
  });

  gamepadManager.connectAllGamepads();
  gamepadManager.start();

   window.addEventListener("keydown", function(e){
    let map = {
      ArrowRight: 'right',
      ArrowLeft: 'left',
      ArrowUp: 'up',
      ArrowDown: 'down',
      Enter: 'go',
    };

    map[e.key] && moveCursor(map[e.key]);
  });
}

function moveCursor(direction) {

  if(!selectedButton) {
    return;
  }

  if (direction === 'right') {
    selectedIndex++;
    if(selectedIndex >= buttons.length) {
      selectedIndex = 0;
    }
  }

  if (direction === 'left') {
    selectedIndex--;
    if(selectedIndex < 0) {
      selectedIndex = buttons.length - 1;
    }
  }

  deselectAllButtons();

  selectedButton = buttons[selectedIndex];
  selectedButton.classList.add('input-selected');

  if (direction === 'go' && selectedButton) {
    if(selectedButton) {
      selectedButton.click();
      addTemporaryClassName(selectedButton, "poke", 250);
    }
  }
}
