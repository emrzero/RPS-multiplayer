// Initialize Firebase
  var config = {
    apiKey: "AIzaSyBlEaQv45FO3Gmf7xMJndSWBKQlEUACXv4",
    authDomain: "rps-hw.firebaseapp.com",
    databaseURL: "https://rps-hw.firebaseio.com",
    storageBucket: "rps-hw.appspot.com",
  };

firebase.initializeApp(config);

var database = firebase.database();

//End Firbase Initialization

var playerNum = 1;
var choices = ['rock', 'paper', 'scissors'];

var localMatchStats = {
  opponent: "",
  turn: 0,
  p1Choice: "",
  p2Choice: "",
  roundOver: false,
  readyForMatch: false, 
  me : ""
}

var playerObj = {
  name: "",
  wins: 0,
  losses: 0
}


var playersRef = database.ref('players');

playersRef.on('child_added', function(snapshot, prevChildKey){
  console.log(snapshot.child("name").val() + ' has entered the arena!');

  var outputHTML = $("#" + snapshot.key + "Box");
  outputHTML.find('h3').text(snapshot.child("name").val());

  playersRef.once('value').then(function(snap){
    if (snap.numChildren() == 1 && snap.child('p1').exists()){
      playerNum = 2;
    } else if (snap.numChildren() == 2){
      localMatchStats.readyForMatch = true;
    }
  })

  .then(function(){
    if (localMatchStats.readyForMatch == false){
      console.log("waiting for more players")
    } else {
      console.log("We're ready for a match. Initializing game...");
      initializeGame();
    }    
  }); 


});


playersRef.on('child_removed', function(snapshot){
  localMatchStats.readyForMatch == false;
  localMatchStats.opponent = "";
  console.log(snapshot.child('name').val() + " has left the arena"); //Returns snapshot of removed data
  if (localMatchStats.me == "p1"){
    $('#p2Box').find('h3').text("Waiting for Player Two");
  } else if(localMatchStats.me == "p1"){
    $('#p1Box').find('h3').text("Waiting for Player One");
  } else {
    $('#p1Box').find('h3').text("Waiting for Player One");
    $('#p2Box').find('h3').text("Waiting for Player Two");
  }

});




$('#submitName').on('click', function(){
  playerObj.name = $('#inputName').val();
  $('#sectionNameInput').html('<h2>Hi ' + playerObj.name + ' you are Player ' + playerNum);
  var k = "p" + playerNum;
  localMatchStats.me = k;
  var playerSession = database.ref("players").update({ [k] : playerObj});
  playerNum++;

  try {
    var ref = database.ref('players/' + localMatchStats.me);
    ref.onDisconnect().set(null);
  }

  catch(err){
    console.log("couldn't complete delete on onDisconnect");
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

function weaponChoiceListener() {
  $('.weapon').on('click',function(){
    localMatchStats[localMatchStats.me + "Choice"] = $(this).data('weapon');
    $('#' + localMatchStats.me + 'Choice').text($(this).data('weapon'));
    
    console.log("You chose " + $(this).data('weapon'));
    console.log(localMatchStats[localMatchStats.me + "Choice"]);
    database.ref('players/' + localMatchStats.me).update({choice : $(this).data('weapon')});
    $('.weapon').remove();
  });
}



//INITIALIZE GAME
function initializeGame(){
  database.ref().update({chat: ""});
  database.ref().update({turn: 1});
  localMatchStats.turn = 1;

  var p1ChoiceRef = database.ref('players/p1/choice');
  p1ChoiceRef.on('value', function(snapshot){
    localMatchStats.p1Choice = snapshot.val();
    if (localMatchStats.me == "p2" && localMatchStats.p1Choice != null){
      database.ref().update({turn: 2});
      printChoices("p2");
      weaponChoiceListener();
    }

  });

  var p2ChoiceRef = database.ref('players/p2/choice');
  p2ChoiceRef.on('value', function(snapshot){
    localMatchStats.p2Choice = snapshot.val();
    if (localMatchStats.p1Choice != null 
      && localMatchStats.p2Choice != null
      && localMatchStats.roundOver == false){
      compareWeapons(localMatchStats.p1Choice, localMatchStats.p2Choice);
    }
  });


  beginRound();
}
//End INITIALIZE GAME

function beginRound(){
  if(localMatchStats.me == "p1"){
    printChoices("p1");
    weaponChoiceListener();
  } else {
    matchMessage("Wating for Opponent to choose");
  }
}

function nextRound(){
  database.ref().update({turn: 1});
  database.ref('players/p1').update({choice : null});
  database.ref('players/p2').update({choice : null});
  localMatchStats.roundOver = false;
  $('#p1Box').text('');
  $('#p2Box').text('');


  beginRound();
}



function compareWeapons (p1, p2){
  localMatchStats.roundOver = true;
  console.log(p1 + " vs " + p2);
  if (p1 == p2){
    console.log("Tie!");
  }
  else if((p1 == 'rock' && p2 == 'scissors') ||
          (p1 == 'paper' && p2 == 'rock') ||
          (p1 == 'scissors' && p2 == 'paper')
    ) {
    console.log("Player ONE wins!");
    playersRef.child('p1/wins').transaction(function(v){
      return v + 0.5;
    });

    playersRef.child('p2/losses').transaction(function(v){
      return v + 0.5;
    });
  }

  else if ((p1 == 'rock' && p2 == 'paper') ||
            (p1 == 'paper' && p2 == 'scissors') ||
            (p1 == 'scissors' && p2 == 'rock')
    ) {
    console.log("Player TWO wins!");
    playersRef.child('p2/wins').transaction(function(v){
      return v+ 0.5;
    });

    playersRef.child('p1/losses').transaction(function(v){
      return v + 0.5;
    });

  }

  setTimeout(nextRound, 2000);
}




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




