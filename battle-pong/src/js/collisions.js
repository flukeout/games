
// When objects collide, we catch that here
// and then pass on the objects that collided
// to the collisionManager.
// We only pass them on if they're in the "objectsToRender" array

var ballEvents = {
  'wall-left':    {type: 'ballHitEndzone',    detail: { side: "left",  belongsToPlayer: 0 }},
  'wall-right':   {type: 'ballHitEndzone',    detail: { side: "right", belongsToPlayer: 1 }},
  'wall-top':     {type: 'ballHitSide',       detail: { side: "top" }},
  'wall-bottom':  {type: 'ballHitSide',       detail: { side: "bottom" }},

  'paddle-one':   {type: 'ballHitPaddle',     detail: { player: 1 }},
  'paddle-two':   {type: 'ballHitPaddle',     detail: { player: 2 }}
};

Events.on(engine, 'collisionEnd', function(event) {
  var pairs = event.pairs;
  var physicsObjectA;
  var physicsObjectB;


  for (var i = 0, j = pairs.length; i != j; ++i) {
    var pair = pairs[i];
    var pairLabels = [];

    pairLabels.push(pair.bodyA.label);
    pairLabels.push(pair.bodyB.label);

    // If the ball is involved
    var ballLookup = pairLabels.indexOf("ball");

    if (ballLookup > -1) {
      var otherLabel = pairLabels[(ballLookup + 1) % 2];

      var event = ballEvents[otherLabel];

      if (event) {

        var ballObj;

        if(pair.bodyA.label == "ball") {
          ballObj = pair.bodyA;
        } else {
          ballObj = pair.bodyB;
        }
        
        let scoringBall;
        for(var k = 0; k < game.balls.length; k++){
          if(ballObj === game.balls[k].physics) {
            scoringBall = game.balls[k];
          }
        }

        if(scoringBall) {
          event.detail.lastTouchedPaddle = scoringBall.lastTouchedPaddle;
          event.detail.ball = ballObj;
        }
        

        document.dispatchEvent(new CustomEvent(event.type, {
          detail: event.detail
        }));
      }
    }

    /// TODO - we can still make this easier somehow, have a way to do lookups
    for(var k = 0; k < objectsToRender.length; k++) {
      if(objectsToRender[k].physics === pair.bodyA){
        var gameObject = objectsToRender[k];
        if(gameObject.hit){
          gameObject.hit(pair.bodyB);
        }
      }
      if(objectsToRender[k].physics === pair.bodyB){
        var gameObject = objectsToRender[k];
        if(gameObject.hit){
          gameObject.hit(pair.bodyA);
        }
      }
    }
  }
});
