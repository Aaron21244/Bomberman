window.addEventListener("load", function() 
{
    var size = 32;//size of a tile

    //size of map width (in grids)
    var mapX = 31;
    //size of map height 
    var mapY = 13;

    var deathTime;//used to animate death of bomberman 
    
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
	
	var gameOver = false;
    var finishScreen = false;
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


    function startGame(level)
    {
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

        var bomberman = new Image();
        bomberman.src = "Art/Bomberman.png";
        bomberman.xPos = 32;//position on board
        bomberman.yPos = 32;//position on board
        bomberman.curFrame = 0;
        bomberman.curDir = "right";
        bomberman.lastMove = 0; //used to time movements
        bomberman.still = true; //standing still
        bomberman.walkFrames = {
            up: [{x: 0, y: 1}, {x: 1, y: 1}, {x: 0, y: 1}, { x: 2, y: 1}],
            down: [{x: 0, y: 0}, {x: 1, y: 0},{x: 0, y: 0}, { x: 2, y: 0}],
            right: [{x: 3, y: 0}, {x: 4, y: 0}, {x: 3, y: 0}, { x: 5, y: 0}],
            left: [{x: 3, y: 1}, {x: 4, y: 1}, {x: 3, y: 1}, { x: 5, y: 1}]
        };
        bomberman.curGrid = grids[1][1];
        bomberman.isAlive = true;

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
        explosions.range = 1;//range of explosions
        explosions.animationFrames = [0,1,2,3,3,2,1,0];//animation frames for explosions
        explosions.timer = 500;//time to explode

        bomberman.onload = function()
        {
            ctx.drawImage(bomberman, bomberman.walkFrames.right[bomberman.curFrame].x*size, bomberman.walkFrames.right[bomberman.curFrame].y*size,
                size, size, bomberman.xPos, bomberman.yPos, size, size);
        }
               
        var barom = new Image();
        barom.src = "Art/Barom.png";
        barom.curFrame = 0;
        barom.curDir = 1;
        barom.numFrames = 10;
        barom.pacer = 0;
        barom.curGrid = grids[3][2];
        barom.chageDirTimer = 0;
        
        
        barom.onload = function()
        {
            ctx.drawImage(barom, 0, 0, size,size,barom.xPos,barom.yPos,size,size);
        }
        
        var baroms = [];//array of baroms
        baroms.count = 7;
        var curX = 3;
        var curY = 2;
        var pacerStart = 0;
        var dirTimer = 0;
			
			
        function setBaroms() 
        {   
            var min = 1;
            var bufZone = 2;
            for (let i = 0; i < baroms.count; i++)
            {
                var xCord = getRandomIntInclusive(min, mapX-1);
                var yCord = getRandomIntInclusive(min, mapY-2);
                while (xCord <= bufZone && yCord <= bufZone)
                {
                    var rNum = getRandomIntInclusive(1, 2);
                    if (rNum == 1) 
                    {
                        xCord = getRandomIntInclusive(min, mapX-1);
                    }
                    else 
                    {
                        yCord = getRandomIntInclusive(min, mapY-2);
                    }
                }
                while (grids[xCord][yCord].walkable == false) {
                    xCord = getRandomIntInclusive(min, mapX-1);
                    yCord = getRandomIntInclusive(min, mapY-1);
                    while (xCord <= bufZone && yCord <= bufZone)
                    {
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
                baroms[i].xPos = xCord*size;
                baroms[i].yPos = yCord*size;
                baroms[i].curGrid = grids[xCord][yCord];
            }
        };
        

        //Place soft blocks down around the map
        var softBlocks = [];
        softBlocks.numFrames = 7;//number of frames in an explosion
        softBlocks.timer = 700;//time to explode
        var softBlock = function(x, y)
        {
            var obj = {};
            obj.img = new Image();
            obj.img.src = "Art/Brick.png";
            obj.xPos = x;
            obj.yPos = y;
            obj.curFrame = 0;//current frame
            obj.explode = function()
            {
                obj.curFrame++;
                if(obj.curFrame < softBlocks.numFrames)
                    setTimeout(function(){obj.explode();}, softBlocks.timer/softBlocks.numFrames);
                else
                {
                    obj.isActive = false;
                    grids[obj.xPos/size][obj.yPos/size].walkable = true;
                    grids[obj.xPos/size][obj.yPos/size].hasBlock = false;
                }
            }
                obj.isActive = true;//added is active clause for blocks
                return obj;
        }
            
            //Number of Blocks to placedown onto the map
            var numBlocks = 35;

            //Call setSoftBlocks function
            setSoftBlocks(numBlocks); 

			
			for(i = 0; i < baroms.count; i++){
				baroms[i] = {};
				baroms[i].isActive = true;
				baroms[i].curFrame = 0; 
				baroms[i].curDir = Math.floor((Math.random() * 4) + 1);
				baroms[i].pacer = pacerStart;
				baroms[i].chageDirTimer = dirTimer;
                baroms[i].deathTime = 0;
				curX+=3;
				curY++;
				pacerStart ++;
				dirTimer += 50;
			}	


            setBaroms();

            //Takes the number of softBlocks to be placed on the map randomly
            function setSoftBlocks(numSB) 
            {   
                //Min zone around the player to place blocks
                var min = 1;
                //Buffer zone around the player(Cord 1,1 for now, THIS DOESNT TAKE INTO ACCOUNT PLYER STRT POS CHANGE) in a square formation
                var bufZone = 4;
                for (let i = 0; i < numSB; i++)
                {
                    //Obtain random x and y cords to place the soft block
                    var xCord = getRandomIntInclusive(min, mapX-1);
                    var yCord = getRandomIntInclusive(min, mapY-2);
                    
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
                            yCord = getRandomIntInclusive(min, mapY-2);
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
                    softBlocks[i] = softBlock(xCord*size, yCord*size);
                    
                    //Set the grid cord the block is being placed into a non-walkable state
                    grids[xCord][yCord].walkable = false;
                    //sets the block to true
                    grids[xCord][yCord].hasBlock = true;
                }
            };

            //Returns a random number between the passed values
            function getRandomIntInclusive(min, max) {
                min = Math.ceil(min);
                max = Math.floor(max);
                return Math.floor(Math.random() * (max - min + 1)) + min;
            }

            
        
            function tickTimer()
            {
				if(parseInt(timer.textContent) > 0 && !finishScreen)
				{
					timer.textContent = parseInt(timer.textContent) - 1;
					setTimeout(function() { tickTimer();}, 1000);
				}
				else if (bomberman.isAlive)
				{
                    bombermanDeath();
				}
            }


            function bombermanDeath()
            {
                bomberman.isAlive = false;
                bomberman.curFrame = 0;
                deathTime = new Date().getTime();
                if(parseInt(lives.textContent) > 0)
                {
                    lives.textContent = (parseInt(lives.textContent) - 1);
                }
                else
                {
                    gameOver = true;
                }
            }

             //adds the powerup
            var powerUp = new Image();
            powerUp.src = "Art/Powerup.png";
            powerUp.numPowerUps = 8;
            powerUp.curPowerUp = (level-1)%powerUp.numPowerUps;
            powerUp.blockIndex = getRandomIntInclusive(0, softBlocks.length-1);
            powerUp.xPos = softBlocks[powerUp.blockIndex].xPos;
            powerUp.yPos = softBlocks[powerUp.blockIndex].yPos;
            //console.log(powerUp.xPos + ", " + powerUp.yPos);
            powerUp.isActive = true;

            //adds the exit
            var targetDoor = new Image();
            targetDoor.src = "Art/Door.png";
            targetDoor.blockIndex = getRandomIntInclusive(0, softBlocks.length-1); 
            while(targetDoor.blockIndex == powerUp.blockIndex)
                targetDoor.blockIndex = getRandomIntInclusive(0, softBlocks.length-1);
            targetDoor.xPos = softBlocks[targetDoor.blockIndex].xPos;
            targetDoor.yPos = softBlocks[targetDoor.blockIndex].yPos;

            
           

            setTimeout(function() {tickTimer();}, 1000);
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
                            bomberman.curGrid.walkable = false;
                            bombs[t].isActive = true;
                            setTimeout(function(){ animateBomb(t);}, bombs.timer/ bombs.numFrames);
                        }
                    }
            });

            document.onkeydown = function(e)
            {
                
                if(bomberman.isAlive)
                {
                    switch(e.which)
                    {
                        case 37: //left
                            if(bomberman.curDir != "left")
                                bomberman.curFrame = 0;
                            bomberman.curDir = "left";
                            bomberman.still = false;
                            break;
                        case 38: //up
                            if(bomberman.curDir != "up")
                                bomberman.curFrame = 0;
                            bomberman.curDir = "up";
                            bomberman.still = false;
                            break;
                        case 39: //right
                            if(bomberman.curDir != "right")
                                bomberman.curFrame = 0;
                            bomberman.curDir = "right";
                            bomberman.still = false;
                            break;
                        case 40: //down
                            if(bomberman.curDir != "down")
                                bomberman.curFrame = 0;
                            bomberman.curDir = "down";
                            bomberman.still = false;
                            break;
                    }
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

                //checks bombermans position
                checkPosition();
            };

            document.onkeyup = function(e)
            {
                if(bomberman.isAlive)
                {
                    switch(e.which)
                    {
                        case 37: //left
                        case 38: //up
                        case 39: //right
                        case 40: //down
                            bomberman.still = true;
                            break;
                    }
                }

            }

            function checkPosition()
            {
                //found powerup
                if(powerUp.isActive && bomberman.xPos+size-1 >= powerUp.xPos && bomberman.xPos-size+1 <= powerUp.xPos &&
                    bomberman.yPos+size-1 >= powerUp.yPos && bomberman.yPos-size+1 <= powerUp.yPos)
                        usePowerUp();

                //found exit
                if(bomberman.xPos+size-1 >= targetDoor.xPos && bomberman.xPos-size+1 <= targetDoor.xPos &&
                    bomberman.yPos+size-1 >= targetDoor.yPos && bomberman.yPos-size+1 <= targetDoor.yPos)
                {
                    //don't increase level since powerup depends on level 0
                    //can implement later if needed
                    //level+=1;
                    reset();
                }
				/*		
				//hit enemy
                for(let k = 0; k < baroms.length; k++)
                {
                    if(baroms[k].curGrid == grids[bombs[i].xPos/size][bombs[i].yPos/size])
                    {
                        console.log("dead barom");
                        baroms[k].isActive = false;
                        baroms[k].curFrame = 0;
                        baroms[k].deathTime = new Date().getTime();
                    }
                }
                */
                //if(bomberman.curGrid === grids[bombs[i].xPos/size][bombs[i].yPos/size])
                 //   bombermanDeath();
            }

            function usePowerUp()
            {
                powerUp.isActive = false;
                switch(powerUp.curPowerUp)
                {
                    case 0:
                        explosions.range++;
                    break;
                }
            }


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
                        grids[bombs[i].xPos/size][bombs[i].yPos/size].walkable = true;
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

                        var blocksToExplode = [];
                        //if the range is greater than 2, add a new image for each direction
                        if(explosions.range > 1)
                        { 
                            var lblock, rblock, ublock, dblock = false;
                            for(j = 0; j < explosions.range; j++)
                            {
                                if(!lblock)
                                {
                                    if((grids[(bombs[i].xPos-(size*(j+1)))/size][(bombs[i].yPos)/size].walkable))  
                                    {
                                            explosions[explosions.activeExp].left[j] = {xPos: bombs[i].xPos-(size*(j+1)),
                                                yPos: bombs[i].yPos, animPos: 6};
                                    }
                                    else
                                    {
                                        //if the current block is a brick
                                        if((grids[(bombs[i].xPos-(size*(j+1)))/size][(bombs[i].yPos)/size].hasBlock))
                                        {
                                            explosions[explosions.activeExp].left[j] = {xPos: bombs[i].xPos-(size*(j+1)),
                                                yPos: bombs[i].yPos, animPos: 6};
                                            
                                            for(var k = 0; k < softBlocks.length; k++)
                                                if(softBlocks[k].xPos == bombs[i].xPos-(size*(j+1)) && softBlocks[k].yPos == bombs[i].yPos)
                                                {
                                                    blocksToExplode[blocksToExplode.length] = softBlocks[k];
                                                }
                                        }
                                        lblock = true;
                                    }
                                }
                                if(!ublock)
                                {
                                    if(grids[(bombs[i].xPos)/size][(bombs[i].yPos-(size*(j+1)))/size].walkable)
                                    {

                                        explosions[explosions.activeExp].up[j] = {xPos: bombs[i].xPos,
                                            yPos: bombs[i].yPos-(size*(j+1)), animPos: 5};                    
                                    }                   
                                    else
                                    {
                                        if(grids[(bombs[i].xPos)/size][(bombs[i].yPos-(size*(j+1)))/size].hasBlock)
                                        { 
                                            explosions[explosions.activeExp].up[j] = {xPos: bombs[i].xPos,
                                                yPos: bombs[i].yPos-(size*(j+1)), animPos: 5};

                                            for(var k = 0; k < softBlocks.length; k++)
                                                if(softBlocks[k].xPos == bombs[i].xPos && softBlocks[k].yPos == bombs[i].yPos-(size*(j+1)))
                                                {
                                                    blocksToExplode[blocksToExplode.length] = softBlocks[k];
                                                }
                                        }
                                        ublock = true;
                                    }
                                }
                                if(!rblock)
                                {
                                    if(grids[(bombs[i].xPos+(size*(j+1)))/size][(bombs[i].yPos)/size].walkable)
                                    {

                                        explosions[explosions.activeExp].right[j] = {xPos: bombs[i].xPos+(size*(j+1)),
                                            yPos: bombs[i].yPos, animPos: 6};
                                    }
                                    else
                                    {
                                        if(grids[(bombs[i].xPos+(size*(j+1)))/size][(bombs[i].yPos)/size].hasBlock)
                                        {
                                            explosions[explosions.activeExp].right[j] = {xPos: bombs[i].xPos+(size*(j+1)),
                                                yPos: bombs[i].yPos, animPos: 6};

                                            for(var k = 0; k < softBlocks.length; k++)
                                                if(softBlocks[k].xPos == bombs[i].xPos+(size*(j+1)) && softBlocks[k].yPos == bombs[i].yPos)
                                                {
                                                    blocksToExplode[blocksToExplode.length] = softBlocks[k];
                                                }
                                        }
                                        rblock = true;
                                    }
                                }
                                if(!dblock)
                                {
                                    if(grids[(bombs[i].xPos)/size][(bombs[i].yPos+(size*(j+1)))/size].walkable)
                                    {   
                                        explosions[explosions.activeExp].down[j] = {xPos: bombs[i].xPos,
                                            yPos: bombs[i].yPos+(size*(j+1)), animPos: 5};
                                    }
                                    else
                                    {
                                        if(grids[(bombs[i].xPos)/size][(bombs[i].yPos+(size*(j+1)))/size].hasBlock)
                                        {
                                            explosions[explosions.activeExp].down[j] = {xPos: bombs[i].xPos,
                                                yPos: bombs[i].yPos+(size*(j+1)), animPos: 5};

                                            for(var k = 0; k < softBlocks.length; k++)
                                                if(softBlocks[k].xPos == bombs[i].xPos && softBlocks[k].yPos == bombs[i].yPos+(size*(j+1)))
                                                {
                                                    blocksToExplode[blocksToExplode.length] = softBlocks[k];
                                                }
                                        
                                        }
                                        dblock = true;
                                    }
                                }
                            }
                        }
                        
                        if(grids[(bombs[i].xPos-size)/size][(bombs[i].yPos)/size].walkable)
                        {
                            explosions[explosions.activeExp].left[explosions[explosions.activeExp].left.length] = 
                                {xPos: bombs[i].xPos-size, yPos: bombs[i].yPos, animPos: 1};
                        }
                        //if the block is explodable 
                        else if(grids[(bombs[i].xPos-size)/size][(bombs[i].yPos)/size].hasBlock)
                        {
                            explosions[explosions.activeExp].left[explosions[explosions.activeExp].left.length] = 
                                {xPos: bombs[i].xPos-size, yPos: bombs[i].yPos, animPos: 1};
                            
                            for(var k = 0; k < softBlocks.length; k++)
                                if(softBlocks[k].xPos == bombs[i].xPos-size && softBlocks[k].yPos == bombs[i].yPos)
                                {
                                    blocksToExplode[blocksToExplode.length] = softBlocks[k];                        
                                }
                            
                        }
                        
                        if(grids[(bombs[i].xPos)/size][(bombs[i].yPos-size)/size].walkable)
                        {
                            explosions[explosions.activeExp].up[explosions[explosions.activeExp].up.length] = 
                                {xPos: bombs[i].xPos, yPos: bombs[i].yPos-size, animPos: 2};
                        }
                        //if the block is explodable
                        else if(grids[(bombs[i].xPos)/size][(bombs[i].yPos-size)/size].hasBlock)
                        {
                            explosions[explosions.activeExp].up[explosions[explosions.activeExp].up.length] = 
                                {xPos: bombs[i].xPos, yPos: bombs[i].yPos-size, animPos: 2};

                            for(var k = 0; k < softBlocks.length; k++)
                                if(softBlocks[k].xPos == bombs[i].xPos && softBlocks[k].yPos == bombs[i].yPos-size)
                                {
                                    blocksToExplode[blocksToExplode.length] = softBlocks[k];
                                }
                        }

                        if(grids[(bombs[i].xPos+size)/size][(bombs[i].yPos)/size].walkable)
                        {
                            explosions[explosions.activeExp].right[explosions[explosions.activeExp].right.length] = 
                                {xPos: bombs[i].xPos+size, yPos: bombs[i].yPos, animPos: 3};
                        }
                        //if the block is explodable
                        else if(grids[(bombs[i].xPos+size)/size][(bombs[i].yPos)/size].hasBlock)
                        {
                            explosions[explosions.activeExp].right[explosions[explosions.activeExp].right.length] = 
                                {xPos: bombs[i].xPos+size, yPos: bombs[i].yPos, animPos: 3};

                            for(var k = 0; k < softBlocks.length; k++)
                                if(softBlocks[k].xPos == bombs[i].xPos+size && softBlocks[k].yPos == bombs[i].yPos)
                                {
                                    blocksToExplode[blocksToExplode.length] = softBlocks[k];
                                }
                        }
                        
                        if(grids[(bombs[i].xPos)/size][(bombs[i].yPos+size)/size].walkable)
                        {
                            explosions[explosions.activeExp].down[explosions[explosions.activeExp].down.length] =
                                {xPos: bombs[i].xPos, yPos: bombs[i].yPos+size, animPos: 4};
                        }
                        //if the block is explodable
                        else if(grids[(bombs[i].xPos)/size][(bombs[i].yPos+size)/size].hasBlock)
                        {
                            explosions[explosions.activeExp].down[explosions[explosions.activeExp].down.length] =
                                {xPos: bombs[i].xPos, yPos: bombs[i].yPos+size, animPos: 4};

                            for(var k = 0; k < softBlocks.length; k++)
                                if(softBlocks[k].xPos == bombs[i].xPos && softBlocks[k].yPos == bombs[i].yPos+size)
                                {
                                    blocksToExplode[blocksToExplode.length] = softBlocks[k];
                                }
                        }
                        explosions[explosions.activeExp].curFrame = 0;
                        explosions[explosions.activeExp].isActive = true;
                        var j = explosions.activeExp;
                        explosions.activeExp++;
                        setTimeout(function(){ animateexplosion(j);}, explosions.timer/explosions.animationFrames.length);
                        if(blocksToExplode.length > 0)
                            setTimeout(function(){
                                for(var i = 0; i < blocksToExplode.length; i++)
                                blocksToExplode[i].explode();
                            }, 450);
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


            function reset()
            {
                if(gameOver)
                {
                    finishScreen = true;
                    return;
                }
                curPowerUp = (level-1)%powerUp.numPowerUps;
                explosions.range = 1;
                powerUp.isActive = true;
                for(let i = 0; i < bombs.maxBombs; i++)
                {
                    bombs[i].isActive = false;
                    bombs[i].curFrame = 0;//current frame in animation cycle
                    bombs[i].cFrame = 0;//current frame up to frames length
                    bombs[i].xPos = 0;
                    bombs[i].yPos = 0;              
                }
                bombs.activeBombs = 0;
                for(let i = 0; i < explosions.length; i++)
                    explosions[i].isActive = false;
                explosions.activeExp = 0;
                timer.textContent = 200;
                bomberman.still = true;
                bomberman.isAlive = true;
                bomberman.curFrame = 0;
                bomberman.curDir = "right";
                bomberman.xPos = 32;
                bomberman.yPos = 32;
                bomberman.curGrid = grids[1][1];
                bombs.activeBombs = 0;
                for(let i = 0; i < mapX; i++)
                {
                    for(let j = 0; j < mapY; j++)
                    {
                        if(j == 0 || j == mapY-1 || i == 0 || i == mapX-1)
                            grids[i][j].walkable = false;
                        else if (i % 2 == 0)
                        {
                            if(j % 2 == 0)
                            {
                                grids[i][j].hasBlock = false;
                                grids[i][j].walkable = false;
                            }
                            else
                            {
                                grids[i][j].walkable = true;
                                grids[i][j].hasBlock = false;
                            }
                        }
                        else
                        {
                            grids[i][j].walkable = true;
                            grids[i][j].hasBlock = false;
                        }
                        
                    }
                }
                bxPos = 96;
                byPos = 64;
                curX = 3;
                curY = 2;
                for(i = 0; i < baroms.count; i++){
                    baroms[i] = {};
                    baroms[i].xPos = bxPos;
                    baroms[i].yPos = byPos;
                    baroms[i].isActive = true;
                    baroms[i].curFrame = 0; 
                    baroms[i].curDir = Math.floor((Math.random() * 4) + 1);
                    baroms[i].pacer = pacerStart;
                    baroms[i].curGrid = grids[curX][curY];
                    baroms[i].chageDirTimer = dirTimer;
                    bxPos += 96;
                    byPos += 32;
                    curX+=3;
                    curY++;
                    pacerStart ++;
                    dirTimer += 50;
			    }	
                setSoftBlocks(numBlocks);
                powerUp.numPowerUps = 8;
                powerUp.curPowerUp = (level-1)%powerUp.numPowerUps;
                powerUp.blockIndex = getRandomIntInclusive(0, softBlocks.length-1);
                powerUp.xPos = softBlocks[powerUp.blockIndex].xPos;
                powerUp.yPos = softBlocks[powerUp.blockIndex].yPos;
                //console.log(powerUp.xPos + ", " + powerUp.yPos);
                powerUp.isActive = true;
                targetDoor.blockIndex = getRandomIntInclusive(0, softBlocks.length-1); 
                while(targetDoor.blockIndex == powerUp.blockIndex)
                    targetDoor.blockIndex = getRandomIntInclusive(0, softBlocks.length-1);
                targetDoor.xPos = softBlocks[targetDoor.blockIndex].xPos;
                targetDoor.yPos = softBlocks[targetDoor.blockIndex].yPos;
            }
            //given two rectangles see if they overlap
            //used for collision detection
            //x,y for first object
            //x1,y1 for second object
            function overlap(x1,y1,x2,y2)
            {   
                if((x1+size) <= x2 || (x2 + size) <= x1 || (y1+size) <= y2 || (y2+size) <= y1 )
                {
                    return false;
                }
                return true;
            }
            //sets a buffer to redraw the background
            function buffer()
            {     
                ctx.clearRect(0,0,canvas.clientWidth, canvas.clientHeight);
                if(finishScreen)
                {
                    ctx.fillStyle = '#000000';
                    ctx.fillRect(0,0,canvas.clientWidth, canvas.clientHeight);
                    ctx.fillStyle = "#FFFFFF";
                    ctx.font = "20px Arial";
                    ctx.fillText("Game over! Final Score: " + score.textContent, canvas.clientWidth/2-120, canvas.clientHeight/2);
                    return;
                }
                ctx.drawImage(map, map.xPos*size, map.yPos*size, canvas.clientWidth, canvas.clientHeight, 
                    0, 0, canvas.clientWidth, canvas.clientHeight);

                //draws powerup            
                if(powerUp.isActive)
                    ctx.drawImage(powerUp, powerUp.curPowerUp * size, 0, size, size, 
                        powerUp.xPos - map.xPos*size, powerUp.yPos - map.yPos*size, size, size);

                //draws door
                ctx.drawImage(targetDoor, 0, 0, size, size, targetDoor.xPos - map.xPos*size, 
                    targetDoor.yPos - map.yPos*size, size, size);

                //Drawing of soft blocks
                for (let i = 0; i < softBlocks.length; i++)
                {
                    //if the block is active
                    if(softBlocks[i].isActive)
                        ctx.drawImage(softBlocks[i].img, softBlocks[i].curFrame * size, 0, size, size,
                            softBlocks[i].xPos - map.xPos*size, softBlocks[i].yPos - map.yPos*size, size, size);
                }


                for(i = 0; i < baroms.count; i++){
                    if(baroms[i].chageDirTimer == 500){
                        baroms[i].chageDirTimer = 0;
                        baroms[i].curDir = Math.floor((Math.random() * 4) + 1); 
                    }
                    else{
                        baroms[i].chageDirTimer ++;
                    }
                    if(baroms[i].isActive){              
                        if(baroms[i].curFrame == 5){
                                baroms[i].curFrame = 0;
                        }
                        else{
                            if(baroms[i].pacer == 10){
                                baroms[i].curFrame++;
                                
                                baroms[i].pacer = 0;
                            }
                            else{
                                baroms[i].pacer++;
                            }	
                        }
                    }
                    else{
                        
                        if(baroms[i].curFrame == 11){
                                //baroms[i].curFrame = 0;
                        }
                        else{
                            if(baroms[i].pacer == 10){
                                baroms[i].curFrame++;
                                
                                baroms[i].pacer = 0;
                            }
                            else{
                                baroms[i].pacer++;
                            }	
                        }
                    }	
                    switch(baroms[i].curDir)
                    {
                        //up 
                        case 1:	
                            if(baroms[i].curDir == 1 && baroms[i].isActive)
                            {
                                baroms[i].yPos --;
                                //if bomberman left the current grid
                                if(baroms[i].curGrid.y * size>= baroms[i].yPos)
                                {
                                    //if the grid moved to is walkable, set curGrid 
                                    if(grids[baroms[i].curGrid.x][baroms[i].curGrid.y-1].walkable)
                                        baroms[i].curGrid = grids[baroms[i].curGrid.x][baroms[i].curGrid.y-1];
                                    //else undo the move
                                    else{
                                        baroms[i].yPos ++;
                                        baroms[i].curDir = Math.floor((Math.random() * 4) + 1); 
                                    }

                                }

                            }
                            else
                            {
                                baroms[i].curDir = Math.floor((Math.random() * 4) + 1); 

                            }
                        break;
                        
                        //down 
                        case 2:
                            if(baroms[i].curDir == 2 && baroms[i].isActive)
                            {
                                baroms[i].yPos ++;
                                //if bomberman left the current grid
                                if(baroms[i].curGrid.y * size + size <= baroms[i].yPos + size/2 + size/3)
                                {
                                    //if the grid moved to is walkable, set curGrid 
                                    if(grids[baroms[i].curGrid.x][baroms[i].curGrid.y+1].walkable)
                                        baroms[i].curGrid = grids[baroms[i].curGrid.x][baroms[i].curGrid.y+1];
                                    //else undo the move
                                    else{
                                        baroms[i].curDir = Math.floor((Math.random() * 4) + 1); 
                                        baroms[i].yPos --;
                                    }
                                        
                                }
                            }
                            else
                            {
                                baroms[i].curDir = Math.floor((Math.random() * 4) + 1); 
                            }
                            
                        break;
                        
                        //left 
                        case 3:
                            if(baroms[i].curDir == 3 && baroms[i].isActive)
                            {
                                baroms[i].xPos --;
                                //if bomberman left the current grid
                                if(baroms[i].curGrid.x * size >= baroms[i].xPos )
                                {
                                    //if the grid moved to is walkable, set curGrid 
                                    if(grids[baroms[i].curGrid.x-1][baroms[i].curGrid.y].walkable)
                                        baroms[i].curGrid = grids[baroms[i].curGrid.x-1][baroms[i].curGrid.y];
                                    //else undo the move
                                    else{
                                        baroms[i].curDir = Math.floor((Math.random() * 4) + 1); 
                                        baroms[i].xPos ++;
                                    }
                                    
                                }
                            }
                            else
                            {
                                baroms[i].curDir = Math.floor((Math.random() * 4) + 1); 
                            }
                        break;

                        //right 
                        case 4:
                            if(baroms[i].curDir == 4 && baroms[i].isActive)
                            {
                                baroms[i].xPos ++;
                                //if bomberman left the current grid
                                if(baroms[i].curGrid.x * size + size <= baroms[i].xPos + size)
                                {
                                    //if the grid moved to is walkable, set curGrid 
                                    if(grids[baroms[i].curGrid.x+1][baroms[i].curGrid.y].walkable)
                                        baroms[i].curGrid = grids[baroms[i].curGrid.x+1][baroms[i].curGrid.y];
                                    //else undo the move
                                    else{
                                        baroms[i].curDir = Math.floor((Math.random() * 4) + 1); 
                                        baroms[i].xPos --;
                                    }
                                        
                                    
                                }
                            }
                            else
                            {
                                baroms[i].curDir = Math.floor((Math.random() * 4) + 1); 
                            }
                        break;			
					}
				}
				

                
                for(let i = 0; i < baroms.length; i++)
                {
                    /*
                    if(baroms[i].curGrid == bomberman.curGrid && bomberman.isAlive && baroms[i].isActive)
                    {
                        bombermanDeath();
                    }
                    */
                    if(bomberman.isAlive && baroms[i].isActive && overlap(baroms[i].xPos,baroms[i].yPos,bomberman.xPos,bomberman.yPos))
                    {
                        bombermanDeath();
                    }
                }
				

                var curMove = new Date().getTime();
                if(curMove - bomberman.lastMove >= 60 && bomberman.isAlive)
                {
                    if(!bomberman.still)
                    {
                        bomberman.lastMove = curMove;
                        if(bomberman.curDir == "up")
                        {
                            bomberman.curFrame = (bomberman.curFrame + 1) % bomberman.walkFrames.up.length;
                            if(bomberman.xPos === bomberman.curGrid.x*size && (grids[bomberman.curGrid.x][bomberman.curGrid.y-1].walkable || bomberman.yPos !== bomberman.curGrid.y*size))
                            {
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
                            else if(bomberman.xPos > bomberman.curGrid.x*size && grids[bomberman.curGrid.x][bomberman.curGrid.y-1].walkable )
                            {
                                console.log("center in square");
                                bomberman.xPos -= size/bomberman.walkFrames.up.length;
                                bomberman.yPos -= size/bomberman.walkFrames.up.length;
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
                            else if(bomberman.xPos < bomberman.curGrid.x*size && grids[bomberman.curGrid.x][bomberman.curGrid.y-1].walkable )
                            {
                                console.log("center in square");
                                bomberman.xPos += size/bomberman.walkFrames.up.length;
                                bomberman.yPos -= size/bomberman.walkFrames.up.length;
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
                        }
                        else if(bomberman.curDir == "down")
                        {
                            bomberman.curFrame = (bomberman.curFrame + 1) % bomberman.walkFrames.down.length;
                            if(bomberman.xPos === bomberman.curGrid.x*size && (grids[bomberman.curGrid.x][bomberman.curGrid.y+1].walkable || bomberman.yPos !== bomberman.curGrid.y*size))
                            {
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
                            else if(bomberman.xPos > bomberman.curGrid.x*size && (grids[bomberman.curGrid.x][bomberman.curGrid.y+1].walkable || bomberman.yPos !== bomberman.curGrid.y*size))
                            {
                                console.log("center in square down");
                                bomberman.xPos -= size/bomberman.walkFrames.up.length;
                                bomberman.yPos += size/bomberman.walkFrames.up.length;
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
                            else if(bomberman.xPos < bomberman.curGrid.x*size && (grids[bomberman.curGrid.x][bomberman.curGrid.y+1].walkable || bomberman.yPos !== bomberman.curGrid.y*size))
                            {
                                console.log("center in square");
                                bomberman.xPos += size/bomberman.walkFrames.up.length;
                                bomberman.yPos += size/bomberman.walkFrames.up.length;
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
                        }
                        else if(bomberman.curDir == "left")
                        {
                            bomberman.curFrame = (bomberman.curFrame + 1) % bomberman.walkFrames.left.length;
                            if(bomberman.yPos === bomberman.curGrid.y*size && (grids[bomberman.curGrid.x-1][bomberman.curGrid.y].walkable || bomberman.xPos !== bomberman.curGrid.x*size))
                            {
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
                            else if(bomberman.yPos > bomberman.curGrid.y*size && grids[bomberman.curGrid.x-1][bomberman.curGrid.y].walkable )
                            {
                                console.log("center in square");
                                bomberman.xPos -= size/bomberman.walkFrames.left.length;
                                bomberman.yPos -= size/bomberman.walkFrames.up.length;
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
                            else if(bomberman.yPos < bomberman.curGrid.y*size && grids[bomberman.curGrid.x-1][bomberman.curGrid.y].walkable )
                            {
                                console.log("center in square");
                                bomberman.xPos -= size/bomberman.walkFrames.left.length;
                                bomberman.yPos += size/bomberman.walkFrames.up.length;
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
                        }
                        else if(bomberman.curDir == "right")
                        {
                            bomberman.curFrame = (bomberman.curFrame + 1) % bomberman.walkFrames.right.length;
                            if(bomberman.yPos === bomberman.curGrid.y*size && (grids[bomberman.curGrid.x+1][bomberman.curGrid.y].walkable || bomberman.xPos !== bomberman.curGrid.x*size))
                            {
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
                            else if(bomberman.yPos > bomberman.curGrid.y*size && grids[bomberman.curGrid.x+1][bomberman.curGrid.y].walkable )
                            {
                                console.log("center in square");
                                bomberman.xPos += size/bomberman.walkFrames.left.length;
                                bomberman.yPos -= size/bomberman.walkFrames.up.length;
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
                            else if(bomberman.yPos < bomberman.curGrid.y*size && grids[bomberman.curGrid.x+1][bomberman.curGrid.y].walkable )
                            {
                                console.log("center in square");
                                bomberman.xPos += size/bomberman.walkFrames.left.length;
                                bomberman.yPos += size/bomberman.walkFrames.up.length;
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
                        }
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

                    //checks bombermans position
                    checkPosition();
                }

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
                for(var i = 0; i < bombs.length; i++)
                    if(bombs[i].isActive)
                        ctx.drawImage(bomb, bombs.animationFrames[bombs[i].curFrame]*size, 0, size, size, bombs[i].xPos - map.xPos*size, bombs[i].yPos - map.yPos*size, size, size);
                for(var i = 0; i < explosions.length; i++)
                    if(explosions[i].isActive)
                    {
                        ctx.drawImage(explosion, explosions[i].mid.animPos*size, explosions.animationFrames[explosions[i].curFrame]*size, 
                            size, size, explosions[i].mid.xPos - map.xPos*size, explosions[i].mid.yPos - map.yPos*size, size, size);
                        //check for center explosion
                        /*
                        if(bomberman.isAlive && bomberman.curGrid == grids[explosions[i].mid.xPos/size][explosions[i].mid.yPos/size])
                        {
                            bombermanDeath();
                        }
                        */
                        if(bomberman.isAlive && overlap(bomberman.xPos,bomberman.yPos,explosions[i].mid.xPos,explosions[i].mid.yPos))
                        {
                            bombermanDeath();
                        }
                        for(j = 0; j < explosions.range; j++)
                        {
                            if(explosions[i].left[j])
                            {
                                ctx.drawImage(explosion, explosions[i].left[j].animPos*size, explosions.animationFrames[explosions[i].curFrame]*size, 
                                    size, size, explosions[i].left[j].xPos - map.xPos*size, explosions[i].left[j].yPos - map.yPos*size, size, size);
                                /*
                                if(bomberman.isAlive && bomberman.curGrid == grids[explosions[i].left[j].xPos/size][explosions[i].left[j].yPos/size])
                                {
                                    bombermanDeath();
                                }
                                */
                                if(bomberman.isAlive && overlap(bomberman.xPos,bomberman.yPos,explosions[i].left[j].xPos,explosions[i].left[j].yPos))
                                {
                                    bombermanDeath();
                                }
                                for(let k = 0; k < baroms.length; k++)
                                {
									if(baroms[k].isActive)
										if(overlap(baroms[k].xPos,baroms[k].yPos,explosions[i].left[j].xPos,explosions[i].left[j].yPos))
										{
											baroms[k].isActive = false;
											baroms[k].curFrame = 0;
											baroms[k].deathTime = new Date().getTime();
										}
                                }
                            }
                            if(explosions[i].up[j])
                            {
                                ctx.drawImage(explosion, explosions[i].up[j].animPos*size, explosions.animationFrames[explosions[i].curFrame]*size, 
                                    size, size, explosions[i].up[j].xPos - map.xPos*size, explosions[i].up[j].yPos - map.yPos*size, size, size);
                                //if(bomberman.isAlive && bomberman.curGrid == grids[explosions[i].up[j].xPos/size][explosions[i].up[j].yPos/size])
                                    //bombermanDeath();
                                if(bomberman.isAlive && overlap(bomberman.xPos,bomberman.yPos,explosions[i].up[j].xPos,explosions[i].up[j].yPos))
                                    bombermanDeath();
                                for(let k = 0; k < baroms.length; k++)
                                {
									if(baroms[k].isActive)
										if(overlap(baroms[k].xPos,baroms[k].yPos,explosions[i].up[j].xPos,explosions[i].up[j].yPos))
										{
											baroms[k].isActive = false;
											baroms[k].curFrame = 0;
											baroms[k].deathTime = new Date().getTime();
										}
                                }
                            }
                            if(explosions[i].right[j])
                            {
                                ctx.drawImage(explosion, explosions[i].right[j].animPos*size, explosions.animationFrames[explosions[i].curFrame]*size, 
                                    size, size, explosions[i].right[j].xPos - map.xPos*size, explosions[i].right[j].yPos - map.yPos*size, size, size);
                                //if(bomberman.isAlive && bomberman.curGrid == grids[explosions[i].right[j].xPos/size][explosions[i].right[j].yPos/size])
                                    //bombermanDeath();
                                if(bomberman.isAlive && overlap(bomberman.xPos,bomberman.yPos, explosions[i].right[j].xPos,explosions[i].right[j].yPos))
                                    bombermanDeath();
                                for(let k = 0; k < baroms.length; k++)
                                {
									if(baroms[k].isActive)
										if(overlap(baroms[k].xPos,baroms[k].yPos, explosions[i].right[j].xPos,explosions[i].right[j].yPos))
										{
											baroms[k].isActive = false;
											baroms[k].curFrame = 0;
											baroms[k].deathTime = new Date().getTime();
										}
                                }
                            }
                            if(explosions[i].down[j])
                             {
                                ctx.drawImage(explosion, explosions[i].down[j].animPos*size, explosions.animationFrames[explosions[i].curFrame]*size, 
                                    size, size, explosions[i].down[j].xPos - map.xPos*size, explosions[i].down[j].yPos - map.yPos*size, size, size);

                                //if(bomberman.isAlive && bomberman.curGrid == grids[explosions[i].down[j].xPos/size][explosions[i].down[j].yPos/size])
                                    //bombermanDeath();
                                if(bomberman.isAlive && overlap(bomberman.xPos,bomberman.yPos,explosions[i].down[j].xPos,explosions[i].down[j].yPos))
                                    bombermanDeath();
                                for(let k = 0; k < baroms.length; k++)
                                {
									if(baroms[k].isActive)
										if(overlap(baroms[k].xPos,baroms[k].yPos,explosions[i].down[j].xPos,explosions[i].down[j].yPos))
										{
											baroms[k].isActive = false;
											baroms[k].curFrame = 0;
											baroms[k].deathTime = new Date().getTime();
										}
                                }
                             }
                        }
                    }
                        
                //modified to take maps position in account
                if(bomberman.isAlive)
                    ctx.drawImage(bomberman, dir[bomberman.curFrame].x*size, dir[bomberman.curFrame].y*size,
                        size, size, bomberman.xPos - map.xPos*size, bomberman.yPos - map.yPos*size, size, size);
                else{
                    var curTime = new Date().getTime();
                    if(curTime - deathTime >= 250 )
                    {
                        deathTime = curTime;
                        bomberman.curFrame++;
                    }
                    ctx.drawImage(bomberman, bomberman.curFrame * size, 2 * size, size, size,
                        bomberman.xPos - map.xPos*size, bomberman.yPos - map.yPos*size, size, size);
                    if(bomberman.curFrame == 5)
                        reset();
                }
                for(i = 0; i < baroms.count; i++){
                    //if barom is alive
                    if(baroms[i].isActive)
                        ctx.drawImage(barom, baroms[i].curFrame*size, 0,size,size,baroms[i].xPos - map.xPos*size,baroms[i].yPos - map.yPos*size,size,size);
                    //if barom is dead and death animation isn't finished show next image
                    else if (baroms[i].curFrame <= 4)
                    {
                        var curTime = new Date().getTime();
                        //to slow animation changes 250ms between each other
                        if(curTime - baroms[i].deathTime >= 250)
                        {
                            baroms[i].deathTime = curTime;
                            baroms[i].curFrame++;
                        }
                        ctx.drawImage(barom, (baroms[i].curFrame+6)*size, 0,size,size,baroms[i].xPos - map.xPos*size,baroms[i].yPos - map.yPos*size,size,size);
                    }
                    else if(baroms[i].curFrame == 5)
                    {
                        score.textContent = parseInt(score.textContent) + 100;
                        baroms[i].curFrame++;
                    }
                }
                //console.log(baroms.count);
				setTimeout(function() {buffer();}, frameRate);

            }
    }
    
    startGame(1);
    
});