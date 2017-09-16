// Accepts a dom element and then returns an object

function getElementProperties(element){

  // Get dimensions
  var width = element.offsetWidth;
  var height = element.offsetHeight;

  // Position of center of element
  var x = element.offsetLeft + width / 2;
  var y = element.offsetTop + height / 2;

  var styles = window.getComputedStyle(element, null);

  var transforms = styles.getPropertyValue("transform") || false;

  console.log('Matrix: ' + transforms);

  // Splits the transform matrix into 6 separate values.
  var values = transforms.split('(')[1].split(')')[0].split(',');
  var a = values[0];
  var b = values[1];
  var c = values[2];
  var d = values[3];
  var e = values[4];  // Translate X
  var f = values[5];  // Translate Y

  //
  x = x + parseInt(e);
  y = y + parseInt(f);

  var scale = Math.sqrt(a*a + b*b);

  height = height * scale.toFixed(2);
  width = width * scale.toFixed(2);

  console.log('Height: ' + x);
  console.log('Width:  ' + y);
  console.log('X:      ' + x);
  console.log('Y:      ' + y);
  console.log('Scale:  ' + scale);

  // arc sin, convert from radians to degrees, round
  var sin = b/scale;
  // next line works for 30deg but not 130deg (returns 50);
  // var angle = Math.round(Math.asin(sin) * (180/Math.PI));
  // var angle = Math.round(Math.atan2(b, a) * (180/Math.PI));
  var angle = Math.atan2(b, a); //angle in rad

  console.log('Degrees: ' + (angle * (180/3.14159)));

  return {
    height: height, // Height
    width: width,   // Width
    x: x,           // X (center)
    y: y,           // Y (center)
    angle: angle    // Angle in radians
  }
}
