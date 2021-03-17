var Player = function(a){

	this.name = a.name ? a.name : "Anonymous guy";
	this.id = a.id;
	this.balls = {};
	this.c = G.colors[G.rand(0, G.colors.length-1)];
	this.color = this.c[0];
	this.color2 = this.c[1];
	var cords = G.getFreeCords(Math.sqrt(CONFIG.START_MASS) + 15);
	this.x = cords.x;
	this.y = cords.y;
	this.socket = a.socket || {emit: function(){}};
	this.lastMove = 0;
	this.mass = 0;
	this.lastMove = Date.now();
	this.artificial = a.artificial || 0;
	
	if(CONFIG.DEBUG){
		if(this.name == 'dev') this.mass = 1000;
		if(this.name == 'Piotr') {this.mass = 10000; this.color = 'rgba(0, 0, 0, 0.5)'};
		if(this.name == 'Jan Paweł II') {
			this.mass = 213.7; this.color2 = 'yellow'; this.color = 'white'; 
			this.socket.emit('eval', 'var audio = new Audio("barka.mp3");audio.play();');
		}	//this.socket.emit('eval', 'v = new Image(); v.src = \'img/papiez.jpg\'; k = Entity.prototype.draw; Entity.prototype.draw = function(){k();}')}
	}

	var b = new Ball({
		color: this.color,
		color2: this.color2,
		x: this.x,
		y: this.y,
		player: this,
		mass: this.mass,
	});

	this.balls[b.id] = b;
}

Player.prototype.onDisconnect = function(){
	//delete Player.list[this.id];
}

Player.prototype.getRadius = function(){
	return Math.sqrt(this.mass)*5 + 10;
}

Player.prototype.checkSnacks = function(){
	for(i in G.snacks){

		var s = G.snacks[i];
		if(G.snacks[i] === undefined) continue;
		for(var t in this.balls){
			var k = this.balls[t];
			if(Math.sqrt((s.x - k.x)*(s.x - k.x) + (s.y - k.y)*(s.y - k.y)) < k.getRadius() - 8){
				k.mass++;

				G.snacks[i] = new Snack();
				Player.forAll(function(s){
					s.socket.emit('snack', {id: i, snack:G.snacks[i]});
				});

			}
		}
	}
}

Player.prototype.deleteBall = function(id){
	for(var i in this.balls){
		if(this.balls[i].id == id){
			//this.socket.emit('removeBall', {id:id});
			delete this.balls[i];
			delete Ball.list[i];
		}
	}
}

Player.forAll = function(a){
	for(var i in Player.list){
		a(Player.list[i]);
	}
}

Player.list = [];

module.exports = Player;