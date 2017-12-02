/**
 * The main application script,
 * responsible for calling and running the application
 * @author Eric Schirtzinger
 */
// Globals
var currPos;
var prevPos;
var currMousePos = [0,0,0];
var gameStart = false;
// stores vector 3's of each points position
var vectArray = [];
var m4 = twgl.m4;
// Controlls
// Camera
var theta = 0;
var radius = 10;
var camPosY = 0;
// Spindle
var thetaXSpindle = 0;
var thetaYSpindle = 0;
var rotSpeedY = .00;
var rotSpeedX = .00;
var spindleX = 0;
var spindleZ = 0;
// Commited drawings
var commits = [];
var Tspindle;

var canvas = document.getElementById('myCanvas');
var context = canvas.getContext('2d');
// Inverse transform
var mouseToWorld;
// Set Up
canvas.style.backgroundColor = BACKGROUND_COLOR;
var ui = new UI(context);

// Constants
const xAdjust = 0; const yAdjust = 0;
const stepSize = .001;

// Called when page has loaded
function main(){
  // Same functions used in class for moveTo and lineTo
  function moveToTx(x,y,z,Tx) {
    var loc = [x,y,z];
    var locTx = m4.transformPoint(Tx,loc);
    context.moveTo(locTx[0],locTx[1]);
  }
  function lineToTx(x,y,z,Tx) {
    var loc = [x,y,z];
    var locTx = m4.transformPoint(Tx,loc);
    context.lineTo(locTx[0], locTx[1]);
  }
  function drawAxes(Tx){
    context.beginPath();
    moveToTx(-50, 0, 0, Tx);
    lineToTx(50, 0, 0, Tx);
    context.stroke(); // x-axis
    moveToTx(0, -50, 0, Tx);
    lineToTx(0, 50, 0, Tx);
    context.stroke(); // y-axis
    moveToTx(0, 0, -50, Tx);
    lineToTx(0, 0, 50, Tx);
    context.stroke(); // z-axis
  }
  /**
    Itterates through the 2d array of points (x,y,z), drawing a line
    between each. Points have already been transformed to exist in the world
    coordinate system from the point at which they were added.
  **/
  function drawPicture(Tx, vectArray, toMouse){
    context.beginPath();
    vectArray.forEach(function(point,i){
      if(i === 0){
        moveToTx(point[0],point[1],point[2],Tx);
      }else{
        lineToTx(point[0],point[1],point[2],Tx);
      }
      context.stroke();
    });
    if(toMouse){
      lineToTx(currMousePos[0],currMousePos[1],0,m4.identity());
    }
    context.stroke();
  }
  /**
    Draws a grid on the y=0 plane
  **/
  function drawGrid(Tx){
    context.beginPath();
    var dim = 10;
    var length = 500;
    // Draw from the negative width to pos
    for(var i=-(dim/2); i<=(dim/2); i++){
      iScaled = i * 50;
      moveToTx(iScaled, 0, -length/2, Tx); lineToTx(iScaled, 0, length/2, Tx);
      moveToTx(-length/2, 0, iScaled, Tx); lineToTx(length/2, 0, iScaled, Tx);
    }
    context.stroke();
  }
  // Animation loop
  function draw(){
    // Quick clear for re-draw as well as resize in event of window change
    canvas.width = window.innerWidth; canvas.height = window.innerHeight;
    context.strokeStyle = PRIMARY_TEXT_COLOR;

    // Transforms
    var TrotX = m4.rotationX(thetaXSpindle*Math.PI); // Spindle spins independantly of the world.
    var TrotY = m4.rotationY(thetaYSpindle*Math.PI);
    var Ttrans = m4.translation([spindleX,0,spindleZ]);
    Tspindle = m4.multiply(TrotX, TrotY);
    Tspindle = m4.multiply(Tspindle, Ttrans);

    var eye = [Math.sin(theta*Math.PI)*radius, camPosY, Math.cos(theta*Math.PI)*radius];
    var target = [0,0,0];
    var up = [0,1,0];
    var TlookAt = m4.lookAt(eye, target, up);
    var Tcamera = m4.inverse(TlookAt);
    Tcamera = m4.multiply(Tcamera, m4.scaling([1,-1,1])); // flip to point Y up
    Tcamera = m4.multiply(Tcamera, m4.translation([canvas.width/2, canvas.height/2, 0]));

    context.strokeStyle = 'rgba(255, 255, 255, .15)';
    drawGrid(Tcamera);
    context.strokeStyle = "lightblue";
    commits.forEach(function(curr){
      curr.draw(Tcamera);
    });
    // Animation transforms
    thetaYSpindle += rotSpeedY;
    thetaXSpindle += rotSpeedX;
    TspindleMod = m4.multiply(Tspindle, Tcamera);
    // Update the global variable
    mouseToWorld = m4.inverse(TspindleMod);

    context.strokeStyle = "white";
    drawAxes(TspindleMod);
    context.strokeStyle = "lightblue";
    drawPicture(TspindleMod, vectArray, true);
    context.translate(canvas.width/2, canvas.height/2); // Move orgin for UI
    ui.showManual();
    ui.showStats(rotSpeedX, rotSpeedY, spindleX, spindleZ);
    window.requestAnimationFrame(draw);
  }
  draw();


  // EVENT LISTENERS
  document.onmousemove = function(e){
      currMousePos = [e.pageX, e.pageY, 0];
  }
  document.onmousedown = function(event){
    if(currPos){
      prevPos = currPos
    }
    currPos = [event.clientX, event.clientY, 0];
    currPos = m4.transformPoint(mouseToWorld, currPos);
    vectArray.push(currPos);
  }
  document.addEventListener('keydown', (event) => {
    const keyName = event.key;
    if(keyName === "c"){
      // Store drawing
      var drawing = new Drawing(Tspindle, vectArray);
      drawing.rotSpeedY = rotSpeedY;
      drawing.rotSpeedX = rotSpeedX;
      commits.push(drawing);
      // Clear drawing
      vectArray = [];
      currPos = null;
    }
    if(keyName === "x"){
      // pop last commit
      commits.pop();
      // Clear drawing
      vectArray = [];
      currPos = null;
    }
    // Controll axis'
    if(keyName === "ArrowUp"){
      event.preventDefault();
      rotSpeedX += stepSize;
    }
    if(keyName === "ArrowDown"){
      event.preventDefault();
      rotSpeedX -= stepSize;
    }
    if(keyName === "ArrowLeft"){
      event.preventDefault();
      rotSpeedY -= stepSize;
    }
    if(keyName === "ArrowRight"){
      event.preventDefault();
      rotSpeedY += stepSize;
    }
    if(keyName === "w"){
      event.preventDefault();
      camPosY += 1;
    }
    if(keyName === "s"){
      event.preventDefault();
      camPosY -= 1;
    }
    if(keyName === "d"){
      event.preventDefault();
      theta += .05;
    }
    if(keyName === "a"){
      event.preventDefault();
      theta -= .05;
    }
    if(keyName === "l"){
      event.preventDefault();
      spindleX += 5;
    }
    if(keyName === "j"){
      event.preventDefault();
      spindleX -= 5;
    }
    if(keyName === "i"){
      event.preventDefault();
      spindleZ += 5;
    }
    if(keyName === "k"){
      event.preventDefault();
      spindleZ -= 5;
    }
  });
  /** Drawing **/
  function Drawing(Tmod, array){
    this.Tmod = Tmod;
    this.array = array;
    // Animation transforms
    this.rotSpeedY;
    this.rotSpeedX;
    // Drawing
    this.draw = function(Tcamera){
      var rot = m4.rotationX(Math.PI*this.rotSpeedX);
      this.Tmod = m4.multiply(rot,this.Tmod);
      rot = m4.rotationY(Math.PI*this.rotSpeedY);
      this.Tmod = m4.multiply(rot, this.Tmod);
      var Tx = m4.multiply(this.Tmod, Tcamera);
      drawPicture(Tx, this.array, false);
    }
  }
}
window.onload = main;
