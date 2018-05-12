(function () {
  const actionEnvelopes = {
    left: {
      active: 10
    },
    right: {
      active: 10
    },
    down: {
      active: 10
    },
    up: {
      active: 10
    },
    spinCounterClockwise: {
      active: 50
    },
    spinClockwise: {
      active: 50
    }
  };

  const halfPI = Math.PI / 2;

  const runningModes = ['running', 'finish'];

  function ActionManager () {
    let activeActions = {};

    this.update = function (actions) {
      let currentTime = Date.now();

      Object.keys(activeActions).forEach(k => {
        if (actionEnvelopes[k] && currentTime - activeActions[k].lastFire > actionEnvelopes[k].active) {
          delete activeActions[k];
        }
        actions[k] = 1;
      });
    };

    this.check = function (action) {
      return action in activeActions;
    };

    this.fire = function (action) {
      let currentTime = Date.now();

      activeActions[action] = activeActions[action] || {
        lastFire: currentTime
      };
    };
  }

  function getDistanceFromPointToLine(point, linePoint1, linePoint2) {
    // From https://bobobobo.wordpress.com/2008/01/07/solving-linear-equations-ax-by-c-0/
    // and https://math.stackexchange.com/questions/1570498/distance-between-point-and-line-in-point-slope-form-on-a-plane

    let x1 = linePoint1.x;
    let x2 = linePoint2.x;
    let y1 = linePoint1.y;
    let y2 = linePoint2.y;

    // (y1 – y2)x + (x2 – x1)y + (x1y2 – x2y1) = 0
    let A = y1 - y2;
    let B = x2 - x1;
    let C = x1*y2 - x2*y1;

    // "perpendicular distance" formula
    return Math.abs(A*point.x + B*point.y+C) / Math.sqrt(A*A + B*B);
  }

  window.AIManager = function (game, physicsEngine) {
    let ballBody = null;

    this.createPaddleAIInputComponent = function (paddle, playerSide) {
      const debugOutput = document.querySelector('#aidebug .' + playerSide);

      const directionMultiplier = (playerSide === 'left' ? 1 : -1);
      const idealDistanceFromBall = -10 * directionMultiplier;
      const ySafeDistanceFromRest = 15;
      const attackDistanceX = 25;
      const otherPlayerSide = (playerSide === 'left' ? 'right' : 'left');
      const upAttackAction = (playerSide === 'left' ? 'spinClockwise' : 'spinCounterClockwise');
      const downAttackAction = (playerSide === 'left' ? 'spinCounterClockwise' : 'spinClockwise');

      const restingXPosition = (playerSide === 'left' ? game.boardWidth / 4 : game.boardWidth * 3 / 4);

      const paddleBody = paddle.physics;

      const restingGameModes = ['pregame', 'roundover'];

      const paddleWidth = Math.sqrt(
        (paddleBody.vertices[1].x - paddleBody.vertices[2].x) * (paddleBody.vertices[1].x - paddleBody.vertices[2].x) + 
        (paddleBody.vertices[1].y - paddleBody.vertices[2].y) * (paddleBody.vertices[1].y - paddleBody.vertices[2].y));

      let stupidityProbability = Settings['aiStupidity' + (playerSide === 'left' ? 1 : 2)];

      let actionManager = new ActionManager();
      let currentState = 'getCloseToBall';

      function sampleStupidity () {
        return Math.random() <= stupidityProbability;
      }

      function setupLeftPaddleStuff () {
        abilities.straightenUp = () => {
          let fixedBodyAngle = Math.abs(paddle.targetAngle % Math.PI);

          if (Math.abs(fixedBodyAngle - halfPI) < 0.001) {
            actionManager.fire('spinClockwise');
          }
        };

        abilities.moveToTerrainCenter = () => {
          let xPosition = paddleBody.position.x;
          let yPosition = paddleBody.position.y;
          
          // Head back to the vertical center
          if (yPosition < game.boardHeight / 2 - ySafeDistanceFromRest) actionManager.fire('down');
          if (yPosition > game.boardHeight / 2 + ySafeDistanceFromRest) actionManager.fire('up');;

          let diff = Math.abs(xPosition - restingXPosition);

          // Head back to the horizontal center
          if (xPosition > restingXPosition && diff > 50) {
            actionManager.fire('left');
          }
          else if (xPosition < restingXPosition && diff > 50) {
            actionManager.fire('right');
          }
        };

        states.getReadyForNextRound = actions => {
          if (game.mode === 'roundover') {
            abilities.moveToTerrainCenter();
            abilities.straightenUp();
          }
          else {
            currentState = 'getCloseToBall';
          }
        };
      }

      function setupRightPaddleStuff () {
        abilities.straightenUp = () => {
          let fixedBodyAngle = Math.abs(paddle.targetAngle % Math.PI);

          if (Math.abs(fixedBodyAngle - halfPI) < 0.001) {
            actionManager.fire('spinCounterClockwise');
          }
        };

        states.getReadyForNextRound = actions => {
          let xPosition = paddleBody.position.x;
          let yPosition = paddleBody.position.y;

          if (game.mode === 'roundover') {

            // Head back to the vertical center
            if (yPosition < game.boardHeight / 2 - ySafeDistanceFromRest) actionManager.fire('down');
            if (yPosition > game.boardHeight / 2 + ySafeDistanceFromRest) actionManager.fire('up');

            let diff = Math.abs(xPosition - restingXPosition);

            // Head back to the horizontal center
            if (xPosition < restingXPosition && diff > 50) {
              actionManager.fire('right');
            }
            else if (xPosition > restingXPosition && diff > 50) {
              actionManager.fire('left');
            }

            abilities.straightenUp();
          }
          else {
            currentState = 'getCloseToBall';
          }
        };
      }

      const abilities = {
        swingAtBall: () => {
          if (sampleStupidity()) return;

          // Calculate the distance from each of the longer sides of the paddle to the ball. This is done by extrapolating the
          // line generated from the two vertices that make up each side of the paddle. Careful: if the distance reported is small
          // it could be because the ball is actually in range, or because the ball is close to the *extrapolated* line.
          // Use averageDistanceToBall to fix this, by making sure the vector to the ball is reasonably small first.
          let side1Distance = getDistanceFromPointToLine(ballBody.position, paddleBody.vertices[1], paddleBody.vertices[2]);
          let side2Distance = getDistanceFromPointToLine(ballBody.position, paddleBody.vertices[0], paddleBody.vertices[3]);

          // Pick the shortest one
          let shortestDistanceToBall = Math.min(side1Distance, side2Distance);

          // If the ball is close to one of the sides, attack!
          if (shortestDistanceToBall < attackDistanceX) {

            // TODO: better choose a paddle side to swing from
            if (actionManager.check('up')) actionManager.fire(upAttackAction);
            if (actionManager.check('down')) actionManager.fire(downAttackAction);
          }
        },
        pursueBallX: () => {
          let idealPositionX = ballBody.position.x + idealDistanceFromBall;

          // Find out how far away the paddle is from the ideal position behind the ball
          // Multiply by directionMultiplier to accommodate left/right player
          let xDistanceFromIdeal = (paddleBody.position.x - idealPositionX) * directionMultiplier;

          // If the distance is more than we need,...
          if (xDistanceFromIdeal > 0) {
            // Head toward the ball by telling the paddle to move in whichever direction is appropriate (playerSide)
            actionManager.fire(playerSide);
          }
          else {
            actionManager.fire(otherPlayerSide); 
          }
        },
        pursueBallY: () => {
          // Try to track the ball's y position as closely as possible
          if (paddleBody.position.y < ballBody.position.y) actionManager.fire('down');
          if (paddleBody.position.y > ballBody.position.y) actionManager.fire('up');
        }
      };

      const states = {

        // While the game isn't really doing anything, there's no real input to respond to, so just chill
        waitForGameToResume: actions => {
          if (runningModes.indexOf(game.mode) > -1) {
            currentState = 'getCloseToBall';
          }
        },

        getCloseToBall: actions => {
          if (sampleStupidity()) return;

          abilities.pursueBallY();
          abilities.pursueBallX();

          // See what the distance from the center of paddle to the center of ball is
          let averageDistanceToBall = Math.sqrt(
            (paddleBody.position.x - ballBody.position.x) * (paddleBody.position.x - ballBody.position.x) + 
            (paddleBody.position.y - ballBody.position.y) * (paddleBody.position.y - ballBody.position.y));

          // If the paddle is within 2 attackDistances in general, it might be worth swinging it...
          if (averageDistanceToBall < paddleWidth) {
            abilities.swingAtBall();
          }
          else {
            abilities.straightenUp();
          }
        }
      };

      if (playerSide === 'left')
        setupLeftPaddleStuff();
      else
        setupRightPaddleStuff();

      return {
        actions: {},
        update: function () {
          let actions = {};

          if (!ballBody) return actions;

          if (game.mode === 'roundover') {
            currentState = 'getReadyForNextRound';
          }
          else if (runningModes.indexOf(game.mode) === -1) {
            currentState = 'waitForGameToResume';
          }

          states[currentState](actions);
          actionManager.update(actions);

          // debugOutput.textContent = currentState;

          return actions;
        },
        register: function (actions) {
          this.actions = actions;
        },
        remove: function () {
        }
      };
    };

    this.setBall = ball => {
      ballBody = ball.physics;
    };

  };

})();