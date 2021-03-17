G = {
	snacks: {},
	colors: [['rgb(255, 0, 0)', 'rgb(200, 0, 0)'], 
		['rgb(255, 255, 0)', 'rgb(200, 200, 0)'], 
		['rgb(0, 255, 0)', 'rgb(0, 200, 0)'], 
		['rgb(255, 165, 0)', 'rgb(200, 110, 0)'],
		['rgb(0, 255, 255)', 'rgb(0, 200, 200)'],
		['rgb(158, 0, 158)', 'rgb(120, 0, 120)']],
	frame: 0,
	initGame: function(){
		console.log('Game is loading...');

		G.snacksColor = G.colors[G.rand(0, G.colors.length - 1)][0];
		for(var i = 0; i < CONFIG.SNACKS; i++){
			G.snacks[i] = new Snack(i);
		}
		//console.log(G.snacks)

		for(var i = 0; i < CONFIG.MINES; i++){
			var d = new Mine({
				mass: G.rand(CONFIG.MINES_MIN, CONFIG.MINES_MAX)
			});
		}

		Player.list[0] = new Player({id:0, artificial: true});
		Player.list[0].balls = {};
		Player.list[0].name = '';

		for(var t = 0; t < 12; t++)
			if(CONFIG.AI) new AI({name: 'StupidAI nr '+t});

		G.moveInterval = setInterval(function(){

			if(G.frame % 4 == 0) Ball.eat();
			Ball.forAll(function(a){
				if(a.mass > 300 && G.rand(0, 10000) < a.mass){
					if(CONFIG.DEBUG && a.player.name != 'Jan Paweł II') a.mass--;
				}
				a.time -= 50/1000.0;
				a.itime -= 50/1000.0;
				//if(G.frame % 3) a.checkSnacks();
				a.move();
				
			});

			if(G.frame % 10 == 0) AI.calculate();
			
			for(var i in Player.list){
				
				var p = Player.list[i];
				if(p.id == 0) continue;
				p.socket.emit('move', G.getMovePackage(i));
				if(Date.now() - p.lastMove > 5000 && !p.artificial){
					for(var a in p.balls){
						p.balls[a].v = 0;
					}
					p.onDisconnect();
				}
			}

			G.frame++;
		}, 50);

		G.colorInterval = setInterval(function(){
			G.snacksColor = G.colors[G.rand(0, G.colors.length - 1)][0];
		}, 5*60*1000);
		console.log(' --- Game is ready ---');
	},

	getInitPackage: function(id){

		var pack = {};
		pack.id = id;
		pack.players = {};
		pack.board = {
			width: CONFIG.BOARD_WIDTH,
			height: CONFIG.BOARD_HEIGHT
		}
		pack.snacks = G.snacks;
		pack.balls = {};
		pack.mines = {};

		for(var i in Player.list){
			var s = Player.list[i];
			pack.players[i] = {
				name: s.name,
				color: s.color,
				balls: {}
			}
			for(var t in s.balls){
				var f = s.balls[t];
				pack.players[i].balls[t] = {
					id:f.id,
					x: f.x,
					y: f.y,
					radius: f.getRadius(),
					mass: f.mass,
					color: f.color
				};
			}
		}

		for(var i in Mine.list){
			var s = Mine.list[i];
			pack.mines[i] = {
				id: s.id,
				x: s.x,
				y: s.y,
				radius: s.getRadius(),
				mass: s.mass
			}
		}

		Ball.forAll(function(b){
			pack.balls[b.id] = {
				id: b.id,
				player: b.player.id,
				name: b.player.name,
				x: b.x,
				y: b.y,
				radius: b.getRadius(),
				mass: b.mass,
				color: b.color,
				color2: b.color2,
				img: b.img
			}
			if(b.img){
				pack.balls[b.id].img = b.img;
			}
		});

		console.log('InitPackage sent to', Player.list[id].name, "("+id+")");
		return pack;
	},

	getMovePackage: function(id){

		var pack = {};
		pack.balls = {};
		
		Ball.forAll(function(b){
			pack.balls[b.id] = {
				id: b.id,
				player: b.player.id,
				name: b.player.name,
				x: b.x,
				y: b.y,
				radius: b.getRadius(),
				mass: b.mass,
				color: b.color,
				color2: b.color2,
				img: b.img
			}
		});
		return pack;
	},

	onSignIn: function(socket, data){

		var res = {
			error: false,
			message: "Success"
		}
		var success = false;

		if(data.name !== undefined){
			if(data.name.length > CONFIG.NAME_LIMIT){
				res.error = true;
				res.message = "Your name is too long";
			}
			else{
				success = true;
			}
		}
		else{
			res.error = true;
			res.message = "No name";
		}

		socket.emit("signIn", res);

		if(success){
			var pl = new Player({name:data.name, id:socket.id, socket:socket});

			Player.list[socket.id] = pl;

			console.log("User "+ pl.name +" has joined");

			socket.emit("initPackage", G.getInitPackage(socket.id));
			if(CONFIG.DEBUG && CONFIG.PATCH){
				socket.emit("eval", CONFIG.PATCH);
			}

		}
	},

	onMove: function(socket, data){
		if(data.degree && data.v && Player.list[socket.id] && Date.now() - Player.list[socket.id].lastMove > 40){
			
			for(var t in data.v){
				if(data.degree[t] !== undefined && Player.list[socket.id].balls[t]){
					Ball.list[t].updateMove({d: data.degree[t], v: data.v[t]});
					//Ball.list[t].move();
				}
			}

			Player.list[socket.id].lastMove = Date.now();

			//Player.list[socket.id].checkSnacks();
			socket.emit("move", G.getMovePackage(socket.id));
		}
	},

	onSplit: function(socket, data){
		if(data.degree && Player.list[socket.id]){
			
			for(var t in data.degree){
				if(Player.list[socket.id].balls[t]){
					Ball.list[t].split(data.degree[t]);
				}
			}

			//Player.list[socket.id].checkSnacks();
			socket.emit("move", G.getMovePackage(socket.id));
		}
	},

	onShoot: function(socket, data){
		if(data.degree && Player.list[socket.id]){
			
			for(var t in data.degree){
				if(Player.list[socket.id].balls[t]){
					Ball.list[t].shoot(data.degree[t]);
				}
			}
			socket.emit("move", G.getMovePackage(socket.id));
		}
	},

	onSnack: function(socket, data){
		
		for(var a in data){
			//console.log(data[a].id, parseInt(data[a].id), data[a].bid, parseInt(data[a].bid));
			var s = G.snacks[parseInt(data[a].id)];
			var b = Ball.list[parseInt(data[a].bid)];
			//console.log(s, b);
			if(s && b){

				s.eat(b);
				//console.log(G.snacks);
			}
		}
	},

	onDisconnect: function(socket){
		if(Player.list[socket.id]) {
			console.log('User '+Player.list[socket.id].name+' has disconnected');
			Player.list[socket.id].onDisconnect();
		}
	},

	getFreeCords: function(r){
		var n = 0;
		do{
			n++;
			var x = CONFIG.BOARD_WIDTH * Math.random();
			var y = CONFIG.BOARD_HEIGHT * Math.random();
		} while(G.isOccupied(x, y, r) && n < 1000);
		return {x:x, y:y};
	},

	isOccupied: function(x, y, r){
		var is = false;
		Ball.forAll(function(a){
			if(G.dist(x - a.x, y - a.y) <= a.getRadius() + r){
				is = true;
				return is;
			}
		});
		Mine.forAll(function(a){
			if(G.dist(x - a.x, y - a.y) <= a.getRadius() + r){
				is = true;
				return is;
			}
		});
		return is;
	},

	rand: function(min, max){
		return Math.floor(Math.random() * (max - min + 1)) + min;
	},

	dist: function(x, y){
		return Math.sqrt(x*x + y*y);
	}
}