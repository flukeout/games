var paddleOne;
var paddleTwo;

document.addEventListener('DOMContentLoaded', function () {

  // TODO - maybe another option is to create a paddle factory?

  paddleOne = createObject({
    selector: ".paddle.one",
    player: 0,
    controller: controllers[0],
    physicsOptions : {
      frictionAir: 0.1
    }
  });

  paddleTwo = createObject({
    selector: ".paddle.two",
    player: 1,
    controller: controllers[1],
    physicsOptions : {
      frictionAir: 0.1
    }
  });

  paddleOne.update = update;
  paddleTwo.update = update;

});

// This gets called every frame for the paddle
var update = function(){

  var x = this.physics.position.x;

  if(this.maxX) {
    if(x > this.maxX) {
      Matter.Body.applyForce(this.physics, this.physics.position, {
        x: -.005,
        y : 0
      })
    }
  }

  if(this.minX) {
    if(x < this.minX) {
      Matter.Body.applyForce(this.physics, this.physics.position, {
        x: .005,
        y : 0
      })
    }
  }

  if(this.controller.a) {
    Matter.Body.setAngularVelocity(this.physics, .2);
    playSound("swish");
  }

  if(this.controller.b) {
    Matter.Body.setAngularVelocity(this.physics, -.2);
    playSound("swish");
  }

  if(this.controller.up) {
    Matter.Body.applyForce(this.physics, this.physics.position, {
      x: 0,
      y: -.004
    });
  }

  if(this.controller.down) {
    Matter.Body.applyForce(this.physics, this.physics.position, {
      x: 0,
      y: .004
    });
  }

  if(this.controller.left) {
    Matter.Body.applyForce(this.physics, this.physics.position, {
      x: -0.004,
      y: 0
    });
  }

  if(this.controller.right) {
    Matter.Body.applyForce(this.physics, this.physics.position, {
      x: 0.004,
      y: 0
    });
  }
};
