// Generic object creator

function createObject(options){

  var object = {
    selector: false,
    element : false,  // Placeholder for DOM element
    physics : false,  // Placeholder for physics properties
    width : 0,
    height: 0,
    x : 0,
    y : 0,

    // These are the defaults, but also get overwritten / changed
    // based on the options that are passed in.
    physicsOptions : {
      frictionAir: 0.1,
      restitution: 1
    },

    inputComponent: null,

    actions: [],

    setPhysicsProperties: function (physicsProperties) {
      Matter.Body.setAngularVelocity(this.physics, physicsProperties.angularVelocity);
      Matter.Body.setAngle(this.physics, physicsProperties.angle);
      Matter.Body.setPosition(this.physics, physicsProperties.position);
      Matter.Body.setVelocity(this.physics, physicsProperties.velocity);
    },

    getPhysicsProperties: function () {
      return {
        position: this.physics.position,
        angle: this.physics.angle,
        velocity: this.physics.velocity,
        angularVelocity: this.physics.angularVelocity
      }
    },

    setInputComponent: function(inputComponent) {
      if (this.inputComponent) {
        this.inputComponent.remove();
      }

      // So that you can remove an input component by passing in `null`
      if (inputComponent) {
        this.inputComponent = inputComponent;
        inputComponent.register(this.actions);
      }

      document.dispatchEvent(new CustomEvent('inputcomponentchanged', {detail: {object: this, inputComponent: inputComponent}}));
    },

    updateActionsFromInputComponents: function () {
      if (this.inputComponent) {
        let updatedActions = this.inputComponent.update();

        // For each action, see if the input component registered anything
        for (let action in this.actions) {

          // Reset
          this.actions[action] = 0;
          if (action in updatedActions) {
            this.actions[action] = updatedActions[action];
          }
        }
      }
    },

    init : function(){

      for(var k in options){
        this[k] = options[k];
      }

      // Add physicsOptions from options
      if(options.physicsOptions) {
        Object.assign(this.physicsOptions, options.physicsOptions);
      }

      var props;

      // Get the element
      if(this.selector) {
        this.element = document.querySelector(this.selector);
      }

      if(this.element) {
        props = getElementProperties(this.element);
      } else {

        props = options.properties || {};

        this.element = document.createElement("div");

        if(props.classNames){
          for(var i = 0; i < props.classNames.length; i++) {
            var className = props.classNames[i];
            this.element.classList.add(className);
          }
        }

        this.element.classList.add(options.className);
        // this.element.classList.add(this.selector);
        this.element.innerHTML = options.innerHTML || "";

        if (!options.noBody) {        
          document.querySelector(".world").appendChild(this.element);
        }

        this.element.style.height = props.height + "px";
        this.element.style.width = props.width + "px";
        this.x = props.x;
        this.y = props.y;
        this.element.style.transform = "translateX("+this.x+"px) translateY("+this.y+"px)";
        this.element.style.width = props.width + "px";
      }

      this.height = props.height;
      this.width = props.width;

      // Create the physics simulation
      if (!options.noBody) {
        this.physics = createPhysicsForElement(this.element, this.physicsOptions);
      }

      // console.log(this.physics.id);
      this.id = this.physics.id;


      var actions = this.actions;
      this.actions = {};
      for (var i = 0; i < actions.length; ++i) {
        this.actions[actions[i]] = 0;
      }

      if (!options.noBody) {
        // Add it to the World
        World.add(engine.world, [this.physics]);

        objectsToRender.push(this);
      }
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
