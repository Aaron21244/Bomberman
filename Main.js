window.addEventListener("load", function() 
{
    var size = 32;//size of a tile

    //size of map width (in grids)
    var mapX = 31;
    //size of map height 
    var mapY = 13;

    var lastFire = new Date().getTime(); //used to slow down the keypresses
    
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

    //grids corresponding to the map
    var grids = new Array(mapX);

    //create array of arrays (2d array)
    for (var i = 0; i < mapX; i++) {
        grids[i] = new Array(mapY);
    }

    //grid class
    var Grid = function(walkable,x,y)
    {
        this.walkable = walkable;
        this.x = x;
        this.y = y;
    }
    //initialize the grids to match the map
    for(let i = 0; i < mapX; i++)
    {
        for(let j = 0; j < mapY; j++)
        {
            if(j == 0 || j == mapY-1 || i == 0 || i == mapX-1)
                grids[i][j] = new Grid(false,i,j);
            else if (i % 2 == 0)
            {
                if(j % 2 == 0)
                    grids[i][j] = new Grid(false,i,j);
                else
                    grids[i][j] = new Grid(true,i,j);
            }
            else
                grids[i][j] = new Grid(true,i,j);
            
        }
    }
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
    bomberman.curGrid = grids[1][1];

    bomberman.onload = function()
    {
        ctx.drawImage(bomberman, bomberman.walkFrames.right[bomberman.curFrame].x*size, bomberman.walkFrames.right[bomberman.curFrame].y*size,
            size, size, bomberman.xPos, bomberman.yPos, size, size);
    }

    setTimeout(function() { tickTimer();}, 1000);
    setTimeout(function(){buffer();}, frameRate);

    document.onkeydown = function(e)
    {
        //ignore button presses that occur within 50 ms
        var curFire = new Date().getTime();
        if(curFire - lastFire < 50)
        {
            return;
        }
        lastFire = curFire;

        switch(e.keyCode)
        {
            //up arrow
            case 38:	
                if(bomberman.curDir == "up")
                {
                    bomberman.curFrame = (bomberman.curFrame + 1) % bomberman.walkFrames.up.length;
                    bomberman.yPos -= size/bomberman.walkFrames.up.length;
                    //if bomberman left the current grid
                    if(bomberman.curGrid.y * size > bomberman.yPos)
                    {
                        //if the grid moved to is walkable, set curGrid 
                        if(grids[bomberman.curGrid.x][bomberman.curGrid.y-1].walkable && bomberman.xPos % size == 0)
                            bomberman.curGrid = grids[bomberman.curGrid.x][bomberman.curGrid.y-1];
                        //else undo the move
                        else
                            bomberman.yPos += size/bomberman.walkFrames.up.length;
                    }

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
                    //if bomberman left the current grid
                    if(bomberman.curGrid.y * size < bomberman.yPos)
                    {
                        //if the grid moved to is walkable, set curGrid 
                        if(grids[bomberman.curGrid.x][bomberman.curGrid.y+1].walkable && bomberman.xPos % size == 0 )
                            bomberman.curGrid = grids[bomberman.curGrid.x][bomberman.curGrid.y+1];
                        //else undo the move
                        else
                            bomberman.yPos -= size/bomberman.walkFrames.up.length;
                    }
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
                    //if bomberman left the current grid
                    if(bomberman.curGrid.x * size > bomberman.xPos)
                    {
                        //if the grid moved to is walkable, set curGrid 
                        if(grids[bomberman.curGrid.x-1][bomberman.curGrid.y].walkable && bomberman.yPos % size == 0)
                            bomberman.curGrid = grids[bomberman.curGrid.x-1][bomberman.curGrid.y];
                        //else undo the move
                        else
                            bomberman.xPos += size/bomberman.walkFrames.left.length;
                    }
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
                    //if bomberman left the current grid
                    if(bomberman.curGrid.x * size < bomberman.xPos)
                    {
                        //if the grid moved to is walkable, set curGrid 
                        if(grids[bomberman.curGrid.x+1][bomberman.curGrid.y].walkable && bomberman.yPos % size == 0)
                            bomberman.curGrid = grids[bomberman.curGrid.x+1][bomberman.curGrid.y];
                        //else undo the move
                        else
                            bomberman.xPos -= size/bomberman.walkFrames.left.length;
                        
                    }
                }
                else
                {
                    bomberman.curDir = "right";
                    bomberman.curFrame = 0;
                }
            break;				
        }

        //move map accordingly
        //dont scroll if less than 1/4 of the map
        if(bomberman.curGrid.x < mapX / 4 )
            map.xPos = 0;
        //dont scroll past the right end of the map
        else if(bomberman.xPos > map.width - canvas.clientWidth)
            map.xPos = (map.width - canvas.clientWidth) / size;
        else
            map.xPos = bomberman.xPos/size - 1;
            
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
        //modified to take maps position in account
        ctx.drawImage(bomberman, dir[bomberman.curFrame].x*size, dir[bomberman.curFrame].y*size,
            size, size, bomberman.xPos - map.xPos*size, bomberman.yPos - map.yPos*size, size, size);
        setTimeout(function() {buffer();}, frameRate);
    }
});