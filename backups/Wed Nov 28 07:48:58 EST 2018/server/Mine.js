var Mine = function(a){
	
	this.mass = a.mass || 100;
	if(!(a.x && a.y)) {
		var c = G.getFreeCords(this.getRadius());
	}
	this.x = a.x || c.x;
	this.y = a.y || c.y;
	this.id = Mine.count;
	Mine.count++;

	Mine.list[this.id] = this;
	Mine.listTmp.push(this);
	var k = Mine.listTmp.pop();
	Player.forAll(function(t){
		t.socket.emit('mine', {id:k.id, x:k.x, y:k.y, radius:k.getRadius()});
	});

}

Mine.prototype.getRadius = function(){
	return Math.sqrt(this.mass)*5 + 10;
}

Mine.prototype.explode = function(b){
	var p = Math.min(CONFIG.BALLS_LIMIT - Object.keys(b.player.balls).length, Math.floor(b.mass / CONFIG.EXPLOSION_MASS - 1));
	if(p > 0){
		var new_mass = Math.floor(b.mass / (p + 1));
		b.mass = new_mass;
		while(p--){
			var f = new Ball({
				player: b.player,
				x: b.x,
				y: b.y,
				color: b.color,
				color2: b.color2,
				mass: new_mass,
				time: CONFIG.UNIFICATION_TIME + Math.random() * CONFIG.UNIFICATION_TIME_RAND,
			});
			f.x = b.x;
			f.y = b.y;
			f.time2 = f.time - 2;
			b.time = 32;
			f.d = Math.random() * 2 * Math.PI;
			f.vx = Math.cos(f.d) * 2 * Math.pow(Math.log10(b.mass), 2);
			f.vy = Math.sin(f.d) * 2 * Math.pow(Math.log10(b.mass), 2);
			b.player.balls[f.id] = f;
		}
		
	}
}

Mine.forAll = function(a){
	for(var b in Mine.list){
		a(Mine.list[b]);
	}
}

Mine.list = {};
Mine.listTmp = [];
Mine.count = 0;

module.exports = Mine;