document.addEventListener('DOMContentLoaded', function () {

  createObject({
    selector: ".paddle.one",
    player: 0,
    controller: controllers[0],
    physicsOptions : {
      frictionAir: 0.1
    },
    update(){

      if(this.controller.a) {
        Matter.Body.setAngularVelocity(this.physics, .2);
      }

      if(this.controller.b) {
        Matter.Body.setAngularVelocity(this.physics, -.2);
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
    }
  });


  createObject({
    selector: ".paddle.two",
    player: 1,
    controller: controllers[1],
    physicsOptions : {
      frictionAir: 0.1
    },
    update(){

      if(this.controller.a) {
        Matter.Body.setAngularVelocity(this.physics, .2);
      }

      if(this.controller.b) {
        Matter.Body.setAngularVelocity(this.physics, -.2);
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
    }
  });


});
