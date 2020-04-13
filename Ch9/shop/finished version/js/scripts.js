$(document).ready(function(){
  var countCookies, plural;

  
  // Lift card and show stats on mouseover
  $('.product').each(function(i, el){         
    $(el).find('.make3D').hover(function(){
      $(this).parent().css('z-index', "20");
      $(this).addClass('animate');
    }, function(){
      $(this).removeClass('animate');     
      $(this).parent().css('z-index', "1");
    }); 
  });

  // Delete items on click, and update cart totals
  $("body").on("click", ".delete-item", function(){
    $(this).parent().fadeOut(300, function(){
      $(this).remove();
      
      /* update basket totals */
      countCookies = $(".cart-item").length;
      countCookies > 1 ? plural = "s" : plural = "";
      $("span.count").html(countCookies + " item" + plural + " in basket");
      var basketAmt = Number(countCookies * 0.5).toFixed(2);
      $(".subtotal").html(basketAmt);

      if($("#cart .cart-item").length == 0){
        $("#cart .empty").fadeIn(500);
        $("#checkout").fadeOut(500);
        $("span.count").html("No items in basket");
        $("#cart").css("display", "none");
      }
    });
  });

  $('.add_to_cart').on("click", function() {
    $("#cart").css("display", "block");
    sessionStorage.setItem("speechEnabled", "false");

    var productCard = $(this).parent();
    var position = productCard.offset();
    var productImage = $(productCard).find('img').get(0).src;
    var productName = $(productCard).find('.product_name').get(0).innerHTML;  

    $("body").append('<div class="floating-cart"></div>');    
    var cart = $('div.floating-cart');    
    productCard.clone().appendTo(cart);
    $(cart).css({'top' : position.top + 'px', "left" : position.left + 'px'}).fadeIn("slow").addClass('moveToCart');    

    setTimeout(function() {
      $("body").addClass("MakeFloatingCart");
    }, 800);

    setTimeout(function(){
      $('div.floating-cart').remove();
      $("body").removeClass("MakeFloatingCart");

      var cartItem = "<div class='cart-item'><div class='img-wrap'><img src='"+productImage+"' alt='' /></div><span>"+productName+"</span><strong>$0.50</strong><div class='cart-item-border'></div><div class='delete-item'></div></div>";     

      $("#cart .empty").hide();     
      $("#cart").append(cartItem);
      $("#checkout").fadeIn(500);
      $("span.empty").css("display", "none");
      
      /* Provide running totals */
      countCookies = $(".cart-item").length;
      countCookies > 1 ? plural = "s" : plural = "";
      $("span.count").html(countCookies + " item" + plural + " in basket");
      
      var basketAmt = Number(countCookies * 0.5).toFixed(2);
      $(".subtotal").html(basketAmt);

      $("span.count").css("display", "inline-block");

      /* Flash last item once added */
      $("#cart .cart-item").last().addClass("flash");
        setTimeout(function(){
        $("#cart .cart-item").last().removeClass("flash");
      }, 10 );
      
    }, 1000);
  });

  /* MODAL ---------------------------------------------------- */

  $("body").on("click", "#checkout", function(){
    $(".overlay, .modal").addClass("active");
    $(".cookietotal").html($("#carttotal > span.subtotal").text());

    var toDisplay = Number($(".cookietotal").text()) + 3.95;
    $(".totalAmt").text("$ " + toDisplay);

  });

  $(".close, .overlay").on("click", function(){
     $(".overlay, .modal").removeClass("active");
  });

  $(document).keyup(function(e) {
    if (e.keyCode === 27) {
      $(".overlay, .modal").removeClass("active");
    }
  }); 


  /* SPEECH RECOGNITION --------------------------------------- */
  /* Code to be added here */

  const log = document.querySelector(".output_log");
  const output = document.querySelector(".output_result");

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = new SpeechRecognition();

  recognition.interimResults = false;
  recognition.maxAlternatives = 1;
  recognition.continuous = true;

  document.querySelector("#microphone").addEventListener("click", () => {
    let recogLang = "en-US";
    recognition.lang = recogLang.value;
    recognition.start();
  });

  recognition.addEventListener("speechstart", () => {
    log.textContent = "Speech has been detected.";
  });

  recognition.addEventListener("result", (e) => {
    log.textContent = "Result has been detected.";

    let last = e.results.length - 1;
    let text = e.results[last][0].transcript;

    output.textContent = text;

    // SR - "Add an X to the basket"
    if (text.search(/\badd\b/)) {
      var request = text.split(" ").pop();

      console.log(request);
      var cookieChosen;
      
      /* add cookie to basket */
      if (request == "cherry") {
        cookieChosen = "cherry bakewell";        
      }

      if (request == "dark") {
        console.log("Cookie to add is Dark Chocolate");
        cookieChosen = "dark chocolate";
      }

      if (request == "raspberry") {
        cookieChosen = "raspberry";
      } 

      if (request == "toffee") {
        cookieChosen = "toffee";
      }

      $('[data-product="' + cookieChosen + '"]').trigger("click");

      /* ----------------- */
      /* click on checkout */
      if (text.indexOf("check") != -1) {
        $("#checkout").trigger("click");
      }

      /* ----------------- */
      /* enter credit card number */
      if (text.indexOf("credit card") != -1) {
        $("#cardnumber").val("4111111111111111");
      }

      /* ----------------- */
      /* enter card date   */    
      if (text.indexOf("expiry") != -1) {
        $("#cardexpiration").val("10/2022");
      }  

      /* ----------------- */
      /* enter CVV number  */      
      if (text.indexOf("security") != -1) {
        $("#cardcvc").val("672");
      }  

      /* ----------------- */
      /* click on purchase */      
      if (text.indexOf("purchase") != -1) {
        $("div.card-form > button > span").trigger("click");
      }
    }
    
    log.textContent = "Confidence: " + (e.results[0][0].confidence * 100).toFixed(2) + "%";
  });

  recognition.addEventListener("speechend", () => {
    recognition.stop();
  });

  recognition.onspeechend = function() {
    log.textContent = 'You were quiet for a while so voice recognition turned itself off.';
    console.log("off");
  };

  recognition.addEventListener("error", e => {
    if (e.error == "no-speech") {
      output.textContent = "Error: no speech detected";  
    } else {
      output.textContent = "Error: " + e.error;  
    }
  });


  /* PAYMENT FORM --------------------------------------------- */
  $(".cookietotal").html($(".subtotal").text());


  $('#cardnumber').payment('formatCardNumber');
  $('#cardexpiration').payment('formatCardExpiry');
  $('#cardcvc').payment('formatCardCVC');
  
  $('#cardnumber').keyup(function(event) {
    $('#label-cardnumber').empty().append($(this).val());
  });
  
  $('#cardexpiration').keyup(function(event) {
    var data = $(this).val() + '<span>' + $('#cardcvc').val() + '</span>';
    $('#label-cardexpiration').empty().append(data);
  });
  
  $('#cardcvc').keyup(function(event) {
    var data = $('#cardexpiration').val() + '<span>' + $(this).val() + '</span>';
    $('#label-cardexpiration').empty().append(data);
  });
  
  $('.button-cta').on('click', function () { 
    var proceed = true;
    $(".field input").each(function(){
      $(this).parent().find('path').each(function(){
        $(this).attr('fill', '#dddfe6');
      });
      
      if(!$.trim($(this).val())){
        $(this).parent().find('path').each(function(){
          $(this).attr('fill', '#f1404b');
          proceed = false;
        });
        
        if(!proceed){
          $(this).parent().find('svg').animate({opacity: '0.1'}, "slow");
          $(this).parent().find('svg').animate({opacity: '1'}, "slow");
          $(this).parent().find('svg').animate({opacity: '0.1'}, "slow");
          $(this).parent().find('svg').animate({opacity: '1'}, "slow");
        }
      }
    });
       
    if(proceed) //everything looks good! proceed purchase...
    {
      $('.field').find('path').each(function(){
        $(this).attr('fill', '#3ac569');
      });
      $('.payment').fadeToggle('slow', function() {
        $('.paid').fadeToggle('slow', 'linear');
      });
    }
  });
});