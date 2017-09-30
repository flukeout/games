// Accepts a DOM element and then returns an object
// full of properties for matter.js consume

function getElementProperties(element){

  // Get dimensions
  var width = element.offsetWidth;
  var height = element.offsetHeight;

  // Position of center of element
  var x = element.offsetLeft + width / 2;
  var y = element.offsetTop + height / 2;

  var styles = window.getComputedStyle(element, null);

  var transforms = styles.getPropertyValue("transform");
  if(transforms == "none") {
    transforms = "matrix(1, 0, 0, 1, 0, 0)";
  }

  // console.log('Computed Transformation: ' + transforms);
  // Splits the transform matrix into 6 separate values.

  var values = transforms.split('(')[1].split(')')[0].split(',');
  var a = values[0];
  var b = values[1];
  var c = values[2];
  var d = values[3];
  var e = values[4];  // Translate X
  var f = values[5];  // Translate Y

  // Adds translate values to the element position
  x = x + parseInt(e);
  y = y + parseInt(f);

  var scale = Math.sqrt(a*a + b*b);

  var scaleX = Math.sqrt(a*a + c*c);
  var scaleY = Math.sqrt(b*b + d*d);
  // If there is a uniform scale, lets multiply the height and width by it
  // We could also do this after the fact by modifying the object after instantiation
  // matter.js gives us scaleX and scaleY modifiers
  height = height * scaleY.toFixed(2);
  width = width * scaleX.toFixed(2);

  var angle = Math.atan2(b, a); //angle in rad

  // console.log('Height:   ' + x);
  // console.log('Width:    ' + y);
  // console.log('X:        ' + x);
  // console.log('Y:        ' + y);
  // console.log('Scale:    ' + scale);
  // console.log('Rotation: ' + (angle * (180/3.14159)));

  var bodyType = "rectangle";

  var borderRadius = parseInt(styles.borderRadius);
  var sizeRatio = height/width;

  // Check if it is square enought
  if(sizeRatio > .9 && sizeRatio < 1.1) {
    // Check if it's round enough
    if(borderRadius > .4 * (width / 2)) {
      // Make it into a circle
      bodyType = "circle";
    }
  }

  return {
    height: height, // Height
    width: width,   // Width
    x: x,           // X (center)
    y: y,           // Y (center)
    angle: angle,   // Angle in radians
    bodyType : bodyType
  }
}



function createPhysicsForElement(element, options) {

  var guid = getRandom(0,9999999);


  var props = getElementProperties(element);

  var finalOptions = {
    isStatic: element.hasAttribute('data-static') ? element.getAttribute('data-static') : false,
    angle: props.angle
  }

  // Add options that are passed in
  Object.assign(finalOptions, options);

  var physics = false;

  if(props.bodyType == "rectangle") {
    physics = Bodies.rectangle(props.x, props.y, props.width, props.height, finalOptions);
  }

  if(props.bodyType == "circle") {
    physics = Bodies.circle(props.x, props.y, props.width/2, finalOptions);
  }

  physics.guid = guid;

  // if (!finalOptions.isStatic) resetElementPosition(element);
  resetElementPosition(element);

  if(physics){
    return physics;
  }
}


