var lobbySock = null;
var wsStart = 'ws://'
var loc = window.location;
if (loc.protocol == 'https:') {
    wsStart = 'wss://'
};
function choose_opponent(id) {
    
    el = document.getElementById(id);
    opponent = el.innerHTML;
    console.log("Sending req to user: ", opponent)
    sendGameRequest(opponent, id);
};


function loadPlayers(playersLst) {
    // Displays players that are currently online

    tbl = document.getElementById("players-tbl");
    tbl.innerHTML = "";
    for (var i = 0; i < playersLst.length; i++) {
        tr = document.createElement("tr");
        td = document.createElement("td");
        innerDiv = document.createElement("div");
        innerDiv.setAttribute("class", "uname")
        innerDiv.setAttribute("id", "num" + String(i + 1))
        innerDiv.setAttribute("onclick", "choose_opponent(this.id)")
        innerDiv.innerHTML = playersLst[i];
        td.appendChild(innerDiv);
        tr.appendChild(td);
        tbl.appendChild(tr);
    };
};

function sendGameRequest(recipient, lobbyId) {
   
    if(lobbySock != null) {
        var recipientEl = document.getElementById(lobbyId);
        recipientEl.disabled = true;
        recipientEl.style.color = 'lightgray';

        var user = getCookieValue('games_username');
        var token = getCookieValue('games_user_token');
        lobbySock.send(JSON.stringify({
            'game_req': {
                'sender': user,
                'recipient': recipient,
                'recipient_lobby_id': lobbyId,
                'token': token
            }}))
    };
}

function joinLobby() {
    
    var endpoint = wsStart + loc.host + loc.pathname;
    console.log("Joining lobby at: ", endpoint)
    lobbySock = new WebSocket(endpoint);
    lobbySock.onmessage = function (e) {
        console.log("message", e.data)
        //display_msg(e.data, "green", 1);
        obj = JSON.parse(e.data)
    
        if (obj.hasOwnProperty('game_req')) {
            if(confirm("Game Request from: " + obj['game_req']['sender'])) {
                
                // Respond with my username and my lobby id
                lobbySock.send(JSON.stringify({'req_accepted': {'sender': currentUser, 'recipient': obj['game_req']['sender']}}));

                var roomName = obj['game_req']['sender'] + "-" + currentUser;
               
                lobbySock.close();
                window.location.replace("http://"  + loc.host + "/games/battleship/game/" + roomName + "/");
                
            } else {
                
                lobbySock.send(JSON.stringify({'req_refused': {'sender': currentUser, 'sender_lobby_id': obj['game_req']['recipient_lobby_id'], 'recipient': obj['game_req']['sender']}}));
            }
        
        } else if(obj.hasOwnProperty('req_accepted')) {
            var roomName = currentUser + "-" + obj['req_accepted']['sender']; 
            //join_chat(obj);
            lobbySock.close();
            window.location.replace("http://"  + loc.host + "/games/battleship/game/" + roomName + "/"); // make this NOT hard coded

        } else if(obj.hasOwnProperty('req_refused')) {
            // make the requested user clickable again
            var opponentEl = document.getElementById(obj['req_refused']['sender_lobby_id']);
            opponentEl.disabled = false;
            opponentEl.style.color = 'black';

        } else if (obj.hasOwnProperty('users')) {
            loadPlayers(obj['users']);
        };

    }
    lobbySock.onopen = function (e) {
        // send token
        //display_msg("Connected", "green", 0);
        var token = getCookieValue("games_user_token");
        lobbySock.send(JSON.stringify({ 'games_user_token': token }));

    }
    lobbySock.onerror = function (e) {
        //console.log("error", e)
        //display_msg("Error! Disconnected", "red", 0);
    }
    lobbySock.onclose = function (e) {
        //console.log("close", e)
        //display_msg("Disconnected", "red", 0);
    }
};