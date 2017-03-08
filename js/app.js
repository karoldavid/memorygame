var model = {};

model.symboles = ["", "", "", "", "", "", "", ""];

model.makeCards = function() {
	var cards = [];
	var number = this.size * this.size;
	for (var i = 0; i < number; i++) {
		cards.push({
			type: "heart",
			hidden: true,
		});
	}
	return cards;
};

model.init = function() {
	this.size = 4;
	this.cards = this.makeCards();
};

var controller = {};

controller.init = function(size) {
	model.init(size);
	memoryGame.init(model.size);
};


var memoryGame = {};

memoryGame.init = function(size) {
	this.$board = $('#memoryGame');
	this.rowElem = '<div class="row">';
	// this.tileElem = '<div class="card blue rounded-corners"></div>';
	this.tileElem = '<div class="col s2"><div class="card-panel teal"></div></div>';
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

controller.init();