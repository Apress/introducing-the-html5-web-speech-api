let bot = new RiveScript();
let langSupport, intro, brains;

const message_container = document.querySelector('.messages');
const form = document.querySelector('form');
const input_box = document.querySelector('input');
const question = document.querySelector('#help');
const voiceSelect = document.getElementById('voice');
const english = document.querySelector(".en-us");
const french = document.querySelector(".fr-fr");
const voice = document.querySelector(".voicechoice");

const enIntro = "Hello. my name is Hazel. How can I be of help?";
const frIntro = "Bonjour. Je m'appelle Hélène. Comment puis-je vois aider?";

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
}

function speak(text) {
  var msg = new SpeechSynthesisUtterance();
  msg.text = text;
   
  if (voiceSelect.value) {
    msg.voice = speechSynthesis.getVoices().filter(function(voice) { 
      return voice.name == voiceSelect.value; 
    })[0];
  }

  msg.lang = langSupport;
  
  speechSynthesis.speak(msg);
}

function setLanguage(langUsed, selIndex, langIntro) {
  voiceSelect.selectedIndex = selIndex;
  langSupport = langUsed;
  intro = langIntro;
  brains = [ './js/brain-' + langSupport + '.rive' ];
  question.disabled = false;  	
}

english.addEventListener("click", function() {
  console.log("clicked english");
  setLanguage('en-us', 3, enIntro);
  question.innerHTML = "Ask a question";
});

french.addEventListener("click", function() {
  console.log("clicked french");
  setLanguage('fr-fr', 8, frIntro);
  question.innerHTML = "Poser une question";
});

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
  botReply(intro);
}

function botNotReady(err){
  console.log("An error has occurred.", err);
}

question.addEventListener("click", function() {
  speak(intro);
  bot.loadFile(brains + "?" + parseInt(Math.random() * 100000)).then(botReady).catch(botNotReady);
});
