window.FrameRateMonitor = function () {

  const numSamples = 15;
  const samples = [];

  const sampleAnimation = ['|', '\\', '—', '/'];

  for (let i = 0; i < numSamples; ++i) {
    samples[i] = 0;
  }

  const container = document.createElement('div');
  container.id = 'fps';
  document.body.appendChild(container);

  var lastTime = performance.now();
  var sampleIndex = 0;
  var samplesSoFar = 0;

  var numFrames = 0;

  var currentMeasuredFPS = 0;

  (function loop() {
    ++numFrames;

    var thisTime = performance.now();
    var delta = thisTime - lastTime;

    if (delta > 1000) {
      lastTime = thisTime;

      samples[sampleIndex] = numFrames;

      ++samplesSoFar;

      let average = samples[0];
      for (let i = 1; i < numSamples && i < samplesSoFar; ++i) {
        average += samples[i];
      }

      currentMeasuredFPS = Math.round(average / Math.min(numSamples, samplesSoFar));
  
      container.textContent = sampleAnimation[samplesSoFar % 4] + currentMeasuredFPS;

      numFrames = 0;

      sampleIndex = (sampleIndex + 1) % numSamples;
    }

    }

    requestAnimationFrame(loop);
  })();
};
