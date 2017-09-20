document.addEventListener('DOMContentLoaded', function () {

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