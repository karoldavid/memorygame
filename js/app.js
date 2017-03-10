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
			id: i
		});
	}
	return cards;
};

model.init = function() {
	this.size = 4;
	this.selectedCard = null;
	this.cards = this.makeCards();
};

var controller = {};

controller.init = function(size) {
	model.init(size);
	memoryGame.init(model.size);
};

controller.getCardStatus = function(cardIndex){
	return model.cards[cardIndex].hidden;
};

controller.checkPair = function(cardIndex) {
	var type = model.cards[cardIndex].type;
	var pair = model.cards.filter(function(card) {
		return card.type === type;
	});
	return pair[0].hidden || pair[1].hidden ? true : false;
};

controller.setCardToVisible = function (cardIndex) {
	model.cards[cardIndex].hidden = false;
};

controller.setCardToHidden = function (cardIndex) {
	model.cards[cardIndex].hidden = true;
};

controller.getCard = function(cardIndex) {
	return model.cards[cardIndex];
};

controller.setSelected = function (card) {
	model.selectedCard = card;
};

controller.getSelected = function(card) {
	return model.selectedCard;
};

controller.isCardSelected = function() {
	return model.selectedCard != null;
};



var memoryGame = {};

memoryGame.init = function(size) {
	var self = this;
	this.$board = $('#memoryGame');
	this.rowElem = '<div class="row">';
	// this.tileElem = '<div class="card blue rounded-corners"></div>';
	this.tileElem = '<div class="col s2"><div id="#" class="card-panel teal valign-wrapper"><i class="material-icons valign">add</i></div></div>';
	this.size = size;
	this.render();
	this.$cardElem = $('.card-panel');
	this.$cardElem.click(function(event) {
		var cardIndex = event.target.id || $(event.target).parent()[0].id;
		self.showCard(cardIndex);
	});
};

memoryGame.showCard = function(cardIndex) {
	var show = controller.getCardStatus(cardIndex);
	var card = controller.getCard(cardIndex);
	console.log(show);
	if ((show && !controller.isCardSelected()) || (show && card.type === controller.getSelected().type))  {

		this.$cardElem = $('#' + cardIndex + " .material-icons:first");
		this.$cardElem.text(card.type);
		controller.setCardToVisible(cardIndex);

	} else if (show && card.type != controller.getSelected().type){
		this.$cardElem = $('#' + cardIndex + " .material-icons:first");
		this.$cardElem.text('add');
		controller.setCardToHidden(cardIndex);

		var card2Index = controller.getSelected().id;
		this.$cardElem = $('#' + card2Index + " .material-icons:first");
		this.$cardElem.text('add');

		controller.setCardToHidden(card2Index);
	}
	controller.isCardSelected() ? controller.setSelected(null) : controller.setSelected(card);
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