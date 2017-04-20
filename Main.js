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
    var Grid = function(walkable,x,y,hasBlock)
    {   
        this.walkable = walkable;
        this.x = x;
        this.y = y;
        this.hasBlock = hasBlock;
    }
    //initialize the grids to match the map
    for(let i = 0; i < mapX; i++)
    {
        for(let j = 0; j < mapY; j++)
        {
            if(j == 0 || j == mapY-1 || i == 0 || i == mapX-1)
                grids[i][j] = new Grid(false,i,j,false);
            else if (i % 2 == 0)
            {
                if(j % 2 == 0)
                    grids[i][j] = new Grid(false,i,j,false);
                else
                    grids[i][j] = new Grid(true,i,j,false);
            }
            else
                grids[i][j] = new Grid(true,i,j,false);
            
        }
    }
    

    //Place soft blocks down around the map
    var softBlocks = [];
    var softBlock = function(x, y)
    {
        this.img = new Image();
        this.img.src = "Art/Brick.png";
        this.xPos = x;
        this.yPos = y;
    }
    
    //Number of Blocks to placedown onto the map
    var numBlocks = 35;

    //Call setSoftBlocks function
    setSoftBlocks(numBlocks); 
    //Takes the number of softBlocks to be placed on the map randomly
    function setSoftBlocks(numSB) 
    {   
        //Min zone around the player to place blocks
        var min = 1;
        //Buffer zone around the player(Cord 1,1 for now, THIS DOESNT TAKE INTO ACCOUNT PLYER STRT POS CHANGE) in a square formation
        var bufZone = 2;
        for (let i = 0; i < numSB; i++)
        {
            //Obtain random x and y cords to place the soft block
            var xCord = getRandomIntInclusive(min, mapX-1);
            var yCord = getRandomIntInclusive(min, mapY-1);
            
            //Check for a n-block bufferzone around the player
            while (xCord <= bufZone && yCord <= bufZone)
            {
                //Generate a ran int to decide which cord to change
                //This is done for a truly unique block placement
                var rNum = getRandomIntInclusive(1, 2);
                if (rNum == 1) 
                {
                    xCord = getRandomIntInclusive(min, mapX-1);
                }
                else 
                {
                    yCord = getRandomIntInclusive(min, mapY-1);
                }
            }

            //Check if the block isnt walkable before placing
            while (grids[xCord][yCord].walkable == false) {
                //Generate new cords and test again
                xCord = getRandomIntInclusive(min, mapX-1);
                yCord = getRandomIntInclusive(min, mapY-1);

                //Check for a n-block bufferzone around the player
                while (xCord <= bufZone && yCord <= bufZone)
                {
                    //Generate a ran int to decide which cord to change
                    //This is done for a truly unique block placement
                    var rNum = getRandomIntInclusive(1, 2);
                    if (rNum == 1) 
                    {
                        xCord = getRandomIntInclusive(min, mapX-1);
                    }
                    else 
                    {
                        yCord = getRandomIntInclusive(min, mapY-1);
                    }
                }
            }
            
            //Add the new block to the array
            softBlocks[i] = new softBlock(xCord*size, yCord*size);
            
            //Set the grid cord the block is being placed into a non-walkable state
            grids[xCord][yCord].walkable = false;
        }
    };

    //Returns a random number between the passed values
    function getRandomIntInclusive(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    //Holds the current blocks that need exploded
    var blocksToBlow = [];
    //Class struct holds the blocks cords
    var blockToBlow = function(x, y)
    {
        this.xPos = x;
        this.yPos = y;
    };

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

    var bombs = [];//array of bombs
    bombs.numBombs = 1;//number of bombs allowed
    bombs.activeBombs = 0;
    bombs.maxBombs = 10;//maximum number of bombs
    var bomb = new Image();//image for bombs
    bomb.src = "Art/Bomb.png";//image for bombs
    bombs.animationFrames = [0,1,0,2];//animation frames
    for(i = 0; i < bombs.maxBombs; i++)
    {
        bombs[i] = {};
        bombs[i].curFrame = 0;//current frame in animation cycle
        bombs[i].cFrame = 0;//current frame up to frames length
        bombs[i].xPos = 0;
        bombs[i].yPos = 0;
        bombs[i].isActive = false;
    }
    bombs.timer = 3000;//time for bomb to explode
    bombs.numFrames = 8;//number of frames before bomb explodes
    var explosions = [];//array of explosions
    explosions.activeExp = 0;
    var explosion = new Image();
    explosion.src = "Art/Explosion.png";
    explosions.range = 2;//range of explosions
    explosions.animationFrames = [0,1,2,3,3,2,1,0];//animation frames for explosions
    explosions.timer = 500;//time to explode
    
    

    bomberman.onload = function()
    {
        ctx.drawImage(bomberman, bomberman.walkFrames.right[bomberman.curFrame].x*size, bomberman.walkFrames.right[bomberman.curFrame].y*size,
            size, size, bomberman.xPos, bomberman.yPos, size, size);
    }

    setTimeout(function() { tickTimer();}, 1000);
    setTimeout(function(){buffer();}, frameRate);

    //seperate event listener for bomb drops
    document.addEventListener("keydown", function(e){
        if(e.keyCode == 32)
            if(bombs.activeBombs < bombs.numBombs)
            {
                var t = -1;
                //if a bomb is available
                for(i = 0; i < bombs.length; i++)
                {
                    if(!bombs[i].isActive)
                    {
                        t = i;
                        break;
                    }
                }
                if(t != -1)
                {
                    bombs.activeBombs++;
                    bombs[t].curFrame = 0;//current frame in animation cycle
                    bombs[t].cFrame = 0;//current frame up to frames length
                    bombs[t].xPos = bomberman.curGrid.x * size;
                    bombs[t].yPos = bomberman.curGrid.y * size;
                    bombs[t].isActive = true;
                    setTimeout(function(){ animateBomb(t);}, bombs.timer/ bombs.numFrames);
                }
            }
    });

    document.onkeydown = function(e)
    {
        //ignore button presses that occur within 40 ms
        var curFire = new Date().getTime();
        if(curFire - lastFire < 40)
        {
            return;
        }
        lastFire = curFire;
        //console.log(bomberman.curGrid.x + " " + bomberman.curGrid.y);
        switch(e.keyCode)
        {
            //up arrow
            case 38:	
                if(bomberman.curDir == "up")
                {
                    bomberman.curFrame = (bomberman.curFrame + 1) % bomberman.walkFrames.up.length;
                    bomberman.yPos -= size/bomberman.walkFrames.up.length;
                    //if bomberman left the current grid
                    if(bomberman.curGrid.y * size>= bomberman.yPos + size/2)
                    {
                        //if the grid moved to is walkable, set curGrid 
                        if(grids[bomberman.curGrid.x][bomberman.curGrid.y-1].walkable)
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
                    if(bomberman.curGrid.y * size + size <= bomberman.yPos + size/2 + size/3)
                    {
                        //if the grid moved to is walkable, set curGrid 
                        if(grids[bomberman.curGrid.x][bomberman.curGrid.y+1].walkable)
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
                    if(bomberman.curGrid.x * size >= bomberman.xPos + size/2)
                    {
                        //if the grid moved to is walkable, set curGrid 
                        if(grids[bomberman.curGrid.x-1][bomberman.curGrid.y].walkable)
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
                    if(bomberman.curGrid.x * size + size <= bomberman.xPos + size/2)
                    {
                        //if the grid moved to is walkable, set curGrid 
                        if(grids[bomberman.curGrid.x+1][bomberman.curGrid.y].walkable)
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
        //gets previously map position
        var prevPos = map.xPos;
        map.xPos = bomberman.xPos/size - canvas.clientWidth / size / 2 + 1;
        //don't go past the left end of the map
        if(map.xPos < 0)
            map.xPos = 0;
        //don't go past the right end of the map
        else if (map.xPos+canvas.clientWidth/size > mapX)
            map.xPos = mapX - canvas.clientWidth/size;
            
    };
       

    //function for setting timers to animate bombs
    function animateBomb(i)
    {
        if(bombs[i].isActive)
        {
            if(bombs[i].cFrame < bombs.numFrames)
            {
                bombs[i].curFrame = (bombs[i].curFrame+1) % bombs.animationFrames.length;
                bombs[i].cFrame++;
                setTimeout(function(){ animateBomb(i);}, bombs.timer/bombs.numFrames);
            }
            else
            {
                bombs.activeBombs--;
                bombs[i].isActive = false;
                //explode
                //adds an image for each direction
                explosions[explosions.activeExp] = {};
                explosions[explosions.activeExp].mid = {xPos: bombs[i].xPos,
                    yPos: bombs[i].yPos, animPos: 0};
                explosions[explosions.activeExp].left = [];
                explosions[explosions.activeExp].up = [];
                explosions[explosions.activeExp].right = [];
                explosions[explosions.activeExp].down = [];
                //if the range is greater than 2, add a new image for each direction
                if(explosions.range > 1)
                { 
                    var lblock, rblock, ublock, dblock = false;
                    for(j = 0; j < explosions.range; j++)
                    {
                        if(!lblock)
                        {
                            if((grids[(bombs[i].xPos-(size*(j+1)))/size][(bombs[i].yPos)/size].walkable))
                                explosions[explosions.activeExp].left[j] = {xPos: bombs[i].xPos-(size*(j+1)),
                                    yPos: bombs[i].yPos, animPos: 6};
                            else
                                lblock = true;
                        }
                        if(!ublock)
                        {
                            if(grids[(bombs[i].xPos)/size][(bombs[i].yPos-(size*(j+1)))/size].walkable)
                                explosions[explosions.activeExp].up[j] = {xPos: bombs[i].xPos,
                                    yPos: bombs[i].yPos-(size*(j+1)), animPos: 5};
                            else
                                ublock = true;
                        }
                        if(!rblock)
                        {
                            if(grids[(bombs[i].xPos+(size*(j+1)))/size][(bombs[i].yPos)/size].walkable)
                                explosions[explosions.activeExp].right[j] = {xPos: bombs[i].xPos+(size*(j+1)),
                                    yPos: bombs[i].yPos, animPos: 6};
                            else
                                rblock = true;
                        }
                        if(!dblock)
                        {
                            if(grids[(bombs[i].xPos)/size][(bombs[i].yPos+(size*(j+1)))/size].walkable)
                                explosions[explosions.activeExp].down[j] = {xPos: bombs[i].xPos,
                                    yPos: bombs[i].yPos+(size*(j+1)), animPos: 5};
                            else
                                dblock = true;
                                
                        }
                    }
                }
                if(grids[(bombs[i].xPos-size)/size][(bombs[i].yPos)/size].walkable)
                {
                    explosions[explosions.activeExp].left[explosions[explosions.activeExp].left.length] = 
                        {xPos: bombs[i].xPos-size, yPos: bombs[i].yPos, animPos: 1};
                }
                if(grids[(bombs[i].xPos)/size][(bombs[i].yPos-size)/size].walkable)
                {
                    explosions[explosions.activeExp].up[explosions[explosions.activeExp].up.length] = 
                        {xPos: bombs[i].xPos, yPos: bombs[i].yPos-size, animPos: 2};
                }
                if(grids[(bombs[i].xPos+size)/size][(bombs[i].yPos)/size].walkable)
                {
                    explosions[explosions.activeExp].right[explosions[explosions.activeExp].right.length] = 
                        {xPos: bombs[i].xPos+size, yPos: bombs[i].yPos, animPos: 3};
                }
                if(grids[(bombs[i].xPos)/size][(bombs[i].yPos+size)/size].walkable)
                {
                    explosions[explosions.activeExp].down[explosions[explosions.activeExp].down.length] =
                        {xPos: bombs[i].xPos, yPos: bombs[i].yPos+size, animPos: 4};
                }
                explosions[explosions.activeExp].curFrame = 0;
                explosions[explosions.activeExp].isActive = true;
                var j = explosions.activeExp;
                explosions.activeExp++;
                setTimeout(function(){ animateexplosion(j);}, explosions.timer/explosions.animationFrames.length);
            }
        }       
    }

    //for animating explosions
    function animateexplosion(i)
    {
        if(explosions[i].curFrame < explosions.animationFrames.length)
        {
            explosions[i].curFrame++;
            setTimeout(function(){ animateexplosion(i);}, explosions.timer/explosions.animationFrames.length);
        }
        else
        {
            explosions[i].isActive = false;
            explosions.activeExp--;
        }
    }
    
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

        //minused bomb and explosions xPos by the camera position (map.xPos*size) to get the actual pos of the object
        //on the map
        for(i = 0; i < bombs.length; i++)
            if(bombs[i].isActive)

                ctx.drawImage(bomb, bombs.animationFrames[bombs[i].curFrame]*size, 0, size, size, bombs[i].xPos - map.xPos*size, bombs[i].yPos - map.yPos*size, size, size);
        for(i = 0; i < explosions.length; i++)
            if(explosions[i].isActive)
            {
                ctx.drawImage(explosion, explosions[i].mid.animPos*size, explosions.animationFrames[explosions[i].curFrame]*size, 
                    size, size, explosions[i].mid.xPos - map.xPos*size , explosions[i].mid.yPos - map.yPos*size, size, size);
                for(j = 0; j < explosions.range; j++)
                {
                    if(explosions[i].left[j])
                        ctx.drawImage(explosion, explosions[i].left[j].animPos*size, explosions.animationFrames[explosions[i].curFrame]*size, 
                            size, size, explosions[i].left[j].xPos - map.xPos*size, explosions[i].left[j].yPos - map.yPos*size, size, size);
                    if(explosions[i].up[j])
                        ctx.drawImage(explosion, explosions[i].up[j].animPos*size, explosions.animationFrames[explosions[i].curFrame]*size, 
                            size, size, explosions[i].up[j].xPos - map.xPos*size, explosions[i].up[j].yPos - map.yPos*size, size, size);
                    if(explosions[i].right[j])
                        ctx.drawImage(explosion, explosions[i].right[j].animPos*size, explosions.animationFrames[explosions[i].curFrame]*size, 
                            size, size, explosions[i].right[j].xPos - map.xPos*size, explosions[i].right[j].yPos - map.yPos*size, size, size);
                    if(explosions[i].down[j])
                        ctx.drawImage(explosion, explosions[i].down[j].animPos*size, explosions.animationFrames[explosions[i].curFrame]*size, 
                            size, size, explosions[i].down[j].xPos - map.xPos*size, explosions[i].down[j].yPos - map.yPos*size, size, size);

                }
            }

        //Drawing of soft blocks
        for (let i = 0; i < softBlocks.length; i++) {
            ctx.drawImage(softBlocks[i].img, 0, 0, size, size,
             softBlocks[i].xPos- map.xPos*size, softBlocks[i].yPos - map.yPos*size, size, size);
        }

        
        //modified to take maps position in account
        ctx.drawImage(bomberman, dir[bomberman.curFrame].x*size, dir[bomberman.curFrame].y*size,
            size, size, bomberman.xPos - map.xPos*size, bomberman.yPos - map.yPos*size, size, size);
        setTimeout(function() {buffer();}, frameRate);
    }
});