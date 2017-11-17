window.IntroMachine = function () {
  
  var audio = new Audio();

  var xhr = new XMLHttpRequest();
  xhr.open('GET', encodeURI('assets/music/Niky Nine - Ozuwara Theme-GT3qf8uW1hg.ogg.mp3'), true);
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.responseType = 'blob';
  xhr.onload = function(evt) {
    console.log('Audio source loaded');
    var blob = new Blob([xhr.response], {type: 'audio/mp3'});
    var objectUrl = URL.createObjectURL(blob);
    audio.src = objectUrl;
    // Release resource when it's loaded
    audio.onload = function(evt) {
      console.log('audio ready');
      URL.revokeObjectUrl(objectUrl);
    };


  };

  xhr.send();




  var machine = {
    start: function (onward) {
      var introWrapper = document.querySelector('.intro-wrapper');
      var boardWrapper = document.querySelector('.board-wrapper');
      var title = document.querySelector('.intro-wrapper .title');
      var startButton = document.querySelector('.intro-wrapper .start');
      var skipInstruction = document.querySelector('.skip-instruction');
      
      introWrapper.classList.add('show');
      boardWrapper.classList.add('intro');
      boardWrapper.classList.remove('hide');

      audio.play();
      audio.currentTime = 54.24;      // measured roughly

      setTimeout(function () {
        title.classList.add('show');
        startButton.classList.add('show');
        skipInstruction.parentNode.removeChild(skipInstruction);
        document.removeEventListener('keydown', onKeyDown);
      }, 7794);                       // also measured roughly

      startButton.addEventListener('click', function () {
        stopIntro();
        onward();
      });

      function stopIntro () {
        audio.pause();
        title.classList.remove('show');
        startButton.classList.remove('show');
        introWrapper.classList.remove('show');
        boardWrapper.classList.remove('intro');        
        document.removeEventListener('keydown', onKeyDown);
      }

      function onKeyDown () {
        stopIntro();
        onward();
      }

      document.addEventListener('keydown', onKeyDown);
    }
  };

  window.audio = audio;

  return machine;
};