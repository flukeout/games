var sounds = {
  "swish" : {
    url : "sounds/swish.wav",
    timeout : 260,
    waiting : false
  },
  "hit" : {
    url : "sounds/hit.wav",
    volume : .05
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
      console.log("got it");
    });
  }

  request.send();
}

function playSound(name, options){
  var sound = sounds[name];
  var soundVolume = sounds[name].volume || 1;

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

    var volume = soundContext.createGain();

    if(options) {
      if(options.volume) {
        volume.gain.value = soundVolume * options.volume;
      }
    } else {
      volume.gain.value = soundVolume;
    }

    volume.connect(soundContext.destination);
    source.connect(volume);
    source.start(0);
  }
}