document.addEventListener('DOMContentLoaded', function () {

  // TODO - figure out a better way to consturct these with less duplication;

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
