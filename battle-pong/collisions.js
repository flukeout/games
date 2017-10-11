
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

    var pairLabels = [];

    pairLabels.push(pair.bodyA.label);
    pairLabels.push(pair.bodyB.label);


    // Bobby, the new - label-based approach is here...
    if(pairLabels.indexOf("ball") > -1 && pairLabels.indexOf("wall-right") > -1) {
      var event = new CustomEvent("ballHitEndzone", { detail : { player : 1 }});
      document.dispatchEvent(event);
    }

    if(pairLabels.indexOf("ball") > -1 && pairLabels.indexOf("wall-left") > -1) {
      var event = new CustomEvent("ballHitEndzone", { detail : { player : 2 }});
      document.dispatchEvent(event);
    }

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
});


// Checks the array of objects that have collided (always a pair of two)
// Uses named object variables created earlier to compare.
function collisionManager(objectsArray){


  var one = objectsArray[0];
  var two = objectsArray[1];

  // TODO - change the powerup HIT and Paddle hit stuff to 'event based' system

  if(one.hit) {
    one.hit(two);
  }

  if(two.hit) {
    two.hit(one);
  }

  if(objectsArray.indexOf(ball) > -1 && (objectsArray.indexOf(paddleTwo) > -1 || objectsArray.indexOf(paddleOne) > -1)) {
    if(ball){
      ball.paddleHit();
    }
  }
}
