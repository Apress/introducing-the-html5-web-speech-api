const voiceSelect = document.getElementById('voice');

function loadVoices() {
	var voices = window.speechSynthesis.getVoices();

	voices.forEach(function(voice, i) {
	  var option = document.createElement('option');
	  option.value = voice.name;
	  option.innerHTML = voice.name;
	  voiceSelect.appendChild(option);
	});
}

loadVoices();

// Chrome loads voices asynchronously.
window.speechSynthesis.onvoiceschanged = function(e) {
  loadVoices();
};

window.speechSynthesis.onerror = function(event) {
  console.log('Speech recognition error detected: ' + event.error);
  console.log('Additional information: ' + event.message);
};

function speak(text) {
  var msg = new SpeechSynthesisUtterance();
  msg.text = text;
  msg.lang = 'fr-fr';

  speechSynthesis.speak(msg);
}

// Alex, what time is it now?
var timeNow = function() {
  var localtime = luxon.DateTime
                       .local()
                       .toLocaleString(luxon.DateTime.TIME_SIMPLE);
	speak("Le temps est maintenant " + localtime);
}

// Alex, what time is it in New York?
var timeinnewyork = function() {
  var NYTime = luxon.DateTime.local().setZone('America/New_York').toLocaleString(luxon.DateTime.TIME_WITH_LONG_OFFSET);
  speak("TLe temps à New York est maintenant " + NYTime);
}

// Alex, what is today's date?
var DateNow = function() {
  var localdate = luxon.DateTime.local().toLocaleString(luxon.DateTime.DATE_SIMPLE);
  speak("Le date aujourd'hui est " + localdate);
}

// Alex, tell a funny joke:
var telljoke = function() {
	speak("Why do we tell actors to break a leg? Because every play has a cast");
}

var tellsecondjoke = function() {
	speak('Helvetica and Times New Roman walk into a bar. The bar tender shouts "Get out of here - we don\'t serve your type!"');
}

// Alex, what is the weather in Copenhagen? 
var weather = function() {
  var yourappid = "<INSERT YOUR APP ID HERE>";

  $.ajax({
    method:'GET',
    crossDomain: true,
    url: 'https://api.openweathermap.org/data/2.5/weather?q=copenhagen,dk&appid=' + yourappid,
    dataType: "json",
    async: true,
    success: function(response){
      speak("La température à Copenhague est maintenant : " + parseInt(response.main.temp - 273.15) + " degrees");
    }
  });
}

// Alex, Wikipedia "artificial intelligence"
var wikipedia = function() {
  $.ajax({
    method:'GET',
    crossDomain: true,
    url: 'https://fr.wikipedia.org/api/rest_v1/page/summary/Intelligence_artificielle',
    dataType: "json",
    async: true,
    success: function(response){
      speak("Voici l'extrait de Wikipedia sur l'intelligence artificielle: " + response.extract);
    }
  });
}

// Alex, show me a picture of...
var flickr = function() {
  console.log("This to follow");
}

if (annyang) {
  var commands = {
    'Alex quelle heure est-il': timeNow,
    'Alex raconte-moi une blague': telljoke,
    'Alex raconte une autre blague': tellsecondjoke,
    'Alex quelle heure est-il à New York': timeinnewyork,
    'Alex quel temps fait-il à Copenhague': weather,
    'Alex wikipedia intelligence artificielle': wikipedia,
    'Alex montre-moi une photo d\'orchidées': flickr
  }

  // Add our commands to annyang
  annyang.addCommands(commands);
  annyang.setLanguage('fr-FR');

  // Tell KITT to use annyang
  SpeechKITT.annyang();

  // Define a stylesheet for KITT to use
  SpeechKITT.setStylesheet('css/styles.css');

  // Render KITT's interface
  SpeechKITT.vroom();
}

$(document).ready(function() {
  $("#skitt-ui").insertAfter($("h2"));
  $("#skitt-ui").css("display", "inline-block");
});