var board = null;
var ctx = null;
var x = 0;
var y = 0;
var dx = 1;
var dy = 1;
var radius = 20;
var interval = 50;
var old_x = null;
var old_y = null;

// WORM
var x2 = 900;
var y2 = 500;
var old_x2 = 900;
var old_y2 = 500;
var touchPoints = [[x2, y2-radius], [x2 + radius, y2], [x2, y2 + radius], [x2 - radius, y2] ]; // If one of points in player circle then game over

var up = false;
var down = false;
var left = false;
var right = false;
var playerStride = 2;
var directions = [1,2,3,4];

document.addEventListener('keydown',  function(event) {
    var x = event.which || event.keyCode;
    // W
    if(x == 87) {
        up = true;
    
    // S
    } else if(x == 83) {
        down = true;

    // A
    } else if(x == 65) {
        left = true;
    
    // D
    } else if(x == 68) {
        right = true;
    }
  })

  document.addEventListener('keyup',  function(event) {
    up = false;
    down = false;
    left = false;
    right = false;
  })




function initBoard() {

    board = document.getElementById("board");

    ctx = board.getContext("2d");
    ctx.beginPath();
    ctx.rect(0, 0, board.width, board.height);
    ctx.fillStyle = "brown";
    ctx.fill()
    ctx.closePath();

};

function clearCircle() {
    ctx.save();
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(old_x, old_y, radius, 0, 2 * Math.PI);
    ctx.fill();
    ctx.restore();
};

function drawCircle() {
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, 2 * Math.PI);
    ctx.fillStyle = "blue";
    ctx.strokeStyle = "black"
    ctx.lineWidth = 2;
    ctx.fill()
    ctx.stroke();
   
    for(var i=0; i < touchPoints.length; i++) {
        if(ctx.isPointInPath(touchPoints[i][0], touchPoints[i][1])) {
            console.log("Game Over");
        }
    }
    
};

function colorPreviousCircle() {
    ctx.beginPath();
    ctx.arc(old_x, old_y, radius, 0, 2 * Math.PI);
    ctx.fillStyle = "black";
    ctx.fill()
    //ctx.closePath();
};

function draw() {
    old_y = y;
    old_x = x;
    if(up) {
        y -= playerStride;
    } else if(down) {
        y += playerStride;
    } else if(left) {
        x -= playerStride;
    } else if(right) {
        x += playerStride;
    }
    colorPreviousCircle();
    drawCircle();
};

setInterval(draw, interval);



function drawWormCircle() {
    ctx.beginPath();
    ctx.arc(x2, y2, radius, 0, 2 * Math.PI);
    ctx.fillStyle = "red";
    ctx.strokeStyle = "black"
    ctx.lineWidth = 2;
    ctx.fill()
    ctx.stroke();
    
};

function colorPreviousWormCircle() {
    ctx.beginPath();
    ctx.arc(old_x2, old_y2, radius, 0, 2 * Math.PI);
    ctx.fillStyle = "black";
    ctx.fill()
    //ctx.closePath();
};

function moveWorm() {
    
    var dirIsFree = false;
    while(!dirIsFree) {
        var idx = Math.floor(Math.random() * directions.length);
        // up
        if(directions[idx] == 1 &&  y2 - 20 > 0) {
            //directions = [1,2,3,4];
            old_x2 = x2;
            old_y2 = y2;
            y2 -= 2;
            // Add to increase chance of going the same way in next move. Prevents jiggle
            // Remove opposite direction to prevent going back in the next move
            directions = [1, 1, 1, 1, 1, 3, 1, 4, 1, 1, 1, 1, 1, 1];
            dirIsFree = true;
             
            // down
        } else if(directions[idx] == 2 &&  y2 + 20 < board.height) {
            //directions = [1,2,3,4];
            old_x2 = x2;
            old_y2 = y2;
            y2 += 2;
            directions = [2, 2, 2, 2, 2, 3, 2, 4, 2, 2, 2, 2, 2, 2];
            dirIsFree = true;
           
            // left
        } else if(directions[idx] == 3 &&  x2 - 20 > 0) {
            //directions = [1,2,3,4];
            old_x2 = x2;
            old_y2 = y2;
            x2 -= 2;
            directions = [3, 3, 3, 3, 1, 2, 3, 3, 3, 3, 3, 3, 3, 3];
            dirIsFree = true;
    
            // right
        } else if(directions[idx] == 4 && x2 + 20 < board.width) {
           // directions = [1,2,3,4];
            old_x2 = x2;
            old_y2 = y2;
            x2 += 2;
            directions = [4, 4, 4, 4, 1, 2, 4, 4, 4, 4, 4, 4, 4, 4];
            dirIsFree = true;
           
        } else {
            // Direction is wall. Remove it from pool so that next move is different way
            var val = directions[idx];
            directions = [1,2,3,4]; // reset array
            var idxToRemove = directions.indexOf(val);
            directions.splice(idxToRemove, 1);
                
            
        }
        touchPoints = [[x2, y2 - radius], [x2 + radius, y2], [x2, y2 + radius], [x2 - radius, y2]];
    }
}

function drawWorm() {
    moveWorm();
    colorPreviousWormCircle();
    drawWormCircle();
}

setInterval(drawWorm, 25);
