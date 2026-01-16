// Project Name: Paruresis 
// Date: November 29, 2025
// Author: Hanbo Zhan 
//
// Instructions :
// 1. Press and HOLD the mouse  to urinate and fill the progress bar.
// 2. RELEASE the mouse immediately when the watcher looks at you.
// 3. Watch the indicator:
// - No Sign: Safe to pee.
// - Yellow (!): Warning, get ready to stop.
// - Enemy Face: Danger! If you are peeing now, you lose.
// 4. Fill the bar to 100% to win.
//
// Description:
// A one-button game exploring the social anxiety of public restrooms.
// The game uses simple mechanics to simulate the tension of trying to 
// perform a private act in a public space under scrutiny.
//
// Inspirations:
// Inspired by "Paruresis" (Shy Bladder Syndrome), specifically the phenomenon where men find it difficult or impossible to urinate when someone else is standing nearby.
//
// References:
// Brodsky, C. N., Sitto, H. M., Wittmann, D., Wallner, L. P., Streur, C., DeJonckheere, M., ... & Ippolito, G. M. (2024). “There is a lot of shame that comes with this”: A qualitative study of patient experiences of isolation, embarrassment, and stigma associated with overactive bladder. Neurourology and Urodynamics, 43(8), 1817-1825.
// Elenskaia, K., Haidvogel, K., Heidinger, C., Doerfler, D., Umek, W., & Hanzal, E. (2011). The greatest taboo: urinary incontinence as a source of shame and embarrassment. Wiener Klinische Wochenschrift, 123(19), 607-610.

let img1, img2, img3, img4;
let bgImg;
let imgWarn;
let imgWinScreen;
let sound;

// Game State Variables
let bar = 0;       // Progress bar 0 to 100
let mode = "play"; // Current mode: "play", "lose", "win"

// Scaling Variables
let canvasScale = 0.35;
let scaleFactor = 0.3;

// Define an object variable for the enemy logic
let enemy; 

// Define a variable for the HTML element
let statusMessage; 

function preload() {
  img1 = loadImage('1.png');
  img2 = loadImage('2.png');
  img3 = loadImage('3.png');
  img4 = loadImage('4.png');
  bgImg = loadImage('background.png');
  sound = loadSound('niao.mp3');
  imgWinScreen = loadImage('6.png');
  imgWarn = loadImage('7.png');
}

function setup() {
  let newWidth = bgImg.width * canvasScale;
  let newHeight = bgImg.height * canvasScale;
  
  // Create Canvas and store it in a variable to position DOM elements relative to it
  let cnv = createCanvas(newWidth, newHeight);
  
  //  Create an HTML element
  statusMessage = createP("Press & Hold to Start");
  
  // Apply CSS styling to the DOM element
  statusMessage.style('font-size', '16px');
  statusMessage.style('color', '#333');
  statusMessage.style('text-align', 'center');
  statusMessage.style('font-family', 'sans-serif');
  
  // Position the DOM element directly below the canvas
  statusMessage.position(cnv.position().x, cnv.position().y + height + 10);

  textSize(30 * canvasScale);
  textAlign(CENTER, CENTER);
  
  // Instantiate the custom class
  enemy = new Watcher(); 
}

function draw() {
  // Draw background image first
  image(bgImg, 0, 0, width, height);

  // Switch between game modes
  if (mode === "play") {
    game();
  } else if (mode === "lose") {
    lose();
  } else if (mode === "win") {
    win();
  }
}

//  Custom Class definition
// Encapsulates the logic for the enemy 
class Watcher {
  constructor() {
    this.status = 0; // 0 = Safe, 1 = Warning, 2 = Looking 
    this.t = 0;      // Timer counter
    this.wait = random(60, 120); 
    this.currentImage = img3; // Default enemy image
  }

  // Method to update internal state
  update() {
    this.t++;
    if (this.t > this.wait) {
      this.t = 0; 
      
      if (this.status === 0) {
        // Switch from Safe to Warning
        this.status = 1; 
        this.wait = 40; 
      } else if (this.status === 1) {
        // Switch from Warning to Danger
        this.status = 2; 
        // Randomly select which enemy face appears
        this.currentImage = (random(1) > 0.5) ? img3 : img4;
        this.wait = random(50, 100);
      } else if (this.status === 2) {
        // Switch from Danger back to Safe
        this.status = 0; 
        this.wait = random(80, 180); 
      }
    }
  }

  // Method to draw the enemy or warning signs based on status
  display() {
    let warnW = imgWarn.width * scaleFactor;
    let warnH = imgWarn.height * scaleFactor;
    let warnX = width * 0.75 - warnW / 2;
    let warnY = height / 2 - warnH / 2;

    if (this.status === 1) {
      // Warning state: Draw Yellow Exclamation Mark
      tint(255, 255, 0); 
      image(imgWarn, warnX, warnY, warnW, warnH);
      noTint();
    } else if (this.status === 2) {
      // Danger state: Draw Enemy image
      let bw = this.currentImage.width * scaleFactor;
      let bh = this.currentImage.height * scaleFactor;
      image(this.currentImage, width * 0.75 - bw / 2, height - bh - (50 * canvasScale), bw, bh);
    }
  }

  // Helper method to check if enemy is currently looking 
  isLooking() {
    return this.status === 2;
  }
  
  // Helper to retrieve the specific enemy image 
  getImage() {
    return this.currentImage;
  }
  
  // Method to reset the enemy logic for a new game
  reset() {
    this.status = 0;
    this.t = 0;
    this.wait = random(60, 120);
  }
}

function game() {
  // Update enemy logic
  enemy.update();   
  
  let peeing = false;
  // One-button interaction logic
  if (mouseIsPressed) {
    peeing = true;
    bar = bar + 0.4; // Increase progress
    if (!sound.isPlaying()) sound.loop();
    
    // Update the text inside the HTML element
    statusMessage.html("Keep going...");
  } else {
    peeing = false;
    sound.stop();
    statusMessage.html("Wait for it...");
  }

  
  // Lose Condition
  if (enemy.isLooking() && peeing) { 
    mode = "lose"; 
    sound.stop(); 
    statusMessage.html("Oh no! You got caught."); 
  }
  
  // Win Condition
  if (bar >= 100) { 
    mode = "win"; 
    sound.stop(); 
    statusMessage.html("Victory! Mission Accomplished."); 
  }

  // Draw Player Character
  let pImg = peeing ? img2 : img1;
  let pw = pImg.width * scaleFactor;
  let ph = pImg.height * scaleFactor;
  image(pImg, width / 3 - pw / 2, height - ph - (50 * canvasScale), pw, ph);

  
  enemy.display();

  
  let barX = width * 0.1;
  let barY = height * 0.1;
  let barW = width * 0.8;
  let barH = 30 * canvasScale;
  
  
  fill(255); rect(barX, barY, barW, barH);
  fill(255, 0, 0);
  let w = map(bar, 0, 100, 0, barW);
  rect(barX, barY, w, barH);
}

function lose() {
  stroke(0); strokeWeight(4); fill(255, 0, 0); 
  textSize(40 * canvasScale); 
  text("So embarrassing！", width/2, height/3);
  
  noStroke();
  // Retrieve the specific enemy that caught the player
  let badImg = enemy.getImage();
  let bw = badImg.width * scaleFactor;
  let bh = badImg.height * scaleFactor;
  image(badImg, width/2 - bw/2, height/2, bw, bh);
  
  stroke(0); strokeWeight(3); fill(255);
  textSize(20 * canvasScale); 
  text("Click to Restart", width/2, height - 50*canvasScale);
  noStroke();
}

function win() {
  let targetW = width * 0.8;
  let aspectRatio = imgWinScreen.height / imgWinScreen.width;
  let targetH = targetW * aspectRatio;

  // Draw victory image
  imageMode(CENTER);
  image(imgWinScreen, width/2, height/2, targetW, targetH);
  imageMode(CORNER);
  
  // Draw restart text
  stroke(0); strokeWeight(3); fill(255); 
  textSize(20 * canvasScale);
  text("Click to Restart", width/2, height/2 + targetH/2 + 30*canvasScale);
  noStroke();
}

function mousePressed() {
  
  if (mode === "lose" || mode === "win") {
    bar = 0; 
    mode = "play"; 
    
    //  Reset the enemy object
    enemy.reset(); 
    
    // Reset the HTML text
    statusMessage.html("Press & Hold to Start");
  }
}