(function() {

  var emojis = {
    taunting: [
      'emoji_u1f60e.svg',
      'emoji_u1f62a.svg',
      'emoji_u1f61a.svg',
      'emoji_u1f61c.svg',
      'emoji_u1f61d.svg'
    ],
    embarrassed: [
      'emoji_u1f61b.svg',
      'emoji_u1f62d.svg'
    ],
    winning: [
      'emoji_u1f60b.svg',
      'emoji_u1f60b.svg',
      'emoji_u1f64c.svg'
    ],
    losing: [
      'emoji_u1f61e.svg',
      'emoji_u1f61f.svg',
      'emoji_u1f62d.svg'
    ]
  };

  window.ReactionMachine = function () {
    var reactionContainers = Array.prototype.slice.call(document.querySelectorAll('.reaction-container'));

    var machine = {
      react: function (player, emotion) {
        var emotionalPool = emojis[emotion];
        var randomEmotion = emotionalPool[Math.floor(Math.random() * emotionalPool.length)];


        var reactionContainer = reactionContainers[player - 1].cloneNode(true);
        document.body.appendChild(reactionContainer);

        var emotionalContainer = reactionContainer.querySelector('.emoji');
        emotionalContainer.style.backgroundImage = 'url("assets/emojis/' + randomEmotion + '")';

        setTimeout(function () {
          reactionContainer.classList.add('show');
          setTimeout(function () {
            reactionContainer.classList.remove('show');
            setTimeout(function () {
              setTimeout(function () {
                reactionContainer.parentNode.removeChild(reactionContainer);
              }, 500);
            }, 250);
          }, 1000);
        }, 50);

      }
    };

    return machine;
  };

})();