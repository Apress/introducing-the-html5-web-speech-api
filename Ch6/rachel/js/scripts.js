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
  var msg = new window.SpeechSynthesisUtterance();
  msg.text = text;
   
  if (voiceSelect.value) {
    msg.voice = window.speechSynthesis.getVoices().filter(function(voice) { 
      return voice.name == voiceSelect.value; 
    })[0];
  }

  window.speechSynthesis.speak(msg);
}

// Rachel, what time is it now?
var timeNow = function() {
  var localtime = luxon.DateTime
                       .local()
                       .toLocaleString(luxon.DateTime.TIME_SIMPLE);
  speak("The time is " + localtime);
};

// Rachel, what time is it in New York?
var timeinnewyork = function() {
  var NYTime = luxon.DateTime.local().setZone('America/New_York').toLocaleString(luxon.DateTime.TIME_WITH_LONG_OFFSET);
  speak("The time in New York is " + NYTime);
};

// Rachel, what is today's date?
var DateNow = function() {
  var localdate = luxon.DateTime.local().toLocaleString(luxon.DateTime.DATE_SIMPLE);
  speak("The time is " + localdate);
};

// Rachel tell a funny joke:
var telljoke = function() {
  speak("Why do we tell actors to break a leg? Because every play has a cast");
};

var tellsecondjoke = function() {
  speak('Helvetica and Times New Roman walk into a bar. The bar tender shouts "Get Out of here - we don\'t serve your type!"');
};

// Rachel, what is the weather in Copenhagen? 
var weather = function() {
  var yourappid = "<INSERT YOUR APP ID HERE>";

  $.ajax({
    method:'GET',
    crossDomain: true,
    url: 'https://api.openweathermap.org/data/2.5/weather?q=copenhagen,dk&appid=' + yourappid,
    dataType: "json",
    async: true,
    success: function(response){
      speak("The temperature in Copenhagen is currently: " + parseInt(response.main.temp - 273.15) + " degrees");
    }
  });
};

// Rachel, Wikipedia "artificial intelligence"
var wikipedia = function() {
  $.ajax({
    method:'GET',
    crossDomain: true,
    url: 'https://en.wikipedia.org/api/rest_v1/page/summary/Artificial_intelligence',
    dataType: "json",
    async: true,
    success: function(response){
      speak("Here is the extract from Wikipedia on artificial intelligence: " + response.extract);
    }
  });
};

// Rachel, show me a picture of...
var pixabay = function() {
  console.log("This to follow");
};

if (annyang) {
  var commands = {
    'Rachel what time is it': timeNow,
    'Rachel tell a joke': telljoke,
    'Rachel tell another joke': tellsecondjoke,
    'Rachel what time is it in New York': timeinnewyork,
    'Rachel what is the weather like in Copenhagen': weather,
    'Rachel wikipedia artificial intelligence': wikipedia,
    'Rachel show me a picture of some orchids': pixabay
  };

  // Add our commands to annyang
  annyang.addCommands(commands);

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