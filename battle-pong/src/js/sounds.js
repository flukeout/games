// TODO
// * Make the options volume a 'factor' of the default sound volume, not an absolute value?
// * Remove the timeout stuff? Should just move it to the object that calls it?
// * That would allow us to not have two hit sounds...

// Prevent all of these variables and constants from polluting the global scope
(function () {

const superHardShotIntensityInjection = 15;

const temporaryLowPassSettings = {
  startFrequency: 500,
  endFrequency: 10000,
  attack: 0,
  sustain: 1.666,
  release: 1.666,
  Q: 10
};

let sounds = {
  "Text_Type_1" : {
    url : "sounds/Text_Type.mp3",
    volume : 1,
  },
  "Text_Type_2" : {
    url : "sounds/Text_Type_2.mp3",
    volume : 1,
  },

  "round-start" : {
    url : "sounds/round-start.mp3",
    volume : .25
  },
  "beep" : {
    url : "sounds/beep.mp3",
    volume : .15
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
  "Ball_Bounce_OwnEndzone_V1" : {
    url : "sounds/Ball_Bounce_OwnEndzone_V1.mp3",
    volume : 1,
  },
  "Ball_Bounce_OwnEndzone_V2" : {
    url : "sounds/Ball_Bounce_OwnEndzone_V2.mp3",
    volume : 1,
  },
  "Ball_Bounce_OwnEndzone_V3" : {
    url : "sounds/Ball_Bounce_OwnEndzone_V3.mp3",
    volume : 1,
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

  "Powerup_Bones_Deselect" : {
    url : "sounds/Powerup_Bones_Deselect.mp3",
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

  "Powerup_Ghost_Score" : {
    url : "sounds/Powerup_Ghost_Score.mp3",
    volume : 1
  },
  "Powerup_Ghost_WareOff" : {
    url : "sounds/Powerup_Ghost_WareOff.mp3",
    volume : 1
  },


  "Powerup_Sticky_Score" : {
    url : "sounds/Powerup_Sticky_Score.mp3",
    volume : 1
  },
  "Powerup_Sticky_WareOff" : {
    url : "sounds/Powerup_Sticky_WareOff.mp3",
    volume : 1
  },


  "Powerup_Sticky_Hit_V1" : {
    url : "sounds/Powerup_Sticky_Hit_V1.mp3",
    volume : 1
  },
  "Powerup_Sticky_Hit_V2" : {
    url : "sounds/Powerup_Sticky_Hit_V2.mp3",
    volume : 1
  },
  "Powerup_Sticky_Hit_V3" : {
    url : "sounds/Powerup_Sticky_Hit_V3.mp3",
    volume : 1
  },
  "Powerup_Sticky_Hit_V4" : {
    url : "sounds/Powerup_Sticky_Hit_V4.mp3",
    volume : 1
  },
  "Powerup_Sticky_Hit_V5" : {
    url : "sounds/Powerup_Sticky_Hit_V5.mp3",
    volume : 1
  },
  "Powerup_Sticky_Hit_V6" : {
    url : "sounds/Powerup_Sticky_Hit_V6.mp3",
    volume : 1
  },


  "Powerup_Spin_Wall_Bounce_V1" : {
    url : "sounds/Powerup_Spin_Wall_Bounce_V1.mp3",
    volume : 1
  },
  "Powerup_Spin_Wall_Bounce_V2" : {
    url : "sounds/Powerup_Spin_Wall_Bounce_V2.mp3",
    volume : 1
  },
  "Powerup_Spin_Wall_Bounce_V3" : {
    url : "sounds/Powerup_Spin_Wall_Bounce_V3.mp3",
    volume : 1
  },
  "Powerup_Spin_Wall_Bounce_V4" : {
    url : "sounds/Powerup_Spin_Wall_Bounce_V4.mp3",
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
  "Bomb_Disable" : {
    url : "sounds/Bomb_Disable.mp3",
    volume : 1
  },

  "Menu_Move" : {
    url : "sounds/Menu_Move.mp3",
    volume : 1
  },
  "Menu_Select" : {
    url : "sounds/Menu_Select.mp3",
    volume : 1
  },
  "Menu_Start&Blastoff": {
    url: "sounds/Menu_Start&Blastoff.mp3",
    volume: 1
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

  "Powerup_Spin_Startup" : {
    url : "sounds/Powerup_Spin_Startup.mp3",
    volume : 1
  }
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
  "spin-wall-bounce": {
    sounds: [
      "Powerup_Spin_Wall_Bounce_V1",
      "Powerup_Spin_Wall_Bounce_V2",
      "Powerup_Spin_Wall_Bounce_V3",
      "Powerup_Spin_Wall_Bounce_V4"
    ]
  },
  "sticky-hit": {
    sounds: [
      "Powerup_Sticky_Hit_V1",
      "Powerup_Sticky_Hit_V2",
      "Powerup_Sticky_Hit_V3",
      "Powerup_Sticky_Hit_V4",
      "Powerup_Sticky_Hit_V5",
      "Powerup_Sticky_Hit_V6"
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
    ],
    // ducking: {   gain: 0.2,    attack: 1.0,    sustain: 1,   release: 1    }
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
  },
  "ball-bounce-own-endzone": {
    sounds: [
      "Ball_Bounce_OwnEndzone_V1",
      "Ball_Bounce_OwnEndzone_V2",
      "Ball_Bounce_OwnEndzone_V3"
    ]
  },
  "type": {
    sounds: [
      "Text_Type_1",
      "Text_Type_2"
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
  'Ghost_Enters_Paddle_Enemy_Territory': () => {
    // SoundManager.startLowPass(500, 10, .1, 10000);
  },
  'Ghost_Leaves_Paddle_Enemy_Territory': () => {
    // SoundManager.stopLowPass(10000, .1);
  },
  'Super_Hard_Shot': () => {
    SoundManager.playRandomSoundFromBank("super-hard-shot");
    musicEngine.addIntensity(superHardShotIntensityInjection);
  },
  'Mine_Explosion': () => {
    SoundManager.playRandomSoundFromBank("mine-explosion", {excludeFromLowPassFilter: true});
    // SoundManager.temporaryLowPass();
  },
  'Finish_It_Heartbeat_Start': () => {
    SoundManager.startLoop('Finish_It_Heartbeat');
    SoundManager.startLowPass(temporaryLowPassSettings.startFrequency, temporaryLowPassSettings.Q, .1, temporaryLowPassSettings.endFrequency);
    // musicEngine.setMood('quiet');
    // musicEngine.temporarilyReduceGain(0.2);
  },
  'Finish_It_Heartbeat_Stop_Hit': () => {
    SoundManager.stopLoop('Finish_It_Heartbeat');
    SoundManager.playSound('Finish_It_Hit');
    SoundManager.stopLowPass(temporaryLowPassSettings.endFrequency, .1);
    // musicEngine.setMood('default');
    // musicEngine.resetGlobalGain();
  },
  'Finish_It_Heartbeat_Stop_Miss': () => {
    SoundManager.stopLoop('Finish_It_Heartbeat');
    SoundManager.playSound('Finish_It_Miss');
    SoundManager.stopLowPass(temporaryLowPassSettings.endFrequency, .1);
    // musicEngine.setMood('default');
    // musicEngine.resetGlobalGain();
  },
  'Pause_Game': () => {
    SoundManager.musicEngine.lockMood('pause', 0.4);
  },
  'Resume_Game': () => {
    SoundManager.musicEngine.unlockMood(0.4);
  }
};

let sequenceManagers = {
  Powerup_Spin: function () {
    let spinStart = null;
    let spinLoop = null;

    this.start = function () {
      if (!Settings.sounds) return;
      if (spinLoop) return;
      spinStart = SoundManager.playSound('Powerup_Spin_Spin_Start');
      spinLoop = SoundManager.startLoop('Powerup_Spin_Spin', {start: soundContext.currentTime + spinStart.source.buffer.duration - 0.1});
    };

    this.stop = function () {
      if (!Settings.sounds) return;
      if (!spinStart) return;
      if (!spinLoop) return;
      spinStart.source.stop();
      spinLoop.gain.gain.linearRampToValueAtTime(0, soundContext.currentTime + 0.20);
      SoundManager.stopLoop('Powerup_Spin_Spin', {stop: soundContext.currentTime + 0.20});
      spinLoop = null;
    };
  }
};

for (let sound in sounds) {
  sounds[sound].limit = sounds[sound].limit || 0;
  sounds[sound].ducking = sounds[sound].ducking || {
    gain: 1, attack: 0, sustain: 0, release: 0
  };
}

for (let sound in soundBanks) {
  soundBanks[sound].limit = soundBanks[sound].limit || 0;
  soundBanks[sound].ducking = soundBanks[sound].ducking || {
    gain: 1, attack: 0, sustain: 0, release: 0
  };
}

let limitedSoundTimeouts = {};
let temporaryLowpassTimeout = null;

let soundContext;
let globalBiquadFilter;
let musicEngine;

let soundBankMemory = {};

function loadSound(name){
  return new Promise((resolve, reject) => {

    var sound = sounds[name];
    var url = sound.url;
    var buffer = sound.buffer;

    var request = new XMLHttpRequest();
    request.open('GET', url, true);
    request.responseType = 'arraybuffer';

    request.onload = function() {
      soundContext.decodeAudioData(request.response, function(newBuffer) {
        sound.buffer = newBuffer;
        resolve();
      });
    }

    request.send();
  });
}

function playRandomSoundFromBank(soundBankName, options) {
  // Setup options in case it's not already initialized
  options = options || {};

  // Reference to the bank definition, containing references to sounds that can be played
  let soundBank = soundBanks[soundBankName];
  
  // The name of the sound that will eventually be pasesd to playSound
  let soundName;

  // If this sound bank exists, forge on...
  if (soundBank) {

    // Here, we limit the number of times a soundbank can be used within a certain amount of time
    if (soundBank.limit > 0) {

      // If there is a timeout waiting for this soundbank already, return.
      if(limitedSoundTimeouts['bank_' + soundBankName]) return;
      
      // Otherwise, remember a new timeout for this bank
      limitedSoundTimeouts['bank_' + soundBankName] = setTimeout(() => {

        // Forget this timeout so that this soundbank can be played again
        delete limitedSoundTimeouts['bank_' + soundBankName];

        // Let everyone know what happened :)
        document.dispatchEvent(new CustomEvent('limitedsoundbankfinished', {detail: soundBankName}));
      }, soundBank.limit);

      // Let everyone know what happened :)
      document.dispatchEvent(new CustomEvent('limitedsoundbankstarted', {detail: soundBankName}));
    }

    // Init the memory if it's not already there
    soundBankMemory[soundBankName] = soundBankMemory[soundBankName] || [];

    // Maintain a memory of half the length of the actual sound bank to avoid replaying the exact same sounds
    if (soundBankMemory[soundBankName].length > soundBank.sounds.length / 2) {

      // In FIFO fashion, push the beginning of the array off the cliff
      soundBankMemory[soundBankName].shift();
    }

    // Spin here until soundName becomes something we haven't played recently
    do {
      soundName = soundBank.sounds[Math.floor(Math.random() * soundBank.sounds.length)];
    } while(soundBankMemory[soundBankName].indexOf(soundName) > -1);

    // Push this soundName onto the end of the memory array, (again, in FIFO fashion)
    soundBankMemory[soundBankName].push(soundName);

    // If the bank has a ducking profile, we need to send it into playSound
    if (soundBank.ducking) {
      options.ducking = soundBank.ducking;
    }

    // PLAY THE SOUND!!
    playSound(soundName, options);

    // Let everyone know what happened :)
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

function startLowPass(frequency, Q, attack, startFrequency) {
  attack = attack || 0;
  frequency = frequency || 0;
  startFrequency = startFrequency || globalBiquadFilter.frequency;
  if (isNaN(attack)) attack = 0;
  if (isNaN(frequency)) frequency = 0;
  if (isNaN(startFrequency)) startFrequency = 0;

    // Set up the initial effect
  globalBiquadFilter.type = 'lowpass';

  globalBiquadFilter.frequency.cancelScheduledValues(soundContext.currentTime);
  globalBiquadFilter.frequency.setValueAtTime(startFrequency, soundContext.currentTime);
  globalBiquadFilter.frequency.linearRampToValueAtTime(frequency, soundContext.currentTime + attack);
}

let stopLowPassTimeout = -1;
function stopLowPass(endFrequency, release) {
  release = release || 0;
  endFrequency = endFrequency || 0;
  if (isNaN(release)) release = 0;
  if (isNaN(endFrequency)) endFrequency = 0;

  globalBiquadFilter.frequency.cancelScheduledValues(soundContext.currentTime);
  globalBiquadFilter.frequency.linearRampToValueAtTime(endFrequency, soundContext.currentTime + release);

  if (stopLowPassTimeout > -1) {
    clearTimeout(stopLowPassTimeout);
  }

  stopLowPassTimeout = setTimeout(() => {
    globalBiquadFilter.type = 'allpass';
  }, release * 1000);
}

function playSound(name, options){
  if (!Settings.sounds) return;

  let sound = sounds[name];

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

  let buffer = sound.buffer;

  options = options || {};

  if(!buffer){ return; }

  let soundOptions = {
    volume: sounds[name].volume || 1,
    pan: sounds[name].pan || 0,
    timeout: sounds[name].timeout || false
  };

  if ('volume' in options) {
    soundOptions.volume = options.volume;
  }

  for(let k in options){
    if(soundOptions[k]) {
      soundOptions[k] = options[k];
    }
  }

  let source = soundContext.createBufferSource();
  source.buffer = buffer;

  let panNode = soundContext.createStereoPanner();
  panNode.pan.setTargetAtTime(soundOptions.pan, soundContext.currentTime, 0);

  let volume = soundContext.createGain();
  volume.gain.setTargetAtTime(soundOptions.volume, soundContext.currentTime, 0);

  // Some sounds shouldn't be affected by the low pass filter, like bomb explosions
  if (options.excludeFromLowPassFilter) {
    panNode.connect(soundContext.destination);
  }
  else {
    panNode.connect(globalBiquadFilter);
  }

  volume.connect(panNode);
  source.connect(volume);

  let duckingProfile = options.ducking || sound.ducking;

  // Use a ducking profile if it exists, but only if it's not basically null.
  if (duckingProfile && (duckingProfile.sustain > 0 || duckingProfile.attack > 0 || duckingProfile.release > 0)) {
    musicEngine.duck(duckingProfile);
  }

  source.start(options.start || 0);

  document.dispatchEvent(new CustomEvent('soundplayed', {detail: name}));

  source.onended = () => {
    document.dispatchEvent(new CustomEvent('soundended', {detail: name}));
  };

  /* ʕ •ᴥ•ʔゝ☆ */
  return {
    source: source,
    pan: panNode,
    gain: volume
  };
}

for (let l in loops) {
  loops[l].active = false;
}

function startLoop(name, options) {
  if (!Settings.sounds) return;

  let loop = loops[name];
  
  options = options || {};

  if (!loop) {
    console.warn('No loop named', name);
    return;
  }

  if (loop.active) return;

  let finalVolume = sounds[loop.sound].volume;
  let startVolume = loop.inDuration ? 0 : sounds[loop.sound].volume;

  options.volume = startVolume;

  let sound = playSound(loop.sound, options);
  sound.source.loop = true;

  // :)
  loop.source = sound.source;
  loop.active = true;
  loop.gain = sound.gain;

  if (loop.inDuration) {
    // Should we make this a multiplier of the original?  
    loop.gain.gain.linearRampToValueAtTime(finalVolume, soundContext.currentTime + loop.inDuration);
  }

  document.dispatchEvent(new CustomEvent('loopstarted', {detail: name}));

  return sound;
}

function stopLoop(name, options) {
  if (!Settings.sounds) return;

  let loop = loops[name];
  
  options = options || {};

  if (!loop) {
    console.warn('No loop named', name);
    return;
  }

  if (loop.active) {
    let oldSource = loop.source;

    function doStop () {
      oldSource.stop(options.stop || soundContext.currentTime);
      document.dispatchEvent(new CustomEvent('loopstopped', {detail: name}));      
    }

    loop.source = null;
    loop.active = false;
    
    if (loop.outDuration) {
      loop.gain.gain.linearRampToValueAtTime(0, soundContext.currentTime + loop.outDuration);
      setTimeout(doStop, loop.outDuration * 1000);
    }
    else {
      doStop();
    }
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
  startLowPass: startLowPass,
  stopLowPass: stopLowPass,
  findSounds: findSounds,
  limitedSoundTimeouts: limitedSoundTimeouts,
  temporaryLowPassSettings: temporaryLowPassSettings,
  localStorageStatus: 'Empty',
  sequences: sequenceManagers,
  init: function (options) {
    options = options || {};
    
    return new Promise((resolve, reject) => {
      soundContext = new AudioContext();
      musicEngine = new Music(soundContext);

      globalBiquadFilter = soundContext.createBiquadFilter();
      globalBiquadFilter.type = 'allpass';
      globalBiquadFilter.Q.setTargetAtTime(temporaryLowPassSettings.Q, soundContext.currentTime, 0);
      globalBiquadFilter.frequency.setTargetAtTime(temporaryLowPassSettings.endFrequency, soundContext.currentTime, 0);

      musicEngine.globalGainNode.connect(globalBiquadFilter);
      globalBiquadFilter.connect(soundContext.destination);


      let promises = Object.keys(sounds).map(key => { return loadSound(key); });

      promises.push(musicEngine.load());
      Promise.all(promises).then(() => {
        if (options.preventAutoLoadingOfSettings) {
          resolve();
        }
        else {
          SoundManager.loadSettingsIntelligently().then(() => {
            resolve();
          });
        }
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
  loadSettingsIntelligently: function () {
    return new Promise((yay, nay) => {
      if (localStorage.getItem('sounds')) {
        console.log('Found sound settings in Local Storage');
        SoundManager.loadSettingsFromLocalStorage();
        yay();
      }
      else {
        console.log('No sound settings in Local Storage. Loading from file.');
        SoundManager.loadSoundSettingsFile()
          .then(yay)
          .catch((err) => {
            console.error(err);
            console.log('No sound settings found anywhere. Using defaults.');
            yay();
          });
      }
    });
  },
  loadSoundSettingsFile: function () {
    return new Promise((yay, nay) => {
      fetch('/sound-settings.json', {
        cache: 'no-cache',
        method: 'GET',
        headers: {
          'content-type': 'application/json'
        }
      }).then(res => {
        if (res.ok) {
          res.json().then(json => {
            SoundManager.loadSettingsFromJSON(json);
            yay();
          });
        }
        else {
          nay();
        }
      }).catch((err) => {
        nay(err);
      });
    });
  },
  loadSettingsFromJSON: function (json) {
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
      if (json) {
        useParsedSettings(sounds, json.sound.sounds);
        useParsedSettings(soundBanks, json.sound.banks);
        useParsedSettings(temporaryLowPassSettings, json.sound.temporaryLowPass);
        musicEngine.loadSettingsFromJSON(json.music);
        SoundManager.localStorageStatus = 'Loaded';
      }
    }
    catch (e) {
      console.warn('Sound/music settings not loaded properly.');
      console.error(e);
    }
  },
  loadSettingsFromLocalStorage: function () {
    let json = {
      sound: JSON.parse(localStorage.getItem('sounds')),
      music: JSON.parse(localStorage.getItem('music'))
    };

    if (json.sound && json.music) {
      SoundManager.loadSettingsFromJSON(json);
    }
  },
  saveSettingsToLocalStorage: function () {
    localStorage.setItem('sounds', JSON.stringify(SoundManager.getSettingsForOutput()));
    localStorage.setItem('music', JSON.stringify(musicEngine.getSettingsForOutput()));
    SoundManager.localStorageStatus = 'Saved @ ' + (new Date()).toUTCString();
  },
  clearSettingsFromLocalStorage: function () {
    localStorage.removeItem('sounds');
    localStorage.removeItem('music');
    SoundManager.localStorageStatus = 'Empty';
  },
  fireEvent: function (name, options) {
    if (soundEvents[name]) {
      soundEvents[name](options);
    }
    else {
      console.warn('No sound event named ', name);
    }
  },
  resumeAudioContext: function () {
    // Because of https://developers.google.com/web/updates/2017/09/autoplay-policy-changes#webaudio
    soundContext.resume();
  }
};

})();
