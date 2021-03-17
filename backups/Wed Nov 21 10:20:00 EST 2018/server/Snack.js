var Snack = function(){
	this.x = Math.random()*CONFIG.BOARD_WIDTH;
	this.y = Math.random()*CONFIG.BOARD_HEIGHT;
	this.color = G.snacksColor;
}

module.exports = Snack;