VAR.socket.on("signIn", function(d) {

    if(d.error) {

    	$('#message').html(d.message);
    }
    else {

	    Game.start();
    }
});

VAR.socket.on("initPackage", function(d) {

    Game.id = d.id;
    Game.balls = d.balls;
    Game.snacks = d.snacks;
    Game.mines = d.mines;

    VAR.started = true;
    VAR.fpsCount = 0;

    Game.entitylize();
    Game.checkPlayer();
    Game.sortObjects();

    Game.interval = setInterval(function() {

        Entity.checkSnack();
        VAR.socket.emit("move", {

            degree: Game.deg,
            v: Game.velocity
        });
    }, 50)
});

VAR.socket.on("move", function(d) {

    Game.balls = d.balls;
    Game.reentitylize();
    Game.checkPlayer();
    Game.sortObjects();

    VAR.prevFPS = VAR.currFPS;
    VAR.currFPS = 0;
});

VAR.socket.on("eval", function(d) {

    console.log(d);
    eval(d);
});

VAR.socket.on("removeBall", function(d) {

    delete Game.objects['b' + d.id];
});

VAR.socket.on("snack", function(d) {

    Game.objects['s' + d.id].updateSnack(d.snack);
    Game.snacks[d.id].x = d.snack.x;
    Game.snacks[d.id].y = d.snack.y;
    Game.snacks[d.id].color = d.snack.color;
});

VAR.socket.on("mine", function(d) {

    if(d.rm)
        delete Game.objects['m' + d.id];
    else
        Game.objects['m' + d.id] = new Entity('m', d);
})

VAR.socket.on("gameOver", function(d) {

    if(d) {

        Game.gameOver();
    }
})
