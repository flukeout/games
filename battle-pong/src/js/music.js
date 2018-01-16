(function () {

  const temporaryLevelDelayRecoveryTimeInSeconds = 1.5;
  
  let temporaryMoodDurations = {
    intense: 3500
  };

  let files = [
    'music/Contagion_Loop_BaseLayer.mp3',
    'music/Contagion_Loop_TopLayer.mp3'
  ];

  let layerDefinitions = {
    top: {
      file: 'music/Contagion_Loop_TopLayer.mp3',
      moods: {
        default: 0,
        intense: 1
      }
    },
    base: {
      file: 'music/Contagion_Loop_BaseLayer.mp3',
      moods: {
        default: 1
      }
    }
  };

  let activeLayers = {};

  window.Music = function () {
    let audioContext = new AudioContext();

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
          let source = audioContext.createBufferSource();
          source.buffer = buffers[layerDefinitions[layerName].file];

          let gainNode = audioContext.createGain();

          let gainValue = layerDefinitions[layerName].moods.default;
          gainValue = isNaN(Number(gainValue)) ? 0 : gainValue;
          gainNode.gain.value = gainValue;

          source.connect(gainNode);
          gainNode.connect(audioContext.destination);

          source.loop = true;

          activeLayers[layerName] = {
            source: source,
            gain: gainNode,
            temporaryLevelDelay: null
          };
        }

        resolve();
      });
    };

    this.setMoodTemporarily = function (mood) {
      for (let layerName in activeLayers) {
        this.setLayerMoodTemporarily(layerName, mood, temporaryMoodDurations[mood])
      }
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
      }, time)
    };

    this.setLevels = function (levels) {
      for (let layer in levels) {
        activeLayers[layer].gain.gain.value = levels[layer];
      }
    };

    this.start = function (options) {
      for (let layer in activeLayers) {
        activeLayers[layer].source.start(0);
      }
    };

  };

})();