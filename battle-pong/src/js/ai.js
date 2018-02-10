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

    return Math.abs(A*point.x + B*point.y+C) / Math.sqrt(A*A + B*B);
  }

  window.AIManager = function (physicsEngine) {
    let ballBody = null;

    this.createPaddleAIInputComponent = function (paddle, playerSide) {
      const directionMultiplier = (playerSide === 'left' ? 1 : -1);
      const idealDistanceFromBall = -10 * directionMultiplier;
      const attackDistance = 25;
      const fallbackDistance = 5;
      const otherPlayerSide = (playerSide === 'left' ? 'right' : 'left');
      const safeDistanceFromBall = 30;
      const upAttackAction = (playerSide === 'left' ? 'spinClockwise' : 'spinCounterClockwise');
      const downAttackAction = (playerSide === 'left' ? 'spinCounterClockwise' : 'spinClockwise');

      const states = {
        getBehindBall: actions => {
          let idealPosition = {x: ballBody.position.x + idealDistanceFromBall, y: ballBody.position.y};

          if (paddleBody.position.y > idealPosition.y) actions.down = 1;
          if (paddleBody.position.y > idealPosition.y) actions.up = 1;

          let xDistanceFromIdeal = (paddleBody.position.x - idealPosition.x) * directionMultiplier;

          if (xDistanceFromIdeal > 0) {
            actions[playerSide] = 1;
          }
          else {
            currentState = 'attackBall';
          }        
        },
        attackBall: actions => {
          if (paddleBody.position.y < ballBody.position.y) actions.down = 1;
          if (paddleBody.position.y > ballBody.position.y) actions.up = 1;

          let xDistanceFromBall = paddleBody.position.x - ballBody.position.x;
          let yDistanceFromBall = paddleBody.position.x - ballBody.position.x;
          let distanceFromBall = Math.sqrt(xDistanceFromBall*xDistanceFromBall + yDistanceFromBall*yDistanceFromBall);

          let xSideOfBall = paddleBody.position.x < ballBody.position.x ? 1 : -1;

          let side1Distance = getDistanceFromPointToLine(ballBody.position, paddleBody.vertices[1], paddleBody.vertices[2]);
          let side2Distance = getDistanceFromPointToLine(ballBody.position, paddleBody.vertices[0], paddleBody.vertices[3]);
          let shortestDistanceToBall = Math.min(side1Distance, side2Distance);

          let fixedBodyAngle = Math.abs(paddleBody.angle % Math.PI);

          if (shortestDistanceToBall < attackDistance) {
            if (actions.up) actions[upAttackAction] = 1;
            if (actions.down) actions[downAttackAction] = 1;            
          }
          else {
            if (xSideOfBall === directionMultiplier) {
              actions[otherPlayerSide] = 1;

              if (fixedBodyAngle === halfPI) {
                if (actions.up) actions[upAttackAction] = 1;
                if (actions.down) actions[downAttackAction] = 1;
              }
            }
            else {
              currentState = 'getBehindBall';
            }
          }
        }
      };

      const paddleBody = paddle.physics;

      let currentState = 'getBehindBall';

      return {
        actions: {},
        update: function () {
          let actions = {};

          if (!ballBody) return actions;

          states[currentState](actions);

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