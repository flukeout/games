// TODO
// * Make the options volume a 'factor' of the default sound volume, not an absolute value?
// * Remove the timeout stuff? Should just move it to the object that calls it?
// * That would allow us to not have two hit sounds...

// Prevent all of these variables and constants from polluting the global scope
(function () {

const temporaryLowPassSettings = {
  startFrequency: 500,
  endFrequency: 20000,
  attack: 0,
  sustain: 1.666,
  release: 1.666,
  Q: 10
};

let sounds = {
  "round-start" : {
    url : "sounds/round-start.mp3",
    volume : .25
  },
  "beep" : {
    url : "sounds/beep.mp3",
    volume : .15
  },
  "woosh" : {
    url : "sounds/woosh.wav",
    volume : .35
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
    volume : 1,
    limit: 100
  },
  "Ball_Bounce_Wall" : {
    url : "sounds/Ball_Bounce_Wall 1.2.mp3",
    volume : 1,
    limit: 100
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

  "Powerup_Bones_Score" : {
    url : "sounds/Powerup_Bones_Score.mp3",
    volume : 1
  },
  "Powerup_Enhance_Score" : {
    url : "sounds/Powerup_Enhance_Score.mp3",
    volume : 1
  },
  "Powerup_Spin_Score" : {
    url : "sounds/Powerup_Spin_Score.mp3",
    volume : 1
  },
  
  "Powerup_Enhance_WareOff" : {
    url : "sounds/Powerup_Enhance_WareOff.mp3",
    volume : 1
  },
  "Powerup_Spin_WareOff" : {
    url : "sounds/Powerup_Spin_WareOff.mp3",
    volume : 1
  },
  
  "Bomb_Explosion_V1" : {
    url : "sounds/Bomb_Explosion_V1.mp3",
    volume : 1
  },
  "Bomb_Explosion_V2" : {
    url : "sounds/Bomb_Explosion_V2.mp3",
    volume : 1
  },

  "Paddle_Spin_V1" : {
    url : "sounds/Paddle_Spin_V1.mp3",
    volume : 1
  },
  "Paddle_Spin_V2" : {
    url : "sounds/Paddle_Spin_V2.mp3",
    volume : 1
  },
  "Paddle_Spin_V3" : {
    url : "sounds/Paddle_Spin_V3.mp3",
    volume : 1
  },
  "Paddle_Spin_V4" : {
    url : "sounds/Paddle_Spin_V4.mp3",
    volume : 1
  },
  "Paddle_Spin_V5" : {
    url : "sounds/Paddle_Spin_V5.mp3",
    volume : 1
  },
  "Paddle_Spin_V6" : {
    url : "sounds/Paddle_Spin_V6.mp3",
    volume : 1
  },
  "Paddle_Spin_V7" : {
    url : "sounds/Paddle_Spin_V7.mp3",
    volume : 1
  },
  "Paddle_Spin_V8" : {
    url : "sounds/Paddle_Spin_V8.mp3",
    volume : 1
  },
  "Paddle_Spin_V9" : {
    url : "sounds/Paddle_Spin_V9.mp3",
    volume : 1
  },
  "Paddle_Spin_V10" : {
    url : "sounds/Paddle_Spin_V10.mp3",
    volume : 1
  },
  "Paddle_Spin_V11" : {
    url : "sounds/Paddle_Spin_V11.mp3",
    volume : 1
  },
  "Paddle_Spin_V12" : {
    url : "sounds/Paddle_Spin_V12.mp3",
    volume : 1
  },
  "Paddle_Spin_V13" : {
    url : "sounds/Paddle_Spin_V13.mp3",
    volume : 1
  },
  "Paddle_Spin_V14" : {
    url : "sounds/Paddle_Spin_V14.mp3",
    volume : 1
  },
  "Paddle_Spin_V15" : {
    url : "sounds/Paddle_Spin_V15.mp3",
    volume : 1
  },
  
  "Paddle_Dash_V1" : {
    url : "sounds/Paddle_Dash_V1.mp3",
    volume : 1
  },
  "Paddle_Dash_V2" : {
    url : "sounds/Paddle_Dash_V2.mp3",
    volume : 1
  },
  "Paddle_Dash_V3" : {
    url : "sounds/Paddle_Dash_V3.mp3",
    volume : 1
  },
  "Paddle_Dash_V4" : {
    url : "sounds/Paddle_Dash_V4.mp3",
    volume : 1
  },
  "Paddle_Dash_V5" : {
    url : "sounds/Paddle_Dash_V5.mp3",
    volume : 1
  },

  "Powerup_Spawn" : {
    url : "sounds/Powerup_Spawn.mp3",
    volume : 1
  },
  "Bomb_Spawn" : {
    url : "sounds/Bomb_Spawn.mp3",
    volume : 1
  },

  "Powerup_Bounce_Paddle" : {
    url : "sounds/Powerup_Bounce_Paddle.mp3",
    volume : 1,
    limit: 100
  },

  "Powerup_Bounce_Wall" : {
    url : "sounds/Powerup_Bounce_Wall.mp3",
    volume : 1,
    limit: 100
  },

  "Win_Cheer" : {
    url : "sounds/Win_Cheer.mp3",
    volume : 1
  },

  "Ball_Spawn" : {
    url : "sounds/Ball_Spawn.mp3",
    volume : 1
  },

  "Finish_It_Heartbeat_Loop" : {
    url : "sounds/Finish_It_Heartbeat_Loop.mp3",
    volume : 1
  },
  "Finish_It_Hit" : {
    url : "sounds/Finish_It_Hit.mp3",
    volume : 1
  },
  "Finish_It_Miss" : {
    url : "sounds/Finish_It_Miss.mp3",
    volume : 1
  },

  "Powerup_Spin_Spin_Start" : {
    url : "sounds/Powerup_Spin_Spin_Start.mp3",
    volume : 1
  },
  "Powerup_Spin_Spin_Loop" : {
    url : "sounds/Powerup_Spin_Spin_Loop.mp3",
    volume : 1
  },

};

let soundBanks = {
  "dash": {
    limit: 0,
    sounds: [
      "Paddle_Dash_V1",
      "Paddle_Dash_V2",
      "Paddle_Dash_V3",
      "Paddle_Dash_V4",
      "Paddle_Dash_V5"
    ]
  },
  "score": {
    sounds: [
      "Ball_Score_V1",
      "Ball_Score_V2",
      "Ball_Score_V3",
      "Ball_Score_V4"
    ]
  },
  "super-hard-shot": {
    sounds: [
      "Power_Shot_V1",
      "Power_Shot_V2",
      "Power_Shot_V3",
      "Power_Shot_V4"
    ]
  },
  "swish": {
    sounds: [
      "Paddle_Spin_V1",
      "Paddle_Spin_V2",
      "Paddle_Spin_V3",
      "Paddle_Spin_V4",
      "Paddle_Spin_V5",
      "Paddle_Spin_V6",
      "Paddle_Spin_V7",
      "Paddle_Spin_V8",
      "Paddle_Spin_V9",
      "Paddle_Spin_V10",
      "Paddle_Spin_V11",
      "Paddle_Spin_V12",
      "Paddle_Spin_V13",
      "Paddle_Spin_V14",
      "Paddle_Spin_V15"
    ]
  },
  "mine-collision": {
    limit: 100,
    sounds: [
      "Bomb_Impact_Low_V1",
      "Bomb_Impact_Low_V2",
      "Bomb_Impact_Low_V3"
    ]
  },
  "mine-explosion": {
    sounds: [
      "Bomb_Explosion_V1",
      "Bomb_Explosion_V2"
    ]
  },
  "bones-collide": {
    sounds: [
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
  }
};

let loops = {
  'Finish_It_Heartbeat': {
    sound: 'Finish_It_Heartbeat_Loop'
  },
  'Powerup_Spin_Spin': {
    sound: 'Powerup_Spin_Spin_Loop'
  }
};

let soundEvents = {
  'Finish_It_Heartbeat_Start': () => {
    SoundManager.startLoop('Finish_It_Heartbeat');
    musicEngine.setMood('quiet');
  },
  'Finish_It_Heartbeat_Stop_Hit': () => {
    SoundManager.stopLoop('Finish_It_Heartbeat');
    SoundManager.playSound('Finish_It_Hit');
    musicEngine.setMood('default');
  },
  'Finish_It_Heartbeat_Stop_Miss': () => {
    SoundManager.stopLoop('Finish_It_Heartbeat');
    SoundManager.playSound('Finish_It_Miss');
    musicEngine.setMood('default');
  }
};

let sequenceManagers = {
  Powerup_Spin: function () {
    let spinStart = null;

    this.start = function () {
      spinStart = SoundManager.playSound('Powerup_Spin_Spin_Start');
      SoundManager.startLoop('Powerup_Spin_Spin', {start: soundContext.currentTime + spinStart.buffer.duration - 0.1});
    };

    this.stop = function () {
      spinStart.stop();
      SoundManager.stopLoop('Powerup_Spin_Spin');
    };
  }
};

for (let sound in sounds) {
  sounds[sound].limit = sounds[sound].limit || 0;
}

for (let sound in soundBanks) {
  soundBanks[sound].limit = soundBanks[sound].limit || 0;
}

let limitedSoundTimeouts = {};
let temporaryLowpassTimeout = null;

let soundContext;
let globalBiquadFilter;
let musicEngine;

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

function playRandomSoundFromBank(soundBankName, options) {
  let soundBank = soundBanks[soundBankName];
  if (soundBank) {
    if (soundBank.limit > 0) {
      if(limitedSoundTimeouts['bank_' + soundBankName]) return;

      limitedSoundTimeouts['bank_' + soundBankName] = setTimeout(() => {
        delete limitedSoundTimeouts['bank_' + soundBankName];
        document.dispatchEvent(new CustomEvent('limitedsoundbankfinished', {detail: soundBankName}));
      }, soundBank.limit);

      document.dispatchEvent(new CustomEvent('limitedsoundbankstarted', {detail: soundBankName}));
    }

    let sound = soundBank.sounds[Math.floor(Math.random() * soundBank.sounds.length)];
    playSound(sound, options);
    document.dispatchEvent(new CustomEvent('soundbankplayed', {detail: soundBankName}));
  }
  else {
    console.warn('No soundbank for soundbank name: ' + soundBankName);
  }
}

function temporaryLowPass() {
  // If this effect is already happening, reset it (which effectively extends it)
  if (temporaryLowpassTimeout) {
    clearTimeout(temporaryLowpassTimeout);
    document.dispatchEvent(new CustomEvent('lowpassinterrupted', {detail: null}));
  }

    // Set up the initial effect
  globalBiquadFilter.type = 'lowpass';

  globalBiquadFilter.frequency.cancelScheduledValues(soundContext.currentTime);
  globalBiquadFilter.frequency.linearRampToValueAtTime(temporaryLowPassSettings.startFrequency, soundContext.currentTime + temporaryLowPassSettings.attack);
  globalBiquadFilter.frequency.linearRampToValueAtTime(temporaryLowPassSettings.startFrequency, soundContext.currentTime + temporaryLowPassSettings.attack + temporaryLowPassSettings.sustain);
  globalBiquadFilter.frequency.linearRampToValueAtTime(temporaryLowPassSettings.endFrequency, soundContext.currentTime + temporaryLowPassSettings.attack + temporaryLowPassSettings.sustain + temporaryLowPassSettings.release);

  // When the timeout happens, reset the biquadFilter
  temporaryLowpassTimeout = setTimeout(() => {
    // Reset timer
    temporaryLowpassTimeout = null;

    // Reset the filter
    globalBiquadFilter.type = 'allpass';
    document.dispatchEvent(new CustomEvent('lowpassfinished', {detail: null}));
  }, (temporaryLowPassSettings.attack + temporaryLowPassSettings.sustain + temporaryLowPassSettings.release) * 1000);

  document.dispatchEvent(new CustomEvent('lowpassstarted', {detail: null}));
}

function playSound(name, options){
  if(!window.Settings.sounds) {
    return;
  }
  var sound = sounds[name];

  if (!sound) {
    console.warn('No sound with name ' + name);
    return;
  }

  if (sound.limit > 0) {
    if(limitedSoundTimeouts[name]) return;

    limitedSoundTimeouts[name] = setTimeout(() => {
      delete limitedSoundTimeouts[name];
      document.dispatchEvent(new CustomEvent('limitedsoundfinished', {detail: name}));
    }, sound.limit);

    document.dispatchEvent(new CustomEvent('limitedsoundstarted', {detail: name}));
  }

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

  if (musicEngine && options.musicDuckingProfile) {
    musicEngine.duck(options.musicDuckingProfile);
  }

  source.start(options.start || 0);

  document.dispatchEvent(new CustomEvent('soundplayed', {detail: name}));

  source.onended = () => {
    document.dispatchEvent(new CustomEvent('soundended', {detail: name}));
  };

  /* ʕ •ᴥ•ʔゝ☆ */
  return source;
}

for (let l in loops) {
  loops[l].active = false;
}

function startLoop(name, options) {
  let loop = loops[name];
  
  if (!loop) {
    console.warn('No loop named', name);
    return;
  }

  if (loop.active) return;

  let source = playSound(loop.sound, options);
  source.loop = true;

  // :)
  loop.source = source;
  loop.active = true;

  document.dispatchEvent(new CustomEvent('loopstarted', {detail: name}));

  return source;
}

function stopLoop(name, options) {
  let loop = loops[name];
  
  if (!loop) {
    console.warn('No loop named', name);
    return;
  }

  if (loop.active) {
    loop.source.stop();
    loop.source = null;
    loop.active = false;
    document.dispatchEvent(new CustomEvent('loopstopped', {detail: name}));
  }
}

function findSounds(name) {
  let foundSounds = [];
  for (let sound in sounds) {
    if (sound.indexOf(name) > -1) {
      foundSounds.push(sound);
    }
  }
  return foundSounds;
}

window.SoundManager = {
  get sounds () {
    return sounds;
  },
  get banks () {
    return soundBanks;
  },
  get events () {
    return soundEvents;
  },
  get loops () {
    return loops;
  },
  get musicEngine () {
    return musicEngine;
  },
  playSound: playSound,
  playRandomSoundFromBank: playRandomSoundFromBank,
  startLoop: startLoop,
  stopLoop: stopLoop,
  temporaryLowPass: temporaryLowPass,
  findSounds: findSounds,
  limitedSoundTimeouts: limitedSoundTimeouts,
  temporaryLowPassSettings: temporaryLowPassSettings,
  localStorageStatus: 'Empty',
  sequences: sequenceManagers,
  init: function () {
    return new Promise((resolve, reject) => {
      soundContext = new AudioContext();
      musicEngine = new Music(soundContext);

      globalBiquadFilter = soundContext.createBiquadFilter();
      globalBiquadFilter.type = 'allpass';
      globalBiquadFilter.Q.setTargetAtTime(temporaryLowPassSettings.Q, soundContext.currentTime, 0);
      globalBiquadFilter.frequency.setTargetAtTime(temporaryLowPassSettings.endFrequency, soundContext.currentTime, 0);

      musicEngine.globalGainNode.connect(globalBiquadFilter);
      globalBiquadFilter.connect(soundContext.destination);

      for(var key in sounds) {
        loadSound(key);
      }

      musicEngine.load().then(() => {
        resolve();
      });
    });
  },
  get globalLowPassFilterFrequency () {
    return globalBiquadFilter.frequency.value;
  },
  getSettingsForOutput: function () {
    let output = {
      sounds: JSON.parse(JSON.stringify(sounds)),
      banks: JSON.parse(JSON.stringify(soundBanks)),
      temporaryLowPass: JSON.parse(JSON.stringify(temporaryLowPassSettings))
    };
    
    // Clean up a little
    for (let s in output.sounds) {
      delete output.sounds[s].buffer;
    }

    return output;
  },
  loadSettingsFromLocalStorage: function () {
    let storedSettings = localStorage.getItem('sounds');

    function useParsedSettings(realSettings, parsedSettings) {
      // Using this to preserve object linking, because it makes things like vuejs more responsive!
      function doIt(src, dest) {
        for (let s in dest) {
          if (src[s]) {
            if (typeof dest[s] === 'object') {
              doIt(src[s], dest[s])
            }
            else {
              dest[s] = src[s];
            }
          }
        }
      }

      doIt(parsedSettings, realSettings);
    }

    try {
      if (storedSettings) {
        let parsedSettings = JSON.parse(storedSettings);

        useParsedSettings(sounds, parsedSettings.sounds);
        useParsedSettings(soundBanks, parsedSettings.banks);
        useParsedSettings(temporaryLowPassSettings, parsedSettings.temporaryLowPass);

        musicEngine.loadSettingsFromLocalStorage();

        SoundManager.localStorageStatus = 'Loaded';
      }
    }
    catch (e) {
      console.warn('Sound/music settings not loaded properly.');
      console.error(e);
    }
  },
  saveSettingsToLocalStorage: function () {
    localStorage.setItem('sounds', JSON.stringify(SoundManager.getSettingsForOutput()));
    musicEngine.saveSettingsToLocalStorage();
    SoundManager.localStorageStatus = 'Saved @ ' + (new Date()).toUTCString();
  },
  clearSettingsFromLocalStorage: function () {
    localStorage.removeItem('sounds');
    musicEngine.clearSettingsFromLocalStorage();
    SoundManager.localStorageStatus = 'Empty';
  },
  fireEvent: function (name, options) {
    if (soundEvents[name]) {
      soundEvents[name](options);
    }
    else {
      console.warn('No sound event named ', name);
    }
  }
};

})();
