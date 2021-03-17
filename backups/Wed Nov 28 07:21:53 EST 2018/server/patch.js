/*
Entity.prototype.draw2 = Entity.prototype.draw;
Entity.prototype.draw = function(){
	if(this.type == 'm'){
		Game.ctx.beginPath();
		var mx = (this.coords.x - Game.mid.x) * Game.scale + VAR.W/2;
		var my = (this.coords.y - Game.mid.y) * Game.scale + VAR.H/2;
		var r = this.radius * Game.scale;
		var dr = 0.04 * r;
		var a = 0;
		Game.ctx.moveTo(mx + r - dr, my);
		var k = 2 * Math.floor(this.radius * Math.PI / 5);
		for(var i = 0; i <= k; i++){
			if(i % 2) r += dr;
			else r -= dr;
			Game.ctx.lineTo(mx + Math.cos(i / k * (2 * Math.PI)) * r, my + Math.sin(i / k * (2 * Math.PI)) * r)
		}
        //Game.ctx.arc((this.coords.x - Game.mid.x) * Game.scale + VAR.W/2, (this.coords.y - Game.mid.y) * Game.scale + VAR.H/2, this.radius * Game.scale, 0, 2*Math.PI);
        Game.ctx.fillStyle = "rgba(90, 255, 80, 0.7)";
        Game.ctx.strokeStyle = 'black';
        Game.ctx.lineWidth = Game.scale;
        Game.ctx.fill();
        Game.ctx.stroke();
        Game.ctx.closePath();
        return;
	} /*
	else if(this.type == 'b') {

        //main body
        //outer circle
        var mx = (this.coords.x - Game.mid.x) * Game.scale + VAR.W/2;
        var my = (this.coords.y - Game.mid.y) * Game.scale + VAR.H/2;
        var r = this.radius * Game.scale;
        Game.ctx.beginPath();
		Game.ctx.arc(mx, my, r, 0, 2*Math.PI)
		Game.ctx.fillStyle = this.color2;
		Game.ctx.fill();
        Game.ctx.closePath();
        //inner circle
		Game.ctx.beginPath();
		Game.ctx.arc(mx, my, (this.radius - 5) * Game.scale, 0, 2*Math.PI);
		Game.ctx.fillStyle = this.color;
		Game.ctx.fill();
		Game.ctx.closePath();

		//nickname
		Game.ctx.font = "bold 100px Graviola, Arial";
		Game.ctx.strokeStyle = "rgba(0, 0, 0, 0.5)";
		Game.ctx.fillStyle = "rgb(255, 255, 255)";
		var k = Game.ctx.measureText(this.name);
		var fontSize = 200 * r * 1.1 / k.width;
		Game.ctx.font = "bold " + fontSize + "px Graviola, Arial";
		var k = Game.ctx.measureText(this.name);
		console.log(k.height);
		Game.ctx.lineWidth = fontSize / 30 + 3;
		Game.ctx.strokeText(this.name, mx - k.width / 2, my  + fontSize / 4);
		Game.ctx.fillText(this.name, mx - k.width / 2, my + fontSize / 4);
    } 
	else{
		this.draw2();
	}
}

Entity.prototype.updateSnack = function(obj) {

    this.coords.x = obj.x;
    this.coords.y = obj.y;
    this.color = obj.color;
}

junction_font = new FontFace('Graviola', 'url(Graviola-Regular.otf)');
junction_font.load().then(function(loaded_face) {
	document.fonts.add(loaded_face);
  	//document.body.style.fontFamily = 'Graviola, Arial';
}).catch(function(error) {
	console.log(error);
});
*/
