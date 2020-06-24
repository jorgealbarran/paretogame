//Jeu de Pareto
//
// Version: 1
// Author: Jorge Albarran
// Date: 24/06/2020
//
// Objectif: Montrer au joeur le modèle mental de Pareto.
//
// Le modèle mental de Pareto dit que 20% de nos resources produissent 80% de nos résultats

// Canvas
const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");

// Colors
const paddleColor = "#111d5e";
const bgColor = "#eeeeee";
const brickColor = "#c70039";
const ballColor = "#ffbd69";
const powerBallColor = "#f37121";

// Structures
const bricks = [];
const balltypes = [];
var scoreByBall = [0,0];

// Sizes
    // Paddle
const paddleHeight = 15;
const paddleWidth = 120;
    // Bricks grid
const brickRowCount = 5;
const brickColumnCount = 10;
const brickWidth = 30;
const brickHeight = 27;
const brickPadding = 15;
const brickOffsetTop = 5;
const brickOffsetLeft = 30;
    // Ball
var ballSize=15;
var powerBallSize=30;

// Dynamics variables
var frames = 0;
var interval;
var transmittedAccel=0;
var ballSpeedh=2;
var ballSpeedv=4;
var paddleSpeed=20;
var executionTime=30000;
var remainingTime=executionTime/1000;
var seconds=0;
// Score variables
var score=0;
var power=0;

// Classes
// Board class. Uses a generic rectangle with a predefined color.
class Board {
    constructor() {
      this.onload = () => {
        this.draw();
      };
    }
    draw() {
        ctx.beginPath();
        ctx.fillStyle = bgColor;
        ctx.rect(0, 0, 500, 500);
        ctx.fill();
        ctx.closePath();
    }
  }
 
  // Paddle class. Draws a standard rectangle with a predefined color.
  class Paddle {
    constructor() {
        this.width = paddleWidth;
        this.height = paddleHeight;
        this.x = (canvas.width-this.width)/2;
        this.y = canvas.height-this.height;
        this.onload = () => {
            this.draw();
        };
    }
    draw() {
        ctx.beginPath();
        ctx.fillStyle = paddleColor;
        ctx.rect(this.x, this.y, this.width, this.height);
        ctx.fill();
        ctx.closePath();
    }
    moveLeft() {
        this.x -= paddleSpeed;
    }
    moveRight() {
        this.x += paddleSpeed;
    }
    stop(){
        this.x=this.x;
    }
  }

  // Brick class. Draws a standard rectangle with a predefined size and color.
  class Brick {
    constructor(x,y) {
        this.width = brickWidth;
        this.height = brickHeight;
        this.x = x;
        this.y = y;
        this.status=1;
        this.onload = () => {
            this.draw();
          };
        }
        draw() {
            if(this.status==1){
                ctx.beginPath();
                ctx.fillStyle = brickColor;
                ctx.rect(this.x, this.y, this.width, this.height);
                ctx.fill();
                ctx.closePath();
          }
        }
        break(){
            this.status=0;
        }
    }

// Ball class. Draws a circle with a predefined color.
  class Ball {
    constructor(dx,angle,type) {
      this.radius = ballSize;
      this.x = canvas.width/2-this.radius;
      this.y = canvas.height-2*this.radius-paddleHeight;
      this.type=type;
      this.dx=ballSpeedh*dx;
      this.dy=-ballSpeedv;
      this.angle=angle;
      this.onload = () => {
        this.draw();
      };
    }
    draw() {
        switch (this.type){
            case 0:
                this.color = ballColor;  
                this.radius=ballSize;
                break;
            case 1:
                this.color = powerBallColor;
                this.radius=powerBallSize;
                break;
        }
        this.x=this.x+this.angle*this.dx;
        this.y=this.y+this.dy;
        ctx.beginPath();
        ctx.arc(this.x+this.dx,this.y+this.dy, this.radius, 0, Math.PI*2, false);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.closePath();
    }
}

const board = new Board();
const ball = new Ball(Math.sign(Math.random()-.5),Math.random()+.2,0);
const paddle = new Paddle();

// Le jeu
function update() {
  frames++;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  board.draw();
  ball.draw();
  paddle.draw();
  drawbricksgrid();
  checkRebound();
  checkCollition();
  drawScore();
}

// inicio
function start() {
    interval = setInterval(update, 1000 / 60);
    generatebricksgrid();
    counter = setInterval(incrementSeconds, 1000);
    countdown = setInterval(gameOver,executionTime);
  }

function incrementSeconds() {
    --remainingTime;
}
  
  function gameOver() {
      clearInterval(interval);
      ctx.font = "100px Arcade";
      ctx.fillStyle = "#0B2981";
      ctx.fillText("GAME OVER", 17, 190);
     
    }
    
// On génére les briques
function generatebricksgrid() {
    for(i=0; i<brickColumnCount*brickRowCount; i++) {
        var c=i%brickColumnCount;
        var r=Math.floor(i/brickColumnCount)+1;
        var brickX = (c*(brickWidth+brickPadding))+brickOffsetLeft;
        var brickY = (r*(brickHeight+brickPadding))+brickOffsetTop;
        const brick = new Brick(brickX,brickY);
        bricks.push(brick);
    }
}
// On dessine le carré des briques
function drawbricksgrid() {
    bricks.forEach(brick => {
        if (brick.status==1){
            brick.draw();
        }
    });
}

// On regarde ou la balle rebondit et on ajuste le nécéssaire
function checkRebound(){
    // Rebote simétrico en x en las paredes laterales
    if((ball.x+ball.dx>canvas.width-ball.radius)||(ball.x+ball.dx<0)){
        ball.dx=-ball.dx;
    }
    // Rebote simétrico en y en el techo
   if(ball.y + ball.dy < 0) {
        ball.dy = -ball.dy;
    }
    // Rebote en el paddle
    else if(ball.y+ball.dy+ball.radius/2>canvas.height-paddle.height){
        if((ball.x+ball.radius>=paddle.x)&&(ball.x-ball.radius<=paddle.x+paddle.width)){
            ball.dy=-ball.dy;
            ball.dx=ball.dx+transmittedAccel/5;
        }
        else {
            gameOver();
        }
    }
}

function checkCollition(){
    bricks.forEach(brick => {
        if (brick.status==1){
            if(ballTouchesBrick(brick,ball.x,ball.y,ball.radius))
            {
                brick.break();
                ball.dy=-ball.dy;
                ++scoreByBall[ball.type];
                score++;
                if(score == brickRowCount*brickColumnCount) {
                    alert("YOU WIN, CONGRATULATIONS!");
                    document.location.reload();
                }
            }
        }
    }); 
}
                              
function isInside(b,u,v){
    return ((u>=b.x) && (u<=b.x+b.width) && (v>=b.y) && (v<=b.y+b.height));
}

function ballTouchesBrick(b,x,y,r){
    return (
        isInside(b,x-r,y-r) ||
        isInside(b,x,y-r) ||
        isInside(b,x+r,y-r) ||
        isInside(b,x-r,y) ||
        isInside(b,x,y) ||
        isInside(b,x+r,y) ||
        isInside(b,x-r,y+r) ||
        isInside(b,x,y+r) ||
        isInside(b,x+r,y+r)
    );
}

function drawScore() {
    ctx.font = "25px Arcade";
    ctx.fillStyle = "#0B2981";
    ctx.fillText("Porcentaje competado: %"+2*score, 8, 20);
    ctx.fillText("Normal: %"+Math.round(scoreByBall[0]*100/score)+"-Power Ball: %"+Math.round(scoreByBall[1]*100/score), 8, 40);
    ctx.fillText("RT: "+remainingTime, 400, 20);
}

addEventListener("keydown", function(e) {
    if (e.keyCode === 37) {
        transmittedAccel--;
        paddle.moveLeft();
    } else if (e.keyCode === 39) {
        transmittedAccel++;
        paddle.moveRight();
    } else if (e.keyCode === 38) {
        if (power<executionTime/500){
            ball.type=1;
        }
        else {ball.type=0;}
        power++;
        console.log(power);
    }
  });
 
addEventListener("keyup", function(e) {
    if (e.keyCode === 38) {
        ball.type=0;
    } else if ((e.keyCode === 37)||(e.keyCode === 38)) {
        transmittedAccel=0;
    }
  });

  start();