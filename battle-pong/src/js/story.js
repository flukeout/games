(function () {
const CREDITS_DELAY = 3000;

let paddles = [];
let bestOfEls, 
    powerupEls,
    toggleEls,
    playerOptionEls;

let timeoutAccumulator = 0;

let starsManager;

let story = [
  '22,018 Galactic Era',
  'Long since humanity\'s ascent to hyper-cybernetics, Earth\'s descendants have achieved their optimal form.',
  'Scattered throughout the galaxy, rival factions of the once proud and unified Photospheric Orbital Nova Group compete for resources.',
  'The two most powerful, Purpolium and Greebesque have been negotiating for control of the supermassive black hole at the galactic center.',
  'Inevitably conflict arises, and the two factions agree to settle the confrontation through modern diplomatic means.',
  'As they summon their most elite warriors from the corners of the Milky Way, the entire galaxy awaits in anticipation of organized warfare on a scale never before seen...'
];

function startStory(finishedCallback) {
  let storyScreen = document.querySelector('.story-content');
  let typer = storyScreen.querySelector('.typer');
  let skipButton = storyScreen.querySelector('.skip');
  let typingInterval;
  let typingNextTimeout;

  function finished() {
    storyScreen.classList.remove('show');
    finishedCallback();
  }

  storyScreen.classList.add('show');

  function typeNext() {
    typer.textContent = '';

    let currentLine = story.shift();

    if (currentLine) {
      let index = 0;
      typingInterval = setInterval(() => {
        let letter = currentLine[index++];

        if (letter) {
          SoundManager.playRandomSoundFromBank('type');
          typer.textContent += letter;
        }
        else {
          clearInterval(typingInterval);
          typingNextTimeout = setTimeout(typeNext, 2000);
        }
      }, 25);
    }
    else {
      finished();
    }
  }

  typeNext();

  skipButton.addEventListener('click', (e) => {
    clearTimeout(typingNextTimeout);
    clearInterval(typingInterval);
    finished();
  });
}

ScreenManager.addScreen('story', {
  init: () => {
  },
  start: () => {
    return new Promise((resolve, reject) => {
      let storyScreen = document.querySelector(".screen.story");
      // storyScreen.classList.add

      let readyScreen = document.querySelector('.screen.story .ready');

      let isChrome = navigator.userAgent.toLowerCase().includes("chrome") || false;
      if(isChrome) {
        document.querySelector(".story").classList.add("is-chrome");
      } else {
        document.querySelector(".story").classList.add("not-chrome");
      }

      // A cute way of detecting Electron
      if (window.process) {
        Array.prototype.forEach.call(document.querySelectorAll('.in-browser'), (e) => {
          e.setAttribute('hidden', true);
        });
        Array.prototype.forEach.call(document.querySelectorAll('.in-electron'), (e) => {
          e.removeAttribute('hidden');
        });
      }

      readyScreen.classList.add('show');

      readyScreen.querySelector('.ok').addEventListener('click', () => {
      
        readyScreen.classList.remove('show');
        
        setTimeout(function(){
          startStory(() => {
            ScreenManager.transitionToScreen('splash');
          });
        }, 750);
      
      });

      loop();

      starsManager = startStars('.screen.story', 50, window.innerWidth, window.innerHeight);

      resolve();
    });
  },
  stop: () => {
    return new Promise((resolve, reject) => {
      fadeOutScene();
      setTimeout(function () {
        starsManager.stop();

        // An odd place for this, but this is the best place to boot up the menu music for the splash+rules pages
        SoundManager.musicEngine.cueSong('menu');
        if (Settings.music) SoundManager.musicEngine.fadeIn( 2, {loop: true} );

        resolve();
      }, 1000);
    });
  }
});

function loop(){
  drawParticles();
  requestAnimationFrame(loop);
}

function timeoutClass(selector, className, timeout){
  timeoutAccumulator = timeoutAccumulator + (timeout || 0);
  setTimeout(function(){
    document.querySelector(selector).classList.add(className);
  },timeoutAccumulator)
}

function fadeOutScene(){
  console.log('fadeoutscene');
  timeoutClass(".copyright", "transition-out", 200);
  timeoutClass(".canvas-stars", "transition-out", 200);
}

// This shouldn't be in here, we should just import it from effects.js
function addTemporaryClassName(element, className, durationMS){
  element.classList.remove(className);
  element.style.width = element.clientWidth;
  element.classList.add(className);
  setTimeout(function(){
    element.classList.remove(className);
  }, durationMS || 1000);
}

function startCredits(timeoutDelay) {
  let creditsContainer = document.querySelector('.credits');
  let realCredits = Array.prototype.slice.call(creditsContainer.querySelectorAll('.credit'));
  let creditsToShow = [];
  let lastCredit = null;
  let creditToRemove = null;

  let bonusFirstWords = [
    'Executive',
    'Assistant',
    'Planetary',
    'Visual',
    'Monetary'
  ];

  let fistWords = [
    'User',
    'Cinematic',
    'Effect',
    'Wildlife',
    'Robot',
    'Pong',
    'Genetic',
    'Spatial',
    'Quantum',
    'Vacation',
    'Vacuum',
    'Masonic',
    'Geographic',
    'Geological',
    'Mathematics',
    'Financial',
    'Morphology',
    'Destruction',
    'Paddle',
    'Physics',
    'Pentatonic',
    'Flux'
  ];

  let secondWords = [
    'Programming',
    'Assessment',
    'Science',
    'Forecasting',
    'Design',
    'Inquiry',
    'Research',
    'Arbitration',
    'Collection',
    'Verification',
    'Taxation',
    'Molding',
    'Crafting',
    'Production',
    'Appreciation',
    'Accounting',
    'Intake',
    'Organization'
  ];

  let bonusSecondWords = [
    'Lead',
    'Carrier',
    'Consultant',
    'Assistant',
    'Support',
    'Tailor',
    'Expert',
    'Professor',
    'Researcher',
    'Manager',
    'Painter',
    'Franchising',
    'Manufacturing'
  ];

  let realPeople = [
    'Bobby Richter',
    'Luke Pacholski'
  ];

  function creditsLoop() {
    if (creditToRemove) {
      creditsContainer.removeChild(creditToRemove);
      creditToRemove = null;
    }

    if (lastCredit) {
      lastCredit.classList.remove('show');
      lastCredit.classList.add('after-show');
      creditToRemove = lastCredit;
      lastCredit = null;
    }

    if (creditsToShow.length === 0) {
      let fakeCredits = [];

      for (let i = 0, r = Math.round(5 + Math.random() * 10); i < r; ++i) {
        let credit = realPeople[Math.floor(Math.random() * realPeople.length)];


        let firstWord = fistWords[Math.floor(Math.random() * fistWords.length)];
        let secondWord = secondWords[Math.floor(Math.random() * secondWords.length)];

        let title = firstWord + ' ' + secondWord;

        if (Math.random() < 0.4) {
          title = bonusFirstWords[Math.floor(Math.random() * bonusFirstWords.length)] + ' ' + title;
        }

        if (Math.random() < 0.5) {
          title += ' ' + bonusSecondWords[Math.floor(Math.random() * bonusSecondWords.length)];
        }

        title += ': ';

        let fakeCredit = document.createElement('div');
        fakeCredit.classList.add('credit');

        let titleNode = document.createElement('span');
        titleNode.classList.add('title');
        titleNode.textContent = title;

        let nameNode = document.createElement('span');
        nameNode.classList.add('name');
        nameNode.textContent = credit;

        fakeCredit.appendChild(titleNode);
        fakeCredit.appendChild(nameNode);
        fakeCredits.push(fakeCredit);
      }

      creditsToShow = realCredits.map(c => { return c.cloneNode(true); }).concat(fakeCredits);

      creditsToShow.forEach(c => {
        c.classList.add('before-show');
        creditsContainer.appendChild(c);
      });
    }
    else {
      let nextCredit = creditsToShow.shift();
      
      nextCredit.classList.remove('before-show');
      nextCredit.classList.add('show');

      lastCredit = nextCredit;
    }

    setTimeout(creditsLoop, timeoutDelay);
  }

  creditsLoop();

  realCredits.forEach(c => { creditsContainer.removeChild(c); });

  creditsContainer.classList.add('show');
}

})();