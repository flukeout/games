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

    inputComponents: [],

    actions: [],

    addInputComponent: function(inputComponent) {
      this.inputComponents.push(inputComponent);
      inputComponent.register(this.actions);
    },

    updateActionsFromInputComponents: function () {
      // Prepare a queue to mixdown actions received from inputs
      var actionsQueue = [];
      
      // Store the action changes from each input component
      for (var i = 0; i < this.inputComponents.length; ++i) {
        actionsQueue.push(this.inputComponents[i].update());
      }

      // For each action, see if any of the input components registered anything
      for (action in this.actions) {

        // Reset
        this.actions[action] = 0;
        for (var i = 0; i < actionsQueue.length; ++i) {
          if (action in actionsQueue[i]) {

            // If it's already set to something, don't set it back to 0
            this.actions[action] = this.actions[action] || actionsQueue[i][action];
          }
        }
      }
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

      var actions = this.actions;
      this.actions = {};
      for (var i = 0; i < actions.length; ++i) {
        this.actions[actions[i]] = 0;
      }

      // Add it to the World
      World.add(engine.world, [this.physics]);

      objectsToRender.push(this);
    }
  }


  for(var k in options){
    object[k] = options[k];
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
