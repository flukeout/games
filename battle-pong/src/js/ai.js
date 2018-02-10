(function () {

  const halfPI = Math.PI / 2;

  window.AIManager = function (physicsEngine) {
    let ballBody = null;

    this.createPaddleAIInputComponent = function (paddle, playerSide) {
      const directionMultiplier = (playerSide === 'left' ? 1 : -1);
      const idealDistanceFromBall = -10 * directionMultiplier;
      const attackDistance = -15 * directionMultiplier;
      const fallbackDistance = 5 * directionMultiplier;
      const otherPlayerSide = (playerSide === 'left' ? 'right' : 'left');
      const safeDistanceFromBall = 30;

      const states = {
        getBehindBall: actions => {
          let idealPosition = {x: ballBody.position.x + idealDistanceFromBall, y: ballBody.position.y};

          if (paddleBody.position.y > idealPosition.y) actions.down = 1;
          if (paddleBody.position.y > idealPosition.y) actions.up = 1;

          let xDistanceFromIdeal = (paddleBody.position.x - idealPosition.x) * directionMultiplier;

          // document.querySelector('#aidebug [data-key="distance"]').textContent = xDistanceFromIdeal;

          if (xDistanceFromIdeal > 0) {
            actions[playerSide] = 1;
          }
          else {
            currentState = 'attackBall';
          }        
        },
        attackBall: actions => {
          let yAttackPosition = ballBody.position.y;
          let xAttackPosition = ballBody.position.x + attackDistance;
          let xFallbackPosition = ballBody.position.x + fallbackDistance;

          if (paddleBody.position.y < yAttackPosition) actions.down = 1;
          if (paddleBody.position.y > yAttackPosition) actions.up = 1;

          let xDistanceFromAttack = (xAttackPosition - paddleBody.position.x)  * directionMultiplier;
          let xDistanceFromFallback = (paddleBody.position.x - xFallbackPosition) * directionMultiplier;

          document.querySelector('#aidebug [data-key="distance"]').textContent = xDistanceFromAttack;

          let fixedBodyAngle = Math.abs(paddleBody.angle % Math.PI);

          if (xDistanceFromAttack > 0) {
            actions[otherPlayerSide] = 1;

            if (fixedBodyAngle === halfPI) {
              if (actions.up) actions.spinClockwise = 1;
              if (actions.down) actions.spinCounterClockwise = 1;
            }
          }
          else if (xDistanceFromFallback > 0){
            currentState = 'getBehindBall';
          }
          else {
            console.log('attack!', actions.up, actions.down);
            if (actions.up) actions.spinClockwise = 1;
            if (actions.down) actions.spinCounterClockwise = 1;
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

          document.querySelector('#aidebug [data-key="state"]').textContent = currentState;

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