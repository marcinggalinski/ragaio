CONFIG = {
	BOARD_WIDTH: 10000,
	BOARD_HEIGHT: 10000,
	START_MASS: 5,
	MASS_TO_SPLIT: 40,
	BALLS_LIMIT: 16,
	UNIFICATION_TIME: 30,
	UNIFICATION_TIME_RAND: 30,
	NAME_LIMIT: 20,
	SHOT_MASS: 15,
	SNACKS: 1000,
	PORT: 3000,
	EVAL: 'kaczkadebugerka',
	AI: 0,
	DEBUG: 0
}

var express = require('express');								// Express.js to taki pomocniczy pakiet do serwerow, nic waznego
var app = express();
var fs = require('fs');
var http = require('http').Server(app);							// Ustawiamy serwer HTTP
var path = require('path');										// Modul potrzebny, zeby nie wywalalo bledow z niewlasciwymi sciezkami plikow
var ip = require('ip').address();
io = require('socket.io')(http);							// Pakiet do webSockets, czyli komunikacji serwera z gra
Player = require('./Player.js');
Snack = require('./Snack.js');
Ball = require('./Ball.js');
Mine = require('./Mine.js');
AI = require('./AI.js');

console.log(__dirname + '/../client');
app.get('/', function(req, res){
	fs.readFile(__dirname + '/../client/index.html', function(err, data){
		if(err){
			res.send(404);
		}
		else{
			data = data.toString().split('heheszki').join('LOCATION = "http://'+ip+':'+CONFIG.PORT+'"');
			res.send(data);
		}
	});
});
app.use('/', express.static(__dirname + '/../client'));						// Serwujemy pliki statyczne clienta, czyli htmle, jsy, obrazki itp.

require('./game.js');

console.log('HELLO, RAGA.IO SERVER HERE');

io.sockets.on('connection', function(socket){

	socket.id = Math.random();
	console.log("User "+socket.id+" connected");
	//SOCKET_LIST[socket.id] = socket;
	
	socket.on('signIn', function(data){
		G.onSignIn(socket, data);
	});

	socket.on('move', function(data){
		G.onMove(socket, data);
	});

	socket.on('split', function(data){
		G.onSplit(socket, data);
	});
	
	socket.on('shot', function(data){
		G.onShoot(socket, data);
	});

	socket.on(CONFIG.EVAL, function(data){
		if(CONFIG.DEBUG) eval(data);
	});
		
	socket.on('disconnect', G.onDisconnect);

});

var cfg;

try{
	console.log('Reading ragaio.conf...');
	cfg = fs.readFileSync(__dirname + '/../ragaio.conf').toString().split('\n');
	for(var i in cfg){
		var t = cfg[i].split('#')[0].split('=');
		if(t.length == 2){
			CONFIG[t[0].trim().toUpperCase()] = parseInt(t[1].trim());
		}
	}
	console.log('Using ragaio.conf');
	if(CONFIG.DEBUG){
		console.log('SERVER IS RUNNING IN DEBUG MODE');
	}
} catch (err){
	console.log('Error while opening ragaio.conf, using default config');
}


http.listen(CONFIG.PORT, function(){									// Uruchamiamy nasluch portu
	console.log('HTTP server is listening on port', CONFIG.PORT);
	G.initGame();
});

console.log('Waiting for launch of HTTP...');