(function () {
  const intensityReductionFactor = .01;
  const moodTransitionFactor = 0.95;
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

    let globalGainNode = audioContext.createGain();
    let duckingNode = audioContext.createGain();
    
    globalGainNode.gain.setValueAtTime(defaultGlobalGainValue, audioContext.currentTime);

    duckingNode.connect(globalGainNode);
    globalGainNode.connect(audioContext.destination);

    this.duckingNode = duckingNode;
    this.globalGainNode = globalGainNode;

    this.getMoods = function () { return currentSong.getMoods(); };
    this.temporarilyReduceGain = function (percentage) { return currentSong.temporarilyReduceGain(percentage); };
    this.resetGlobalGain = function () { return currentSong.resetGlobalGain(); };
    this.setGlobalGain = function (value, ramp) { return currentSong.setGlobalGain(value, ramp); };
    this.getGlobalGain = () => { return currentSong.getGlobalGain(); };
    this.duck = function (duckingProfile) { return currentSong.duck(duckingProfile); };
    this.transitionToMood = function (mood) { return currentSong.transitionToMood(mood); };
    this.lockMood = function (mood) { return currentSong.lockMood(mood); };
    this.unlockMood = function (mood) { return currentSong.unlockMood(mood); };
    this.setMood = function (mood) { return currentSong.setMood(mood); };
    this.transitionLayerMood = function (layerName, mood, oldMood) { return currentSong.transitionLayerMood(layerName, mood, oldMood) };
    this.setLayerMood = function (layerName, mood) { return currentSong.setLayerMood(layerName, mood); };
    this.setLayerMoodTemporarily = function (layerName, mood, time) { return currentSong.setLayerMoodTemporarily(layerName, mood, time); };
    this.setLevels = function (levels) { return currentSong.setLevels(levels); };
    this.getLayerDefinitions = () => { return currentSong.getLayerDefinitions(); };
    this.getLayers = () => { return currentSong.getLayers(); };
    this.getContext = () => { return currentSong.getContext(); };
    this.addIntensity = (newIntensity) => { return currentSong.addIntensity(newIntensity); };

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

    this.load = function () {
      return new Promise(async (resolve, reject) => {
        let buffers = {};
        let requests = {};

        files.forEach(file => {
          requests[file] = new Promise((requestResolve, requestReject) => {
            let request = new XMLHttpRequest();
            request.open('GET', file, true);
            request.responseType = 'arraybuffer';
            request.onload = () => audioContext.decodeAudioData(request.response, buffer => requestResolve(buffer));
            request.send();
          });
        });

        // TODO: make these load asynchronously
        for (let file in requests) {
          buffers[file] = await requests[file];
        }

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
        if (currentSong) {
          currentSong.clearLoopListeners();
          oldIntensity = currentSong.getIntensity();
        }
        this.cueSong(nextSong.name);
        if (!nextSong.loop) {
          currentSong.addLoopListener(playNextSong);
        }
        currentSong.setIntensity(oldIntensity);
        this.start({ loop: nextSong.loop });
        songChainListeners.forEach(l => l());
      };

      playNextSong();
    };

    this.start = function (options) {
      this.status = 'playing';
      return currentSong.start(options);
    };

    this.stop = function () {
      this.status = 'stopped';
      currentSong.resetSongGainNode();
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
    let layerDefinitions = songDefinition.layers;
    let loopListeners = [];
    let loop = false;
    let loopingInterval = null;
    let moodInterval = null;
    let duckingTimeout = -1;
    let currentMood = 'default';

    audioContext = audioContext || new AudioContext();

    let songGainNode = audioContext.createGain();
    
    this.temporaryMoodDurations = temporaryMoodDurations;
    this.currentDuckingProfile = null;
    this.duckingNode = duckingNode;
    this.globalGainNode = globalGainNode;
    this.currentIntensity = intensity;
    
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

    this.transitionToMood = function (mood) {
      let oldMood = currentMood;
      currentMood = mood;
      for (let layerName in layers) {
        this.transitionLayerMood(layerName, mood, oldMood);
      }
    };

    let lockedMood = null;
    this.lockMood = function (mood) {
      lockedMood = currentMood;
      this.setMood(mood);
      this.stopMoodInterval();
    };

    this.unlockMood = function () {
      if (lockedMood) {
        this.setMood(lockedMood);
        this.startMoodInterval();
        lockedMood = null;        
      }
    };

    this.setMood = function (mood) {
      currentMood = mood;
      for (let layerName in layers) {
        this.setLayerMood(layerName, mood);
      }
    }

    this.transitionLayerMood = function (layerName, mood, oldMood) {
      let layer = layers[layerName];
      if (!layer) {
        console.warn('No music layer named ', layerName);
        return;
      }

      let moodValue = layerDefinitions[layerName].moods.default;

      if (mood in layerDefinitions[layerName].moods) {
        moodValue = layerDefinitions[layerName].moods[mood];
      }

      // If this layer doesn't have a value set for this mood, assuming it's meant to keep playing the way it already is
      if (isNaN(Number(moodValue))) {
        return;
      }

      // layer.gain.gain.linearRampToValueAtTime(defaultGainValue, audioContext.currentTime + temporaryLevelDelayRecoveryTimeInSeconds);

      if (!layers[layerName].gain) return;

      layer.gain.gain.cancelScheduledValues(audioContext.currentTime);
      layer.gain.gain.setTargetAtTime(moodValue, audioContext.currentTime, moodTransitionFactor);

      document.dispatchEvent(new CustomEvent('musicmoodstart', {detail: mood}));
    };

    this.setLayerMood = function (layerName, mood) {
      let layer = layers[layerName];
      if (!layer) {
        console.warn('No music layer named ', layerName);
        return;
      }


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
      layer.gain.gain.setTargetAtTime(moodValue, audioContext.currentTime, 0);

      document.dispatchEvent(new CustomEvent('musicmoodstart', {detail: mood}));
    };

    this.setLayerMoodTemporarily = function (layerName, mood, time) {
      let layer = layers[layerName];
      if (!layer) {
        console.warn('No music layer named ', layerName);
        return;
      }

      let moodValue = layerDefinitions[layerName].moods[mood] || layerDefinitions[layerName].moods.default;
      // If this layer doesn't have a value set for this mood, assuming it's meant to keep playing the way it already is
      if (isNaN(Number(moodValue))) {
        return;
      }

      if (layer.temporaryLevelDelay) {
        clearTimeout(layer.temporaryLevelDelay);
        layer.gain.gain.cancelScheduledValues(audioContext.currentTime);
      }

      layer.gain.gain.setTargetAtTime(moodValue, audioContext.currentTime, 0);

      layer.temporaryLevelDelay = setTimeout(() => {
        let defaultGainValue = layerDefinitions[layerName].moods.default;
        layer.gain.gain.linearRampToValueAtTime(defaultGainValue, audioContext.currentTime + temporaryLevelDelayRecoveryTimeInSeconds);
        layer.temporaryLevelDelay = null;
        document.dispatchEvent(new CustomEvent('musicmoodstop', {detail: mood}));
      }, time);

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

      this.startLoopingInterval();
      this.startMoodInterval();
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

    this.startMoodInterval = function () {
      moodInterval = setInterval(() => {
        // Intensity logic
        intensity -= intensity * intensityReductionFactor;
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
          this.transitionToMood(suggestedMood);
        }
      }, 50);
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

    this.getIntensity = () => { return intensity; };

    this.addIntensity = (newIntensity) => {
      intensity += Number(newIntensity);
      let suggestedMood = getLowestIntensityMood();
      if (currentMood !== suggestedMood) {
        this.setMood(suggestedMood);
      }
    };

    this.setIntensity = newIntensity => {
      intensity = Number(newIntensity);
      let suggestedMood = getLowestIntensityMood();
      if (currentMood !== suggestedMood) {
        this.setMood(suggestedMood);
      }
    };
  };

})();