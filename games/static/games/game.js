
function getGameName() {

    var arr = loc.pathname.split("/");
    var name = arr[arr.length -2];

    return name
};

function getOpponentName() {

    var gameName = getGameName();
    const [player1, player2] = gameName.split("-");
    var opponentNameEl = document.getElementById("opponent-name");

    if(player1 == currentUser) {
        opponentNameEl.innerHTML = player2
        return ['player2', player2]
    } else {
        opponentNameEl.innerHTML = player1
        return ['player1', player1]
    }
}


function createNewGame() {

    var url = window.location.origin + "/api/games/battleship/";
    var token = getCookieValue("games_user_token");
    var gameName = getGameName();
    var player2 = null;
    var opponentName = getOpponentName();
    if(opponentName[0] == 'player2') {
        player2 = opponentName[1]
    } else {
        player2 = currentUser
    };
    var data = {'game_name': gameName,
                'player_2': player2,
                'turn': '0', 
                'player_1_board_state': JSON.stringify(boardsState[0]),
                'player_1_ships': JSON.stringify(ships[0]),
                'player_2_board_state': 'a',
                'player_2_ships': 'b',
                }

    //var data = JSON.stringify(data_obj);
    $.ajax({
        type: "POST",
        url: url,
        data: data,
        headers: { "Authorization": "Token " + token },
        success: function (data) {

            console.log("Game Created. status: ", data.status)
            console.log(data)
            initBoards();
        },
        error: function(data) {
            console.log("Error. Game not created. status: ", data.status)
        }
    });
}

$(document).ready(function () {

    var gameName = getGameName();
    var url = window.location.origin + "/api/games/battleship/" + gameName ;
    var token = getCookieValue("games_user_token");
    joinGame()
   
    
    $.ajax({
        type: "GET",
        url: url,
        headers: { "Authorization": "Token " + token },
        success: function (data) {
            console.log("Got game, status: ", data.status)
            var opponentName = getOpponentName();
            if(opponentName[0] == 'player_2') {
                boardsState[0] = JSON.parse(data['player_1_board_state'])
                boardsState[1] = JSON.parse(data['player_2_board_state'])
                ships[0] = JSON.parse(data['player_1_ships'])
                ships[1] = JSON.parse(data['player_2_ships'])
                gameState['you_ready'] = data['player_1_ready']
                gameState['opponent_ready'] = data['player_2_ready']
            } else {
                boardsState[1] = JSON.parse(data['player_1_board_state'])
                boardsState[0] = JSON.parse(data['player_2_board_state'])
                ships[1] = JSON.parse(data['player_1_ships'])
                ships[0] = JSON.parse(data['player_2_ships'])
                gameState['you_ready'] = data['player_2_ready']
                gameState['opponent_ready'] = data['player_1_ready']
            };
           
            gameState['turn'] = data['turn']
            console.log("SHIPS1 AT REQ: ", ships[0])
            console.log("SHIPS2 AT REQ: ", ships[1])
            if(isKeySmall(boardsState[0]['1'].d) && d === 40) {
                initBoards();
                changeBoardSize();
            } else {
                initBoards();
            }
            
        },
        error: function(data) {
            console.log("Error get game. status: ", data.status)
            createNewGame()
                
        }
            
    });
});



function updateChatScroll() {
    var chatCont = document.getElementById("chat-msg-cont");
    chatCont.scrollTop = chatCont.scrollHeight;
};


function sendMsg() {
    chatWindow = document.getElementById("chat-msg-cont")
    msgDiv = document.createElement("div");
    msg = document.getElementById("chat-msg-input");
    if(msg.value != "") {
        chatSock.send(JSON.stringify({"chat_message": msg.value}));
        msg.value = "";
    }
    
};

function receiveMsg(msg, usr) {
    chatWindow = document.getElementById("chat-msg-cont")
    msgDiv = document.createElement("div");
    
    if(currentUser == null) {
        currentUser = getCookieValue("games_username");
      
    };
    if(currentUser == usr) {
        msgDiv.setAttribute("class", "chat-msg-light")
    } else {
        msgDiv.setAttribute("class", "chat-msg-dark")
    } 
    
    msgDiv.innerHTML = msg; 
    chatWindow.appendChild(msgDiv);  
    updateChatScroll();
    
};

var wsStart = 'ws://'
var loc = window.location;
if (loc.protocol == 'https:') {
    wsStart = 'wss://'
};


var chatSock = null;
var gameSock = null;

// Chat Sockets
function joinChat() {

    //var chatWindow = document.getElementById('chat-cont');
    //var lobby_window = document.getElementById('lobby-cont');

    document.getElementById("chat-msg-input")
    .addEventListener("keyup", function(event) {
    event.preventDefault();
        if (event.keyCode === 13) {
            document.getElementById("send-btn").click();
        };
    });
    //lobby_window.style.display = "none";
    //chatWindow.style.display = "flex";
    
    
    var endpoint = wsStart + loc.host + loc.pathname
    //var endpoint = wsStart + loc.host + loc.pathname + "chat/" + "test_room/";
  
    chatSock = new WebSocket(endpoint);

    chatSock.onmessage = function (e) {
        console.log("message", e.data)
        //displayMsg(e.data, "green", 1);
        obj = JSON.parse(e.data)
        // display message from other user
        if(obj.hasOwnProperty('user_online')) {
            receiveMsg(obj['user_online'] + " joined the chat!", obj['user_online']);
        } else if(obj.hasOwnProperty('user_offline')) {
            receiveMsg(obj['user_offline'] + " left the chat!", obj['user_offline']);   
        } else {
            receiveMsg(obj['chat_message'], obj['from_user']);
        };
       

    }
    chatSock.onopen = function (e) {
        // send token
        //displayMsg("Chat Connected. You are chatting with " + req['opponent'], "green", 0);
        var token = getCookieValue('games_user_token');
        if(token) {
            chatSock.send(JSON.stringify({'games_user_token': token}));
        };  

    }
    chatSock.onerror = function (e) {
        //console.log("error", e)
        //displayMsg("Error! Chat Disconnected", "red", 0);
    }
    chatSock.onclose = function (e) {
        //console.log("close", e)
        //displayMsg("Disconnected. Opponent left the game", "red", 0);
    }
};

// Game Sockets
function joinGame() {

    var endpoint = wsStart + loc.host + loc.pathname + "comms/";

    gameSock = new WebSocket(endpoint);

    gameSock.onmessage = function (e) {
        
        //displayMsg(e.data, "green", 1);
        obj = JSON.parse(e.data)
       
        if(obj['msg_type'] == "shot") {
            
            // if num ends with 5 after dividing by 2, it corresponds with small board
            var key = obj['key'];
           
            if(obj['user'] == currentUser) {
                // TO DO change key size to correspond with current size of board
                markBoard(key, 1);
            } else {
                markBoard(key, 0);
            }
        } else if(obj['msg_type'] == 'ready') {
            
            boardsState[1] = JSON.parse(obj['board_state']);

            switchOpponentReady();
            drawOpponentBoard();
        }

    }

    gameSock.onopen = function (e) {
        // send token
        displayMsg("Connected", "green", 0);
        var token = getCookieValue("games_user_token");
        gameSock.send(JSON.stringify({ 'games_user_token': token }));

    }
    gameSock.onerror = function (e) {
        //console.log("error", e)
        displayMsg("Error! Disconnected", "red", 0);
    }
    gameSock.onclose = function (e) {
        //console.log("close", e)
        displayMsg("Disconnected", "red", 0);
    }
};
