window.addEventListener("load", function()
{
    var size = 32;//size of a tile
    //gets the canvas
    var canvas = document.getElementById("canvas");
    var ctx = canvas.getContext("2d");
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

    document.onkeydown = function(e)
    {
        switch(e.keyCode)
        {
            //up arrow
            case 38:	
                if(bomberman.curDir == "up")
                {
                    bomberman.curFrame = (bomberman.curFrame + 1) % bomberman.walkFrames.up.length;
                    ctx.clearRect(bomberman.xPos, bomberman.yPos, size, size);
                    bomberman.yPos -= size/bomberman.walkFrames.up.length;
                    ctx.drawImage(bomberman, bomberman.walkFrames.up[bomberman.curFrame].x*size, bomberman.walkFrames.up[bomberman.curFrame].y*size,
                        size, size, bomberman.xPos, bomberman.yPos, size, size);
                }
                else
                {
                    bomberman.curDir = "up";
                    bomberman.curFrame = 0;
                    ctx.clearRect(bomberman.xPos, bomberman.yPos, size, size);
                    ctx.drawImage(bomberman, bomberman.walkFrames.up[bomberman.curFrame].x*size, bomberman.walkFrames.up[bomberman.curFrame].y*size,
                        size, size, bomberman.xPos, bomberman.yPos, size, size);
                }
            break;
            
            //down arrow
            case 40:
                if(bomberman.curDir == "down")
                {
                    bomberman.curFrame = (bomberman.curFrame + 1) % bomberman.walkFrames.down.length;
                    ctx.clearRect(bomberman.xPos, bomberman.yPos, size, size);
                    bomberman.yPos += size/bomberman.walkFrames.down.length;
                    ctx.drawImage(bomberman, bomberman.walkFrames.down[bomberman.curFrame].x*size, bomberman.walkFrames.down[bomberman.curFrame].y*size,
                        size, size, bomberman.xPos, bomberman.yPos, size, size);
                }
                else
                {
                    bomberman.curDir = "down";
                    bomberman.curFrame = 0;
                    ctx.clearRect(bomberman.xPos, bomberman.yPos, size, size);
                    ctx.drawImage(bomberman, bomberman.walkFrames.down[bomberman.curFrame].x*size, bomberman.walkFrames.down[bomberman.curFrame].y*size,
                        size, size, bomberman.xPos, bomberman.yPos, size, size);
                }
                
            break;
            
            //left arrow
            case 37:
                if(bomberman.curDir == "left")
                {
                    bomberman.curFrame = (bomberman.curFrame + 1) % bomberman.walkFrames.left.length;
                    ctx.clearRect(bomberman.xPos, bomberman.yPos, size, size);
                    bomberman.xPos -= size/bomberman.walkFrames.left.length;
                    ctx.drawImage(bomberman, bomberman.walkFrames.left[bomberman.curFrame].x*size, bomberman.walkFrames.left[bomberman.curFrame].y*size,
                        size, size, bomberman.xPos, bomberman.yPos, size, size);
                }
                else
                {
                    bomberman.curDir = "left";
                    bomberman.curFrame = 0;
                    ctx.clearRect(bomberman.xPos, bomberman.yPos, size, size);
                    ctx.drawImage(bomberman, bomberman.walkFrames.left[bomberman.curFrame].x*size, bomberman.walkFrames.left[bomberman.curFrame].y*size,
                        size, size, bomberman.xPos, bomberman.yPos, size, size);
                }
            break;

            //right arrow
            case 39:
                if(bomberman.curDir == "right")
                {
                    bomberman.curFrame = (bomberman.curFrame + 1) % bomberman.walkFrames.right.length;
                    ctx.clearRect(bomberman.xPos, bomberman.yPos, size, size);
                    bomberman.xPos += size/bomberman.walkFrames.right.length;
                    ctx.drawImage(bomberman, bomberman.walkFrames.right[bomberman.curFrame].x*size, bomberman.walkFrames.right[bomberman.curFrame].y*size,
                        size, size, bomberman.xPos, bomberman.yPos, size, size);
                }
                else
                {
                    bomberman.curDir = "right";
                    bomberman.curFrame = 0;
                    ctx.clearRect(bomberman.xPos, bomberman.yPos, size, size);
                    ctx.drawImage(bomberman, bomberman.walkFrames.right[bomberman.curFrame].x*size, bomberman.walkFrames.right[bomberman.curFrame].y*size,
                        size, size, bomberman.xPos, bomberman.yPos, size, size);
                }
            break;				
        }			
    };
});