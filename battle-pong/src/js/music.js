(function () {

  const temporaryLevelDelayRecoveryTimeInSeconds = 1.5;
  
  const temporaryMoodDurations = {
    intense: 3500
  };

  const files = [
    'music/Contagion_Loop_BaseLayer.mp3',
    'music/Contagion_Loop_TopLayer.mp3'
  ];

  const layerDefinitions = {
    top: {
      file: 'music/Contagion_Loop_TopLayer.mp3',
      moods: {
        default: 0,
        intense: 1,
        quiet: 0.2
      }
    },
    base: {
      file: 'music/Contagion_Loop_BaseLayer.mp3',
      moods: {
        default: 1,
        quiet: 0.2
      }
    }
  };

  let duckingProfiles = {
    test: {
      gain: 0.2,
      attack: 1,
      sustain: 1,
      release: 1
    }
  };

  const defaultGlobalGainValue = 1;

  window.Music = function () {
    let activeLayers = {};

    let audioContext = new AudioContext();
    let globalGainNode = audioContext.createGain();
    let duckingNode = audioContext.createGain();
    
    globalGainNode.gain.value = defaultGlobalGainValue;

    duckingNode.connect(globalGainNode);
    globalGainNode.connect(audioContext.destination);

    this.temporaryMoodDurations = temporaryMoodDurations;
    this.currentDuckingProfile = null;

    this.duckingNode = duckingNode;
    
    let duckingTimeout = -1;

    this.getDuckingProfiles = function () {
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
      globalGainNode.gain.value = value;
    };

    this.getGlobalGain = () => { return globalGainNode.gain.value; };

    this.duck = function (profileName) {
      let profile = duckingProfiles[profileName];

      if (duckingTimeout > -1) {
        clearTimeout(duckingTimeout);
      }

      document.dispatchEvent(new CustomEvent('duckingstart', {detail: profileName}));

      duckingNode.gain.cancelScheduledValues(audioContext.currentTime);
      duckingNode.gain.linearRampToValueAtTime(profile.gain, audioContext.currentTime + profile.attack);
      duckingNode.gain.linearRampToValueAtTime(profile.gain, audioContext.currentTime + profile.attack + profile.sustain);
      duckingNode.gain.linearRampToValueAtTime(1, audioContext.currentTime + profile.attack + profile.sustain + profile.release);

      this.currentDuckingProfile = profileName;

      duckingTimeout = setTimeout(() => {
        document.dispatchEvent(new CustomEvent('duckingstop', {detail: profileName}));
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
          let layer = {
            init: function () {
              let source = audioContext.createBufferSource();
              source.buffer = buffers[layerDefinitions[layerName].file];

              let gainNode = audioContext.createGain();

              let gainValue = layerDefinitions[layerName].moods.default;
              gainValue = isNaN(Number(gainValue)) ? 0 : gainValue;
              gainNode.gain.value = gainValue;

              source.connect(gainNode);
              gainNode.connect(duckingNode);

              source.loop = true;

              layer.source = source;
              layer.gain = gainNode;
            },
            source: null,
            gain: null,
            temporaryLevelDelay: null
          };

          activeLayers[layerName] = layer;
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

      let moodValue = layerDefinitions[layerName].moods[mood];
      // If this layer doesn't have a value set for this mood, assuming it's meant to keep playing the way it already is
      if (isNaN(Number(moodValue))) {
        return;
      }

      layer.gain.gain.cancelScheduledValues(audioContext.currentTime);
      layer.gain.gain.value = moodValue;

      document.dispatchEvent(new CustomEvent('musicmoodstart', {detail: mood}));
    };

    this.setLayerMoodTemporarily = function (layerName, mood, time) {
      let layer = activeLayers[layerName];
      if (!layer) {
        console.warn('No music layer named ', layerName);
        return;
      }

      let moodValue = layerDefinitions[layerName].moods[mood];
      // If this layer doesn't have a value set for this mood, assuming it's meant to keep playing the way it already is
      if (isNaN(Number(moodValue))) {
        return;
      }

      if (layer.temporaryLevelDelay) {
        clearTimeout(layer.temporaryLevelDelay);
        layer.gain.gain.cancelScheduledValues(audioContext.currentTime);
      }

      layer.gain.gain.value = moodValue;

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
        activeLayers[layer].gain.gain.value = levels[layer];
      }
    };

    this.start = function (options) {
      for (let layer in activeLayers) {
        activeLayers[layer].init();
        activeLayers[layer].source.start(0);
      }
    };

    this.stop = function () {
      for (let layer in activeLayers) {
        activeLayers[layer].source.stop();
      }
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
        globalGainNode.gain.value = parsedSettings.globalGainValue;
      }
    };

    this.saveSettingsToLocalStorage = function () {
      localStorage.setItem('music', JSON.stringify(this.getSettingsForOutput()));
    };
  };

})();