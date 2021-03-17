var Mine = function(a){
	
	this.mass = a.mass || 100;
	this.x = a.x || CONFIG.BOARD_WIDTH*Math.random();
	this.y = a.y || CONFIG.BOARD_HEIGHT*Math.random();
	this.id = Mine.count;
	Mine.count++;

	Mine.list[this.id] = this;

}

Mine.prototype.getRadius = function(){
	return Math.sqrt(this.mass)*5 + 10;
}

Mine.list = {};
Mine.count = 0;

module.exports = Mine;