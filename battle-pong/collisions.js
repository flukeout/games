
// When objects collide, we catch that here
// and then pass on the objects that collided
// to the collisionManager.
// We only pass them on if they're in the "objectsToRender" array

Events.on(engine, 'collisionStart', function(event) {
  var pairs = event.pairs;
  var objA;
  var objB;

  for (var i = 0, j = pairs.length; i != j; ++i) {
    var pair = pairs[i];

    objA = { name : pair.bodyA.label };
    objB = { name : pair.bodyB.label };

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

  // console.log(objA, objB);

});


// Checks the array of objects that have collided (always a pair of two)
// Uses named object variables created earlier to compare.
function collisionManager(objectsArray){

  var one = objectsArray[0];
  var two = objectsArray[1];

  // console.log(one,two);

  if(one.hit) {
    one.hit(two);
  }

  if(two.hit) {
    two.hit(one);
  }


  // console.log(objectsArray);
  // console.log(objectsArray.indexOf(ball))

  if(objectsArray.indexOf(ball) > -1 && (objectsArray.indexOf(paddleTwo) > -1 || objectsArray.indexOf(paddleOne) > -1)) {
    if(ball){
      ball.paddleHit();
    }
  }

  // If the ball hits either endzone
  if(objectsArray.indexOf(ball) > -1 && objectsArray.indexOf(endzoneOne) > -1) {
    game.playerScored(1);
  }

  if(objectsArray.indexOf(ball) > -1 && objectsArray.indexOf(endzoneTwo) > -1) {
    game.playerScored(2);
  }
}
