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
          (event.key === "ArrowUp" || event.key === "ArrowDown" || event.key === "ArrowRight" ) &&
          this.game.keys.indexOf(event.key) === -1
        ) {
          this.game.keys.push(event.key);
        }  if (event.key === "ArrowRight") {
          //shoot
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
      this.width = 50;
      this.height = 3;
      this.speed = 10;
      this.markedForDeletion = false;
      this.image = new Image();
    }
    update() {
      this.x += this.speed;
      if (this.x > this.game.width * 0.8) this.markedForDeletion = true;
    }
    draw(context) {
      context.fillStyle = "lime";
      context.fillRect(this.x+68, this.y+69, this.width, this.height);
    }
  }
  // PARTICLE CLASS
  class Particle {}
  //PLAYER CLASS
  class Player {
    constructor(game) {
      this.game = game;
      this.width = 120;
      this.height = 200;
      this.x = 20;
      this.y = 100;
      this.frameX = 0;
      this.frameY = 0;
      this.speedY = 0; //vertical movement
      this.maxSpeed = 5;
      this.projectiles = [];
      this.images = {
        idle: document.getElementById("player"),
        attack: document.getElementById("playerAttack"),

        up: document.getElementById("playerUp"),
        down: document.getElementById("playerDown"),
      
      
      
      }// this is so we can change the image of the player when moving up and down and shooting
      this.image = this.images.idle
      this.frameCount = 0;
      this.isAttacking = false;
    }
    update() {

      // handling player animation/ movement
      if (this.game.keys.includes("ArrowUp")) {
        this.speedY = -this.maxSpeed;
        this.image = this.images.up;
        this.isAttacking = false;
      } else if (this.game.keys.includes("ArrowDown")) {
        this.speedY = this.maxSpeed;
        this.image = this.images.down;
        this.isAttacking = false;
      } else if (this.game.keys.includes("ArrowRight")) {
        this.image = this.images.attack;
        this.isAttacking = true;
        
      } else {
        this.speedY = 0;
        this.image = this.images.idle;
        if (!this.isAttacking) {
        this.frameX = 0;} //resets to idle
      }
      this.y += this.speedY;





      // handling projectiles
      this.projectiles.forEach((projectile) => {
        projectile.update();
      });
      this.projectiles = this.projectiles.filter(
        (projectile) => !projectile.markedForDeletion
      );
        // Update the frameX value every X frames to cycle through the sprite sheet
    if (this.frameCount % 5 === 0 ) {
      this.frameX = (this.frameX + 1) % 4; // Assuming there are 4 frames in each sprite sheet
    }

    if (this.isAttacking && this.frameX === 3) { 
      this.isAttacking = false;
    }
    this.frameCount++;
    }
    draw(context) {
      context.fillStyle = "black";
      if (this.image === this.images.idle) {
        // Draw the idle image by selecting a frame
        let frameWidth = this.image.width / 5.98; // Replace 4 with the number of frames in the idle image
        context.drawImage(this.image, this.frameX * frameWidth, 0, frameWidth, this.image.height, this.x, this.y, this.width, this.height);
      }
       else {
        // Draw the other images by selecting a frame
        context.drawImage(this.image, this.frameX * 192, 0, 192, 192, this.x, this.y, this.width, this.height);
      }


      // handling projectiles
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
      this.frameX = 0;
      this.frameY = 0;
      this.maxFrame = 37;

    }
    update() {
      this.x += this.speedX; //move from right to left
      if (this.x +this.width < 0) this.markedForDeletion = true;  //if off screen
      if(this.frameX < this.maxFrame){
        this.frameX++
      }else this.frameX = 0
    }
    draw(context) {
      
      // context.strokeRect(this.x, this.y, this.width, this.height);
      context.drawImage(this.image, this.frameX * this.width , this.frameY * this.height, this.width, this.height, this.x, this.y, this.width, this.height);
      context.font = "30px Helvetica";
      context.fillText(this.lives, this.x, this.y)
  }
}
//to inherit from enemy class
class Enemy1 extends Enemy {
  constructor(game) {
    super(game); //this will inherit all the properties from the enemy class combines the two classes properties together
    this.width = 228 ;
    this.height = 169 ;
    this.y = Math.random() * (this.game.height * 0.9 - this.height); //random y position on screen but not off screen so * .9 and - height of the Enemy1
    this.image = document.getElementById("enemy1");
    this.frameY = Math.floor(Math.random() * 3); //random frameY position 
  }


}
   //LAYER CLASS
  class Layer {
    constructor(game, image, speedModifier, initialY = 0) {
      this.game = game
      this.image = image
      this.speedModifier = speedModifier
      this.width = 1768;
      this.height = 500;
      this.x = 0
      this.y = initialY || 0 // to pass unique y position for each layer if needed
  }
  update(){
    this.x -= this.game.speed * this.speedModifier;
    if (this.x <= -this.width) this.x = 0;
  } // this is so the background will move to the left and loop back to the start of the image
  draw(context) {
    context.drawImage(this.image, this.x, this.y);
    context.drawImage(this.image, this.x + this.width, this.y);
    // this is so the image will loop back to the start of the image when it reaches the end looks seemless
  }
}
  //BACKGROUND CLASS
  class Background {
    constructor(game) {
      this.game = game
      this.image1 = document.getElementById('sky')//sky image1
      this.layer1 = new Layer(this.game, this.image1, .2 , -550)
      this.image2 = document.getElementById('layer1')//city image2
      this.image3 = document.getElementById('layer2')//creeps image3
      this.image4 = document.getElementById('layer3')//clouds image4
      this.image5 = document.getElementById('layer4')//trees image5
      this.layer2 = new Layer(this.game, this.image2, 1)
      this.layer3 = new Layer(this.game, this.image3, .5, -65)
      this.layer4 = new Layer(this.game, this.image4, 2)
      this.layer5 = new Layer(this.game, this.image5, 3.5)
      this.layers = [this.layer1, this.layer2, this.layer3, this.layer5]
  }
  update(){
    this.layers.forEach(layer => layer.update())
  }
  draw(context){
    this.layers.forEach(layer => layer.draw(context))

  }

}
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
      this.background = new Background(this)
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
      this.winningScore = 1000
      this.gameTime = 0
      this.timeLimit = 600000 //10 minutes
      this.speed = 1
    }
    update(deltaTime) {
      if (!this.gameOver) this.gameTime += deltaTime
      if (this.gameTime > this.timeLimit) this.gameOver = true
      this.background.update()
      this.background.layer4.update()// because the clouds are on top of everything else
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
      this.background.draw(context)
      this.player.draw(context); //it take this param above so has to here
      this.ui.draw(context);
      this.enemies.forEach((enemy) => {
        enemy.draw(context);
      });
      this.background.layer4.draw(context) // this is so the clouds will be drawn on top of the everything else
    }
    addEnemy() {
      this.enemies.push(new Enemy1(this));
      
    }
    collisionCheck(rect1,rect2){
       // If rect1 is a projectile, adjust its x and y values
  if (rect1 instanceof Projectile) {
    rect1 = {
      ...rect1,
      x: rect1.x + 68,
      y: rect1.y + 69,
    };
  } // this is so the projectile will be in the right position when checking for collision since I offset it above to he in the middle of the player
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
