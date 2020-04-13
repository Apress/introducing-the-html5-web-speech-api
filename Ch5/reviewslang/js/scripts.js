var transcript = document.getElementById('transcript');
var log = document.getElementById('log');
var start = document.getElementById('speechButton');
var clearbtn = document.getElementById('clearall-btn');
var submitbtn = document.getElementById('submit-btn');
var review = document.getElementById('reviews');
var unsupported = document.getElementById('unsupported');
var speaking = false;
var chosenLang = 'en-us';
const english = document.querySelector("span.en-us");
const french = document.querySelector("span.fr-fr");

window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition || null;

if (window.SpeechRecognition === null) {
  unsupported.classList.remove('hidden');
  start.classList.add('hidden');
} else {
  
  var recognition = new window.SpeechRecognition();
  
  // Recogniser doesn't stop listening even if the user pauses
  recognition.continuous = true;
  recognition.lang = chosenLang;
  
  // Start recognising
  recognition.onresult = function(event) {
    transcript.textContent = '';
    for (var i = event.resultIndex; i < event.results.length; i++) {
      if (event.results[i].isFinal) {
        transcript.textContent = event.results[i][0].transcript;
      } else {
        transcript.textContent += event.results[i][0].transcript;
      }
    }
  };
 
  // Listen for errors
  recognition.onerror = function(event) {
    log.innerHTML = 'Recognition error: ' + event.message + '<br />' + log.innerHTML;
  };

  start.addEventListener('click', function() {
    if (!speaking) {
      speaking = true;
      start.classList.toggle('stop');

      recognition.interimResults = document.querySelector('input[name="recognition-type"][value="interim"]').checked;
      try {
        recognition.start();
        log.innerHTML = 'Start speaking now - click to stop';
      } catch (ex) {
        log.innerHTML = 'Recognition error:' + ex.message;
      }
    } else {
      recognition.stop();
      start.classList.toggle('stop');
      log.innerHTML = 'Recognition stopped - click to speak';
      speaking = false;
    }
  });

  submitbtn.addEventListener('click', function() {
    let p = document.createElement('p');
    var textnode = document.createTextNode(transcript.value);
    p.appendChild(textnode);
    review.appendChild(p);

    let today = dayjs().format('ddd, MMMM D YYYY [at] H:HH');
    let s = document.createElement('small');
    textnode = document.createTextNode(today);
    s.appendChild(textnode);
    review.appendChild(s);

    let hr = document.createElement('hr');
    review.appendChild(hr);
    transcript.textContent = '';
  });

  clearbtn.addEventListener('click', function() {
    transcript.textContent = '';
  });

  english.addEventListener("click", function() {
    recognition.lang = 'en-us';
    english.style.fontWeight = 'bold';
    french.style.fontWeight = 'normal';
  });

  french.addEventListener("click", function() {
    recognition.lang = 'fr-fr';
    english.style.fontWeight = 'normal';
    french.style.fontWeight = 'bold';    
  });
}
