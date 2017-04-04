window.addEventListener("load", function() 
{
    var size = 32;//size of a tile
    //gets the canvas
    var canvas = document.getElementById("canvas");
    var ctx = canvas.getContext("2d");
    var frameRate = 1000/60;//frame rate to buffer
    //gets timer
    var timer = document.getElementById("timeLeft");
    timer.textContent = 200;

    //gets lives
    var lives = document.getElementById("livesLeft");
    lives.textContent = 2;

    //get score
    var score = document.getElementById("scoreTot");

    //loads the map
    var map = new Image();
    map.src = "Art/Map.png";
    map.xPos = 0;//x position of map
    map.yPos = 0;//y position of map
    map.onload = function()
    {
        ctx.drawImage(map, map.xPos, map.yPos, canvas.clientWidth, canvas.clientHeight, 
            0, 0, canvas.clientWidth, canvas.clientHeight);
    };

   
    function tickTimer()
    {
        if(parseInt(timer.textContent) > 0)
        {
            timer.textContent = parseInt(timer.textContent) - 1;
            setTimeout(function() { tickTimer();}, 1000);
        }
        else
        {
            //gameover
        }
    }

    var bomberman = new Image();
    bomberman.src = "Art/Bomberman.png";
    bomberman.xPos = 32;//position on board
    bomberman.yPos = 32;//position on board
    bomberman.curFrame = 0;
    bomberman.curDir = "right";
    bomberman.walkFrames = {
        up: [{x: 0, y: 1}, {x: 1, y: 1}, {x: 0, y: 1}, { x: 2, y: 1}],
        down: [{x: 0, y: 0}, {x: 1, y: 0},{x: 0, y: 0}, { x: 2, y: 0}],
        right: [{x: 3, y: 0}, {x: 4, y: 0}, {x: 3, y: 0}, { x: 5, y: 0}],
        left: [{x: 3, y: 1}, {x: 4, y: 1}, {x: 3, y: 1}, { x: 5, y: 1}]
    };

    bomberman.onload = function()
    {
        ctx.drawImage(bomberman, bomberman.walkFrames.right[bomberman.curFrame].x*size, bomberman.walkFrames.right[bomberman.curFrame].y*size,
            size, size, bomberman.xPos, bomberman.yPos, size, size);
    }

    setTimeout(function() { tickTimer();}, 1000);
    setTimeout(function(){buffer();}, frameRate);

    document.onkeydown = function(e)
    {
        switch(e.keyCode)
        {
            //up arrow
            case 38:	
                if(bomberman.curDir == "up")
                {
                    bomberman.curFrame = (bomberman.curFrame + 1) % bomberman.walkFrames.up.length;
                    bomberman.yPos -= size/bomberman.walkFrames.up.length;
                }
                else
                {
                    bomberman.curDir = "up";
                    bomberman.curFrame = 0;
                }
            break;
            
            //down arrow
            case 40:
                if(bomberman.curDir == "down")
                {
                    bomberman.curFrame = (bomberman.curFrame + 1) % bomberman.walkFrames.down.length;
                    bomberman.yPos += size/bomberman.walkFrames.down.length;
                }
                else
                {
                    bomberman.curDir = "down";
                    bomberman.curFrame = 0;
                }
                
            break;
            
            //left arrow
            case 37:
                if(bomberman.curDir == "left")
                {
                    bomberman.curFrame = (bomberman.curFrame + 1) % bomberman.walkFrames.left.length;
                    bomberman.xPos -= size/bomberman.walkFrames.left.length;
                }
                else
                {
                    bomberman.curDir = "left";
                    bomberman.curFrame = 0;
                }
            break;

            //right arrow
            case 39:
                if(bomberman.curDir == "right")
                {
                    bomberman.curFrame = (bomberman.curFrame + 1) % bomberman.walkFrames.right.length;
                    bomberman.xPos += size/bomberman.walkFrames.right.length;
                }
                else
                {
                    bomberman.curDir = "right";
                    bomberman.curFrame = 0;
                }
            break;				
        }			
    };

    
    //sets a buffer to redraw the background
    function buffer()
    {     
        ctx.clearRect(0,0,canvas.clientWidth, canvas.clientHeight);
        ctx.drawImage(map, map.xPos*size, map.yPos*size, canvas.clientWidth, canvas.clientHeight, 
            0, 0, canvas.clientWidth, canvas.clientHeight);
        
        var dir;
        switch(bomberman.curDir)
        {
            case "up":
                dir = bomberman.walkFrames.up;
            break;
            case "down":
                dir = bomberman.walkFrames.down;
            break;
            case "left":
                dir = bomberman.walkFrames.left;
            break;
            case "right":
                dir = bomberman.walkFrames.right;
            break;
        }

        ctx.drawImage(bomberman, dir[bomberman.curFrame].x*size, dir[bomberman.curFrame].y*size,
            size, size, bomberman.xPos, bomberman.yPos, size, size);
        setTimeout(function() {buffer();}, frameRate);
    }
});