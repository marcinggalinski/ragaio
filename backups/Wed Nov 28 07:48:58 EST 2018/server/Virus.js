var Virus = function(a){
	
	this.mass = a.mass || 100;
	this.x = a.x || BOARD_WIDTH*Math.random();
	this.y = a.y || BOARD_WIDTH*Math.random();
	this.id = Virus.count;
	Virus.count++;

	Virus.list[this.id] = this;

}

Virus.prototype.getRadius = function(){
	return Math.sqrt(this.mass)*5 + 10;
}

Virus.list = {};
Virus.count = 0;

module.exports = Virus;