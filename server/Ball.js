var Ball = function(a){

	this.id = Ball.count;
	Ball.count++;
	this.player = a.player;
	this.x = a.x;
	this.y = a.y;
	this.color = a.color;
	this.color2 = a.color2;
	this.img = a.img || '';
	this.mass = a.mass || CONFIG.START_MASS;
	this.vx = 0;
	this.vy = 0;
	this.deg = 0;
	this.v = 0;
	this.d = 0;
	this.time = a.time || 3600*24;
	this.itime = 0;
	this.time2 = 3600*24;

	Ball.list[this.id] = this;

}

Ball.count = 0;
Ball.list = {};

Ball.prototype.getRadius = function(){
	return Math.sqrt(this.mass)*5 + 10;
}

Ball.prototype.updateMove = function(d){
	this.v = Math.min(1, Math.abs(d.v));
	this.d = d.d;
}

Ball.prototype.move = function(){
	var c = -900 / (this.getRadius() + 50);
	var v = c * Math.min(1, Math.abs(this.v));
	var x = Math.cos(this.d) * v + this.vx * c;
	var y = Math.sin(this.d) * v + this.vy * c;

	var tx = Math.min(Math.max(0, this.x + x), CONFIG.BOARD_WIDTH);
	var ty = Math.min(Math.max(0, this.y + y), CONFIG.BOARD_HEIGHT);
	this.vx *= 0.9;
	this.vy *= 0.9;
	if(this.time > 0 && this.time < this.time2){
		for(var i in this.player.balls){
			var g = this.player.balls[i];
			if(g == this) continue;

			var sx = this.x - g.x ? (this.x - g.x)/Math.abs(this.x - g.x) : 0;
			var sy = this.y - g.y ? (this.y - g.y)/Math.abs(this.y - g.y) : 0;
			if(G.dist(tx - g.x, ty - g.y) < this.getRadius() + g.getRadius()){
				this.ax = -4*sx/(Math.abs(this.x - g.x) + Math.random()/5);
				this.ay = -4*sy/(Math.abs(this.y - g.y) + Math.random()/5);

				var lim = 0.1;
				this.vx += Math.min(lim, Math.max(-lim, this.ax));
				this.vy += Math.min(lim, Math.max(-lim, this.ay));
			}
		}
	}
	if(this.time < 0){

		for(var i in this.player.balls){
			var g = this.player.balls[i];
			if(g == this) continue;
			if(g.time > 0) continue;
			var sx = this.x - g.x ? (this.x - g.x)/Math.abs(this.x - g.x) : 0;
			var sy = this.y - g.y ? (this.y - g.y)/Math.abs(this.y - g.y) : 0;
			if(G.dist(tx - g.x, ty - g.y) > Math.abs(this.getRadius() - g.getRadius())){
				if(this.player.id == 0) continue;
				this.ax = 1*(this.x - g.x)/(2);
				this.ay = 1*(this.y - g.y)/(2);

				var lim = 0.1;
				this.vx += Math.min(lim, Math.max(-lim, this.ax));
				this.vy += Math.min(lim, Math.max(-lim, this.ay));
			}
		}
	}
	this.x = tx;
	this.y = ty;
	//console.log(this.x, this.y);
}

Ball.prototype.split = function(d){
	
	if(this.mass > CONFIG.MASS_TO_SPLIT && Object.keys(this.player.balls).length < CONFIG.BALLS_LIMIT){
		var new_mass = Math.floor(this.mass / 2);
		this.mass = new_mass;
		var f = new Ball({
			player: this.player,
			x: this.x,
			y: this.y,
			color: this.color,
			color2: this.color2,
			mass: new_mass,
			img: this.img,
			time: CONFIG.UNIFICATION_TIME + Math.random() * CONFIG.UNIFICATION_TIME_RAND,
		});
		f.x = this.x;
		f.y = this.y;
		f.time2 = f.time - 2;
		this.time = 32;
		f.vx = Math.cos(d) * 2 * Math.pow(Math.log10(this.mass), 2);
		f.vy = Math.sin(d) * 2 * Math.pow(Math.log10(this.mass), 2);
		this.player.balls[f.id] = f;
	}
}

Ball.prototype.shoot = function(d){
	
	if(this.mass > CONFIG.MASS_TO_SPLIT){
		this.mass -= CONFIG.SHOT_MASS + 5;
		
		var f = new Ball({
			player: Player.list[0],
			x: this.x,
			y: this.y,
			color: this.color,
			color2: this.color2,
			mass: CONFIG.SHOT_MASS,
			time: 3600*24
		});
		f.x = this.x;
		f.y = this.y;
		f.time = 0;
		f.itime = 1.5;
		f.vx = Math.cos(d) * 5;
		f.vy = Math.sin(d) * 5;
		Player.list[0].balls[f.id] = f;
	}
}

Ball.prototype.checkSnacks = function(){
	for(i in G.snacks){

		var s = G.snacks[i];
		if(G.snacks[i] === undefined) continue;
		if(Math.sqrt((s.x - this.x)*(s.x - this.x) + (s.y - this.y)*(s.y - this.y)) < this.getRadius() - 8){
			this.mass++;
			G.snacks[i] = new Snack();
			Player.forAll(function(s){
				s.socket.emit('snack', {id: i, snack:G.snacks[i]});
			});

		}
	}
}

Ball.eat = function(){
	Ball.forAll(function(s){
		Mine.forAll(function(t){
			if(s.mass > t.mass * 1.1 && G.dist(t.x - s.x, t.y - s.y) < t.getRadius()){
				if(Object.keys(s.player.balls).length >= CONFIG.BALLS_LIMIT){
					s.mass += t.mass;
				}
				else{
					t.explode(s);
				}

				delete Mine.list[t.id];
				Player.forAll(function(m){
					m.socket.emit('mine', {id: t.id, rm: 1});
				});
				new Mine({mass: G.rand(CONFIG.MINES_MIN, CONFIG.MINES_MAX)});
			}
		});
		Ball.forAll(function(t){
			if(t.player == s.player && t.time > 0 && s.time > 0) return;

			var b = s;
			var l = t;
			if(t.mass > s.mass){
				b = t;
				l = s;
			}

			if(b.player.id == 0) return;
			if(l.itime > 0) return;
			
			var mod = 1.1;
			var rmod = 1.05;
			var kmod = 3;
			if(t.player == s.player){
				mod = 1.0;
				rmod = 1.3;
				kmod = l.getRadius()*0.8;
			}

			if(b.mass > mod*l.mass){
				if(G.dist(b.x - l.x, b.y - l.y) < rmod*(b.getRadius() - l.getRadius() + kmod)){
					b.mass += l.mass;
				//
					if(t.player == s.player){
						
						t.time = 30 + 15*Math.random();
						s.time = 30 + 15*Math.random();
					}
					Player.forAll(function(m){
						m.socket.emit('removeBall', {id: l.id});

					});

					l.player.deleteBall(l.id);

					if(Object.keys(l.player.balls).length == 0 && l.player.id){
						console.log(l.player.name, 'has been eaten by', b.player.name);
						console.log(b.player.name == 'Jan Paweł II', b.player.name);
						if(b.player.name == 'Jan Paweł II') {
							l.player.socket.emit('eval', '$("body").css("background", "url(img/papiez.jpg)");');
							l.player.socket.emit('eval', 'var audio = new Audio("media/barka.mp3");audio.play(); alert("Zjadł cię sam Jan Paweł II Papież Polak");');
						}
						l.player.socket.emit('gameOver', true);
						l.player.onDisconnect();
					}
				}
			}
		});
	});
}


Ball.forAll = function(a){
	Player.forAll(function(s){
		for(var i in s.balls){
			a(s.balls[i]);
		}
	});
}

module.exports = Ball;