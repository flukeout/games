(function() {

  var emojis = {
    taunting: [
      'cat-mischevious.svg',
      'sunglasses.svg'
    ],
    embarrassed: [
      'zipper-mouth.svg'
    ],
    winning : [
      'hands-up.svg',
      'happy-tongue-out.svg',
      'smiling.svg'
    ],
    strong: [
      // 'gun.svg',
      'flex.svg'
    ],

    scared: [
      'hands-praying.svg'
    ],
    losing: [
      'angry-teeth.svg',
      'cat-crying.svg',
      'cat-mad.svg',
      'crying-bigtime.svg',
      'sad-downlook.svg',
      'self-berated.svg'
    ]
  };

  window.ReactionMachine = function () {
    var reactionContainers = Array.prototype.slice.call(document.querySelectorAll('.reaction-container'));

    document.addEventListener("emotion", function(e) {
      machine.react(e.detail.player, e.detail.type);
    });

    var machine = {
      react: function (player, emotion) {
        // console.log(player,emotion);
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