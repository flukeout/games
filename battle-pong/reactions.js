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
  
  var exclamations = {
    winning: [
      'booya!',
      'bam!',
      'shazang!',
      'what what'
    ],
    losing: [
      'uh oh',
      'yikes!',
      'blarg...',
      'oops'
    ],
    taunting: [
      'toasty!',
    ],
    embarrassed: [
    ]
  };

  var exclamationClasses = [
    'thick-n-white',
    'pink-n-yellow'
  ];

  window.ReactionMachine = function () {
    var reactionContainers = Array.prototype.slice.call(document.querySelectorAll('.reaction-container'));

    var machine = {
      react: function (player, emotion) {
        var emotionalPool = emojis[emotion];
        var verbalPool = exclamations[emotion];

        var randomEmotion = emotionalPool[Math.floor(Math.random() * emotionalPool.length)];
        var randomExclamation = verbalPool[Math.floor(Math.random() * verbalPool.length)];
        var randomExclamationClass = exclamationClasses[Math.floor(Math.random() * exclamationClasses.length)];

        var reactionContainer = reactionContainers[player - 1].cloneNode(true);
        document.body.appendChild(reactionContainer);

        var emotionalContainer = reactionContainer.querySelector('.emoji');
        var verbalContainer = reactionContainer.querySelector('.words');

        var randomVerbalAngle = Math.random() * Math.PI / 2 - Math.PI / 4;
        var randomVerbalXPosition = Math.round(Math.random() * 100);

        emotionalContainer.style.backgroundImage = 'url("assets/emojis/' + randomEmotion + '")';

        if (randomExclamation) verbalContainer.innerText = randomExclamation;

        verbalContainer.classList.add(randomExclamationClass);

        verbalContainer.style.transform = 'translateX(' + randomVerbalXPosition + 'px) translateY(-150px) rotate(' + randomVerbalAngle + 'rad)';

        setTimeout(function () {
          reactionContainer.classList.add('show');
          setTimeout(function () {
            reactionContainer.classList.remove('show');
            setTimeout(function () {
              verbalContainer.classList.remove(randomExclamationClass);
              verbalContainer.style.transform = '';
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

  window.addEventListener('DOMContentLoaded', function () {
    window.rm = new ReactionMachine();

  });

})();