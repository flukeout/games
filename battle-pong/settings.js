window.Settings = {
  clearSavedControlSettings : true,
  showIntro : false,
  debug : true,
  powerUpTypes : ["mine", "clone", "grow", "spin"], //"multiball"
  // powerUpTypes : ["clone"],
  brakesModeEnabled : false,
  goalTimeoutMS : 250,
  powerupFrequency : 300,
  maxPowerupCount : 2,
  playTo : 2,
  mineForceRadius: 175,
  mineForceMultiplier: 0.00075
};

var queryStringParts = window.location.search.substr(1).split('&');
queryStringParts.forEach(function (pair) {
  var pairParts = pair.split('=');
  var key = pairParts[0];
  var value = pairParts[1];
  if (key in window.Settings) window.Settings[key] = value;
});
