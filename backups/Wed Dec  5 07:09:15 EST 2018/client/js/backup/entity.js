Entity = function(type, obj) {

    this.type = type;
    this.radius = obj.radius || 8;
    this.playerID = obj.id;
    this.color = obj.color;
    this.color2 = obj.color2;
    this.x = obj.x;
    this.y = obj.y;
    this.mass = obj.mass || 1;
    this.name = obj.name;
}

Entity.prototype.update = function(obj) {

    console.log(obj);
    //alert();
    this.radius = obj.radius || 8;
    this.x = obj.x;
    this.y = obj.y;
    this.mass = obj.mass || 1;
}

Entity.prototype.draw = function() {

    if(this.type == 's') {

        Game.ctx.beginPath();
		Game.ctx.arc((this.x - Game.mid.x) * Game.scale + VAR.W/2, (this.y - Game.mid.y) * Game.scale + VAR.H/2, this.radius * Game.scale, 0, 2*Math.PI);
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

        console.log(Game.mid);
        //main body
        //outer circle
        Game.ctx.beginPath();
		Game.ctx.arc((this.x - Game.mid.x) * Game.scale + VAR.W/2, (this.y - Game.mid.y) * Game.scale + VAR.H/2, this.radius * Game.scale, 0, 2*Math.PI)
		Game.ctx.fillStyle = this.color2;
		Game.ctx.fill();
        Game.ctx.closePath();
        //inner circle
		Game.ctx.beginPath();
		Game.ctx.arc((this.x - Game.mid.x) * Game.scale + VAR.W/2, (this.y - Game.mid.y) * Game.scale + VAR.H/2, (this.radius - 5) * Game.scale, 0, 2*Math.PI);
		Game.ctx.fillStyle = this.color;
		Game.ctx.fill();
		Game.ctx.closePath();

		//nickname
		Game.ctx.font = "10px Arial";
		Game.ctx.fillStyle = "#000000";
		Game.ctx.fillText(this.name, (this.x - Game.mid.x)*Game.scale + VAR.W/2, (this.y - Game.mid.y)*Game.scale + VAR.H/2);
    }
}
