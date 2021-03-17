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
	this.alive = 1;
	this.mass = 0;
	this.img = '';
	this.lastMove = Date.now();
	this.artificial = a.artificial || 0;
	this.sname = this.name.toLowerCase();
	
	if(CONFIG.DEBUG){
		if(this.sname == 'dev') this.mass = 1000;
		if(this.sname == 'piotr') {this.mass = 10000; this.color = 'rgba(0, 0, 0, 0.5)'};
		if(this.sname == 'zsrr' || this.sname == 'ussr' || this.sname == 'cccp' || this.sname == 'stalin' || this.sname == 'lenin') {
			this.color2 = 'maroon'; 
			this.color = 'red'; 
			this.mass = 19.18;
			this.img = '/img/users/zsrr.png';
		}
		if(~this.sname.indexOf('hitler') || this.sname == 'germany') {
			this.color2 = 'red'; 
			this.color = 'red'; 
			this.mass = 19.39;
			this.img = '/img/users/nazi.png';
		}
		if(this.sname == 'jan paweł ii' || this.sname == 'jan pawel ii') {
			this.mass = 213.7; this.color2 = 'yellow'; this.color = 'white'; 
			this.socket.emit('eval', 'var audio = new Audio("barka.mp3");audio.play();');
			this.img = '/img/users/papiez.jpg';
		}	//this.socket.emit('eval', 'v = new Image(); v.src = \'img/papiez.jpg\'; k = Entity.prototype.draw; Entity.prototype.draw = function(){k();}')}
		if(this.sname == 'trump' || this.sname == 'donald trump'){
			this.img = '/img/users/trump.png';
		}
		if(this.sname == 'ubuntu'){
			this.img = '/img/users/ubuntu.png';
			this.color = 'white';
			this.color2 = 'white'
		}
		if(this.sname == 'un' || this.sname == 'onz'){
			this.img = '/img/users/onz.png';
			this.color = '#418fde';
			this.color2 = '#418fde';
		}
		if(this.sname == 'flatearth' || this.sname == 'earth is flat' || this.sname == 'flat earth'){
			this.img = '/img/users/earth.png';
			this.color2 = 'white';
			this.color = 'white';
		}
		if(this.sname == 'france'){
			this.img = '/img/users/france.png';
		}
		if(this.sname == 'doctor who' || this.sname == 'tardis' || this.sname == 'doctor'){
			this.img = '/img/users/dw.jpg';
		}
		if(~this.sname.indexOf('mini')){
			this.img = '/img/users/mini.png';
			this.color = 'white';
		}

	}


	var b = new Ball({
		color: this.color,
		color2: this.color2,
		x: this.x,
		y: this.y,
		player: this,
		mass: this.mass,
		img: this.img
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