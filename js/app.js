function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}

var model = {};

model.symboles = ["android", "star", "call", "radio", "vpn_key", "work", "https", "videocam"];

model.makeCards = function() {
	var cards = [];
	var number = this.size * this.size;
	var allCardTypes = [];
	model.symboles.forEach(function(symbol) {
		allCardTypes.push(symbol, symbol);
	});

	for (var i = 0; i < number; i++) {
		var index = getRandomInt(0, allCardTypes.length);
		var type = allCardTypes.splice(index, 1)[0];

		cards.push({
			type: type,
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
	this.tileElem = '<div class="col s2"><div id="#" class="card-panel teal valign-wrapper"><i class="material-icons valign">add</i></div></div>';
	this.size = size;
	this.render();
	this.$cardElem = $('.card-panel');
	this.$cardElem.click(function(event) {
		var cardIndex;
		cardIndex = event.target.id || $(event.target).parent()[0].id;
		console.log(cardIndex);
	});
};

memoryGame.makeRow = function(rowIndex){
	var row = this.rowElem;
	var tile = this.tileElem;
	var id;

	for (var i = 0; i < this.size; i++) {
		id = rowIndex * this.size + i;
		row += tile.replace('#', id);
	}

	row += '</div>';

	return row;
}

memoryGame.buildBoard = function(){
	for(var i = 0; i < this.size; i++) {
		this.$board.append(this.makeRow(i));
	}
};

memoryGame.render = function() {
	this.buildBoard();
};

controller.init();