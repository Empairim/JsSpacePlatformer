// alot of files so gonna have a load function before running anything
window.addEventListener("load", function () {
  //canvas setup
  const canvas = document.getElementById("canvas");
  const ctx = canvas.getContext("2d");
  canvas.width = 1500;
  canvas.height = 500;
  
  // Improved version of my player handler from last game
  class InputHandler {
    constructor(game) {
      this.game = game;
      window.addEventListener("keydown", (event) => {
        //so key is only added once to keys array
        if (
          (event.key === "ArrowUp" || event.key === "ArrowDown") &&
          this.game.keys.indexOf(event.key) === -1
        ) {
          this.game.keys.push(event.key);
        } else if (event.key === " ") {
          //spacebar
          this.game.player.shootTop();
        }
      });
      window.addEventListener("keyup", (event) => {
        if (this.game.keys.indexOf(event.key) > -1) {
          this.game.keys.splice(this.game.keys.indexOf(event.key), 1);
        }
      });
    }
  }
  // PROJECTILE CLASS
  class Projectile {
    constructor(game, x, y) {
      this.game = game;
      this.x = x;
      this.y = y;
      this.width = 20;
      this.height = 3;
      this.speed = 3;
      this.markedForDeletion = false;
      this.image = new Image();
    }
    update() {
      this.x += this.speed;
      if (this.x > this.game.width * 0.8) this.markedForDeletion = true;
    }
    draw(context) {
      context.fillStyle = "red";
      context.fillRect(this.x, this.y, this.width, this.height);
    }
  }
  // PARTICLE CLASS
  class Particle {}
  //PLAYER CLASS
  class Player {
    constructor(game) {
      this.game = game;
      this.width = 120;
      this.height = 190;
      this.x = 20;
      this.y = 100;
      this.speedY = 0; //vertical movement
      this.maxSpeed = 5;
      this.projectiles = [];
    }
    update() {
      if (this.game.keys.includes("ArrowUp")) this.speedY = -this.maxSpeed;
      else if (this.game.keys.includes("ArrowDown"))
        this.speedY = this.maxSpeed;
      else this.speedY = 0;
      this.y += this.speedY;
      // handling projectiles
      this.projectiles.forEach((projectile) => {
        projectile.update();
      });
      this.projectiles = this.projectiles.filter(
        (projectile) => !projectile.markedForDeletion
      );
    }
    draw(context) {
      context.fillStyle = "black";
      context.fillRect(this.x, this.y, this.width, this.height);
      this.projectiles.forEach((projectile) => {
        projectile.draw(context);
      });
    }
    shootTop() {
      if (this.game.ammo > 0){
      this.projectiles.push(new Projectile(this.game, this.x, this.y + 30));
      this.game.ammo--;
     }
    }
  }
  //ENEMY CLASS
  class Enemy {
    constructor(game) {
      this.game = game;
      this.x = this.game.width;
      this.speedX = Math.random() * -1.5 - .5; //move to left
      this.markedForDeletion = false;
      this.lives = 5
      this.score = this.lives

    }
    update() {
      this.x += this.speedX; //move from right to left
      if (this.x +this.width < 0) this.markedForDeletion = true;  //if off screen
    }
    draw(context) {
      context.fillStyle = "aqua";
      context.fillRect(this.x, this.y, this.width, this.height);
      context.fillStyle = "black";
      context.font = "30px Helvetica";
      context.fillText(this.lives, this.x, this.y)
  }
}
//to inherit from enemy class
class Angler1 extends Enemy {
  constructor(game) {
    super(game); //this will inherit all the properties from the enemy class combines the two classes properties together
    this.width = 228 / 5;
    this.height = 169 / 5;
    this.y = Math.random() * (this.game.height * 0.9 - this.height); //random y position on screen but not off screen so * .9 and - height of the Angler1
  }


}
  //LAYER CLASS
  class Layer {}
  //BACKGROUND CLASS
  class Background {}
  //UI CLASS
  class UI {
    constructor(game) {
      this.game = game;
      this.fontSize = 30;
      this.fontFamily = "Helvetica";
      this.color = "white";
    }
    
    draw(context) {
      context.save()// saves a state of the canvas so this wont effect the rest of the canvas just the text below
      context.fillStyle = this.color;
      context.shadowOffsetX = 2;
      context.shadowOffsetY = 2;
      context.shadowColor = "black";
      context.font = `${this.fontSize}px ${this.fontFamily}`;
      //        draw score
      context.fillText('Score: ' + this.game.score, 20, 40);
      //      draw ammo
      for (let i = 0;i < this.game.ammo;i++){
        context.fillRect(20+ 5 * i, 50, 3, 20)
      }
      //        draw time
      context.fillText('Time: ' + Math.floor(this.game.gameTime/1000), this.game.width/2, 40);
      //        draw  game over message
      if (this.game.gameOver){
        context.textAlign = "center"
        let message1
        let message2
        if (this.game.score >= this.game.winningScore){
          message1 = "You Win!"
          message2 = "Well Done!"
        }else {
          message1 = "Game Over"
          message2 = "Try Again?"
        }
        context.font =  '50px ' + this.fontFamily
        context.fillText(message1, this.game.width/2, this.game.height/2 - 40)
        context.font =  '25px ' + this.fontFamily
        context.fillText(message2, this.game.width/2, this.game.height/2 + 40)
      }
      context.restore() // restores the state of the canvas
    }
  }
  //GAME CLASS
  class Game {
    constructor(width, height) {
      this.width = width;
      this.height = height;
      this.player = new Player(this); // This allows you to have multiple instances of the Game class, each with its own set of players, and they won't interfere with each other.
      this.input = new InputHandler(this);
      this.ui = new UI(this);
      this.keys = []; //saves all key presses and allows me to pass it to the player class as well
      this.enemies = [];
      this.enemyTimer = 0;
      this.enemyInterval = 1000;//1 second
      this.ammo = 20
      this.maxAmmo = 50
      this.ammoTimer = 0
      this.ammoInterval = 500;//.5 second
      this.gameOver = false;
      this.score = 0
      this.winningScore = 10
      this.gameTime = 0
      this.timeLimit = 30000
    }
    update(deltaTime) {
      if (!this.gameOver) this.gameTime += deltaTime
      if (this.gameTime > this.timeLimit) this.gameOver = true
      this.player.update();
      if(this.ammoTimer > this.ammoInterval){
        if(this.ammo < this.maxAmmo) this.ammo++
        this.ammoTimer = 0 //reset timer and the above if statement will add ammo if less than max
      } else {
        this.ammoTimer += deltaTime
      } // this is so we can use the deltaTime in the update method to track ammo timer
      this.enemies.forEach((enemy) => {
        enemy.update();
        if (this.collisionCheck(this.player, enemy)){
          enemy.markedForDeletion = true;
        } 
        this.player.projectiles.forEach((projectile) => {
          if (this.collisionCheck(projectile, enemy)) {
            enemy.lives--;
            
            if(enemy.lives <= 0){
              enemy.markedForDeletion = true;
              if(!this.gameOver)this.score += enemy.score
              if(this.score >= this.winningScore){
                this.gameOver = true
                
              }
            }
          }
        })
      });
      this.enemies = this.enemies.filter(
        (enemy) => !enemy.markedForDeletion
      ); 
        if(this.enemyTimer > this.enemyInterval && !this.gameOver){
          this.addEnemy();
          this.enemyTimer = 0 //reset timer
        }else{
          this.enemyTimer += deltaTime
        }
    }
    draw(context) {
      this.player.draw(context); //it take this param above so has to here
      this.ui.draw(context);
      this.enemies.forEach((enemy) => {
        enemy.draw(context);
      });
    }
    addEnemy() {
      this.enemies.push(new Angler1(this));
      
    }
    collisionCheck(rect1,rect2){
      return(
        rect1.x < rect2.x + rect2.width &&
        rect1.x + rect1.width > rect2.x &&
        rect1.y < rect2.y + rect2.height &&
        rect1.y + rect1.height > rect2.y
      )
    }
  }
  // create new instance of game class
  const game = new Game(canvas.width, canvas.height);
  let lastTime = 0
  // animation/game loop
  function animate(timeStamp) {
    const deltaTime = timeStamp - lastTime
    lastTime = timeStamp // this is so we can use the deltaTime in the update method
    ctx.clearRect(0, 0, canvas.width, canvas.height); // will clear the canvas b4 loop
    game.update(deltaTime);
    game.draw(ctx); // this is telling where we want it drawn then passes it back to the game/player class draw methods
   
    requestAnimationFrame(animate);//this function has timeStamps built in
  }
  animate(0);
});
