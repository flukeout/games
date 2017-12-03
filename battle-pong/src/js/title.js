// Makes a mini pong animation in the title tag of the page
// |    *  |

var position = 0;
var pongLength = 6;
var direction = "up";

setInterval(function(){

  var titleString = "|";

  if(direction == "up") {
    position++;
  } else {
    position--;
  }

  if(position < 1) {
    direction = "up";
  }

  if(position > pongLength) {
    direction = "down";
  }

  for(var i = 0; i <= pongLength + 1; i++) {
    if(i == position) {
      titleString = titleString + "\u2022";
    } else {
      titleString = titleString + "\u00A0";
    }
  }

  titleString = titleString + "|";

  document.title = titleString;

}, 250);
