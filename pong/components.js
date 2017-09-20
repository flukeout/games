// Generic object creator

function createObject(options){

  var object = {
    selector: false,
    element : false,  // Placeholder for DOM element
    physics : false,  // Placeholder for physics properties

    // These are the defaults, but also get overwritten / changed
    // based on the options that are passed in.
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

      for(var k in options){
        this[k] = options[k];
      }

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



// After we add a physics element to the simulation, we need to strip its original CSS positioning
// and let the engine handle it all via it's own X,Y coords.
function resetElementPosition(element) {
  element.style.top = 0;
  element.style.left = 0;
  element.style.bottom = "";
  element.style.right = "";
}
