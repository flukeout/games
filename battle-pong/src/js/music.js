(function () {

  const temporaryLevelDelayRecoveryTimeInSeconds = 1.5;
  
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
    'music/GamplayMusic1_PartA&B_Layer4.mp3'
  ];

  const songs = {
    gameplay: {
      loopAt: 69.81818181,
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

  let currentSong = songs.gameplay;
  let layerDefinitions = currentSong.layers;

  let duckingProfiles = {
    'test':                 {   gain: 0.2,    attack: 1.0,    sustain: 1,   release: 1    },
    'dash':                 {   gain: 0.1,    attack: 0.1,    sustain: 0,   release: 2    },
    'score':                {   gain: 0.1,    attack: 0.1,    sustain: 0,   release: 2    },
    'super-hard-shot':      {   gain: 0.7,    attack: 0.003,  sustain: 0.1, release: 1.3  },
    'swish':                {   gain: 0.1,    attack: 0.1,    sustain: 0,   release: 2    },
    'mine-collision':       {   gain: 0.1,    attack: 0.1,    sustain: 0,   release: 2    },
    'mine-explosion':       {   gain: 0.1,    attack: 0.1,    sustain: 0,   release: 2    },
    'bones-collide':        {   gain: 0.1,    attack: 0.1,    sustain: 0,   release: 2    }
  };

  const defaultGlobalGainValue = window.Settings.music ? .3 : 0;

  window.Music = function (audioContext) {
    let activeLayers = {};
    let lastLoopTime = 0;

    audioContext = audioContext || new AudioContext();
    
    let globalGainNode = audioContext.createGain();
    let duckingNode = audioContext.createGain();
    
    globalGainNode.gain.setTargetAtTime(defaultGlobalGainValue, audioContext.currentTime, 0);

    duckingNode.connect(globalGainNode);
    globalGainNode.connect(audioContext.destination);

    this.temporaryMoodDurations = temporaryMoodDurations;
    this.currentDuckingProfile = null;

    this.duckingNode = duckingNode;
    this.globalGainNode = globalGainNode;
    
    let duckingTimeout = -1;

    function createLayer(layerName, buffer) {
      let gainNode = audioContext.createGain();

      let layer = {
        source: null,
        lastSource: null,
        init: () => {
          let gainValue = layerDefinitions[layerName].moods.default;
          gainValue = isNaN(Number(gainValue)) ? 0 : gainValue;
          gainNode.gain.setTargetAtTime(gainValue, audioContext.currentTime, 0);

          gainNode.connect(duckingNode);

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
            layer.source.disconnect(gainNode);
          }
        },
        getLoopSwappingReady: function () {
          let newSourceNode = layer.createSourceNode();
          let oldSourceNode = layer.source;
          newSourceNode.start(lastLoopTime + currentSong.loopAt);
          layer.source = newSourceNode;

          // TODO: Make sure this actually disconnects when it rolls over
          if (layer.lastSource) {
            layer.lastSource.disconnect(gainNode);
          }

          layer.lastSource = oldSourceNode;

          console.log('Getting loop swapping ready: ', audioContext.currentTime, lastLoopTime + currentSong.loopAt);
        },
        source: null,
        gain: gainNode,
        temporaryLevelDelay: null
      };

      return layer;
    }

    this.getDuckingProfiles = () => {
      return duckingProfiles;
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

    this.setGlobalGain = function (value) {
      globalGainNode.gain.setTargetAtTime(value, audioContext.currentTime, 0);
    };

    this.getGlobalGain = () => { return globalGainNode.gain.value; };

    this.duck = function (profileName) {
      let profile = duckingProfiles[profileName];

      if (!profile) return;

      if (duckingTimeout > -1) {
        clearTimeout(duckingTimeout);
        document.dispatchEvent(new CustomEvent('duckinginterrupted', {detail: this.currentDuckingProfile + ''}));
      }

      document.dispatchEvent(new CustomEvent('duckingstarted', {detail: profileName}));

      duckingNode.gain.cancelScheduledValues(audioContext.currentTime);
      duckingNode.gain.linearRampToValueAtTime(profile.gain, audioContext.currentTime + profile.attack);
      duckingNode.gain.linearRampToValueAtTime(profile.gain, audioContext.currentTime + profile.attack + profile.sustain);
      duckingNode.gain.linearRampToValueAtTime(1, audioContext.currentTime + profile.attack + profile.sustain + profile.release);

      this.currentDuckingProfile = profileName;

      duckingTimeout = setTimeout(() => {
        duckingTimeout = -1;
        this.currentDuckingProfile = null;
        document.dispatchEvent(new CustomEvent('duckingstopped', {detail: profileName}));
      }, (profile.attack + profile.sustain + profile.release) * 1000);
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

        for (let layerName in layerDefinitions) {
          activeLayers[layerName] = createLayer(layerName, buffers[layerDefinitions[layerName].file]);
        }

        resolve();
      });
    };

    this.setMood = function (mood) {
      for (let layerName in activeLayers) {
        this.setLayerMood(layerName, mood, temporaryMoodDurations[mood]);
      }      
    }

    this.setMoodTemporarily = function (mood) {
      for (let layerName in activeLayers) {
        this.setLayerMoodTemporarily(layerName, mood, temporaryMoodDurations[mood]);
      }
    };

    this.setLayerMood = function (layerName, mood) {
      let layer = activeLayers[layerName];
      if (!layer) {
        console.warn('No music layer named ', layerName);
        return;
      }

      let moodValue = layerDefinitions[layerName].moods[mood] || layerDefinitions[layerName].moods.default;
      // If this layer doesn't have a value set for this mood, assuming it's meant to keep playing the way it already is
      if (isNaN(Number(moodValue))) {
        return;
      }

      if (!activeLayers[layerName].gain) return

      layer.gain.gain.cancelScheduledValues(audioContext.currentTime);
      layer.gain.gain.setTargetAtTime(moodValue, audioContext.currentTime, 0);

      document.dispatchEvent(new CustomEvent('musicmoodstart', {detail: mood}));
    };

    this.setLayerMoodTemporarily = function (layerName, mood, time) {
      let layer = activeLayers[layerName];
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
        if (!activeLayers[layer].gain) return;
        activeLayers[layer].gain.gain.setTargetAtTime(levels[layer], audioContext.currentTime, 0);
      }
    };

    let loopCheckInterval = 0;

    this.start = function (options) {
      for (let layer in activeLayers) {
        activeLayers[layer].start();
      }

      lastLoopTime = audioContext.currentTime;

      console.log('Starting', lastLoopTime);
      console.log('Should loop at ', lastLoopTime + currentSong.loopAt);

      loopCheckInterval = setInterval(() => {
        if (audioContext.currentTime - lastLoopTime > currentSong.loopAt - 1) {
          for (let layerName in activeLayers) {
            let layer = activeLayers[layerName];
            console.log(layerName);
            layer.getLoopSwappingReady();
          }

          lastLoopTime += currentSong.loopAt;
        }
      }, 100);
    };

    this.stop = function () {
      for (let layer in activeLayers) {
        activeLayers[layer].stop();
      }

      clearInterval(loopCheckInterval);
    };

    this.getSettingsForOutput = function () {
      return {
        duckingProfiles: duckingProfiles,
        globalGainValue: globalGainNode.gain.value
      };
    };

    this.loadSettingsFromLocalStorage = function () {
      let storedSettings = localStorage.getItem('music');
      
      if (storedSettings) {
        let parsedSettings = JSON.parse(storedSettings);
        duckingProfiles = parsedSettings.duckingProfiles;
        globalGainNode.gain.setTargetAtTime(parsedSettings.globalGainValue, audioContext.currentTime, 0);
      }
    };

    this.saveSettingsToLocalStorage = function () {
      localStorage.setItem('music', JSON.stringify(this.getSettingsForOutput()));
    };

    this.clearSettingsFromLocalStorage = function () {
      localStorage.removeItem('music');
    };

    this.getLayerDefinitions = () => {
      return layerDefinitions;
    };

    this.getActiveLayers = () => {
      return activeLayers;
    };

    this.getContext = () => {
      return audioContext;
    };
  };

})();