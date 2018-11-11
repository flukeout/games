let buttons;
let selectedButton;
let selectedIndex;

const keyDownListener = e => {

  let map = {
    ArrowRight: 'right',
    ArrowLeft: 'left',
    ArrowUp: 'up',
    ArrowDown: 'down',
    Enter: 'go',
  };

  map[e.key] && moveCursor(map[e.key]);
}

const setupInputButtons = (ignoreStartButton) => {

  buttons = Array.prototype.slice.call(document.querySelectorAll('.gamepad-button'));

  buttons.forEach(button => {
    button.onmouseover = e => {
      buttons.forEach(otherButton => {
        otherButton.classList.remove('input-selected');
      });
    };
  });

  let gamepadManager = new InputManager.GamepadEventManager();

  let buttonListeners = {
    left: () => { moveCursor('left'); },
    right: () => { moveCursor('right'); },
    down: () => { moveCursor('down'); },
    up: () => { moveCursor('up'); },
    start: () => {
      if (!ignoreStartButton) {
        moveCursor('go');
      }
    },
    go: () => { moveCursor('go'); }
  };

  gamepadManager.addButtonListener('dPadLeft', 'down', buttonListeners.left);
  gamepadManager.addButtonListener('dPadRight', 'down', buttonListeners.right);
  gamepadManager.addButtonListener('dPadDown', 'down', buttonListeners.down);
  gamepadManager.addButtonListener('dPadUp', 'down', buttonListeners.up);
  gamepadManager.addButtonListener(['start', 'home'], 'down', buttonListeners.start);
  gamepadManager.addButtonListener(['actionUp', 'actionDown', 'actionLeft', 'actionRight'], 'down', buttonListeners.go);

  gamepadManager.start();

  // Pause right away to prevent this from interfering with anything else
  gamepadManager.pause();

  // Remove any previous keydown listeners we have attached
  window.removeEventListener("keydown", keyDownListener);
  window.addEventListener("keydown", keyDownListener);

  return {
    clearSelectedButton: () => {
      selectedButton = null;
    },
    disconnect: () => {
      gamepadManager.pause();
    },
    connect: () => {
      gamepadManager.resume();
    }
  };
}

function moveCursor(direction) {
  if(!selectedButton) {
    return;
  }

  selectButtonByDirection(selectedButton, direction);

  SoundManager.playSound('Menu_Move');

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



// Selects a button closest to thisButton for a given Direction
const selectButtonByDirection = (thisButton, direction) => {

  let thisButtonCenter = getCenter(thisButton);
  let col = parseInt(thisButton.getAttribute("col"));
  let row = parseInt(thisButton.getAttribute("row"));
  let nextRow, nextCol;


  let allButtons = []; // Visible buttons
  let allButtonEls = document.querySelectorAll("[row][col]");

  allButtonEls.forEach( el => {
    if(el.offsetParent) {
      allButtons.push(el);
    }
  });

  // Get the number of rows
  let rows = [];

  allButtons.forEach( el => { 
    let row = parseInt(el.getAttribute("row"));
    if(rows.indexOf(row) < 0) {
      rows.push(row);
    }
  });

  let numRows = Math.max(...rows);

  let rowButtons = [];

  allButtons.forEach(el => {
    if(parseInt(el.getAttribute("row")) === row) {
      rowButtons.push(el);
    }
  });

  if(direction == "right" || direction == "left") {
    if(direction === "right") {
      if(col < rowButtons.length) {
        nextRow = row;
        nextCol = col + 1;
      } else {
        nextRow = row;
        nextCol = 1;
      }
    }

    if(direction === "left") {
      if(col > 1) {
        nextRow = row;
        nextCol = col - 1;
      } else {
        nextRow = row;
        nextCol = rowButtons.length;
      }
    }

    allButtons.forEach(el => {
      if(parseInt(el.getAttribute("row")) === nextRow
      && parseInt(el.getAttribute("col")) === nextCol) {
          selectButtonEl(el);
      }
    });

  } // End of "left" & "right" directions

  if(direction === "up" || direction === "down") {

    let thisIndex = rows.indexOf(row);

    if(direction === "down") {
      if(rows.indexOf(row) + 1 < rows.length) {
        row = rows[thisIndex + 1];
      } else {
        row = rows[0];
      }
    }

    if(direction === "up") {
      if(rows.indexOf(row) === 0) {
        row = rows[rows.length - 1];
      } else {
        row = rows[thisIndex - 1];
      }
    }

    let nextRowButtons = []

    allButtons.forEach(el => {
      if(parseInt(el.getAttribute("row")) === row) {
        nextRowButtons.push(el);
      }
    });

    let closestButton = false;
    let delta = 9999999;

    nextRowButtons.forEach(button => {
      let xDelta = Math.abs(thisButtonCenter.x - getCenter(button).x)
      if( xDelta < delta) {
        closestButton = button;
        delta = xDelta;
      }
    });

    selectButtonEl(closestButton);
  } // End of "up" & "down" directions
  
}

const selectButtonEl = el => {
  deselectAllButtons();
  selectedButton = el;
  el.classList.add('input-selected');
}

const selectButtonByRowCol = (row,col) => {
  deselectAllButtons();
  selectedButton = document.querySelector(`[row='${row}'][col='${col}']`);
  selectedButton.classList.add('input-selected');
}

const selectButtonBySelector = selector => {
  deselectAllButtons();
  selectedButton = document.querySelector(selector);
  selectedButton.classList.add('input-selected');
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
