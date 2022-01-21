//returns protocol,hostname, port number of url
const url = window.location.origin;
//to connect to the server-here localhost/8080
let socket = io.connect(url);

var myTurn = true, symbol;

// import ScoreboardView from "./scoreboard/ScoreboardView.js";
// let playerOneScore = 0;
// let playerTwoScore = 0;

function getBoardState() {
//this obj will store the present state of board
  var obj = {};

  // We will compose an object of all of the Xs and Os
  // that are on the board
  $(".board button").each(function() {
    obj[$(this).attr("id")] = $(this).text() || "";
  });

  return obj;
}

function isGameOver() {
  var state = getBoardState(),
    // One of the rows must be equal to either of these
    // value for
    // the game to be over
    matches = ["XXX", "OOO"],
    // These are all of the possible combinations
    // that would win the game
    combinations = [
      state.a0 + state.a1 + state.a2,
      state.b0 + state.b1 + state.b2,
      state.c0 + state.c1 + state.c2,
      state.a0 + state.b1 + state.c2,
      state.a2 + state.b1 + state.c0,
      state.a0 + state.b0 + state.c0,
      state.a1 + state.b1 + state.c1,
      state.a2 + state.b2 + state.c2
    ];

  // Loop over all of the combinations and check if any of them compare
  // to either 'XXX' or 'OOO'
  for (var i = 0; i < combinations.length; i++) {
    if (combinations[i] === matches[0] || combinations[i] === matches[1]) {
      return true;
    }
  }
}

function renderTurnMessage() {
  // Disable the board if it is the opponents turn
  if (!myTurn) {
    $("#messages").text("Your opponent's turn");
    $(".board button").attr("disabled", true);

    // Enable the board if it is your turn
  } else {
    $("#messages").text("Your turn.");
    $(".board button").removeAttr("disabled");
  }
}

function makeMove(e) {
  e.preventDefault();

  // It's not your turn
  if (!myTurn) {
    return;
  }

  // The space is already checked
  if ($(this).text().length) {
    return;
  }

  // Emit the move to the server
  //these emitted events can be listened on the other side(client or serve)
  //in this case, emmitting make.move event to be caught by server
  socket.emit("make.move", {
    symbol: symbol,
    position: $(this).attr("id")
  });
}

// Event is called when either player makes a move
//listening to move.made event emitted by server
socket.on("move.made", function(data) {
  // Render the move
  $("#" + data.position).text(data.symbol);

  // If the symbol is the same as the player's symbol,
  // we can assume it is their turn
  myTurn = data.symbol !== symbol;

  // If the game is still going, show who's turn it is
  let cnt=0;
  if (!isGameOver()) {
    var st = getBoardState();
    console.log(st);
    const keys = Object.keys(st);
    keys.forEach((key,index)=> {
      if(st[key]==="") cnt++;
    })
    if(cnt===0) {
      $("#messages").text("Game over. it is a draw.");
      $(".board button").attr("disabled", true);
    }
    else
    renderTurnMessage();

    // If the game is over
  } else {
    // Show the message for the loser
    if (myTurn) {
      $("#messages").text("Game over. You lost.");
      //playerTwoScore++;
      // Show the message for the winner
    } else {
      $("#messages").text("Game over. You won!");
      //playerOneScore++;
    }
    // view();
    // refreshGame();

    // Disable the board
    $(".board button").attr("disabled", true);
  }
});

// function refreshGame() {
//   $(".board button").each(function() {
//     $(this).text("");
//   });

// }

// Set up the initial state when the game begins
socket.on("game.begin", function(data) {
  // The server will asign X or O to the player
  symbol = data.symbol;

  // Give X the first turn
  myTurn = symbol === "X";
  renderTurnMessage();
});

// Disable the board if the opponent leaves
socket.on("opponent.left", function() {
  $("#messages").text("Your opponent left the game.");
  $(".board button").attr("disabled", true);
});

$(function() {
  $(".board button").attr("disabled", true);
  $(".board button").on("click", makeMove);
});

//to update score card
// const root = document.querySelector("#app");
// const view = new ScoreboardView(root, "Player One", "Player Two", (player, direction) => {

// 	view.update(playerOneScore, playerTwoScore);
// });