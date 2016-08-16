// Initialize Firebase
  var config = {
    apiKey: "AIzaSyBlEaQv45FO3Gmf7xMJndSWBKQlEUACXv4",
    authDomain: "rps-hw.firebaseapp.com",
    databaseURL: "https://rps-hw.firebaseio.com",
    storageBucket: "rps-hw.appspot.com",
  };
  firebase.initializeApp(config);

  var database = firebase.database();


//Begin session experiment
// var connectionsRef = database.ref("/connections");

// var connectedRef = database.ref(".info/connected");

// connectedRef.on('value', function(snapshot){
//   if (snapshot.val()){
//     var con = connectionsRef.push(true);

//     con.onDisconnect().remove();
//   }
// });

//End Session Experiment

//Begin Read once experiment

var playerNum = 0;
var readyForMatch = false;

var localMatchStats ={
  opponent: "",
  turn: 0,
  p1Choice: "",
  p2Choice: "",
  roundOver: false
}

database.ref('players').once('value').then(function(snapshot){
  if (snapshot.val() == null){
    console.log("no players yet");
    playerNum = 1;
    console.log('You are player ' + playerNum);
    database.ref().update({chat: ''});
  } 

  else if (Object.keys(snapshot.val()).length == 1) {
    console.log(Object.keys(snapshot.val()).length);
    readyForMatch = true;
    playerNum = 2;
    console.log('You are player ' + playerNum);
    localMatchStats.opponent = snapshot.val().p1.name;
    $('#playerOneBox').find('h3').text(localMatchStats.opponent);
  }

  else if (Object.keys(snapshot.val()).length == 2){
    $('#sectionNameInput').html("Arena is full. No more slots!");
    $('#playerOneBox').find('h3').text(snapshot.val().p1.name);
    $('#playerTwoBox').find('h3').text(snapshot.val().p2.name);
  }
});

//End Read once experiment

//Begin Watch for updates Experiment

var playersRef = database.ref('players');


playersRef.on('child_added', function(snapshot, prevChildKey){
  console.log('A new player has entered the arena!');
  console.log(playerNum);
  console.log(prevChildKey);

  if (playerNum == 1){
    if(readyForMatch == false) {
      $('#playerOneBox').find('h3').text(snapshot.val().name);
      readyForMatch = true;
      
    }
    database.ref('players').once('value').then(function(snapshot){
      try{
        console.log(snapshot.val().p2.name);
        localMatchStats.opponent = snapshot.val().p2.name;
        $('#playerTwoBox').find('h3').text(localMatchStats.opponent);
        printChoices('playerOne');
        weaponChoiceListener();
        // $('#matchBox').find('h3').text("It's your turn");
        matchMessage("It's your turn")
      }

      catch(err){
        console.log("player two doesn't exist yet");
      }
 
    });
  } 

  else if (playerNum == 2 ){
    $('#playerTwoBox').find('h3').text(snapshot.val().name);
    printChoices('playerTwo');
    weaponChoiceListener();
    database.ref().update({turn : 1});
    $('#matchBox').find('h3').text("Waiting for " + localMatchStats.opponent + " to choose");
    if (readyForMatch == false){
      $('#playerOneBox').find('h3').text("Waiting for Player One");
    }
  }
});

//

//Begin Experiment with watching removal of players

playersRef.on('child_removed', function(snapshot){
  readyForMatch == false;
  // console.log(snapshot.val()); //Returns snapshot of removed data
  if (playerNum == 1){
    $('#playerTwoBox').find('h3').text("Waiting for Player Two");
  } else if(playerNum == 2){
    $('#playerOneBox').find('h3').text("Waiting for Player One");
  } else {
    $('#playerOneBox').find('h3').text("Waiting for Player One");
    $('#playerTwoBox').find('h3').text("Waiting for Player Two");
  }

});
//End Experiment with watching removal of players

var playerObj = {
  name: "",
  wins: 0,
  losses: 0
}


// var playerOne = '';
// var playerTwo = '';

// var playerOneWeapon = '';
// var playerTwoWeapon = '';

// var turn = 1;


var choices = ['rock', 'paper', 'scissors'];

$('#submitName').on('click', function(){
  playerObj.name = $('#inputName').val();
  $('#sectionNameInput').html('<h2>Hi ' + playerObj.name + ' you are Player ' + playerNum);
  var k = "p" + playerNum;
  var playerSession = database.ref("players").update({ [k] : playerObj});

  try {
    var ref = database.ref('players/p' + playerNum);
    ref.onDisconnect().set(null);
  }

  catch(err){
    console.log("couldn't complete delete on onDisconnect");
  }


});

// $('#submitName').on('click', function(){
//   if (playerOne == ''){
//     playerObj.name = $('#inputName').val();
//     playerOne = $('#inputName').val();
//     $('#playerOneBox').find('h3').text('Player One');
//     $('#playerOneBox').append('<h1>' + playerOne + '</h1>');
//     // printChoices('playerOne');
//     matchMessage('Wating for player two');
//     database.ref("/players").set({p1 : playerObj});
//   } else {
//     playerTwo = $('#inputName').val();
//     $('#playerTwoBox').find('h3').text('Player Two');
//     $('#playerTwoBox').append('<h1>' + playerTwo + '</h1>');
//     printChoices('playerOne');
//     printChoices('playerTwo');
//     matchMessage("Let's play!");
//     weaponChoiceListener();
//   }
// });

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

function weaponChoiceListener() {
  $('.weapon').on('click',function(){
    localMatchStats["p" + playerNum + "Choice"] = $(this).data('weapon');
    $('.weapon').detach();
    matchMessage("You chose " + localMatchStats["p" + playerNum + "Choice"])
    database.ref('players/p' + playerNum).update({choice :localMatchStats["p" + playerNum + "Choice"]});
    database.ref('turn').once('value').then(function(snapshot){
      if (snapshot.val() == 1){
        // console.log("It's player one's turn, now toggling.");
        database.ref().update({turn: 2});
      } else{
        // console.log("It's player two's turn, now toggling.");
        database.ref().update({turn: 1});
      }
      localMatchStats.turn = snapshot.val();
    });
  });
}

database.ref('turn').on('value', function(snapshot){
  // console.log(snapshot.val());
  localMatchStats.turn = snapshot.val();
  if (localMatchStats.turn == 1 ){
    if (playerNum == 1){
      matchMessage("It's your turn");
    } else if(playerNum == 2){
      matchMessage("Wating for " + localMatchStats.opponent + " to choose");
    }
    
  } else if(localMatchStats.turn == 2){
    if(playerNum == 2){
      matchMessage("It's your turn");
    } else if(playerNum == 1){
      matchMessage("Wating for " + localMatchStats.opponent + " to choose");
    }
    
  }
});

// function weaponChoiceListener (){
//   $('.weapon').on('click',function(){
//     if (turn == 1 && $(this).data('player')== 'playerOne'){
//       turn = 2;
//       playerOneWeapon = $(this).data('weapon');
//       $('#playerOneChoice').text(playerOneWeapon);
//       matchMessage('Wating for Player TWO to choose');

//     } else if (turn == 2 && $(this).data('player')== 'playerTwo'){
//       turn = 1;
//       playerTwoWeapon = $(this).data('weapon');
//       $('#playerTwoChoice').text(playerTwoWeapon);
//       compareWeapons(playerOneWeapon, playerTwoWeapon);
//     }

//   });
// }

//Begin Chat functionality

$('#send').on('click', function(){
  var msg = $('#message').val();
  // console.log(msg);

  database.ref('chat').push({name: playerObj.name, message: msg});
  $('#message').val('');
});

var chatRef = database.ref('chat');

chatRef.on('child_added', function(snapshot){
  // console.log(snapshot.val().name);
  // console.log(snapshot.val().message);

  var l = $('<li>');
  l.append(snapshot.val().name);
  l.append(': ');
  l.append(snapshot.val().message);
  $('#chatLog').append(l);

});

//End Chat functionality

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
