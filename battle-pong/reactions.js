(function() {

  var emojis = {
    winning: [
      'face-throwing-a-kiss_1f618.png',
      'kissing-face-with-smiling-eyes_1f619.png',
      'kissing-face_1f617.png',
      'smiling-face-with-heart-shaped-eyes_1f60d.png',
      'smiling-face-with-open-mouth-and-cold-sweat_1f605.png',
      'smiling-face-with-open-mouth-and-tightly-closed-eyes_1f606.png',
      'persevering-face_1f623.png'
    ],
    losing: [
      'dizzy-face_1f635.png',
      'crying-face_1f622.png',
      'astonished-face_1f632.png',
      'loudly-crying-face_1f62d.png',
      'face-with-cold-sweat_1f613.png',
      'face-with-cold-sweat_1f613.png',
      'face-with-no-good-gesture_1f645.png',
      'neutral-face_1f610.png',
      'pensive-face_1f614.png',
      'hushed-face_1f62f.png',
      'disappointed-but-relieved-face_1f625.png'
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
      'whoopsie',
      'uh oh',
      'yikes!',
      'blarg...',
      'oops'
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

        var reactionContainer = reactionContainers[player].cloneNode(true);
        document.body.appendChild(reactionContainer);

        var emotionalContainer = reactionContainer.querySelector('.emoji');
        var verbalContainer = reactionContainer.querySelector('.words');

        var randomVerbalAngle = Math.random() * Math.PI / 2 - Math.PI / 4;
        var randomVerbalXPosition = Math.round(Math.random() * 100);

        emotionalContainer.style.backgroundImage = 'url("assets/' + randomEmotion + '")';
        verbalContainer.innerText = randomExclamation;
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
  
      },
      chooseForMe: function (player1Emotion, player2Emotion) {
        var randomness = Math.random();
        if (randomness > 0.66) {
          machine.react(0, player1Emotion);
        }
        else if (randomness > 0.33) {
          machine.react(1, player2Emotion);
        }
        else {
          machine.react(0, player1Emotion);
          machine.react(1, player2Emotion);
        }
      }
    };

    return machine;
  };

  window.addEventListener('DOMContentLoaded', function () {
    window.rm = new ReactionMachine();

  });

})();