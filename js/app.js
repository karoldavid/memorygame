var memoryGame = {};

memoryGame.init = function(size) {
	this.$board = $('#memoryGame');
	this.rowElem = '<div class="row">';
	this.tileElem = '<div class="card blue rounded-corners"></div>';
	this.size = size;

	this.render();
};

memoryGame.makeRow = function(){
	var row = this.rowElem;
	var tile = this.tileElem;

	for (var i = 0; i < this.size; i++) {
		row += tile;
	}

	row += '</div>';

	return row;
}

memoryGame.buildBoard = function(){
	for(var i = 0; i < this.size; i++) {
		this.$board.append(this.makeRow());
	}
};

memoryGame.render = function() {
	this.buildBoard();

};

memoryGame.init(4);