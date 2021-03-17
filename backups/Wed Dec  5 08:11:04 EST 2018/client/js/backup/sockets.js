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

    Game.entitylize();
    Game.checkPlayer();
    Game.sortObjects();

    Game.interval = setInterval(function() {
        
        //Game.mouseMoveHandler();
        VAR.socket.emit("move", {

            degree: Game.deg,
            v: Game.velocity
        });
    }, 50)
});

VAR.socket.on("move", function(d) {

    //Game.balls = d.balls;
    for(var i in d.balls) {

        if(!Game.objects['b' + i])
            Game.objects['b' + i] = new Entity('b', d.balls[i]);
        else
            Game.objects['b' + i].update(d.balls[i]);
    }
    
    Game.entitylize();
    Game.checkPlayer();
    Game.sortObjects();
});

VAR.socket.on("snack", function(d) {

    Game.objects['s' + d.id].update(d.snack);
    //Game.snacks[d.id] = d.snack;
});
