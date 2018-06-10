(function () {
  const intensityChangeDelay = 1000;
  const intensityReductionFactor = .75;
  const intensityBoostReductionFactor = .01;
  const moodIntervalAttackTime = 0.95;
  const temporaryLevelDelayRecoveryTimeInSeconds = 1.5;
  const defaultGlobalGainValue = .3;
  
  const temporaryMoodDurations = {
    intense: 3500
  };

  const files = [
    'music/GamplayMusic1_Intro_Layer1.mp3',
    'music/GamplayMusic1_Intro_Layer2.mp3',
    'music/GamplayMusic1_Intro_Layer3.mp3',
    'music/GamplayMusic1_PartA&B_Layer1.mp3',
    'music/GamplayMusic1_PartA&B_Layer2.mp3',
    'music/GamplayMusic1_PartA&B_Layer3.mp3',
    'music/GamplayMusic1_PartA&B_Layer4.mp3',
    'music/MenuMusic1.mp3'
  ];

  const songs = {
    menu: {
      loopDuration: 69.81818181,
      layers: {
        one: {
          file: 'music/MenuMusic1.mp3',
          moods: { default: 1 }
        }
      }
    },
    gameplayIntro: {
      bps: 1/(110/60),
      loopDuration: 34.9090909090,
      layers: {
        one: {
          file: 'music/GamplayMusic1_Intro_Layer1.mp3',
          moods: { default: 1, pause: 1 }
        },
        two: {
          file: 'music/GamplayMusic1_Intro_Layer2.mp3',
          moods: { default: 1, pause: 0 }
        },
        three: {
          file: 'music/GamplayMusic1_Intro_Layer3.mp3',
          moods: { default: 1, pause: 0 }
        }
      }
    },
    gameplay: {
      bps: 1/(110/60),
      loopDuration: 69.81818181,
      layers: {
        one: {
          file: 'music/GamplayMusic1_PartA&B_Layer1.mp3',
          moods: {
            default: 1,
            pause: 1,
            level1: 1,
            level2: 1,
            level3: 1,
            level4: 1
          }
        },
        two: {
          file: 'music/GamplayMusic1_PartA&B_Layer2.mp3',
          moods: {
            default: 1,
            pause: 0,
            level1: 1,
            level2: 1,
            level3: 1,
            level4: 1
          }
        },
        three: {
          file: 'music/GamplayMusic1_PartA&B_Layer3.mp3',
          moods: {
            default: 0,
            pause: 0,
            level1: 0,
            level2: 0,
            level3: 1,
            level4: 1
          }
        },
        four: {
          file: 'music/GamplayMusic1_PartA&B_Layer4.mp3',
          moods: {
            default: 0,
            pause: 0,
            level1: 0,
            level2: 0,
            level3: 0,
            level4: 1
          }
        }
      }      
    }
  };

  let songChains = {
    gameplay: [
      { name: 'gameplayIntro' },
      { name: 'gameplay', loop: true }
    ]
  };

  let intensityThresholds = {
    default: -1,
    level1: 0,
    level2: 5,
    level3: 10,
    level4: 20
  };

  window.Music = function (audioContext) {
    let currentSong = null;
    let preparedSongs = {};
    let songChainListeners = [];
    let beatCallbacks = [];

    let globalGainNode = audioContext.createGain();
    let duckingNode = audioContext.createGain();
    
    globalGainNode.gain.setValueAtTime(defaultGlobalGainValue, audioContext.currentTime);

    duckingNode.connect(globalGainNode);
    globalGainNode.connect(audioContext.destination);

    this.duckingNode = duckingNode;
    this.globalGainNode = globalGainNode;

    // TODO: clean this up. It's a really bad way of handling this situation.
    this.getMoods = function () { if (currentSong) return currentSong.getMoods(); };
    this.temporarilyReduceGain = function (percentage) { if (currentSong) return currentSong.temporarilyReduceGain(percentage); };
    this.resetGlobalGain = function () { if (currentSong) return currentSong.resetGlobalGain(); };
    this.setGlobalGain = function (value, ramp) { if (currentSong) return currentSong.setGlobalGain(value, ramp); };
    this.getGlobalGain = () => { if (currentSong) return currentSong.getGlobalGain(); };
    this.duck = function (duckingProfile) { if (currentSong) return currentSong.duck(duckingProfile); };
    this.lockMood = function (mood, attackTime) { if (currentSong) return currentSong.lockMood(mood, attackTime); };
    this.unlockMood = function (mood, releaseTime) { if (currentSong) return currentSong.unlockMood(mood, releaseTime); };
    this.setMood = function (mood, attackTime) { if (currentSong) return currentSong.setMood(mood, attackTime); };
    this.setLayerMood = function (layerName, mood) { if (currentSong) return currentSong.setLayerMood(layerName, mood); };
    this.setLevels = function (levels) { if (currentSong) return currentSong.setLevels(levels); };
    this.getLayerDefinitions = () => { if (currentSong) return currentSong.getLayerDefinitions(); };
    this.getLayers = () => { if (currentSong) return currentSong.getLayers(); };
    this.getContext = () => { if (currentSong) return currentSong.getContext(); };
    this.addIntensity = (newIntensity) => { if (currentSong) return currentSong.addIntensity(newIntensity); };

    Object.defineProperties(this, {
      currentIntensity: {
        get: () => {
          if (currentSong) return currentSong.currentIntensity;
        }
      },
      targetIntensity: {
        get: () => {
          if (currentSong) return currentSong.targetIntensity;
        },
        set: (targetIntensity) => {
          if (currentSong) currentSong.targetIntensity = targetIntensity;
        }
      },
      bps: {
        get: () => {
          if (currentSong) return currentSong.songDefinition.bps;
          return 0;
        }
      }
    });

    this.status = 'loading';

    this.currentSongName = null;

    this.cueSong = function (songName) {
      currentSong = preparedSongs[songName];
      if (!preparedSongs[songName]) {
        console.warn('No song named ', songName);
      }

      this.currentSong = currentSong;
      this.currentSongName = songName;

      this.status = 'ready';
    };

    this.getNumberOfAssetsToLoad = function () {
      return files.length;
    };

    this.load = function (options) {
      options = options || {};

      return new Promise(async (resolve, reject) => {
        let buffers = {};
        let bufferPromises = [];

        let loaded = 0;
        Promise.all(files.map(file => {
          return new Promise((requestResolve, requestReject) => {
            let request = new XMLHttpRequest();
            request.open('GET', file, true);
            request.responseType = 'arraybuffer';
            request.onload = () => audioContext.decodeAudioData(request.response, buffer => {
              buffers[file] = buffer;
              ++loaded;
              options.progress && options.progress(files.length, loaded);
              requestResolve(buffer);
            });
            request.send();
          });
        })).then(() => {
          let songPromises = [];
          for (let songName in songs) {
            preparedSongs[songName] = new Song(songName, audioContext, buffers, songs[songName], globalGainNode, duckingNode);
            songPromises.push(preparedSongs[songName].load());
          }

          Promise.all(songPromises).then(() => {
            this.status = 'ready';
            resolve();
          });
        });
      });
    };

    this.addSongChainListener = function (listener) {
      songChainListeners.push(listener);
    };

    this.playSongChain = function (name) {
      // TODO: uncouple this stuff a bit so that you can hit playSongChain more than once...

      let songChain = songChains[name].slice();

      if (currentSong) {
        currentSong.stop();
      }

      let playNextSong = () => {
        let nextSong = songChain.shift();
        let oldIntensity = 0;
        let oldMood = 'default';

        if (currentSong) {
          currentSong.clearLoopListeners();
          oldIntensity = currentSong.getIntensity();
          oldMood = currentSong.getMood();
        }

        this.cueSong(nextSong.name);

        if (!nextSong.loop) {
          currentSong.addLoopListener(playNextSong);
        }

        currentSong.setMood(oldMood, 0);
        currentSong.setIntensity(oldIntensity, true);

        this.start({ loop: nextSong.loop });
        songChainListeners.forEach(l => l());
      };

      playNextSong();
    };

    function onSongBeat () {
      beatCallbacks.forEach(bc => bc());
    }

    this.addBeatCallback = function (callback) {
      beatCallbacks.push(callback);
    };

    this.removeBeatCallbacks = function () {
      beatCallbacks = [];
    };

    this.start = function (options) {
      this.status = 'playing';
      currentSong.setBeatCallback(onSongBeat);
      return currentSong.start(options);
    };

    this.stop = function () {
      this.status = 'stopped';
      currentSong.resetSongGainNode();
      currentSong.setBeatCallback(null);
      return currentSong.stop();
    };

    this.fadeIn = function (duration, options) {
      this.status = 'playing';
      return currentSong.fadeIn(duration, options);
    };

    this.fadeOut = function (duration) {
      if (currentSong) {
        return currentSong.fadeOut(duration).then(() => {
          this.status = 'stopped';
        });
      }
      return null;
    };

    this.getSettingsForOutput = function () {
      return {
        globalGainValue: globalGainNode.gain.value
      };
    };

    this.loadSettingsFromJSON = function (json) {
      if (json) {
        globalGainNode.gain.setValueAtTime(json.globalGainValue, audioContext.currentTime);
      }
    };

    this.getSongs = () => { return songs; };
    this.getSongChains = () => { return songChains; };
  };

  let Song = function (songName, audioContext, buffers, songDefinition, globalGainNode, duckingNode) {
    let layers = {};
    let lastLoopTime = 0;
    let intensity = 0;
    let boostIntensity = 0;
    let baseIntensity = 0;
    let layerDefinitions = songDefinition.layers;
    let loopListeners = [];
    let loop = false;
    let loopingInterval = null;
    let moodInterval = null;
    let duckingTimeout = -1;
    let currentMood = 'default';
    let beatCallback = null;
    let beatInterval = -1;
    let beating = false;
    let startTime = 0;

    audioContext = audioContext || new AudioContext();

    let songGainNode = audioContext.createGain();
    
    this.temporaryMoodDurations = temporaryMoodDurations;
    this.currentDuckingProfile = null;
    this.duckingNode = duckingNode;
    this.globalGainNode = globalGainNode;
    this.currentIntensity = intensity;

    let targetIntensity = intensity;
    let nextTargetIntensity = targetIntensity;

    Object.defineProperty(this, 'targetIntensity', {
      get: () => {
        return targetIntensity;
      },
      set: (newTargetIntensity) => {
        nextTargetIntensity = newTargetIntensity;
      }
    });
    
    this.songDefinition = songDefinition;

    songGainNode.connect(duckingNode);
    songGainNode.gain.setTargetAtTime(1, audioContext.currentTime, 0);

    function createLayer(layerName, buffer) {
      let gainNode = audioContext.createGain();

      let layer = {
        source: null,
        lastSource: null,
        init: () => {
          let gainValue = layerDefinitions[layerName].moods.default;
          gainValue = isNaN(Number(gainValue)) ? 0 : gainValue;
          gainNode.gain.setTargetAtTime(gainValue, audioContext.currentTime, 0);

          gainNode.connect(songGainNode);

          layer.source = layer.createSourceNode();
        },
        createSourceNode: () => {
          let sourceNode = audioContext.createBufferSource();
          sourceNode.buffer = buffer;
          sourceNode.connect(gainNode);
          sourceNode.loop = false;
          return sourceNode;          
        },
        start: () => {
          layer.init(0);
          layer.source.start(0);
        },
        stop: () => {
          // TODO: Make sure this still works with looping
          if (layer.source) {
            layer.source.stop();

            // TODO: More cleanup to get rid of nodes that aren't needed anymore
            layer.source.disconnect(gainNode);
            layer.source = null;
          }
        },
        getLoopSwappingReady: function () {
          let newSourceNode = layer.createSourceNode();
          let oldSourceNode = layer.source;
          newSourceNode.start(lastLoopTime + songDefinition.loopDuration);
          layer.source = newSourceNode;

          // TODO: Make sure this actually disconnects when it rolls over
          if (layer.lastSource) {
            layer.lastSource.disconnect(gainNode);
          }

          layer.lastSource = oldSourceNode;
        },
        source: null,
        gain: gainNode,
        temporaryLevelDelay: null
      };

      return layer;
    }

    this.resetSongGainNode = () => {
      songGainNode.gain.setValueAtTime(1, audioContext.currentTime);
    };

    this.getMoods = function () {
      let allMoods = [];
      
      for (let layer in layerDefinitions) {
        if (layerDefinitions[layer].moods) {
          for (let mood in layerDefinitions[layer].moods) {
            if (allMoods.indexOf(mood) === -1) allMoods.push(mood);
          }
        }
      }

      return allMoods;
    };

    let oldGlobalGain = defaultGlobalGainValue;
    this.temporarilyReduceGain = function (percentage) {
      oldGlobalGain = this.getGlobalGain();
      this.setGlobalGain(oldGlobalGain * percentage, 0.15);
    };

    this.resetGlobalGain = function () {
      this.setGlobalGain(oldGlobalGain, 0.75);
    };

    this.setGlobalGain = function (value, ramp) {
      ramp = ramp || 0;
      globalGainNode.gain.setTargetAtTime(value, audioContext.currentTime, ramp);
    };

    this.getGlobalGain = () => { return globalGainNode.gain.value; };

    this.duck = function (profile) {
      if (!profile) return;

      if (duckingTimeout > -1) {
        clearTimeout(duckingTimeout);
        document.dispatchEvent(new CustomEvent('duckinginterrupted'));
      }

      document.dispatchEvent(new CustomEvent('duckingstarted', {detail: profile}));

      duckingNode.gain.cancelScheduledValues(audioContext.currentTime);
      duckingNode.gain.linearRampToValueAtTime(profile.gain, audioContext.currentTime + profile.attack);
      duckingNode.gain.linearRampToValueAtTime(profile.gain, audioContext.currentTime + profile.attack + profile.sustain);
      duckingNode.gain.linearRampToValueAtTime(1, audioContext.currentTime + profile.attack + profile.sustain + profile.release);

      duckingTimeout = setTimeout(() => {
        duckingTimeout = -1;
        document.dispatchEvent(new CustomEvent('duckingstopped'));
      }, (profile.attack + profile.sustain + profile.release) * 1000);
    };

    this.load = function () {
      return new Promise(async (resolve, reject) => {
        for (let layerName in layerDefinitions) {
          if (!buffers[layerDefinitions[layerName].file]) {
            console.warn('Buffer for', layerName, 'does not exist.');
          }
          layers[layerName] = createLayer(layerName, buffers[layerDefinitions[layerName].file]);
        }

        resolve();
      });
    };

    let lockedMood = null;
    this.lockMood = function (mood, attackTime) {
      lockedMood = currentMood;
      this.setMood(mood, attackTime);
      this.stopMoodInterval();
    };

    this.unlockMood = function (releaseTime) {
      if (lockedMood) {
        this.setMood(lockedMood, releaseTime);
        this.startMoodInterval();
        lockedMood = null;        
      }
    };

    this.setMood = function (mood, attackTime) {
      currentMood = mood;
      for (let layerName in layers) {
        this.setLayerMood(layerName, mood, attackTime);
      }
    };

    this.setLayerMood = function (layerName, mood, attackTime) {
      let layer = layers[layerName];
      if (!layer) {
        console.warn('No music layer named ', layerName);
        return;
      }

      attackTime = attackTime || 0;

      let moodValue = layerDefinitions[layerName].moods.default;

      if (mood in layerDefinitions[layerName].moods) {
        moodValue = layerDefinitions[layerName].moods[mood];
      }

      // If this layer doesn't have a value set for this mood, assuming it's meant to keep playing the way it already is
      if (isNaN(Number(moodValue))) {
        return;
      }

      if (!layers[layerName].gain) return;

      layer.gain.gain.cancelScheduledValues(audioContext.currentTime);
      layer.gain.gain.linearRampToValueAtTime(moodValue, audioContext.currentTime + attackTime);

      document.dispatchEvent(new CustomEvent('musicmoodstart', {detail: mood}));
    };

    this.setLevels = function (levels) {
      for (let layer in levels) {
        if (!layers[layer].gain) return;
        layers[layer].gain.gain.setTargetAtTime(levels[layer], audioContext.currentTime, 0);
      }
    };

    function getLowestIntensityMood () {
      let moodWithLowestThreshold = 'default';
      let lowestThreshold = -1;
      for (let mood in intensityThresholds) {
        if (intensityThresholds[mood] <= intensity && intensityThresholds[mood] > lowestThreshold) {
          moodWithLowestThreshold = mood;
          lowestThreshold = intensityThresholds[mood];
        }
      }

      return moodWithLowestThreshold;
    }

    this.addLoopListener = function (loopListener) {
      loopListeners.push(loopListener);
    };

    this.clearLoopListeners = function () {
      loopListeners = [];
    };

    this.start = function (options) {
      let endedLayers = 0;
      let numLayers = Object.keys(layers).length;

      loop = options.loop;

      options = options || {};

      for (let layer in layers) {
        layers[layer].start();

        if (!loop) {
          layers[layer].source.addEventListener('ended', (e) => {
            ++endedLayers;
            if (endedLayers === numLayers) {
              this.stop();
            }
          });
        }
      }

      startTime = audioContext.currentTime;
      beating = false;

      beatInterval = setInterval(() => {
        let songTime = audioContext.currentTime - startTime;
        let beatBinary = Math.round(songTime % songDefinition.bps);

        if (beatBinary === 1) {
          beating = true;
        }
        else if (beating === true) {
          beating = false;
          beatCallback && beatCallback();
        }
      }, 10);

      this.startLoopingInterval();
      this.startMoodInterval();
    };

    this.setBeatCallback = function (callback) {
      beatCallback = callback;
    };

    this.startLoopingInterval = function () {
      lastLoopTime = audioContext.currentTime;

      loopingInterval = setInterval(() => {
        // Looping logic
        if (audioContext.currentTime - lastLoopTime > songDefinition.loopDuration - 1) {
          if (loop) {
            for (let layerName in layers) {
              let layer = layers[layerName];
              layer.getLoopSwappingReady();
            }
          }

          let remainingTime = (lastLoopTime + songDefinition.loopDuration) - audioContext.currentTime;

          lastLoopTime += songDefinition.loopDuration;

          // TODO: this is... a terrible way of relying on specific timing. :(
          setTimeout(function () {
            loopListeners.forEach(l => l());
          }, remainingTime * 1000);
        }
      }, 50);
    };

    this.stopLoopingInterval = function () {
      if (loopingInterval > 0) {
        clearInterval(loopingInterval);
        loopingInterval = null;
      }
    };

    let lastIntensityChangeTime;
    this.startMoodInterval = function () {
      lastIntensityChangeTime = Date.now();

      moodInterval = setInterval(() => {
        let currentTime = Date.now();

        // TODO: use different delays if it's going up vs. down
        if (currentTime - lastIntensityChangeTime > intensityChangeDelay) {
          lastIntensityChangeTime = Date.now();
          targetIntensity = nextTargetIntensity;
        }

        baseIntensity -= (baseIntensity - targetIntensity) * intensityReductionFactor;
        boostIntensity -= boostIntensity * intensityBoostReductionFactor;

        intensity = baseIntensity + boostIntensity;
        this.currentIntensity = intensity;

        let moodWithLowestThreshold;
        let lowestThreshold = -1;
        for (let mood in intensityThresholds) {
          if (intensityThresholds[mood] <= intensity && intensityThresholds[mood] > lowestThreshold) {
            moodWithLowestThreshold = mood;
            lowestThreshold = intensityThresholds[mood];
          }
        }

        let suggestedMood = getLowestIntensityMood();
        if (currentMood !== suggestedMood) {
          this.setMood(suggestedMood, moodIntervalAttackTime);
        }
      }, 50);
    };

    this.getIntensities = function () {
      console.log('intensityChangeDelay: ', intensityChangeDelay);
      console.log('lastIntensityChangeTime: ', lastIntensityChangeTime);
      console.log('time delta: ', Date.now() - lastIntensityChangeTime);
      console.log('Base: ', baseIntensity);
      console.log('Boost: ', boostIntensity);
      console.log('Target: ', this.targetIntensity);
      console.log('Total: ', this.currentIntensity);
    };

    this.stopMoodInterval = function () {
      if (moodInterval > 0) {
        clearInterval(moodInterval);
        moodInterval = null;
      }
    };

    this.stop = function () {
      for (let layer in layers) {
        layers[layer].stop();
      }

      this.stopMoodInterval();
      this.stopLoopingInterval();

      songGainNode.gain.cancelScheduledValues(audioContext.currentTime);
    };

    this.fadeIn = function (duration, options) {
      songGainNode.gain.setValueAtTime(0, audioContext.currentTime);
      songGainNode.gain.linearRampToValueAtTime(1, audioContext.currentTime + duration);
      this.start(options);
    };

    this.fadeOut = function (duration) {
      songGainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + duration);
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          this.stop();
          resolve();
        }, duration * 1000);
      });
    };

    this.getLayerDefinitions = () => { return layerDefinitions; };
    this.getLayers = () => { return layers; };
    this.getContext = () => { return audioContext; };

    this.getMood = () => { return currentMood; };
    this.getIntensity = () => { return intensity; };

    this.addIntensity = (newIntensity) => {
      boostIntensity += Number(newIntensity);
      let suggestedMood = getLowestIntensityMood();
      if (currentMood !== suggestedMood) {
        this.setMood(suggestedMood, moodIntervalAttackTime);
      }
    };

    this.setIntensity = (newIntensity, immediately) => {
      newIntensity = Number(newIntensity);

      this.targetIntensity = newIntensity;

      if (immediately) baseIntensity = newIntensity;

      let suggestedMood = getLowestIntensityMood();
      if (currentMood !== suggestedMood) {
        this.setMood(suggestedMood, moodIntervalAttackTime);
      }
    };
  };

})();