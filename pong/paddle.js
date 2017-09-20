document.addEventListener('DOMContentLoaded', function () {


  // TODO - create a paddle factory that still uses the createObject call and takes
  // * selector
  // * player
  // * controller/input obj

  createObject({
    selector: ".paddle.one",
    player: 0,
    controller: controllers[0],
    physicsOptions : {
      frictionAir: 0.1
    },
    update(){


      //TODO - rewrite this as an this.input so it's generic
      // and use things like "input.rotateRight", "input.moveUp"
      // nicely named events that whatever we build as controller
      // can send them.
      //
      // Avoid input method specific things like (a) and (b) buttons.

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

      // Raname to "input"
      // this.input.rotRight

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
