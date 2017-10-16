
// When objects collide, we catch that here
// and then pass on the objects that collided
// to the collisionManager.
// We only pass them on if they're in the "objectsToRender" array

var ballEvents = {
  'wall-right':   {type: 'ballHitEndzone',    detail: { side: "right" }},
  'wall-left':    {type: 'ballHitEndzone',    detail: { side: "left" }},
  'paddle-one':   {type: 'ballHitPaddle',     detail: { player: 1 }},
  'paddle-two':   {type: 'ballHitPaddle',     detail: { player: 2 }}
};

Events.on(engine, 'collisionStart', function(event) {
  var pairs = event.pairs;
  var objA;
  var objB;

  for (var i = 0, j = pairs.length; i != j; ++i) {
    var pair = pairs[i];

    var pairLabels = [];

    pairLabels.push(pair.bodyA.label);
    pairLabels.push(pair.bodyB.label);

    if(pairLabels.indexOf("ball"))


    // If the ball is involved
    var ballLookup = pairLabels.indexOf("ball");

    if (ballLookup > -1) {
      var otherLabel = pairLabels[(ballLookup + 1) % 2];

      var event = ballEvents[otherLabel];

      if (event) {
        document.dispatchEvent(new CustomEvent(event.type, {detail: event.detail}));
      }
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

    if(objA.hit) {
      objA.hit(objB);
    }

    if(objB.hit) {
      objB.hit(objA);
    }
  }
});
