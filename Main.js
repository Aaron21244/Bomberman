window.addEventListener("load", function() 
{
    var size = 32;//size of a tile
    //gets the canvas
    var canvas = document.getElementById("canvas");
    var ctx = canvas.getContext("2d");
    ctx.globalCompositeOperation="destination-over";
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

    setTimeout(function() { tickTimer();}, 1000);
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

    setTimeout(function() {buffer();}, frameRate);
    
    //sets a buffer to redraw the background
    function buffer()
    {
        ctx.drawImage(map, map.xPos, map.yPos, canvas.clientWidth, canvas.clientHeight, 
            0, 0, canvas.clientWidth, canvas.clientHeight);
        setTimeout(function() {buffer();}, frameRate);
    }
});