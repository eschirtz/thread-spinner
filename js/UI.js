// Holds all the ui elements to display to user
function UI(context){
  this.context = context;

  this.showStart = function(){
    this.context.font = "30px Courier New";
    this.context.fillStyle = PRIMARY_TEXT_COLOR;
    this.context.textAlign = "center";
    context.fillText(START_TEXT,0,0);
  }
  this.hideStart = function(){
    this.context.font = "bold 30px Courier New";
    this.context.fillStyle = BACKGROUND_COLOR;
    context.clearRect(0, 0, 1, 1);
  }
  this.showManual = function(){
    this.context.font = "18px Courier New";
    this.context.fillStyle = PRIMARY_TEXT_COLOR;
    this.context.textAlign = "center";
    context.fillText(MANUAL1,0, (window.innerHeight/2) - 30);
    context.fillText(MANUAL2,0, (window.innerHeight/2) - 60);
  }
  this.showStats = function(rotSpeedX, rotSpeedY, xpos, zpos){
    this.context.font = "18px Courier New";
    this.context.fillStyle = PRIMARY_TEXT_COLOR;
    this.context.textAlign = "center";
    var statText = "X-orbit " + rotSpeedX.toFixed(3) + " | Y-orbit " + rotSpeedY.toFixed(3);
    var statText2 = "X-pos " + xpos.toFixed(3) + " | Z-pos " + zpos.toFixed(3);
    context.fillText(statText,0, -(window.innerHeight/2) + 30);
    context.fillText(statText2,0, -(window.innerHeight/2) + 60);
  }
}
