
// VAR to taki obiekt zeby nie zasmiecac glownej przestrzeni nazw, tu wrzucamy wszystkie pierdoly ktore nigdzie indziej nie pasuja
VAR = {
	fps: 60,
	W: 0,										// Szerokosc okna
	H: 0,										// Wysokosc okna
												// Odpalamy sockety do komunikacji z serwerem
	id: 0,
	lastTime: 0,
	started: false,
	prevE: {},
	currFPS: 30,
	prevFPS: 30,

	piotrFPS: 0,
	piotrTimer: 0,
	piotrPFS: 30
}

if(location.href.indexOf("localhost") >= 0) {
	VAR.socket = io();
}
else {
	VAR.socket = io(LOCATION);
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
	Mass: {
		mass: 0,
		id: 0,
		name: 0
	},
	ranking: [],
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
	wPressed: false,
	paused: false,
	images: [],

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
	reentitylize: function() {

		for(var i in Game.balls) {

			if(!Game.objects['b' + i])
				Game.objects['b' + i] = new Entity('b', Game.balls[i]);
			else
				Game.objects['b' + i].updateBall(Game.balls[i]);
		}
	},

	checkPlayer: function() {

		Game.player = {};
		Game.ballCount = 0;
		for(var i in Game.objects) {

			if(Game.objects[i].playerID == Game.id) {

				Game.player[i.slice(1)] = Game.objects[i];
				Game.ballCount++;
			}
		}
		//alert();
	},
	sortObjects: function() {

		Game.sortedObjects = [];
		var temp = Object.keys(Game.objects).sort(function(a, b) {return Game.objects[a].radius - Game.objects[b].radius});

		for(var i in temp) {

			Game.sortedObjects[i] = Game.objects[temp[i]];
		}

		Game.sortMass();
	},
	sortMass: function() {

		Game.ranking = [];
		var temp = Object.keys(Game.Mass).sort(function(a, b) {return Game.Mass[b].mass - Game.Mass[a].mass});

		for(var i in temp) {

			Game.ranking[i] = Game.Mass[temp[i]];
			if(Game.ranking[i].id == Game.id) {

				position = i;
			}
		}
	},

	computeMass: function() {

		Game.Mass = {};
		for(var b in Game.objects) {

			if(Game.objects[b].playerID) {

				if(Game.Mass[Game.objects[b].playerID])
					Game.Mass[Game.objects[b].playerID].mass += Game.objects[b].mass;
				else {
					
					Game.Mass[Game.objects[b].playerID] = {};
					Game.Mass[Game.objects[b].playerID].mass = Game.objects[b].mass;
					Game.Mass[Game.objects[b].playerID].id = Game.objects[b].playerID;
					Game.Mass[Game.objects[b].playerID].name = Game.objects[b].name;
				}
			}
		}
	},
	computeMid: function() {												//Funkcja do liczenia środka

		Game.mid = {};
		var sumX = 0;
		var sumY = 0;
		var count = 0;
		if(Game.player) {

			for(var i in Game.player) {

				sumX += Game.player[i].coords.x;
				sumY += Game.player[i].coords.y;
				count++;
			}
			if(count) {

				Game.mid.x = sumX/count;
				Game.mid.y = sumY/count;
			}
		}
	},
	computeShift: function() {												// Funkcja do liczenia przesuniecia serwer -> klient

		Game.shift.x = -Game.mid.x + VAR.W/2;
		Game.shift.y = -Game.mid.y + VAR.H/2;
	},
	computeScale: function() {												//Funkcja do liczenia skali rysowania

		Game.scale =  10/Math.pow(Math.pow(Game.mass, 1/3) + 57*Math.pow(Game.ballCount, 4/7), 17/32);
	},

	mouseMoveHandler: function(e) {											// Funkcja liczaca predkosc i kat dla kazdej kulki skladowej

		if(VAR.started) {

			if(e !== undefined)
				VAR.prevE = e;
			var Balls = Game.player;
			for(var i in Balls) {

				var relativeX = Balls[i].coords.x + Game.shift.x - VAR.prevE.clientX;
				var relativeY = Balls[i].coords.y + Game.shift.y - VAR.prevE.clientY;
				Game.velocity[i] = Math.hypot(relativeX, relativeY)/Balls[i].radius;
				Game.deg[i] = Math.atan2(relativeY, relativeX);
			}
		}
	},
	keyDown: function(e) {

		if(Game.spacebarPressed == false && e.key == " ") {

			Game.spacebarPressed = true;
			VAR.socket.emit("split", {degree: Game.deg});
			return;
		}
		if(e.key == "w") {

			Game.wPressed = true;
			VAR.socket.emit("shot", {degree: Game.deg});
			return;
		}
	},
	keyUp: function(e) {

		if(e.key == " ") {

			Game.spacebarPressed = false;
			return;
		}
		if(e.key == "w") {

			Game.wPressed = false;
			return;
		}
	},

	drawScoreboard: function() {

		Game.ctx.font = "bold 28px Graviola, Arial";
		Game.ctx.fillStyle = "#ffffff";
		Game.ctx.fillText("Scoreboard:", VAR.W - 250, 30);
		var currPlr = false;
		var no = 1;
		var h = 60;
		for(var i in Game.ranking) {

			if(no > 10)
				return;
			Game.ctx.font = "18px Graviola, Arial";
			if(Game.ranking[i].id == Game.id) {
				
				Game.ctx.fillStyle = "#ffff00";
				currPlr = true;
			}
			else
				Game.ctx.fillStyle = "#ffffff";
			Game.ctx.fillText(no + ". " + Game.ranking[i].name + "   " + Game.ranking[i].mass, VAR.W - 250, h);
			h += 30;
			no++;
		}
	},
	drawMass: function() {

		Game.ctx.font = "bold 32px Graviola, Arial";
		Game.ctx.fillStyle = "#ffffff";
		Game.ctx.fillText("Mass: " + Game.Mass[Game.id].mass, 30, VAR.H-30);
	},
	drawVer: function() {

		Game.ctx.font = "12px Arial";
		Game.ctx.fillStyle = "rgba(225, 225, 225, 0.6";
		Game.ctx.fillText("ver. 1.3.2", VAR.W-60, VAR.H-10);
	},

	animationLoop: function(time) {												// Glowna petla gry

		requestAnimationFrame(Game.animationLoop);									// Gdy bedzie mozna narysowac nastepna klatke, to odpalamy animationLoop
		if(time-VAR.lastTime >= 1000 / VAR.fps){									// Sprawdzamy, czy nie za czesto rysujemy

			VAR.currFPS++;
			VAR.lastTime = time;												// Zapamietujemy kiedy ostatni raz rysowalismy
			Game.ctx.clearRect(0, 0, VAR.W, VAR.H);									// Czyscimy canvas

			Game.computeMid();
			Game.computeMass();
			Game.computeShift();
			Game.computeScale();
			Game.mouseMoveHandler();
			for(var i in Game.sortedObjects) {										//rysowanie WSZYSTKIEGO

				Game.sortedObjects[i].draw();
				Game.sortedObjects[i].move();
			}
			Game.drawMass();
			Game.drawScoreboard();
			Game.drawVer();
		}
	},

	gameOver: function() {

		//
	}
}

window.onload = function(){													// Funkcja wywolywana automatycznie gdy strona jest gotowa

	Game.spr = new Image();													// Wczytujemy obrazek tla, kiedys kiedys moze pojawi sie tu cos ciekawszego
	Game.spr.onload = Game.init;											// Jak sie obrazek zaladuje, to jedziem z gra
	Game.spr.src = '/img/bg.png';

	$('#send').click(function() {

		Game.sendName();
	});
}

addEventListener("mousemove", Game.mouseMoveHandler, false);
addEventListener("keydown", Game.keyDown, false);
addEventListener("keyup", Game.keyUp, false);
