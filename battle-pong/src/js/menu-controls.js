let buttons;
let selectedButton;
let selectedIndex;

const setupInputButtons = (rulesManager) => {
  
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

  gamepadManager.onGamepadButtonDown('dPadDown', function () {
    moveCursor('down');
  });

  gamepadManager.onGamepadButtonDown('dPadUp', function () {
    moveCursor('up');
  });

  gamepadManager.onGamepadButtonDown(['start', 'home'], function () {
    if (rulesManager) {
      rulesManager.toggleRules();
    }
    else {
      moveCursor('go');
    }
  });

  gamepadManager.onGamepadButtonDown(['actionUp', 'actionDown', 'actionLeft', 'actionRight'], function () {
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

  selectButtonByDirection(selectedButton, direction);

  if (direction === 'go' && selectedButton) {
    if(selectedButton) {
      selectedButton.click();
    }
  }
}

// Returns the center coordinates of a button
const getCenter = el => {
  let rect = el.getBoundingClientRect();
  return {
    x : Math.floor(rect.left + rect.width / 2),
    y : Math.floor(rect.top + rect.height / 2)
  }
}

// Returns an array of possible buttons that are in the desired
// direction from the base button. And at least a range of of
// maximum value on the opposite axis.
// Also returns these buttons along with a distance from the current button.
const getOptions = (baseCenter, buttons, direction, axisRange) => {
  let options = [];
  let maxOppositeAxisRange = axisRange || 75;

  buttons.forEach(button => {
    let center = getCenter(button);
    let conditionMet = false;

    if(direction === "down" 
        && center.y > baseCenter.y
        && Math.abs(center.x - baseCenter.x) < maxOppositeAxisRange) {
      conditionMet = true;
    }

    if(direction === "up" 
        && center.y < baseCenter.y
        && Math.abs(center.x - baseCenter.x) < maxOppositeAxisRange) {
      conditionMet = true;
    }

    if(direction === "left" 
        && center.x < baseCenter.x
        && Math.abs(center.y - baseCenter.y) < maxOppositeAxisRange) {
      conditionMet = true;
    }

    if(direction === "right" 
        && center.x > baseCenter.x
        && Math.abs(center.y - baseCenter.y) < maxOppositeAxisRange) {
      conditionMet = true;
    }
    
    if(conditionMet) {
      options.push({
        el: button,
        delta: Math.sqrt(Math.pow((center.x - baseCenter.x), 2) + Math.pow((center.y - baseCenter.y), 2))
      });
    }
  });

  return options;
}

// Selects a button closest to thisButton for a given Direction
const selectButtonByDirection = (thisButton, direction) => {

  let thisButtonCenter = getCenter(thisButton);
  let options = [];
  
  let maxRange = 200;
  let range = 75;

  while(options.length === 0 && range < maxRange) {
    options = getOptions(thisButtonCenter, buttons, direction, range);
    range = range + 25;
  }

  if(options.length === 0) {
    return;
  }

  let minDistance = false;
  let closestButton;
  
  // Finds the closets button in absolute terms
  // from the range of possible buttons.  
  options.forEach(option => {
    if(!minDistance){
      minDistance = option.delta;
      closestButton = option.el;
    }
    if(option.delta < minDistance) {
      minDistance = option.delta;
      closestButton = option.el;
    }
  });

  selectButtonEl(closestButton);
}

const selectButtonEl = el => {
  deselectAllButtons();
  selectedIndex = buttons.indexOf(el);
  selectedButton = el;
  el.classList.add('input-selected');
}

const selectButtonByIndex = num => {
  deselectAllButtons();
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
