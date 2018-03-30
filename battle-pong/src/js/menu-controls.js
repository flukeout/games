let buttons;
let selectedButton;
let selectedIndex;

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

 

  // if (direction === 'right') {
  //   selectedIndex++;
  //   if(selectedIndex >= buttons.length) {
  //     selectedIndex = 0;
  //   }
  //   deselectAllButtons();
  // }

  findButton(selectedButton, direction);
//   if (direction === 'down') {
//     findButton(selectedButton, 'down');
//   }

//   if (direction === 'up') {
//     findButton(selectedButton, 'up');
//   }

// if (direction === 'left') {
//     findButton(selectedButton, 'left');
//   }

  // if (direction === 'left') {
  //   selectedIndex--;
  //   if(selectedIndex < 0) {
  //     selectedIndex = buttons.length - 1;
  //   }
  //   deselectAllButtons();
  // }

  

  selectedButton = buttons[selectedIndex];
  selectedButton.classList.add('input-selected');

  if (direction === 'go' && selectedButton) {
    if(selectedButton) {
      selectedButton.click();
      addTemporaryClassName(selectedButton, "poke", 250);
    }
  }
}

const getCenter = el => {
  let rect = el.getBoundingClientRect();
  return {
    x : Math.floor(rect.left + rect.width / 2),
    y : Math.floor(rect.top + rect.height / 2)
  }
}

const getOptions = (baseCenter, buttons, direction) => {
  let options = [];

  buttons.forEach(button => {
    let center = getCenter(button);
    let conditionMet = false;

    if(direction === "down" 
        && center.y > baseCenter.y
        && Math.abs(center.x - baseCenter.x) < 75) {
      conditionMet = true;
    }

    if(direction === "up" 
        && center.y < baseCenter.y
        && Math.abs(center.x - baseCenter.x) < 75) {
      conditionMet = true;
    }

    if(direction === "left" 
        && center.x < baseCenter.x
        && Math.abs(center.y - baseCenter.y) < 75) {
      conditionMet = true;
    }

    if(direction === "right" 
        && center.x > baseCenter.x
        && Math.abs(center.y - baseCenter.y) < 75) {
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

let lowestY;
let highestY;

const findButton = (thisButton, direction) => {

  let thisCenter = getCenter(thisButton);
  let options = getOptions(thisCenter, buttons, direction);

  if(options.length == 0) {
    return;
  }

  let minDistance = false;
  let closestButton;

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
