var AI = function(t){
	this.p = new Player({
		name: t.name, 
		id: t.id || Math.random() - 1, 
		artificial:true
	});

	this.type = t.type || 'walkaround';
	this.id = this.p.id;

	Player.list[this.id] = this.p;

	AI.list[this.id] = this;
}

AI.prototype.action = function(){
	if(!this.p){
		delete AI.list[this.id];
		return;
	}
	var b = this.p.balls;

	for(var a in b){
		//console.log(b[a].d);
		b[a].updateMove({v: 1, d: b[a].d + Math.random() - 0.5});
	}
}

AI.list = {};

AI.calculate = function(){
	for(var b in AI.list){
		AI.list[b].action();
	}
}

module.exports = AI;