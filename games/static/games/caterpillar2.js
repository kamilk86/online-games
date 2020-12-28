var board = null;
var ctx = null;
var worm = null;
var intervalId = null;


function Worm(stride, thickness, length, feedLevel) {
    // to do make stride hardcoded, as it stretches the worm
    this.stride = stride;

    this.thickness = thickness;
    this.length = length;
    this.SegmentsCoords = {}
    for (var i = 1; i <= this.length; i++) {
        this.SegmentsCoords[i] = [i * this.stride, 150]
    }
    this.prevCoords = [];
    this.segmentNum = 1;
    this.strideNum = 1;
    this.directions = [1, 2, 3, 4];
    this.direction = null;
    this.feedLevel = feedLevel;
    this.maxFeedLevel = 500;

    this.getState = function () {
        return [this.stride, this.thickness, this.length, this.feedLevel, this.SegmentsCoords]
    }

    this.updateFeedLevel = function() {

        var bar = document.getElementById("bar-feed-level");
       
        //var barWrapper = document.getElementById("bar-feed-level-wrapper");
        var percent = this.feedLevel / this.maxFeedLevel * 100;
        if(percent > 99) {
            bar.style.background = "#4CAF50";
            bar.style.color = "white"
        }
        else if(percent == 70) {
            bar.style.background = "yellow";
            bar.style.color = "black"
        } else if(percent == 35){
            bar.style.background = "red";
            bar.style.color = "white"
        }
        bar.style.width = percent + "%";
        bar.innerHTML = (percent | 0) + "%";
        //barWrapper.innerText = (percent | 0) + "%";
    }

    this.draw = function () {
        ctx.clearRect(0, 0, board.width, board.height);
        ctx.beginPath();
        ctx.rect(0,0, board.width, 100);
        ctx.fillStyle = "SaddleBrown";
        ctx.fill();
        ctx.closePath();


        for (var i = this.length; i > 0; i--) {
            ctx.beginPath();
            ctx.arc(this.SegmentsCoords[i][0], this.SegmentsCoords[i][1], this.thickness, 0, 2 * Math.PI);
            if (i == 1) {
                ctx.fillStyle = "black";
                //ctx.strokeStyle = "black"
                //ctx.lineWidth = 5;
                //ctx.stroke();
            } else {
                ctx.fillStyle = "DarkGreen";
            }

            ctx.fill()

        }

    };

    this.pickDirection = function () {

        while (true) {

            var idx = Math.floor(Math.random() * this.directions.length);
            // up
            if (this.directions[idx] == 1 && this.SegmentsCoords[1][1] - this.thickness > 120 && this.SegmentsCoords[1][1] - (this.stride - 1) != this.SegmentsCoords[2][1]) {
                // Add to increase chance of going the same way in next move. Prevents jiggle
                // Remove opposite direction to prevent going back in the next move
                this.directions = [1, 1, 1, 1, 1, 3, 1, 4, 1, 1, 1, 1, 1, 1];

                return 1;

                // down
            } else if (this.directions[idx] == 2 && this.SegmentsCoords[1][1] + this.thickness < board.height && this.SegmentsCoords[1][1] + (this.stride - 1) != this.SegmentsCoords[2][1]) {

                this.directions = [2, 2, 2, 2, 2, 3, 2, 4, 2, 2, 2, 2, 2, 2];
                
                return 2

                // left
            } else if (this.directions[idx] == 3 && this.SegmentsCoords[1][0] - this.thickness > 0 && this.SegmentsCoords[1][0] - (this.stride - 1) != this.SegmentsCoords[2][0]) {

                this.directions = [3, 3, 3, 3, 1, 2, 3, 3, 3, 3, 3, 3, 3, 3];
                return 3

                // right
            } else if (this.directions[idx] == 4 && this.SegmentsCoords[1][0] + this.thickness < board.width && this.SegmentsCoords[1][0] + (this.stride - 1) != this.SegmentsCoords[2][0]) {

                this.directions = [4, 4, 4, 4, 1, 2, 4, 4, 4, 4, 4, 4, 4, 4];
                return 4

            } else {
                // Direction is wall. Remove it from pool so that next move is different way
                var val = this.directions[idx];
                this.directions = [1, 2, 3, 4]; // reset array
                var idxToRemove = this.directions.indexOf(val);
                this.directions.splice(idxToRemove, 1);
            };

        };
    };
    this.move = function () {

        if (this.segmentNum == 1) {

            if (this.strideNum == 1) {
                this.feedLevel -= 1;
                this.updateFeedLevel();
                this.prevCoords[0] = [this.SegmentsCoords[this.segmentNum][0], this.SegmentsCoords[this.segmentNum][1]];
                this.direction = this.pickDirection();
            }

            if (this.direction == 1) {
                this.SegmentsCoords[this.segmentNum][1] -= 1;
            } else if (this.direction == 2) {
                this.SegmentsCoords[this.segmentNum][1] += 1;
            } else if (this.direction == 3) {
                this.SegmentsCoords[this.segmentNum][0] -= 1
            } else if (this.direction == 4) {
                this.SegmentsCoords[this.segmentNum][0] += 1;
            }
            this.draw()
            this.strideNum += 1;
            if (this.strideNum == this.stride) {
                this.segmentNum += 1;
                this.strideNum = 1;
            }
            //touchPoints = [[this.x1, this.y1 - this.size], [this.x1 + this.size, this.y1], [this.x1, this.y1 + this.size], [this.x1 - this.size, this.y1]];

        } else {
            if (this.segmentNum % 2 == 0) {
                var idx = 0;
                var idx2 = 1;
            } else {
                var idx = 1;
                var idx2 = 0;
            }
            // Save current position
            if (this.strideNum == 1) {
                this.prevCoords[idx2] = [this.SegmentsCoords[this.segmentNum][0], this.SegmentsCoords[this.segmentNum][1]]
            }
            // Move to previous segment position
            if (this.SegmentsCoords[this.segmentNum][0] != this.prevCoords[idx][0]) {
                if (this.SegmentsCoords[this.segmentNum][0] < this.prevCoords[idx][0]) {
                    this.SegmentsCoords[this.segmentNum][0] += 1;

                } else {
                    this.SegmentsCoords[this.segmentNum][0] -= 1;
                }
            } else if (this.SegmentsCoords[this.segmentNum][1] != this.prevCoords[idx][1]) {
                if (this.SegmentsCoords[this.segmentNum][1] < this.prevCoords[idx][1]) {
                    this.SegmentsCoords[this.segmentNum][1] += 1;

                } else {
                    this.SegmentsCoords[this.segmentNum][1] -= 1;

                }
            }
            this.strideNum += 1;
            this.draw();
            if (this.strideNum == this.stride) {
                if (this.segmentNum == this.length) {
                    this.segmentNum = 1;
                } else {
                    this.segmentNum += 1;
                }
                this.strideNum = 1;
            }

        }

    }

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
   
};

function startGame() {
    if(intervalId) {
        clearInterval(intervalId);
    }
    var speed = document.getElementById("speed").value;
    var length = document.getElementById("length").value;
    var thickness = document.getElementById("thickness").value;

    worm = new Worm(20, parseInt(thickness), parseInt(length), 500);
    intervalId = setInterval(moveWorm, parseInt(speed));
}






