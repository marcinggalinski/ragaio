Entity = function(type, obj) {

    this.type = type;
    this.radius = obj.radius || 8;
    this.playerID = obj.player;
    this.color = obj.color;
    this.color2 = obj.color2;
    this.mass = obj.mass || 1;
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
}

Entity.prototype.move = function() {

    if(this.type == 'b') {

        this.coords.x += sqrt((this.newCoords.x - this.coords.x)/2);
        this.coords.y += sqrt((this.newCoords.y - this.coords.y)/2);
    }
}

Entity.prototype.draw = function() {

    if(this.type == 's') {

        Game.ctx.beginPath();
		Game.ctx.arc((this.coords.x - Game.mid.x) * Game.scale + VAR.W/2, (this.coords.y - Game.mid.y) * Game.scale + VAR.H/2, this.radius * Game.scale, 0, 2*Math.PI);
		Game.ctx.fillStyle = this.color;
		Game.ctx.fill();
		Game.ctx.closePath();
        return;
    }
    if(this.type == 'm') {

        //svg
        return;
    }
    if(this.type == 'b') {

        //main body
        //outer circle
        Game.ctx.beginPath();
		Game.ctx.arc((this.coords.x - Game.mid.x) * Game.scale + VAR.W/2, (this.coords.y - Game.mid.y) * Game.scale + VAR.H/2, this.radius * Game.scale, 0, 2*Math.PI)
		Game.ctx.fillStyle = this.color2;
		Game.ctx.fill();
        Game.ctx.closePath();
        //inner circle
		Game.ctx.beginPath();
		Game.ctx.arc((this.coords.x - Game.mid.x) * Game.scale + VAR.W/2, (this.coords.y - Game.mid.y) * Game.scale + VAR.H/2, (this.radius - 5) * Game.scale, 0, 2*Math.PI);
		Game.ctx.fillStyle = this.color;
		Game.ctx.fill();
		Game.ctx.closePath();

		//nickname
		Game.ctx.font = "10px Arial";
		Game.ctx.fillStyle = "#000000";
		Game.ctx.fillText(this.name, (this.coords.x - Game.mid.x)*Game.scale + VAR.W/2, (this.coords.y - Game.mid.y)*Game.scale + VAR.H/2);
    }
}

function sqrt(x) {

    return x < 0 ? -Math.sqrt(-x) : Math.sqrt(x);
}
