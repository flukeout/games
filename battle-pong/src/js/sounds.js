// TODO
// * Make the options volume a 'factor' of the default sound volume, not an absolute value?
// * Remove the timeout stuff? Should just move it to the object that calls it?
// * That would allow us to not have two hit sounds...

// Prevent all of these variables and constants from polluting the global scope
(function () {

const limitedSoundTimeoutMS = 100;
const temporaryLowPassDuration = 5000;
const temporaryLowPassExitFrequency = 20000;
const temporaryLowPassStartFrequency = 1000;
const temporaryLowPassQuality = 10;

let limitedSoundTimeouts = {};
let temporaryLowpassTimeout = null;
let temporaryLowpassComebackTimeout = null;

var sounds = {
  "beep" : {
    url : "sounds/beep.mp3",
    volume : .15
  },
  "thwap" : {
    url : "sounds/thwap.wav",
    volume : .15
  },
  "win-round" : {
    url : "sounds/crowd.wav",
    volume : .15
  },
  "star-hit" : {
    url : "sounds/star-hit.wav",
    volume : .15
  },
  "woosh" : {
    url : "sounds/woosh.wav",
    volume : .35
  },
  "swish" : {
    url : "sounds/swish.wav",
  },
  "bonus" : {
    url : "sounds/bonus.wav",
    volume : .03
  },
  "coin" : {
    url : "sounds/coin.mp3",
  },
  "boom" : {
    url : "sounds/boom.wav",
    volume : .3
  },
  "boom-mine" : {
    url : "sounds/mine-explosion.mp3",
    volume : .3
  },
  "clang" : {
    url : "sounds/clang-2.mp3",
    volume : .2
  },
  "score" : {
    url : "sounds/score.mp3",
    volume:  .1
  },
  "hit" : {
    url : "sounds/hit.mp3",
    volume : 1
  },

  "Power_Shot_V1" : {
    url : "sounds/Power_Shot_V1.mp3",
    volume : 1
  },
  "Power_Shot_V2" : {
    url : "sounds/Power_Shot_V2.mp3",
    volume : 1
  },
  "Power_Shot_V3" : {
    url : "sounds/Power_Shot_V3.mp3",
    volume : 1
  },
  "Power_Shot_V4" : {
    url : "sounds/Power_Shot_V4.mp3",
    volume : 1
  },

  "Ball_Score_V1" : {
    url : "sounds/Ball_Score_V1.mp3",
    volume : 1
  },
  "Ball_Score_V2" : {
    url : "sounds/Ball_Score_V2.mp3",
    volume : 1
  },
  "Ball_Score_V3" : {
    url : "sounds/Ball_Score_V3.mp3",
    volume : 1
  },
  "Ball_Score_V4" : {
    url : "sounds/Ball_Score_V4.mp3",
    volume : 1
  },


  "Bomb_Impact_High_V1" : {
    url : "sounds/Bomb_Impact_High_V1.mp3",
    volume : 1
  },
  "Bomb_Impact_High_V2" : {
    url : "sounds/Bomb_Impact_High_V2.mp3",
    volume : 1
  },
  "Bomb_Impact_High_V3" : {
    url : "sounds/Bomb_Impact_High_V3.mp3",
    volume : 1
  },
  "Bomb_Impact_Low_V1" : {
    url : "sounds/Bomb_Impact_Low_V1.mp3",
    volume : 1
  },
  "Bomb_Impact_Low_V2" : {
    url : "sounds/Bomb_Impact_Low_V2.mp3",
    volume : 1
  },
  "Bomb_Impact_Low_V3" : {
    url : "sounds/Bomb_Impact_Low_V3.mp3",
    volume : 1
  },

  "Ball_Bounce_Paddle" : {
    url : "sounds/Ball_Bounce_Paddle 1.2.mp3",
    volume : 1
  },
  "Ball_Bounce_Wall" : {
    url : "sounds/Ball_Bounce_Wall 1.2.mp3",
    volume : 1
  },

};

var soundBanks = {
  "score": [
    "Ball_Score_V1",
    "Ball_Score_V2",
    "Ball_Score_V3",
    "Ball_Score_V4"
  ],
  "super-hard-shot": [
    // "thwap",
    "Power_Shot_V1",
    "Power_Shot_V2",
    "Power_Shot_V3",
    "Power_Shot_V4"
  ],
  "mine-collision-low": [
    "Bomb_Impact_Low_V1",
    "Bomb_Impact_Low_V2",
    "Bomb_Impact_Low_V3"
  ],
  "mine-collision-high": [
    "Bomb_Impact_High_V1",
    "Bomb_Impact_High_V2",
    "Bomb_Impact_High_V3"
  ]
};

var soundContext = new AudioContext();

for(var key in sounds) {
  loadSound(key);
}

function loadSound(name){
  var sound = sounds[name];
  var url = sound.url;
  var buffer = sound.buffer;

  var request = new XMLHttpRequest();
  request.open('GET', url, true);
  request.responseType = 'arraybuffer';

  request.onload = function() {
    soundContext.decodeAudioData(request.response, function(newBuffer) {
      sound.buffer = newBuffer;
    });
  }

  request.send();
}

function playRandomSoundFromBank(soundBankName) {
  let soundBank = soundBanks[soundBankName];
  if (soundBank) {
    let sound = soundBank[Math.floor(Math.random() * soundBank.length)];
    playSound(sound);
  }
  else {
    console.warn('No soundbank for soundbank name: ' + soundBankName);
  }
}

function playLimitedSound(sound, category, options) {
  category = category || sound;

  if(!limitedSoundTimeouts[category]) {
    playSound(sound, options);
    limitedSoundTimeouts[category] = setTimeout(() => {
      limitedSoundTimeouts[category] = false;
    }, limitedSoundTimeoutMS);
  }
}

function playLimitedRandomSoundFromBank(soundBankName) {
  let soundBank = soundBanks[soundBankName];
  if (soundBank) {
    let sound = soundBank[Math.floor(Math.random() * soundBank.length)];
    playLimitedSound(sound, soundBankName);
  }
  else {
    console.warn('No soundbank for soundbank name: ' + soundBankName);
  }
}

function temporaryLowPass() {

  // If this effect is already happening, reset it (which effectively extends it)
  if (temporaryLowpassTimeout) {
    clearTimeout(temporaryLowpassTimeout);
    clearTimeout(temporaryLowpassComebackTimeout);
    globalBiquadFilter.frequency.cancelScheduledValues(soundContext.currentTime);
  }

    // Set up the initial effect
  globalBiquadFilter.type = 'lowpass';
  globalBiquadFilter.frequency.value = temporaryLowPassStartFrequency;

  temporaryLowpassComebackTimeout = setTimeout(() => {
    // Decrease the effect over time
    globalBiquadFilter.frequency.linearRampToValueAtTime(temporaryLowPassExitFrequency, soundContext.currentTime + (temporaryLowPassDuration / 2) / 1000);
  }, temporaryLowPassDuration / 2);  

  // When the timeout happens, reset the biquadFilter
  temporaryLowpassTimeout = setTimeout(() => {
    // Reset timer
    temporaryLowpassTimeout = null;

    // Reset the filter
    globalBiquadFilter.type = 'allpass';
    globalBiquadFilter.frequency.value = temporaryLowPassExitFrequency;
  }, temporaryLowPassDuration);
}

var globalBiquadFilter = soundContext.createBiquadFilter();
globalBiquadFilter.type = 'allpass';
globalBiquadFilter.Q.value = temporaryLowPassQuality;
globalBiquadFilter.frequency.value = temporaryLowPassExitFrequency;

globalBiquadFilter.connect(soundContext.destination);

function playSound(name, options){
  var sound = sounds[name];
  var buffer = sound.buffer;

  if(!buffer){ return; }

  var soundOptions = {
    volume: sounds[name].volume || 1,
    pan: sounds[name].pan || 0,
    timeout: sounds[name].timeout || false
  }

  for(var k in options){
    if(soundOptions[k]) {
      soundOptions[k] = options[k];
    }
  }

  var source = soundContext.createBufferSource();
  source.buffer = buffer;

  var panNode = soundContext.createStereoPanner();
  panNode.pan.value = soundOptions.pan;

  var volume = soundContext.createGain();

  volume.gain.value = soundOptions.volume; // Should we make this a multiplier of the original?

  panNode.connect(globalBiquadFilter);
  volume.connect(panNode);
  source.connect(volume);
  source.start(0);
}

window.playSound = playSound;
window.playLimitedSound = playLimitedSound;
window.playRandomSoundFromBank = playRandomSoundFromBank;
window.playLimitedRandomSoundFromBank = playLimitedRandomSoundFromBank;

})();
