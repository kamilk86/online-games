var board = null;
var ctx = null;
var worm = null;

function Test(a, b) {
    this.a = a;
    this.b = b;
    this.c = [1,2,3,4];

    this.logA = function() {
        console.log(this.a)
    }

    this.logC = function() {
        console.log(this.c.length)
    }
}

var test = new Test('a', 'b');
test.logC();

function Worm(stride, size, x1, y1, x2, y2, x3, y3) {

    this.stride = stride;
    this.x1 = x1;
    this.y1 = y1;
    this.x2 = x2;
    this.y2 = y2;
    this.x3 = x3;
    this.y3 = y3;
    this.size = size;
    this.directions = [1,2,3,4];

    this.updatePos = function() {
         this.x3 = this.x2;
        this.y3 = this.y2;
        this.x2 = this.x1;
        this.y2 = this.y1;
    }

    this.draw = function() {
        ctx.clearRect(0, 0, board.width, board.height);
        var coords = [[this.x1, this.y1], [this.x2, this.y2], [this.x3, this.y3]];
        for(var i = coords.length - 1; i >= 0; i--) {
            //console.log('circ no: ',i+1,' ',coords[i][0], ' ', coords[i][1]);
            ctx.beginPath();
            ctx.arc(coords[i][0], coords[i][1], this.size, 0, 2 * Math.PI);
            ctx.fillStyle = "brown";
            if(i == 0) {
                ctx.fillStyle = "black";
                //ctx.strokeStyle = "black"
                //ctx.lineWidth = 5;
                //ctx.stroke();
            } else {
                ctx.fillStyle = "brown";
            }
          
            ctx.fill()
            
        }     
    
    };

    this.move = function() {
        
        var dirIsFree = false;
        

        while(!dirIsFree) {
           
                var idx = Math.floor(Math.random() * this.directions.length);
                // up
                if(this.directions[idx] == 1 &&  this.y1 - 20 > 0) {
                    this.x3 = this.x2;
                    this.y3 = this.y2;
                    this.x2 = this.x1;
                    this.y2 = this.y1;
                    
                    this.y1 -= this.stride;
                    // Add to increase chance of going the same way in next move. Prevents jiggle
                    // Remove opposite direction to prevent going back in the next move
                    this.directions = [1, 1, 1, 1, 1, 3, 1, 4, 1, 1, 1, 1, 1, 1];
                    dirIsFree = true;
                     
                    // down
                } else if(this.directions[idx] == 2 &&  this.y1 + 20 < board.height) {
                    this.x3 = this.x2;
                    this.y3 = this.y2;
                    this.x2 = this.x1;
                    this.y2 = this.y1;
                   
                 this.y1 += this.stride;
                    this.directions = [2, 2, 2, 2, 2, 3, 2, 4, 2, 2, 2, 2, 2, 2];
                    dirIsFree = true;
                   
                    // left
                } else if(this.directions[idx] == 3 &&  this.x1 - 20 > 0) {
                    this.x3 = this.x2;
                    this.y3 = this.y2;
                    this.x2 = this.x1;
                    this.y2 = this.y1;
                 
                    this.x1 -= this.stride;
                    this.directions = [3, 3, 3, 3, 1, 2, 3, 3, 3, 3, 3, 3, 3, 3];
                    dirIsFree = true;
            
                    // right
                } else if(this.directions[idx] == 4 && this.x1 + 20 < board.width) {
                    this.x3 = this.x2;
                    this.y3 = this.y2;
                    this.x2 = this.x1;
                    this.y2 = this.y1;
                  
                    this.x1 += this.stride;
                    this.directions = [4, 4, 4, 4, 1, 2, 4, 4, 4, 4, 4, 4, 4, 4];
                    dirIsFree = true;
                   
                } else {
                    // Direction is wall. Remove it from pool so that next move is different way
                    var val = this.directions[idx];
                    this.directions = [1,2,3,4]; // reset array
                    var idxToRemove = this.directions.indexOf(val);
                    this.directions.splice(idxToRemove, 1);
                        
                    
                };
                touchPoints = [[this.x1, this.y1 - this.size], [this.x1 + this.size, this.y1], [this.x1, this.y1 + this.size], [this.x1 - this.size, this.y1]];
        };
        this.draw();
    };
        
};


function moveWorm() {
    worm.move()
    }

function initBoard() {

    board = document.getElementById("board");
    ctx = board.getContext("2d");
    /**
    ctx.beginPath();
    ctx.rect(0, 0, board.width, board.height);
    ctx.fillStyle = "LightGoldenRodYellow";
    ctx.fill()
    ctx.closePath();
    */
    worm = new Worm(20, 20, 150, 50, 100, 50, 50, 50);
    setInterval(moveWorm, 500);
    };



 


   