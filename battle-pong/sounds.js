var sounds = {
  "swish" : {
    url : "sounds/swish.wav",
    timeout : 260,
    waiting : false
  },
  "swish2" : {
    url : "sounds/swish.wav",
    timeout : 260,
    waiting : false
  },
  "hit" : {
    url : "sounds/hit2.mp3",
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
  var options = options || {};

  var sound = sounds[name];
  var soundVolume = sounds[name].volume || 1;
  var panValue = sounds[name].pan || 0;


  if(sound.timeout) {
    if(sound.waiting == false) {
      sound.waiting = true;
      setTimeout(function(){
        sound.waiting = false;
      },sound.timeout);
    } else {
      return;
    }
  }


  var buffer = sound.buffer;

  if(buffer){
    var source = soundContext.createBufferSource();
    source.buffer = buffer;

    var panNode = soundContext.createStereoPanner();
    var volume = soundContext.createGain();

    if(options.pan) {
      panNode.pan.value = options.pan;
    } else {
      panNode.pan.value = panValue;
    }

    if(options) {
      if(options.volume) {
        volume.gain.value = soundVolume * options.volume;
      }
    } else {
      volume.gain.value = soundVolume;
    }

    panNode.connect(soundContext.destination);
    volume.connect(panNode);
    source.connect(volume);
    source.start(0);
  }
}