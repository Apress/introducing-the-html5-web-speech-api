let bot = new RiveScript();

const message_container = document.querySelector('.messages');
const form = document.querySelector('form');
const input_box = document.querySelector('input');
const question = document.querySelector('#help');
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
   
  if (voiceSelect.value) {
    msg.voice = speechSynthesis.getVoices().filter(function(voice) { 
      return voice.name === voiceSelect.value; 
    })[0];
  }
  
  speechSynthesis.speak(msg);
}

const brains = [
  './js/brain.rive'
];

form.addEventListener('submit', (e) => {
  e.preventDefault();
  selfReply(input_box.value);
  input_box.value = '';
});

function botReply(message){
  message_container.innerHTML += `<div class="bot">${message}</div>`;
  location.href = '#edge';
}

function selfReply(message){
  var response;

  response = message.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"");
  message_container.innerHTML += `<div class="self">${message}</div>`;
  location.href = '#edge';
  
  bot.reply("local-user", response).then(function(reply) {
    botReply(reply);
    speak(reply);
  });
}

function botReady(){
  bot.sortReplies();
  botReply('Hello, my name is Hazel. How can I be of help?');
}

function botNotReady(err){
  console.log("An error has occurred.", err);
}

question.addEventListener("click", function() {
  speak("hello. my name is Hazel. How can I be of help?");
  bot.loadFile(brains + "?" + parseInt(Math.random() * 100000)).then(botReady).catch(botNotReady);
});
