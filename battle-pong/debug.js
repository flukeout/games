(function () {
  if (window.Settings.debug) {
    window.Debug =  {

      player1Score: function () {
        document.dispatchEvent(new CustomEvent('ballHitEndzone', {detail: {
          player: 1
        }}));
      },

      player2Score: function () {
        document.dispatchEvent(new CustomEvent('ballHitEndzone', {detail: {
          player: 2
        }}));
      }

    };
  }
})();