document.addEventListener('DOMContentLoaded', function(){
  
  window.addEventListener("keydown", function(e){
    if(e.key === "Escape"){
      document.querySelector(".rules").classList.toggle("visible");
    }
  });

  setTimeout(() => {nextStep()}, 500);
});

let stepList = [
  {
    step : "shoulder-left",
    duration: 1000,
    breakAfter : 250
  },
  {
    step : "shoulder-right",
    duration: 1000,
    breakAfter : 500
  },
  {
    step : "analog-move-x",
    duration: 1000,
    breakAfter : 0
  },
  {
    step : "analog-move-y",
    duration: 1000,
    breakAfter : 250
  },
  {
    step : "analog-spin-right",
    duration: 1000,
    breakAfter : 250
  },
  {
    step : "analog-spin-left",
    duration: 1000,
    breakAfter : 250
  }
]

let currentStepNumber = 0;
let currentClass = "";

const nextStep = () => {
  
  currentStep = stepList[currentStepNumber];

  document.querySelector(".controls").classList.add(currentStep.step);
  
  currentStepNumber++;
  
  if(currentStepNumber >= stepList.length) {
    currentStepNumber = 0;
  }

  setTimeout(function(){
    if(currentStep) {
     document.querySelector(".controls").classList.remove(currentStep.step);  
   }
  }, currentStep.duration);

  setTimeout(function(){
    nextStep();
  }, currentStep.duration + currentStep.breakAfter);
}
