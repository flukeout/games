// The ball
var ball = {
  selector: ".ball",
  element : false,  // Placeholder for DOM element
  physics : false,  // Placeholder for physics properties
  height: 0,
  width: 0,

  // These get passed in when creating this object
  physicsOptions : {
    frictionAir: 0.00001,
    restitution: 1
  },

  init : function(){
    // Get the element
    this.element = document.querySelector(this.selector);

    // Add it to the physics simulation
    this.physics = createPhysicsForElement(this.element, this.physicsOptions);

    this.width = this.element.getBoundingClientRect().width;
    this.height = this.element.getBoundingClientRect().height;

    // Add it to the World
    World.add(engine.world, [this.physics]);

    // Make it render
    objectsToRender.push(this);

    // Get it moving
    this.launch(0, .02);
  },

  launch : function(x,y){
    Matter.Body.applyForce(this.physics, this.physics.position, {x: x,y:y});
  }
}


var paddleOne = createPaddle(0, ".paddle.one");
var paddleTwo = createPaddle(1, ".paddle.two");

function createPaddle(playerId, selector){

  // The paddle
  var paddle = {
    player: playerId,
    selector: selector,
    element : false,  // Placeholder for DOM element
    physics : false,  // Placeholder for physics properties
    controller : controllers[playerId],

    // These get passed in when creating this object
    physicsOptions : {
      frictionAir: 0.1,
      restitution: 1
    },

    colors : ["pink","blue","orange","brown"],

    collide : function(){
      var random = Math.floor(Math.random() * this.colors.length);
      this.element.style.background = this.colors[random];
    },

    init : function(){
      // Get the element
      this.element = document.querySelector(this.selector);

      // Create the physics simulation
      this.physics = createPhysicsForElement(this.element, this.physicsOptions);

      this.width = this.element.getBoundingClientRect().width;
      this.height = this.element.getBoundingClientRect().height;

      // Add it to the World
      World.add(engine.world, [this.physics]);

      objectsToRender.push(this);
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
  }

  return paddle;
}

document.addEventListener('DOMContentLoaded', function () {
  paddleOne.init();
  paddleTwo.init();
  ball.init();

  createObject({
    selector: ".endzone.one",
    physicsOptions : {
      isSensor: true,
      isStatic: true
    }
  });

  createObject({
    selector: ".endzone.two",
    physicsOptions : {
      isSensor: true,
      isStatic: true
    }
  });

});



// Generic object creator

function createObject(options){

  var object = {
    selector: options.selector,
    element : false,  // Placeholder for DOM element
    physics : false,  // Placeholder for physics properties

    // These get passed in when creating this object
    physicsOptions : {
      frictionAir: 0.1,
      restitution: 1
    },

    lightUp : function(){
      this.element.classList.add("endzone-hit");

      setTimeout(function(el) {
        return function() {
          el.classList.remove("endzone-hit");
        };
      }(this.element), 200);

    },

    init : function(){

      // Add physicsOptions from options
      if(options.physicsOptions) {
        Object.assign(this.physicsOptions, options.physicsOptions);
      }

      // Get the element
      this.element = document.querySelector(this.selector);

      // Create the physics simulation
      this.physics = createPhysicsForElement(this.element, this.physicsOptions);

      this.width = this.element.getBoundingClientRect().width;
      this.height = this.element.getBoundingClientRect().height;

      // Add it to the World
      World.add(engine.world, [this.physics]);

      objectsToRender.push(this);
    }
  }

  object.init();


  return object;
}


var score = {
  player1: 0,
  player2: 0
}

// Runs collision stuff!
function collisionManager(a,b){
  console.log("======= COLLISION ========");


  var objects = [];
  objects.push(a);
  objects.push(b);


  var selectors = [];
  selectors.push(a.selector);
  selectors.push(b.selector);

  var scored = false;

  if(selectors.indexOf(".ball") > -1 && selectors.indexOf(".endzone.two") > -1) {
    score.player1++;
    scored = true;
  }
  if(selectors.indexOf(".ball") > -1 && selectors.indexOf(".endzone.one") > -1) {
    score.player2++;
    scored = true;
  }

  if(scored){
    for(var i = 0; i < selectors.length; i++) {
      var selector = selectors[i];
      if(selector.indexOf("endzone") > -1){
        var endzone = objects[i];
        endzone.lightUp();
      }
    }
  }


  document.querySelector(".score-display").innerText = score.player1 + " : " + score.player2;
}


Events.on(engine, 'collisionStart', function(event) {
  var pairs = event.pairs;

  for (var i = 0, j = pairs.length; i != j; ++i) {
    var pair = pairs[i];
    var objA, objB;

    for(var k = 0; k < objectsToRender.length; k++) {
      if(objectsToRender[k].physics === pair.bodyA){
        objA = objectsToRender[k];
      }
      if(objectsToRender[k].physics === pair.bodyB){
        objB = objectsToRender[k];
      }
    }

    if(objA && objB){
      collisionManager(objA,objB);
    }
  }
});
