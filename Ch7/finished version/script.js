/*jshint esversion: 6 */

(function () {
  "use strict";

  let bot = new RiveScript();
  
  const message_container = document.querySelector('.messages');
  const question = document.querySelector('#help');
  const voiceSelect = document.getElementById('voice');
  const mylat = document.querySelector("span.lat");
  const mylon = document.querySelector("span.lon");
  const output = document.querySelector(".output_result");
  
  var cuisineType = sessionStorage.getItem("cuisine");
  var rating = sessionStorage.getItem("priceRange");
  var restCount = 0;
  var takeaway = "";
  
  mylat.innerHTML = "50.0904752";
  mylon.innerHTML = "14.3889708";
  
  // -------
  
  /*function getLocation() {
    navigator.geolocation.getCurrentPosition((loc) => {
      mylat.innerHTML = loc.coords.latitude;
      mylon.innerHTML = loc.coords.longitude;
    })  
  }
  
  getLocation();*/
  
  
  /***********************************************************************/
  
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
        return voice.name == voiceSelect.value; 
      })[0];
    }
    
    speechSynthesis.speak(msg);
  }
  
  const brains = [
    './js/brain.rive'
  ];
  
  function botReply(message){
    if (message.indexOf("No problem") != -1) {
      
      $.when(getRestaurants()).then(function() {
        restCount = sessionStorage.getItem("restCount");
        message = "No problem, here is the " + restCount + " I've found:";
        message_container.innerHTML += `<div class="bot">${message}</div>`;  
      }).then(function(){
        $(".here").css("display", "block");
        output.textContent = "";
      });
    } else {
      message_container.innerHTML += `<div class="bot">${message}</div>`;  
    }

    location.href = '#edge';
  }
  
  function selfReply(message){
    var response;
  
    response = message.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"");

    if (response.indexOf("No problem") != 1) {
      restCount = sessionStorage.getItem("restCount");
      message = "No problem, here is the " + restCount + " I've found:";
    }

    message_container.innerHTML += `<div class="self">${message}</div>`;
    location.href = '#edge';
    
    bot.reply("local-user", response).then(function(reply) {
      botReply(reply);
      speak(reply);
    });
  }
  
  function botReady(){
    bot.sortReplies();
    botReply('Hi there! Hungry? Looking for a restaurant here in Prague?');
  }
  
  function botNotReady(err){
    console.log("An error has occurred.", err);
  }
  
  question.addEventListener("click", function() {
    speak("Hi there! Hungry? Looking for a restaurant here in Prague?");
    bot.loadFile(brains + "?" + parseInt(Math.random() * 100000)).then(botReady).catch(botNotReady);
  });
  
  /************************************************/
  
  var amt;
  
  $.getJSON('https://api.exchangerate-api.com/v4/latest/CZK', function(data) {
    $.each(data.rates, function(currency, rate) {
      if (currency == "USD") {
        amt = (rate * 300).toFixed(2);
      }
    });
  });
  
  function distance(lat1, lon1, lat2, lon2) {
    var p = 0.017453292519943295;    // Math.PI / 180
    var c = Math.cos;
    var a = 0.5 - c((lat2 - lat1) * p)/2 + 
            c(lat1 * p) * c(lat2 * p) * 
            (1 - c((lon2 - lon1) * p))/2;
  
    return 12742 * Math.asin(Math.sqrt(a)); // 2 * R; R = 6371 km
  }
  
  function getRestaurants() {
    $.ajax({
      method:'GET',
      crossDomain: true,
      url: 'js/restaurants-prague.json',
      dataType: "json",
      async: true,
      headers: {
        "user-key": "c697ba51c6b29523f885bb3a8b279c93"
      },
      success: function(response){
  
        /* filter on cuisine type and user rating */
        var returnedData = $.grep(response.restaurants, function (element, index) {
          return ((element.restaurant.cuisines == cuisineType) && (element.restaurant.price_range == rating));
        });
  
        // Work out how many restaurants and store in session Storage
        restCount = (returnedData.length == 1 ? "1 restaurant" : returnedData.length + " restaurants");
        sessionStorage.setItem('restCount', restCount);
  
        for(var i=0; i<returnedData.length; i++){
          var distanceaway = distance(mylat.innerHTML, mylon.innerHTML, returnedData[i].restaurant.location.latitude, returnedData[i].restaurant.location.longitude);
  
          for(var x=0; x<returnedData[i].restaurant.highlights.length; x++){
            if (returnedData[i].restaurant.highlights[x] == "Takeaway Available") {
              takeaway = "Yes";
            }
          }        
  
          var newDiv = $("<div class='card'>");
          newDiv.append(
            $("<div class='card-body'>").append(
              $("<span>").html("<img src=" + returnedData[i].restaurant.thumb + "><h1><a href=" + returnedData[i].restaurant.menu_url + ">"+returnedData[i].restaurant.name+"</a></h1><img class='rating_img' src='./img/" + returnedData[i].restaurant.price_range + ".png'><span class='distance'><img src='./img/location.svg'>" + distanceaway.toFixed(2) + " kms</span>"),
              $("<p>").html("Tel. Nos: " + returnedData[i].restaurant.phone_numbers),
              $("<p>").html("Rating: <span class='av_rating'>"+returnedData[i].restaurant.user_rating.aggregate_rating + " / 5 </span>"),
              $("<p>").text("Address: " + returnedData[i].restaurant.location.address),
              $("<p>").text("Cuisine: " + returnedData[i].restaurant.cuisines),
              $("<p>").text("Average cost for two: " + returnedData[i].restaurant.average_cost_for_two + " " + returnedData[i].restaurant.currency + " (or USD " + amt + ")"),
  
              $("<p>").text("Is takeaway available: " + takeaway),
              $("<p>").text("Latitude: " + returnedData[i].restaurant.location.latitude),
              $("<p>").text("Longitude: " + returnedData[i].restaurant.location.longitude),
              $("<p>").html("<a href=" + returnedData[i].restaurant.url + ">Link to Restaurant</a>")
            )
          );
          $(".here").append(newDiv);   
  
          // reset
          distanceaway = 0;
        }
      }  
    });
  }
  
  /************************************************/
  
  navigator.mediaDevices.getUserMedia({ audio: true }).then(function(stream) {
  
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
  
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.continous = true;
  
    document.querySelector("section.speech > button").addEventListener("click", () => {
      let recogLang = "en-US";
      recognition.lang = recogLang.value;
      recognition.start();
    });
  
    recognition.addEventListener("speechstart", () => {
      console.log = "Speech has been detected.";
    });
  
    recognition.addEventListener("result", (e) => {
      console.log = "Result has been detected.";
  
      let last = e.results.length - 1;
      let text = e.results[last][0].transcript;
  
      output.textContent = text;
      selfReply(output.textContent);
    });
  
    recognition.addEventListener("speechend", () => {
      recognition.stop();
    });
  
    recognition.addEventListener("error", (e) => {
      console.textContent = "Error: " + e.error;
    });
  }).catch(function(err) {
    console.log(err);
  });
}());