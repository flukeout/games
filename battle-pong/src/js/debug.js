document.addEventListener('DOMContentLoaded', e => {

  window.Debug = {
    playerScoreBig: function (player) {
      // Fake the ball physics here
      game.playerScored(player, {
        position: {
          x: ball.physics.position.x,
          y: ball.physics.position.y
        },
        velocity: {
          x: -100,
          y: -100
        }
      });
    },
    player1ScoreBig: function () {
      Debug.playerScoreBig(0);
    },
    player2ScoreBig: function () {
      Debug.playerScoreBig(1);
    }
  };

});