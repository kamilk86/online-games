var boardsState = [];
var gameState = {
    "you_ready": false,
    "opponent_ready": false,
    "turn": 0 // change this to null
};
var adjacent = [];
var taken = [];
var shipSelected = 1;
var shipSquares = 0;
var shipNumOf = 0;
var d = 40; // TO DO: make this relative to screen size and board
var d2 = 30;
var infoCanvas = null;
var infoCtx = null;
var boards = [];
var ctx = [];
var chars = 'ABCDEFGHIJ';

var myState = {};
var opponentState = {};
boardsState.push(myState);
boardsState.push(opponentState);
var ships = [];
for(var i=1;i <= 2; i++) {
    var s = {
        1: {
            "name": "Carrier",
            "num_of": 1,
            "placed": 0,
            "size": 5,
            "pos": { 0: [] }
        },
        2: {
            "name": "Battleship",
            "num_of": 2,
            "placed": 0,
            "size": 4,
            "pos": {
                0: [],
                1: []
            }
        },
        3: {
            "name": "Destroyer",
            "num_of": 3,
            "placed": 0,
            "size": 3,
            "pos": {
                0: [],
                1: [],
                2: []
            }
        },
        4: {
            "name": "Submarine",
            "num_of": 4,
            "size": 2,
            "placed": 0,
            "pos": {
                0: [],
                1: [],
                2: [],
                3: []
            }
        },
    };
    ships.push(s)
};


var c = 1;
for (var x = 1; x <= 10; x++) {
    for (var y = 1; y <= 10; y++) {
        k = "" + d * x + ":" + d * y;
        k2 = "" + d2 * x + ":" + d2 * y;
        boardsState[0][c] = {
            "d": k,
            "d2": k2,
            "is_taken": false,
            "is_hit": false,
            "is_blocked": false,
            "is_miss": false
        };
        c += 1;
    };
};
boardsState[1] = boardsState[0];

function getKeyByVal(val) {
    return Object.keys(boardsState[0]).find(key => Object.values(boardsState[0][key]).includes(val)); 
  }

function markBoard(key, board_num) {
    if(boardsState[board_num][key].is_taken) {
        boardsState[board_num][key].is_hit = true
    } else {
        boardsState[board_num][key].is_miss = true
    }
    drawMyBoard()
    drawOpponentBoard()
};

function switchOpponentReady() {
    if(!gameState.opponent_ready) {

        gameState.opponent_ready = true
    } 
    displayMsg("Opponent is ready!", "green", 0)
}


// NOT NEEDED ?
function isKeySmall(key) {
    // determines if key corresponds with small or large board
    var num = parseInt(key.split(":")[0]) / 2;
    var s = num.toString()
    var result = s[s.length -1];
    if(result === "5") {
        return true
    } else {
        return false
    };
};

function changeBoardSize() {
    if (d == 30 && d2 == 40) {
        d = 40;
        d2 = 30;
        boards[0].width = 500;
        boards[0].height = 500;
        boards[1].width = 400;
        boards[1].height = 400;
        //update_keys(0)
        cleanBoard(1);
        cleanBoard(2);
        drawMyBoard();
        drawOpponentBoard();
    } else {
        d = 30;
        d2 = 40;
        boards[0].width = 400;
        boards[0].height = 400;
        boards[1].width = 500;
        boards[1].height = 500;
        //update_keys(1)
        cleanBoard(1);
        cleanBoard(2);
        drawMyBoard();
        drawOpponentBoard();
    };
};

function getSurroundings(key) {
    x = parseInt(key.split(":")[0]);
    y = parseInt(key.split(":")[1]);

    a = [];
    other = [];
    // Check squares left, up, right, bottom. Shape: +
    key1 = "" + (x - d) + ":" + y;
    key2 = "" + x + ":" + (y - d);
    key3 = "" + (x + d) + ":" + y;
    key4 = "" + x + ":" + (y + d);

    // Check squares upper left, upper right, bottom right, bottom left. Shape: x
    key5 = "" + (x - d) + ":" + (y - d);
    key6 = "" + (x + d) + ":" + (y - d);
    key7 = "" + (x + d) + ":" + (y + d);
    key8 = "" + (x - d) + ":" + (y + d);
    
    a.push.apply(a, [key1, key2, key3, key4]);
    other.push.apply(other, [key5, key6, key7, key8]);
    adjacentFree = [];
    otherFree = [];

    for (var i = 0; i < a.length; i++) {
        var tempKey = getKeyByVal(a[i])
        if (boardsState[0].hasOwnProperty(tempKey) && !boardsState[0][tempKey].is_taken && !boardsState[0][tempKey].is_blocked) {
            adjacentFree.push(a[i])
        };

    }; for (var i = 0; i < other.length; i++) {
        var tempKey = getKeyByVal(other[i])
        if (boardsState[0].hasOwnProperty(tempKey) && !boardsState[0][tempKey].is_taken && !boardsState[0][tempKey].is_blocked) {
            otherFree.push(other[i])
        };

    };
    return [
        adjacentFree,
        otherFree
    ];

};

function autoPlace() {
    // Randomly places ships on the board
    resetBoard();

    for (var [key, value] of Object.entries(ships[0])) {

        for (var i = 0; i < ships[0][key].num_of; i++) {
            keysRem = [];
            for (var [k2, v2] of Object.entries(boardsState[0])) {
              
                if (!boardsState[0][k2].is_blocked && !boardsState[0][k2].is_taken)
                    keysRem.push(boardsState[0][k2].d);
            };

            var randomIdx = Math.floor(Math.random() * keysRem.length);

            var k = keysRem[randomIdx];
            var s = getSurroundings(k);
            adj = [];

            ctr = 0;
            // Check if enough space available around first square for the rest of ship
            while (s[0].length + s[1].length < ships[0][key].size) {

                randomIdx = Math.floor(Math.random() * keysRem.length);
                k = keysRem[randomIdx];
                s = getSurroundings(k);
                ctr++;
                if (ctr > 100) { // Restart if not enough empty squares available for ship
                    autoPlace();
                    return

                };
            };

            boardsState[0][getKeyByVal(k)].is_taken = true;
            taken.push(k)
            adj.push.apply(adj, s[0]);
            
            // Places the rest of ship squares
            for (var ii = 0; ii < ships[0][key].size - 1; ii++) {
                randomIdx = Math.floor(Math.random() * adj.length);
                k = adj.splice(randomIdx, 1)[0];
                s = getSurroundings(k);
                adj.push.apply(adj, s[0]);
                boardsState[0][getKeyByVal(k)].is_taken = true;
                taken.push(k);
            };
            updateBlocked();
        };

    };
    for (const [k2, value] of Object.entries(boardsState[0])) {
        
        boardsState[0][k2].is_blocked = false;
    };
    drawMyBoard();
    gameState.you_ready = true;
};

function displayMsg(msg, c = "green", d = 0) {
    //console.log(msg, c, d);
    if (d == 0) {
        var msgOut = document.getElementById("general-message");
        msgOut.innerHTML = msg;
        msgOut.style.color = c;
    } else {
        var msgOut = document.getElementById("game-message");
        msgOut.innerHTML = msg;
        msgOut.style.color = c;

    };

};
function cleanBoard(brdNum) {
    if(brdNum == 1) {
        if (ctx[0] != null && boards[0] != null) {
            ctx[0].clearRect(0, 0, boards[0].width, boards[0].height);
        };
    };
    if(brdNum == 2) {
        if (ctx[1] != null && boards[1] != null) {
            ctx[1].clearRect(0, 0, boards[1].width, boards[1].height);
        };
    };
    if(brdNum == 3) {
        if (infoCtx != null && infoCanvas != null) {
            infoCtx.clearRect(0, 0, infoCanvas.width, infoCanvas.height);
        };
    };
    
};

function resetBoard() {
    boardsState[0] = {};
    var c = 1;
    for (var x = 1; x <= 10; x++) {
        for (var y = 1; y <= 10; y++) {
            k = "" + d * x + ":" + d * y;
            k2 = "" + d2 * x + ":" + d2 * y;
            boardsState[0][c] = {
                "d": k,
                "d2": k2,
                "is_taken": false,
                "is_hit": false,
                "is_blocked": false,
                "is_miss": false
            };
            c += 1;
        };
    };
    shipSelected = 1;
    shipSquares = 0;
    shipNumOf = 0;
    gameState.you_ready = false;
    adjacent = [];
    taken = [];
    
    for (const [k, v] of Object.entries(ships[0])) {
        for (const [k2, v2] of Object.entries(ships[0][k].pos)) {
            ships[0][k].pos[k2] = [];
        };
    };
    cleanBoard(1);
    cleanBoard(3);
    drawMyBoard();
};


function getMousePos(canvas, evt) {
    var rec = canvas.getBoundingClientRect();
    return {
        x: evt.clientX - rec.left,
        y: evt.clientY - rec.top
    };
};

function initBoards() {
 
        var board = document.getElementById("board");
        var opponent_board = document.getElementById("opponent-board");
        var board_ctx = board.getContext("2d");
        var opponent_board_ctx = opponent_board.getContext("2d");

        boards.push(board);
        boards.push(opponent_board);
        ctx.push(board_ctx);
        ctx.push(opponent_board_ctx);
        drawMyBoard();
        drawOpponentBoard();
        
        if(!gameState.you_ready) {
          
            board.addEventListener('mousedown', function (evt) {
           
                var mousePos = getMousePos(board, evt);
              
                for (const [k, v] of Object.entries(boardsState[0])) {
                    tempKey = boardsState[0][k].d;
                    posInside = isInside(tempKey, mousePos.x, mousePos.y, d)
                    
                    if(posInside == true) {
                        if (boardsState[0][k].is_taken || boardsState[0][k].is_blocked) {
                           
                            displayMsg("Not available!", "red", 1);
                        } else {
                            displayMsg("", "red", 1);
                            x = parseInt(tempKey.split(":")[0]);
                            y = parseInt(tempKey.split(":")[1]);
    
                            if (adjacent.length == 0) {
            
                                boardsState[0][k].is_taken = true;
                                updateAdjacent(x, y);
                                taken.push(tempKey)
                                //ships[shipSelected].pos[shipNumOf].push(k);
                                shipSquares++;
                                displayInfo();
            
                            } else if (adjacent.includes(tempKey)) {
                                
                                boardsState[0][k].is_taken = true;
                                updateAdjacent(x, y);
                                taken.push(tempKey);
                                //ships[shipSelected].pos[shipNumOf].push(k);
                                shipSquares++;
                                displayInfo();
                          
                                if (shipSquares == ships[0][shipSelected].size) {
                                    shipSquares = 0;
                                    shipNumOf++;
                                    displayMsg("Ship finished", "green", 1);
                                    updateBlocked();
                                    displayInfo();
            
                                    if (shipNumOf == ships[0][shipSelected].num_of) {
                                        shipSelected++;
                                        shipNumOf = 0;
                                        displayInfo();
                                    };
            
                                };
                                if (shipSelected == 5) {
                                    //gameState.is_start = false;
                                    displayMsg("All ships placed!");
                                    for (const [k2, value] of Object.entries(boardsState[0])) {
                                        
                                        boardsState[0][k2].is_blocked = false;
                                    };
                                    gameState.you_ready = true;
            
                                };
            
                            } else {
                                displayMsg("Square is NOT adjacent!", "red", 1);
            
                            };
                        }; 
                        break;
                    };
                };
                drawMyBoard();
            });
        };
};

function displayInfo() {
    infoCanvas = document.getElementById("info-canvas");
    infoCtx = infoCanvas.getContext("2d");

    if (shipSelected > 0 && shipSelected < 5) {
        msg = `Place your ships. Current ship: ${ships[shipSelected].name} Squares: ${ships[shipSelected].size}`
        displayMsg(msg);

        infoCtx.clearRect(0, 0, infoCanvas.width, infoCanvas.height);

        for (var x = 1; x <= ships[shipSelected].size; x++) {

            infoCtx.beginPath()
            infoCtx.rect(d * x, 10, d, d);
            infoCtx.lineWidth = 2;
            infoCtx.strokeStyle = "#000000";
            infoCtx.stroke();
            infoCtx.closePath()
            if (x <= shipSquares) {
                infoCtx.fillStyle = "#3498DB";
                infoCtx.fill();

            };

        };
    } else {
        infoCtx.clearRect(0, 0, infoCanvas.width, infoCanvas.height);
    };
};

function playerReady() {
    // Sends 'player ready' state to opponent
    if (gameState.you_ready) {
        document.getElementById("btn-start").disabled = true;
        document.getElementById("btn-reset").disabled = true;
        document.getElementById("btn-random").disabled = true;
        document.getElementById("btn-ready").disabled = true;
        if(!gameState.opponent_ready) {
            displayMsg("Waiting for other player", "red", 0);
        } else {
            displayMsg("War has begun!", "green", 0);
        };
        
        // Send your board state and ready state. Then if other player ready state received, get his board state and redraw his board
        var msg = JSON.stringify({'msg_type': 'ready', 'board_state': JSON.stringify(boardsState[0]), 'ships': JSON.stringify(ships)});
        gameSock.send(msg)
        // TO DO add event after page reload as well
        boards[1].addEventListener('mousedown', function (evt) {
            var opponentName = getOpponentName();
            if (gameState.turn == 0) {
                var mousePos = getMousePos(boards[1], evt);
                for (const [k, v] of Object.entries(boardsState[1])) {
                    var tempKey = boardsState[1][k].d2
                    posInside = isInside(tempKey, mousePos.x, mousePos.y, d2)
                    
                    if(posInside == true) {
                        if (!boardsState[1][k].is_miss && !boardsState[1][k].is_hit) {
                            displayMsg(`Shooting at coords: ${tempKey}`, "green", 1 );
                            var msg = JSON.stringify({'msg_type': 'shot', 'key': k, 'opponent': opponentName[1]});
                            gameSock.send(msg)
                        } else {
                            displayMsg("Already Shot Here!", "red", 1);
                        };
                        break;
                    };
                };
            };
        });       

    } else {
        displayMsg("Place all ships first!", "red", 0);
    };
};

function updateAdjacent(x, y) {
    
    keys = [];
    // Check squares left, up, right, bottom
    key1 = "" + (x - d) + ":" + y;
    key2 = "" + x + ":" + (y - d);
    key3 = "" + (x + d) + ":" + y;
    key4 = "" + x + ":" + (y + d);

    keys.push.apply(keys, [key1, key2, key3, key4]);

    for (var i = 0; i < keys.length; i++) {
        var tempKey = getKeyByVal(keys[i]);
        if (boardsState[0].hasOwnProperty(tempKey) && !boardsState[0][tempKey].is_taken && !boardsState[0][tempKey].is_blocked) {
            adjacent.push(keys[i]);
        };

    };
    if (adjacent.length == 0) {
        adjacent.push('1'); // To make sure "if adjacent.length == 0" is not triggered again in draw_board fn 
    };

};

function updateBlocked() {

    for (var i = 0; i < taken.length; i++) {

        x = parseInt(taken[i].split(":")[0]);
        y = parseInt(taken[i].split(":")[1]);

        keys = [];
        // Check squares left, up, right, bottom. squares shape: +
        key1 = "" + (x - d) + ":" + y;
        key2 = "" + x + ":" + (y - d);
        key3 = "" + (x + d) + ":" + y;
        key4 = "" + x + ":" + (y + d);

        // Check squares upper left, upper right, bottom right, bottom left. squares shape: x
        key5 = "" + (x - d) + ":" + (y - d);
        key6 = "" + (x + d) + ":" + (y - d);
        key7 = "" + (x + d) + ":" + (y + d);
        key8 = "" + (x - d) + ":" + (y + d);

        keys.push.apply(keys, [key1, key2, key3, key4, key5, key6, key7, key8]);

        for (var ii = 0; ii < keys.length; ii++) {
            var tempKey = getKeyByVal(keys[ii])
            if (boardsState[0].hasOwnProperty(tempKey) && !boardsState[0][tempKey].is_taken && !boardsState[0][tempKey].is_blocked) {

                boardsState[0][tempKey].is_blocked = true;
            };

        };

    };
    taken = [];
    adjacent = [];

};

function isInside(key, posX, posY, dim) {
    // Determines if coordinates are inside a square
    x = parseInt(key.split(":")[0]);
    y = parseInt(key.split(":")[1]);
    
    if(posX >= x && posX <= x + dim && posY >= y && posY <= y + dim) {
        return true
    };
    return false
};

function drawMyBoard() {

    cleanBoard(1);

    ctx[0].beginPath();
    // Vertical Captions
    for (var y = 1; y <= 10; y++) {
        ctx[0].fillStyle = '#000000';
        ctx[0].font = "bold 16px sans-serif";
        ctx[0].testBaseLine = "bottom";
        ctx[0].fillText(y, 10, y * d + 24);
    };
    // Horizontal Captions
    for (var x = 1; x <= 10; x++) {
        ctx[0].fillStyle = '#000000';
        ctx[0].font = "bold 16px sans-serif";
        ctx[0].testBaseLine = "bottom";
        ctx[0].fillText(chars[x - 1], x * d + 10, 24);
    };
    ctx[0].closePath();


    for (var x = 1; x <= 10; x++) {
        for (var y = 1; y <= 10; y++) {
            ctx[0].beginPath()
            ctx[0].rect(d * x, d * y, d, d);

            ctx[0].lineWidth = 0;
            ctx[0].strokeStyle = '#a0a0a0';
            ctx[0].stroke();
            ctx[0].closePath()

            key = "" + d * x + ":" + d * y
            var tempKey = getKeyByVal(key);
            
            if (boardsState[0][tempKey].is_hit) {
                ctx[0].fillStyle = "#FF0000";
                ctx[0].fill();
                //boardsState[1][key].is_taken = false;
            } else if (boardsState[0][tempKey].is_miss) {
                ctx[0].fillStyle = "#000000";
                ctx[0].fill();
                //boardsState[1][key].is_taken = false;
            } else if (boardsState[0][tempKey].is_taken) {
                ctx[0].fillStyle = "#3498DB";
                ctx[0].fill();
            } else if (!gameState.you_ready && boardsState[0][tempKey].is_blocked) {
                ctx[0].fillStyle = "#FF0";
                ctx[0].fill();
            } else if (gameState.you_ready && !boardsState[0][tempKey].is_blocked) {
                ctx[0].clearRect(d * x, d * y, d, d);
                ctx[0].stroke();
            };
            
        };

    };

};

function drawOpponentBoard() {

    cleanBoard(2);

    ctx[1].beginPath();
    // Vertical Captions
    for (var y = 1; y <= 10; y++) {
        ctx[1].fillStyle = '#000000';
        ctx[1].font = "bold 16px sans-serif";
        ctx[1].testBaseLine = "bottom";
        ctx[1].fillText(y, 10, y * d2 + 24);
    };
    // Horizontal Captions
    for (var x = 1; x <= 10; x++) {
        ctx[1].fillStyle = '#000000';
        ctx[1].font = "bold 16px sans-serif";
        ctx[1].testBaseLine = "bottom";
        ctx[1].fillText(chars[x - 1], x * d2 + 10, 24);
    };
    ctx[1].closePath();


    for (var x = 1; x <= 10; x++) {
        for (var y = 1; y <= 10; y++) {
            ctx[1].beginPath()
            ctx[1].rect(d2 * x, d2 * y, d2, d2);

            ctx[1].lineWidth = 0;
            ctx[1].strokeStyle = '#a0a0a0';
            ctx[1].stroke();
            ctx[1].closePath();
            key = "" + d2 * x + ":" + d2 * y;
            var tempKey = getKeyByVal(key);
            if (boardsState[1][tempKey].is_hit) {
                ctx[1].fillStyle = "#FF0000";
                ctx[1].fill();
                //boardsState[1][key].is_taken = false;
            } else if (boardsState[1][tempKey].is_miss) {
                ctx[1].fillStyle = "#000000";
                ctx[1].fill();
                //boardsState[1][key].is_taken = false;
            };  
            
        };
    };
};
