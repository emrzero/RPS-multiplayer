// Initialize Firebase
  var config = {
    apiKey: "AIzaSyBlEaQv45FO3Gmf7xMJndSWBKQlEUACXv4",
    authDomain: "rps-hw.firebaseapp.com",
    databaseURL: "https://rps-hw.firebaseio.com",
    storageBucket: "rps-hw.appspot.com",
  };
  firebase.initializeApp(config);

  var database = firebase.database();


var playerOne = '';
var playerTwo = '';

var playerOneWeapon = '';
var playerTwoWeapon = '';

var turn = 1;

var choices = ['rock', 'paper', 'scissors'];

$('#submitName').on('click', function(){
  if (playerOne == ''){
    playerOne = $('#inputName').val();
    $('#playerOneBox').find('h3').text('Player One');
    $('#playerOneBox').append('<h1>' + playerOne + '</h1>');
    // printChoices('playerOne');
    matchMessage('Wating for player two');
  } else {
    playerTwo = $('#inputName').val();
    $('#playerTwoBox').find('h3').text('Player Two');
    $('#playerTwoBox').append('<h1>' + playerTwo + '</h1>');
    printChoices('playerOne');
    printChoices('playerTwo');
    matchMessage("Let's play!");
    weaponChoiceListener();
  }
});

function printChoices(player){
  for (c in choices){
    var l = $('<button>');
    l.data('weapon', choices[c]);
    l.data('player', player);
    l.addClass('weapon');
    l.html(choices[c]);
    var box = player + 'Box';
    $('#' + box).append(l);
  }
}

function matchMessage(msg){
  $('#matchResultsTextBox').text(msg);
}

function weaponChoiceListener (){
  $('.weapon').on('click',function(){
    if (turn == 1 && $(this).data('player')== 'playerOne'){
      turn = 2;
      playerOneWeapon = $(this).data('weapon');
      $('#playerOneChoice').text(playerOneWeapon);
      matchMessage('Wating for Player TWO to choose');

    } else if (turn == 2 && $(this).data('player')== 'playerTwo'){
      turn = 1;
      playerTwoWeapon = $(this).data('weapon');
      $('#playerTwoChoice').text(playerTwoWeapon);
      compareWeapons(playerOneWeapon, playerTwoWeapon);
    }

  });
}

function compareWeapons (p1, p2){
  if (p1 == p2){
    matchMessage("Tie!");
  }
  else if((p1 == 'rock' && p2 == 'scissors') ||
          (p1 == 'paper' && p2 == 'rock') ||
          (p1 == 'scissors' && p2 == 'paper')
    ) {
    matchMessage("Player ONE wins!");
  }

  else if ((p1 == 'rock' && p2 == 'paper') ||
            (p1 == 'paper' && p2 == 'scissors') ||
            (p1 == 'scissors' && p2 == 'rock')
    ) {
    matchMessage ("Player TWO wins!")
  }

  setTimeout(nextRound, 2000);

  // console.log(p1, p2);
}

function nextRound(){
  playerOneWeapon = '';
  $('#playerOneChoice').text(playerOneWeapon);

  playerTwoWeapon = '';
  $('#playerTwoChoice').text(playerTwoWeapon);

  matchMessage('Wating for Player ONE to choose');
}
