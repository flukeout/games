// TODO
// * Make the options volume a 'factor' of the default sound volume, not an absolute value?
// * Remove the timeout stuff? Should just move it to the object that calls it?
// * That would allow us to not have two hit sounds...

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
  }
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

  panNode.connect(soundContext.destination);
  volume.connect(panNode);
  source.connect(volume);
  source.start(0);

}