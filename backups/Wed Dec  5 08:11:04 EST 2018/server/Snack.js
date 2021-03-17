var Snack = function(id){
	this.id = id;
	this.x = Math.random()*CONFIG.BOARD_WIDTH;
	this.y = Math.random()*CONFIG.BOARD_HEIGHT;
	this.color = G.snacksColor;
}

Snack.prototype.eat = function(b){
	//console.log("Całkiem pre eat", this.id);
	if(G.dist(this.x - b.x, this.y - b.y) <= b.getRadius()*1.05){
		b.mass++;
		//console.log("w srodku ifa", b);
		//G.snacks[this.id] = new Snack();
		this.x = Math.random()*CONFIG.BOARD_WIDTH;
		this.y = Math.random()*CONFIG.BOARD_HEIGHT;
		this.color = G.snacksColor;
		//console.log("jeszcze dalej", this);

		var j = this.id;
		//console.log("Preeat", j, this.id);
		Player.forAll(function(s){
			(function(k){
				s.socket.emit('snack', {id: k, snack:G.snacks[k]});
				//console.log("Aftereat", k, j);
			})(j);

		});
		//console.log("Whileeat", j, this.id);
	}
}

module.exports = Snack;