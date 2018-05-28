document.addEventListener('DOMContentLoaded', e => {

  window.Debug = {
    playerScoreBig: function (player) {
      // Fake the ball physics here
      game.playerScored(player, {
        position: {
          x: game.balls[0].physics.position.x,
          y: game.balls[0].physics.position.y
        },
        velocity: {
          x: -100,
          y: -100
        }
      });
    },
    player1ScoreBig: function () {
      Debug.playerScoreBig(1);
    },
    player2ScoreBig: function () {
      Debug.playerScoreBig(0);
    },
    player1Powerup: function (type) {
      game.paddles[0].powerup(type);
    },
    player2Powerup: function (type) {
      game.paddles[1].powerup(type);
    },
    player1Win: function () {
      game.score.player1 = game.score.max - 1;
      Debug.player1ScoreBig();
    },
    player2Win: function () {
      game.score.player2 = game.score.max - 1;
      Debug.player2ScoreBig();
    }
  };

  Settings.powerUpTypes.forEach(type => {
    Debug['player1Powerup_' + type] = function () {
      Debug.player1Powerup(type);
    };
    Debug['player2Powerup_' + type] = function () {
      Debug.player2Powerup(type);
    };
  });

});