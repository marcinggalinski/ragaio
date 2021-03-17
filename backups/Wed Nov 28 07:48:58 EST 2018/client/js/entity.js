Entity = function(type, obj) {

    this.type = type;
    this.radius = obj.radius || 8;
    this.playerID = obj.player;
    this.color = obj.color;
    this.color2 = obj.color2;
    this.mass = obj.mass;
    this.name = obj.name;
    this.coords = {

        x: obj.x,
        y: obj.y
    }
    this.prevCoords = {

        x: obj.x,
        y: obj.y
    }
    this.newCoords = {

        x: obj.x,
        y: obj.y
    }
}

Entity.prototype.updateBall = function(obj) {

    this.radius = obj.radius;
    this.prevCoords.x = this.newCoords.x;
    this.prevCoords.y = this.newCoords.y;
    this.newCoords.x = obj.x;
    this.newCoords.y = obj.y;
    this.coords = this.prevCoords;
    this.mass = obj.mass;
}

Entity.prototype.updateSnack = function(obj) {

    this.coords.x = obj.x;
    this.coords.y = obj.y;
    this.color = obj.color;
}

Entity.prototype.move = function() {

    if(this.type == 'b') {

        this.coords.x += sqrt((this.newCoords.x - this.coords.x)/2);
        this.coords.y += sqrt((this.newCoords.y - this.coords.y)/2);
    }
}

Entity.prototype.draw = function() {

    var scaledX = (this.coords.x - Game.mid.x) * Game.scale + VAR.W/2;
    var scaledY = (this.coords.y - Game.mid.y) * Game.scale + VAR.H/2;
    var scaledR = this.radius * Game.scale;
    var scaledr = (this.radius - 5) * Game.scale;
    if(this.type == 's') {

        Game.ctx.beginPath();
		Game.ctx.arc(scaledX, scaledY, scaledR, 0, 2*Math.PI);
		Game.ctx.fillStyle = this.color;
		Game.ctx.fill();
		Game.ctx.closePath();
        return;
    }
    if(this.type == 'm') {

        var dr = 0.04 * scaledR;
        Game.ctx.beginPath();
        
        Game.ctx.moveTo(scaledX + scaledR - dr, scaledY);
        var k = 2 * Math.floor(this.radius * Math.PI / 5);
        for(var i = 0; i <= k; i++) {

            if(i % 2)
                scaledR += dr;
            else
                scaledR -= dr;
            Game.ctx.lineTo(scaledX + Math.cos(i / k * 2 * Math.PI) * scaledR, scaledY + Math.sin(i / k * 2 * Math.PI) * scaledR);
        }

        Game.ctx.fillStyle = "rgba(90, 255, 80, 0.7)";
        Game.ctx.strokeStyle = "#000000";
        Game.ctx.lineWidth = Game.scale;
        Game.ctx.fill();
        Game.ctx.stroke();
        Game.ctx.closePath();
        return;
    }
    if(this.type == 'b') {

        //main body
        //outer circle
        Game.ctx.beginPath();
		Game.ctx.arc(scaledX, scaledY, scaledR, 0, 2*Math.PI)
		Game.ctx.fillStyle = this.color2;
		Game.ctx.fill();
        Game.ctx.closePath();
        //inner circle
		Game.ctx.beginPath();
		Game.ctx.arc(scaledX, scaledY, scaledr, 0, 2*Math.PI);
		Game.ctx.fillStyle = this.color;
		Game.ctx.fill();
		Game.ctx.closePath();

        //nickname
        Game.ctx.font = "bold 100px Graviola, Arial";
        Game.ctx.strokeStyle = "rgba(0, 0, 0, 0.5)";
        Game.ctx.fillStyle = "rgb(255, 255, 255)";
        var textWidth = Game.ctx.measureText(this.name).width;
        var fontSize = 200 * scaledR * 1.1 / textWidth;
        Game.ctx.font = "bold " + fontSize + "px Graviola, Arial";
        textWidth = Game.ctx.measureText(this.name).width;
        Game.ctx.lineWidth = fontSize / 30 + 3;
        Game.ctx.strokeText(this.name, scaledX - textWidth / 2, scaledY  + fontSize / 4);
        Game.ctx.fillText(this.name, scaledX - textWidth / 2, scaledY + fontSize / 4);
    }
}

function sqrt(x) {

    return x < 0 ? -Math.sqrt(-x) : Math.sqrt(x);
}

junction_font = new FontFace('Graviola', 'url(Graviola-Regular.otf)');
junction_font.load().then(function(loaded_face) {
	document.fonts.add(loaded_face);
  	//document.body.style.fontFamily = 'Graviola, Arial';
}).catch(function(error) {
	console.log(error);
});
