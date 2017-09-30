
// When objects collide, we catch that here
// and then pass on the objects that collided
// to the collisionManager.
// We only pass them on if they're in the "objectsToRender" array

Events.on(engine, 'collisionStart', function(event) {
  var pairs = event.pairs;
  var objA, objB;

  for (var i = 0, j = pairs.length; i != j; ++i) {
    var pair = pairs[i];

    for(var k = 0; k < objectsToRender.length; k++) {
      if(objectsToRender[k].physics === pair.bodyA){
        objA = objectsToRender[k];
      }
      if(objectsToRender[k].physics === pair.bodyB){
        objB = objectsToRender[k];
      }
    }
    collisionManager([objA, objB]);
  }
});


// Checks the array of objects that have collided (always a pair of two)
// Uses named object variables created earlier to compare.
function collisionManager(objectsArray){

  // If the ball hits anything
  if(objectsArray.indexOf(ball) > -1) {
    ball.hit();
  }

  if(objectsArray.indexOf(ball) > -1 && (objectsArray.indexOf(paddleTwo) > -1 || objectsArray.indexOf(paddleOne) > -1)) {
    ball.paddleHit();
  }

  // If the ball hits either endzone
  if(objectsArray.indexOf(ball) > -1 && objectsArray.indexOf(endzoneOne) > -1) {
    game.playerScored(1);
  }

  if(objectsArray.indexOf(ball) > -1 && objectsArray.indexOf(endzoneTwo) > -1) {
    game.playerScored(2);
  }
}
