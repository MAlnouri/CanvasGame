//Modified from http://www.lostdecadegames.com/how-to-make-a-simple-html5-canvas-game/

const SCALE = 1.5;
const WIDTH = 64;
const HEIGHT = 64;
const PKMNWIDTH = 80;
const PKMNHEIGHT = 80;
const SCALED_WIDTH = SCALE * WIDTH;
const SCALED_HEIGHT = SCALE * HEIGHT;
const ANIMATION_LOOP = [0, 1, 2, 3]; //maps the animation cycle for movement
const POKEMON_SHEET = []; //maps 493 pokemon from sprite sheet
for(let i = 0; i < 28; i++) {
    POKEMON_SHEET.push(i);
}
const DOWN = 0; //maps player movement directions
const LEFT = 1;
const RIGHT = 2;
const UP = 3;
const FRAME_LIMIT = 15; //frame limit to display animations
let SPEED = 4; //player movement speed in pixels per second

var wind = window;
requestAnimationFrame = wind.requestAnimationFrame || wind.webkitRequestAnimationFrame || wind.msRequestAnimationFrame || wind.mozRequestAnimationFrame;

// Create the canvas
var canvas = document.createElement("canvas");
var ctx = canvas.getContext("2d");
canvas.width = 1440;
canvas.height = 900;
document.body.appendChild(canvas);

//sound effects
var sfx = new Audio("Capture.mp3");
sfx.playbackRate = 3;

let currentDirection = DOWN;
let animLoopIndex = 0;
let pokemonIndex = 0;
let pokemonGen = 0;
let frameCount = 0;
let img = new Image();

//background image
var bgImage = new Image();
bgImage.src = "images/background.png";

//pokemon image
var pkmnImage = new Image();
pkmnImage.src = "images/pokemon-sheet.png";

var pokemonCaught = 0;

// Game objects
var player = {
	x: 64,
    y: 64,
    width: 64,
    height: 64
};
var pokemon = {
	x: 0,
	y: 0
};
var walls = {
    x: 92,
    y: 64,
    width: 1233,
    height: 680
}

//reset the game when the player catches a pokemon
var reset = function () {
	//picks a random pokemon from the sprite sheet
    pokemonIndex = Math.round((Math.random() * ((26 - 0) + 1)));
    pokemonGen = Math.round((Math.random() * ((15 - 0) + 1)));
	//throw the pokemon somewhere on the screen randomly
	pokemon.x = 32 + (Math.random() * (canvas.width - 144));
    pokemon.y = 32 + (Math.random() * (canvas.height - 144));
};

//update game objects
var update = function () {
    let hasMoved = false;

    if (keysDown.w) { //player moving up
        moveCharacter(0, -SPEED, UP);
        hasMoved = true;
    } else if (keysDown.s) { //player moving down
        moveCharacter(0, SPEED, DOWN);
        hasMoved = true;
    }
    if (keysDown.a) { //player moving left
        moveCharacter(-SPEED, 0, LEFT);
        hasMoved = true;
    } else if (keysDown.d) { //player moving right
        moveCharacter(SPEED, 0, RIGHT);
        hasMoved = true;
    }

    //Are they touching? updates score and resets board
	if (
		player.x <= (pokemon.x + 32 * SCALE)
		&& pokemon.x <= (player.x + 32 * SCALE)
		&& player.y <= (pokemon.y + 32 * SCALE)
		&& pokemon.y <= (player.y + 32 * SCALE)
	) {
        sfx.play(); //plays sound effect on collision
        pokemonCaught++;
        reset();
    }
    //updates frame count for movement animation
    if (hasMoved) {
        frameCount++;
        if (frameCount >= FRAME_LIMIT) {
            frameCount = 0;
            animLoopIndex++;
            if (animLoopIndex >= ANIMATION_LOOP.length) {
                animLoopIndex = 0;
            }
        }
    }
};

//handle keyboard controls
var keysDown = {};

addEventListener("keydown", function (e) {
	keysDown[e.key] = true;
}, false);

addEventListener("keyup", function (e) {
	delete keysDown[e.key];
}, false);

//draws player animation frame from the sprite sheet
function drawFrame(frameX, frameY, canvasX, canvasY) {
    ctx.drawImage(img,
                  frameX * WIDTH, frameY * HEIGHT, WIDTH, HEIGHT,
                  canvasX, canvasY, SCALED_WIDTH, SCALED_HEIGHT);
}
//draws a pokemon from the sprite sheet
function drawPokemon(frameX, frameY, canvasX, canvasY) {
    ctx.drawImage(pkmnImage,
                  frameX * PKMNWIDTH, frameY * PKMNHEIGHT, PKMNWIDTH, PKMNHEIGHT,
                  canvasX, canvasY, PKMNWIDTH * SCALE, PKMNHEIGHT * SCALE);
}

//renders the player
function loadImage() {
    img.src = "images/red.png";
    img.onload = function() {
      requestAnimationFrame(game);
    };
}
reset();
loadImage();

//updates player position/direction
function moveCharacter(deltaX, deltaY, direction) {
    player.x += deltaX;
    player.y += deltaY;
    currentDirection = direction;
    //does not move player if wall collision detected
    if(collision(player, walls)) {
        player.x -= deltaX;
        player.y -= deltaY;
    }
}

//draw everything
var render = function () {
    //draws background
	ctx.drawImage(bgImage, 0, 0);

	//score
	ctx.fillStyle = "rgb(250, 250, 250)";
	ctx.font = "40px Helvetica";
	ctx.textAlign = "left";
	ctx.textBaseline = "top";
    ctx.fillText("Pokemon caught: " + pokemonCaught, 550, 0);
};
//bounding rectangle detects wall collision
function collision(a, b) {
    return (
        ((a.y + a.height) < (b.y)) ||
        (a.y > (b.y + b.height)) ||
        ((a.x + a.width) < b.x) ||
        (a.x > (b.x + b.width))
    );
}

function game() {
    //clears the rendered previous animation
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath();
    ctx.rect(64,64,1312,772);
    ctx.stroke();
    //updates character position
    update();
    //renders images
    render();
    //draws animation frame of player
    drawFrame(ANIMATION_LOOP[animLoopIndex], currentDirection, player.x, player.y);
    //draws random pokemon in a random position
    drawPokemon(pokemonIndex, pokemonGen, pokemon.x, pokemon.y);
    requestAnimationFrame(game);
}