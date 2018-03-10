window.Settings = {
  clearSavedControlSettings : true,
  showIntro : false,
  debug : true,
  availablePowerUpTypes : ["mine", "clone", "grow", "spin", "magnet","noclip"],
  powerUpTypes : ["mine", "clone", "grow", "spin", "magnet","noclip"],
  brakesModeEnabled : true,
  dashingEnabled : false,
  goalTimeoutMS : 250,
  powerupFrequency : 300,
  maxPowerupCount : 2,
  playTo : 2,
  mineForceRadius: 175,
  mineForceMultiplier: 0.00075,
  showFrameRate: false,
  showBackground: true,
  sounds: false, //true
  music: false, 
  player1Control : "player", // or "AI"
  player2Control : "player" // or "AI"
};

loadSettings();

// Grab saved settings from localStorage
// If there are none, then we overwrite them with the defaults above
function loadSettings(){

  let savedSettings = JSON.parse(window.localStorage.getItem("settings"));
  
  if(!savedSettings) {
    window.localStorage.setItem("settings", JSON.stringify(window.Settings));
  } else {
    //Populate the settings object with only the keys from localStorage
    for(var key in savedSettings){
      window.Settings[key] = savedSettings[key];
    }
  }
}

var queryStringParts = window.location.search.substr(1).split('&');
queryStringParts.forEach(function (pair) {
  var pairParts = pair.split('=');
  var key = pairParts[0];
  var value = pairParts[1];

  try {
    value = JSON.parse(unescape(value));
  }
  catch (e) {}

  if (value === 'false') value = false;
  if (value === 'true') value = true;

  if (key in window.Settings) window.Settings[key] = value;
});

console.log(Settings);
