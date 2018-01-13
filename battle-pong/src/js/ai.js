(function () {

  window.AI = function (physicsEngine, paddle) {
    let ballBody = null;
    const paddleBody = paddle.physics;

    const states = {
      getBehindBall: actions => {
        let idealPosition = {x: ballBody.position.x - 10, y: ballBody.position.y};

        if (paddleBody.position.y > idealPosition.y) actions.down = 1;
        if (paddleBody.position.y > idealPosition.y) actions.up = 1;

        if (paddleBody.position.x > idealPosition.x) {
          actions.left = 1;
        }
        else {
          currentState = states.attackBall;
        }        
      },
      attackBall: actions => {
        let attackPosition = {x: ballBody.position.x - 15, y: ballBody.position.y};
        let fallbackPosition = {x: ballBody.position.x + 5, y: ballBody.position.y};

        if (paddleBody.position.y < attackPosition.y) actions.down = 1;
        if (paddleBody.position.y > attackPosition.y) actions.up = 1;

        if (paddleBody.position.x < attackPosition.x) {
          actions.right = 1;
        }
        else if (paddleBody.position.x > fallbackPosition.x){
          currentState = states.getBehindBall;
        }
        else {
          console.log('attack!', actions.up, actions.down);
          if (actions.up) actions.spinClockwise = 1;
          if (actions.down) actions.spinCounterClockwise = 1;
        }
      }
    };

    let currentState = states.attackBall;

    function createAIInputComponent() {
      var component = {
        actions: {},
        update: function () {
          let actions = {};

          if (!ballBody) return actions;

          currentState(actions);

          return actions;
        },
        register: function (actions) {
          this.actions = actions;
        },
        remove: function () {
        }
      };

      return component;
    }

    paddle.setInputComponent(createAIInputComponent());

    this.setBall = ball => {
      ballBody = ball.physics;
    };
  };

})();