(function () {

  const halfPI = Math.PI / 2;

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
      const debugOutput = document.querySelector('#aidebug');

      const directionMultiplier = (playerSide === 'left' ? 1 : -1);
      const idealDistanceFromBall = -10 * directionMultiplier;
      const attackDistance = 25;
      const fallbackDistance = 5;
      const otherPlayerSide = (playerSide === 'left' ? 'right' : 'left');
      const upAttackAction = (playerSide === 'left' ? 'spinClockwise' : 'spinCounterClockwise');
      const downAttackAction = (playerSide === 'left' ? 'spinCounterClockwise' : 'spinClockwise');
      const ySafeDistanceFromRest = 15;

      const restingXPosition = (playerSide === 'left' ? game.boardWidth / 4 : game.boardWidth * 3 / 4);

      const paddleBody = paddle.physics;

      const restingGameModes = ['pregame', 'roundover'];

      const paddleWidth = Math.sqrt(
        (paddleBody.vertices[1].x - paddleBody.vertices[2].x) * (paddleBody.vertices[1].x - paddleBody.vertices[2].x) + 
        (paddleBody.vertices[1].y - paddleBody.vertices[2].y) * (paddleBody.vertices[1].y - paddleBody.vertices[2].y));

      // TODO: add a "stupidity" factor

      const states = {

        // While the game isn't really doing anything, there's no real input to respond to, so just chill
        waitForGameToResume: actions => {
          let xPosition = paddleBody.position.x;
          let yPosition = paddleBody.position.y;
          let fixedBodyAngle = Math.abs(paddle.targetAngle % Math.PI);

          if (restingGameModes.indexOf(game.mode) > -1) {

            // Head back to the vertical center
            if (yPosition < game.boardHeight / 2 - ySafeDistanceFromRest) actions.down = 1;
            if (yPosition > game.boardHeight / 2 + ySafeDistanceFromRest) actions.up = 1;

            // Head back to the horizontal center
            if (playerSide === 'left' && xPosition > restingXPosition) {
              actions.left = 1;
            }
            else if (playerSide === 'right' && xPosition < restingXPosition) {
              actions.right = 1;
            }

            // Right yourself again
            if (fixedBodyAngle === halfPI) {
              if (actions.up) actions[upAttackAction] = 1;
              if (actions.down) actions[downAttackAction] = 1;
            }
          }
          else {
            currentState = 'getBehindBall';
          }
        },
        getBehindBall: actions => {
          // The ideal position behind the ball is just far enough away to attack!
          let idealPosition = {x: ballBody.position.x + idealDistanceFromBall, y: ballBody.position.y};

          // Try to track the ball's y position as closely as possible
          if (paddleBody.position.y > idealPosition.y) actions.down = 1;
          if (paddleBody.position.y > idealPosition.y) actions.up = 1;

          // Find out how far away the paddle is from the ideal position behind the ball
          // Multiply by directionMultiplier to accommodate left/right player
          let xDistanceFromIdeal = (paddleBody.position.x - idealPosition.x) * directionMultiplier;

          // If the distance is more than we need,...
          if (xDistanceFromIdeal > 0) {
            // Head toward the ball by telling the paddle to move in whichever direction is appropriate (playerSide)
            actions[playerSide] = 1;
          }
          else {
            currentState = 'attackBall';
          }        
        },
        attackBall: actions => {
          // Try to track the ball's y position as closely as possible
          if (paddleBody.position.y < ballBody.position.y) actions.down = 1;
          if (paddleBody.position.y > ballBody.position.y) actions.up = 1;

          // See which side of the paddle the ball is on
          let xSideOfBall = paddleBody.position.x < ballBody.position.x ? 1 : -1;

          // Calculate the distance from each of the longer sides of the paddle to the ball. This is done by extrapolating the
          // line generated from the two vertices that make up each side of the paddle. Careful: if the distance reported is small
          // it could be because the ball is actually in range, or because the ball is close to the *extrapolated* line.
          // Use averageDistanceToBall to fix this, by making sure the vector to the ball is reasonably small first.
          let side1Distance = getDistanceFromPointToLine(ballBody.position, paddleBody.vertices[1], paddleBody.vertices[2]);
          let side2Distance = getDistanceFromPointToLine(ballBody.position, paddleBody.vertices[0], paddleBody.vertices[3]);

          // Pick the shortest one
          let shortestDistanceToBall = Math.min(side1Distance, side2Distance);

          // See what the distance from the center of paddle to the center of ball is
          let averageDistanceToBall = Math.sqrt(
            (paddleBody.position.x - ballBody.position.x) * (paddleBody.position.x - ballBody.position.x) + 
            (paddleBody.position.y - ballBody.position.y) * (paddleBody.position.y - ballBody.position.y));

          // If the paddle is within 2 attackDistances in general, and the ball is close to one of the sides, attack!
          if (averageDistanceToBall < paddleWidth && shortestDistanceToBall < attackDistance) {

            // TODO: pick a direction by buffering or something. If the ball is in the middle of the paddle,
            // it just freaks out by twitching back and forth instead of actually hitting in the ball.
            if (actions.up) actions[upAttackAction] = 1;
            if (actions.down) actions[downAttackAction] = 1;            
          }
          else {
            // If we're on the attack side of the ball...
            if (xSideOfBall === directionMultiplier) {
              actions[otherPlayerSide] = 1;

              // If we are sideways, be less sideways!
              let fixedBodyAngle = Math.abs(paddle.targetAngle % Math.PI);

              if (fixedBodyAngle === halfPI) {
                if (actions.up) actions[upAttackAction] = 1;
                if (actions.down) actions[downAttackAction] = 1;
              }
            }
            else {

              // TODO: use fallbackDistance so that it doesn't happen immediately
              currentState = 'getBehindBall';
            }
          }
        }
      };

      let currentState = 'getBehindBall';

      return {
        actions: {},
        update: function () {
          let actions = {};

          if (!ballBody) return actions;

          if (game.mode === 'roundover') {
            currentState = 'waitForGameToResume';
          }

          states[currentState](actions);

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