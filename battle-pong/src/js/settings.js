window.Settings = {
  clearSavedControlSettings : true,
  showIntro : false,
  debug : true,
  powerUpTypes : ["mine", "clone", "grow", "spin"],
  // powerUpTypes : ["mine"],
  brakesModeEnabled : false,
  goalTimeoutMS : 250,
  powerupFrequency : 300,
  maxPowerupCount : 2,
  playTo : 2,
  mineForceRadius: 175,
  mineForceMultiplier: 0.00075,
  showFrameRate: false,
  showBackground: true
};

var queryStringParts = window.location.search.substr(1).split('&');
queryStringParts.forEach(function (pair) {
  var pairParts = pair.split('=');
  var key = pairParts[0];
  var value = pairParts[1];

  if (value === 'false') value = false;
  if (value === 'true') value = true;

  if (key in window.Settings) window.Settings[key] = value;
});
