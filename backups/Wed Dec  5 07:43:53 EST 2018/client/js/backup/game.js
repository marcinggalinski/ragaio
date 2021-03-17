
// VAR to taki obiekt zeby nie zasmiecac glownej przestrzeni nazw, tu wrzucamy wszystkie pierdoly ktore nigdzie indziej nie pasuja
VAR = {
	fps: 30,
	W: 0,										// Szerokosc okna
	H: 0,										// Wysokosc okna
												// Odpalamy sockety do komunikacji z serwerem
	id: 0,
	lastTime: 0,
	started: false,
	prevE: {}
}

if(location.href.indexOf("localhost") >= 0) {
	VAR.socket = io();
}
else {
	VAR.socket = io("http://"+location.href.split("/")[2]+":3000");
}

VAR.socket.on('reconnect_attempt', () => {
	VAR.socket.io.opts.transports = ['polling', 'websocket'];
});

// Glowny obiekt gry
Game = {													
	init: function() {														// Tutaj cos sie bedzie dzialo zaraz po zaladowaniu strony

	},

	objects: [],
	sortedObjects: [],
	id: 0,
	player: {},
	ballCount: 1,
	balls: [],
	sortedBalls: [],
	snacks: [],
	mines: [],
	deg: {},
	velocity: {},
	mass: 5,
	shift: {

		x: 0,
		y: 0
	},
	mid: {

		x: 0,
		y: 0
	},
	scale: 1,
	spacebarPressed: false,
	paused: false,
	
	sendName: function() {

		var name = $('#name').val();
		$('#message').html("Loading...");
		VAR.socket.emit("signIn", {name: name});
	},
	start: function() {														// Zaczynamy wlasciwa gre

		$("#content").hide();

		Game.canvas = document.createElement('canvas');						// Tworzymy obiekt canvas
		Game.ctx = Game.canvas.getContext('2d');							// Bierzemy context, czyli obiekt canvasa, ktory nam wszystko pieknie maluje

		Game.layout();														// Dopasowujemy do okna gry
		window.addEventListener('resize', Game.layout, false);				// Zawsze gdy zmieni sie rozmiar strony, to dopasowujemy wszystko
		document.body.appendChild(Game.canvas);								// Dodajemy canvas na strone
		$("canvas").show();													// Wyswietlamy canvas
		Game.animationLoop();												// Odpalamy petle glowna gry
	},	
	layout: function(ev) {													// Funkcja do dopasowywania wielkosci canvasa do okna

		VAR.W = window.innerWidth;
		VAR.H = window.innerHeight;
		
		Game.canvas.width = VAR.W;
		Game.canvas.height = VAR.H;
	},

	entitylize: function() {

		for(var i in Game.snacks) {

			Game.objects['s' + i] = new Entity('s', Game.snacks[i]);
		}
		for(var i in Game.mines) {

			Game.objects['m' + i] = new Entity('m', Game.mines[i]);
		}
		for(var i in Game.balls) {

			Game.objects['b' + i] = new Entity('b', Game.balls[i]);
		}
	},

	checkPlayer: function() {

		Game.player = [];
		Game.ballCount = 0;
		for(var i in Game.balls) {

			if(Game.balls[i].player == Game.id) {

				Game.player[i] = Game.balls[i];
				Game.ballCount++;
			}
		}
	},
	sortObjects: function() {

		Game.sortedObjects = [];
		var temp = Object.keys(Game.objects).sort(function(a, b) {return Game.objects[a].mass-Game.objects[b].mass});

		//if(!Game.paused) console.log(Game.balls, temp, Game.sortedBalls);
		for(var i in temp) {

			Game.sortedObjects[i] = Game.objects[temp[i]];
		}
	},

	computeMass: function() {

		var sum = 0;
		if(Game.player) {
			for(var i in Game.player) {

				sum += Game.player[i].mass;
			}
			Game.mass = sum;
		}
	},
	computeMid: function() {												//Funkcja do liczenia środka

		var sumX = 0;
		var sumY = 0;
		var count = 0;
		if(Game.player){

			for(var i in Game.player) {

				sumX += Game.player[i].x;
				sumY += Game.player[i].y;
				count++;
			}
			if(count) {

				Game.mid.x = sumX/count;
				Game.mid.y = sumY/count;
			}
		}
	},
	computeShift: function() {												// Funkcja do liczenia przesuniecia sewer -> klient

		Game.shift.x = -Game.mid.x + VAR.W/2;
		Game.shift.y = -Game.mid.y + VAR.H/2;
	},
	computeScale: function() {												//Funkcja do liczenia skali rysowania

		Game.scale =  10/Math.sqrt(Math.sqrt(Game.mass) + 79*Math.sqrt(Math.sqrt(Game.ballCount)));
	},

	mouseMoveHandler: function(e) {											// Funkcja liczaca predkosc i kat dla kazdej kulki skladowej

		if(VAR.started) {

			if(e !== undefined)
				VAR.prevE = e;
			var Balls = Game.player;
			for(var i in Balls) {

				var relativeX = Balls[i].x + Game.shift.x - VAR.prevE.clientX;
				var relativeY = Balls[i].y + Game.shift.y - VAR.prevE.clientY;
				Game.velocity[i] = Math.hypot(relativeX, relativeY)/Balls[i].radius;
				Game.deg[i] = Math.atan2(relativeY, relativeX);
			}
		}
	},
	keyPress: function(e) {

		if(Game.spacebarPressed == false && e.key == " ") {

			Game.spacebarPressed = true;
			VAR.socket.emit("split", {degree: Game.deg});
		}
		if(e.key == "w") {

			VAR.socket.emit("shot", {degree: Game.deg});
		}
		if(e.key == "p") {

			Game.paused = true;
			alert();
		}
	},
	spacebarUp: function(e) {

		if(e.key == " ") {

			Game.spacebarPressed = false;
		}
	},

	drawBall: function(ball) {

		//if(!Game.paused) console.log(ball);

		//main body
		Game.ctx.beginPath();
		Game.ctx.arc((ball.x - Game.mid.x) * Game.scale + VAR.W/2, (ball.y - Game.mid.y) * Game.scale + VAR.H/2, ball.radius * Game.scale, 0, 2*Math.PI)
		Game.ctx.fillStyle = ball.color2;
		Game.ctx.fill();
		Game.ctx.closePath();
		Game.ctx.beginPath();
		Game.ctx.arc((ball.x - Game.mid.x) * Game.scale + VAR.W/2, (ball.y - Game.mid.y) * Game.scale + VAR.H/2, (ball.radius - 5) * Game.scale, 0, 2*Math.PI);
		Game.ctx.fillStyle = ball.color;
		Game.ctx.fill();
		Game.ctx.closePath();

		//nickname
		Game.ctx.font = "10px Arial";
		Game.ctx.fillStyle = "#000000";
		Game.ctx.fillText(ball.name, (ball.x - Game.mid.x)*Game.scale + VAR.W/2, (ball.y - Game.mid.y)*Game.scale + VAR.H/2);
	},
	drawSnack: function(snk) {

		Game.ctx.beginPath();
		//Game.ctx.arc((snk.x + Game.shift.x)*Game.scale, (snk.y + Game.shift.y)*Game.scale, 8*Game.scale, 0, Math.PI*2);
		Game.ctx.arc((snk.x - Game.mid.x) * Game.scale + VAR.W/2, (snk.y - Game.mid.y) * Game.scale + VAR.H/2, 8*Game.scale, 0, 2*Math.PI);
		Game.ctx.fillStyle = snk.color;
		Game.ctx.fill();
		Game.ctx.closePath();
	},
	drawMass: function() {

		Game.ctx.font = "25px Arial";
		Game.ctx.fillStyle = "#ffffff";
		Game.ctx.fillText("Mass: " + Game.mass, 30, VAR.H-30);
	},

	animationLoop:function(time) {												// Glowna petla gry

		requestAnimationFrame(Game.animationLoop);									// Gdy bedzie mozna narysowac nastepna klatke, to odpalamy animationLoop
		if(time-VAR.lastTime >= 1000 / VAR.fps){									// Sprawdzamy, czy nie za czesto rysujemy

			VAR.lastTime = time;												// Zapamietujemy kiedy ostatni raz rysowalismy
			Game.ctx.clearRect(0, 0, VAR.W, VAR.H);									// Czyscimy canvas

			Game.computeMid();
			Game.computeMass();
			Game.computeShift();
			Game.computeScale();
			Game.mouseMoveHandler();
			/*
			for(var s in Game.snacks) {												// Rysowanie ciapek
				
				Game.drawSnack(Game.snacks[s]);
			}
			for(var b in Game.sortedBalls) {												//rysowanie graczy

				Game.drawBall(Game.sortedBalls[b]);
			}
			*/
			for(var i in Game.sortedObjects) {										//rysowanie WSZYSTKIEGO

				Game.sortedObjects[i].draw();
			}
			Game.drawMass();
		}
	}
}

window.onload = function(){													// Funkcja wywolywana automatycznie gdy strona jest gotowa
	
	Game.spr = new Image();													// Wczytujemy obrazek tla, kiedys kiedys moze pojawi sie tu cos ciekawszego
	Game.spr.onload = Game.init;											// Jak sie obrazek zaladuje, to jedziem z gra
	Game.spr.src = '/img/bg.png';

	$('#send').click(function(){
		
		Game.sendName();
	});
}

sigmoid = function(x) {

	return (1 / (1 + Math.pow(Math.E, -x)))
}

addEventListener("mousemove", Game.mouseMoveHandler, false);
addEventListener("keydown", Game.keyPress, false);
addEventListener("keyup", Game.spacebarUp, false);
