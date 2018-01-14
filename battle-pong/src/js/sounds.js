// TODO
// * Make the options volume a 'factor' of the default sound volume, not an absolute value?
// * Remove the timeout stuff? Should just move it to the object that calls it?
// * That would allow us to not have two hit sounds...

// Prevent all of these variables and constants from polluting the global scope
(function () {

const temporaryLowPassSettings = {
  recoveryDuration: 2333,
  recoveryDelay: 1666,
  startFrequency: 500,
  endFrequency: 20000,
  Q: 10
};

const limitedSoundTimeoutMS = 100;
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

  "Powerup_Bones_Disapear_1" : {
    url : "sounds/Powerup_Bones_Disapear_1.mp3",
    volume : 1
  },
  "Powerup_Bones_Disapear_2" : {
    url : "sounds/Powerup_Bones_Disapear_2.mp3",
    volume : 1
  },
  "Powerup_Bones_Disapear_3" : {
    url : "sounds/Powerup_Bones_Disapear_3.mp3",
    volume : 1
  },
  "Powerup_Bones_Disapear_4" : {
    url : "sounds/Powerup_Bones_Disapear_4.mp3",
    volume : 1
  },
  "Powerup_Bones_Disapear_5" : {
    url : "sounds/Powerup_Bones_Disapear_5.mp3",
    volume : 1
  },
  "Powerup_Bones_Disapear_6" : {
    url : "sounds/Powerup_Bones_Disapear_6.mp3",
    volume : 1
  },

  "Powerup_Bones_Collision_Low_V1" : {
    url : "sounds/Powerup_Bones_Collision_Low_V1.mp3",
    volume : 1
  },
  "Powerup_Bones_Collision_Low_V2" : {
    url : "sounds/Powerup_Bones_Collision_Low_V2.mp3",
    volume : 1
  },
  "Powerup_Bones_Collision_Low_V3" : {
    url : "sounds/Powerup_Bones_Collision_Low_V3.mp3",
    volume : 1
  },
  "Powerup_Bones_Collision_Low_V4" : {
    url : "sounds/Powerup_Bones_Collision_Low_V4.mp3",
    volume : 1
  },
  "Powerup_Bones_Collision_Low_V5" : {
    url : "sounds/Powerup_Bones_Collision_Low_V5.mp3",
    volume : 1
  },
  "Powerup_Bones_Collision_Low_V6" : {
    url : "sounds/Powerup_Bones_Collision_Low_V6.mp3",
    volume : 1
  },
  "Powerup_Bones_Collision_Low_V7" : {
    url : "sounds/Powerup_Bones_Collision_Low_V7.mp3",
    volume : 1
  },
  "Powerup_Bones_Collision_Low_V8" : {
    url : "sounds/Powerup_Bones_Collision_Low_V8.mp3",
    volume : 1
  },
  "Powerup_Bones_Collision_Low_V9" : {
    url : "sounds/Powerup_Bones_Collision_Low_V9.mp3",
    volume : 1
  },
  "Powerup_Bones_Collision_Low_V10" : {
    url : "sounds/Powerup_Bones_Collision_Low_V10.mp3",
    volume : 1
  },
  "Powerup_Bones_Collision_Low_V11" : {
    url : "sounds/Powerup_Bones_Collision_Low_V11.mp3",
    volume : 1
  },
  "Powerup_Bones_Collision_Low_V12" : {
    url : "sounds/Powerup_Bones_Collision_Low_V12.mp3",
    volume : 1
  },
  "Powerup_Bones_Collision_Low_V13" : {
    url : "sounds/Powerup_Bones_Collision_Low_V13.mp3",
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
  ],
  "bones-collide": [
    "Powerup_Bones_Collision_Low_V1",
    "Powerup_Bones_Collision_Low_V2",
    "Powerup_Bones_Collision_Low_V3",
    "Powerup_Bones_Collision_Low_V4",
    "Powerup_Bones_Collision_Low_V5",
    "Powerup_Bones_Collision_Low_V6",
    "Powerup_Bones_Collision_Low_V7",
    "Powerup_Bones_Collision_Low_V8",
    "Powerup_Bones_Collision_Low_V9",
    "Powerup_Bones_Collision_Low_V10",
    "Powerup_Bones_Collision_Low_V11",
    "Powerup_Bones_Collision_Low_V12",
    "Powerup_Bones_Collision_Low_V13"
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
  globalBiquadFilter.frequency.value = temporaryLowPassSettings.startFrequency;

  temporaryLowpassComebackTimeout = setTimeout(() => {
    // Decrease the effect over time
    globalBiquadFilter.frequency.linearRampToValueAtTime(temporaryLowPassSettings.endFrequency,
      soundContext.currentTime + temporaryLowPassSettings.recoveryDuration / 1000);
  }, temporaryLowPassSettings.recoveryDelay);

  // When the timeout happens, reset the biquadFilter
  temporaryLowpassTimeout = setTimeout(() => {
    // Reset timer
    temporaryLowpassTimeout = null;

    // Reset the filter
    globalBiquadFilter.type = 'allpass';
    globalBiquadFilter.frequency.value = temporaryLowPassSettings.endFrequency;
  }, temporaryLowPassSettings.recoveryDelay + temporaryLowPassSettings.recoveryDuration);
}

var globalBiquadFilter = soundContext.createBiquadFilter();
globalBiquadFilter.type = 'allpass';
globalBiquadFilter.Q.value = temporaryLowPassSettings.Q;
globalBiquadFilter.frequency.value = temporaryLowPassSettings.endFrequency;

globalBiquadFilter.connect(soundContext.destination);

function playSound(name, options){
  var sound = sounds[name];
  var buffer = sound.buffer;

  options = options || {};

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

  // Some sounds shouldn't be affected by the low pass filter, like bomb explosions
  if (options.excludeFromLowPassFilter) {
    panNode.connect(soundContext.destination);
  }
  else {
    panNode.connect(globalBiquadFilter);
  }

  volume.connect(panNode);
  source.connect(volume);
  source.start(0);














  /* ʕ •ᴥ•ʔゝ☆ */
}

window.playSound = playSound;
window.playLimitedSound = playLimitedSound;
window.playRandomSoundFromBank = playRandomSoundFromBank;
window.playLimitedRandomSoundFromBank = playLimitedRandomSoundFromBank;
window.temporaryLowPass = temporaryLowPass;

})();
