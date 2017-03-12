function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}

var model = {};

model.seconds = 0;

model.moveCount = 0;

model.starRatingRemove = [10,14];
model.stars = 3;
model.finalStars = model.stars;

model.win = false;

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

controller.checkWin = function() {
	var solved = model.cards.filter(function(card) {
		return !card.hidden;
	});

	if (solved.length === model.cards.length) {
		model.win = true;
		memoryGame.showModalWin(model.seconds, model.finalStars, model.stars);
	}
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

controller.writeTimer = function() {
	if (!model.win) {
		memoryGame.updateTimer(model.seconds++);
    	clearInterval(controller.writeTimer);
	}
}

controller.counter = setInterval(controller.writeTimer, 1000);

controller.writeMoveCounter = function() {
	model.moveCount++;
	memoryGame.updateMoveCounter(model.moveCount);
};

controller.writeStarRating = function() {
	var number = model.starRatingRemove.length -1;

	if (model.finalStars > 1) {
		model.finalStars--;
	}
	
	model.starRatingRemove.forEach(function(remove, i) {
		if (model.moveCount >= remove) {
			memoryGame.updateStarRating("", number - i);
		}
	});
};

controller.resetGame = function() {
	model.makeCards();
	model.seconds = 0;
	memoryGame.updateTimer(model.seconds);
	model.moveCount = 0;
	model.win = false;
	model.finalStars = model.stars;
	memoryGame.updateMoveCounter(model.moveCount);
	for (var i = 0; i < model.stars; i++) {
		memoryGame.updateStarRating("star", i);
	}
};

var memoryGame = {};

memoryGame.init = function(size) {
	var self = this;

	this.size = size;
	this.numberOfCards = size * size;

	this.$board = $('#memoryGame');
	this.$timeNeeded = $('#timeNeeded');
	this.$finalStars = $('#finalStars');

	this.rowElem = '<div class="row">';
	this.tileElem = '<div class="col s3"><div id="#" class="card-panel teal valign-wrapper"><i class="material-icons blue-text text-lighten-2 valign">add</i></div></div>';
	this.buttonElem = '<div class="col s6 l3"><a id="reset" class="waves-effect waves-light btn"><i class="material-icons left"></i>RESET</a></div>';
	this.utilitiesElem = '<div id="utilities" class="row"></div>';
	this.timerElem = '<div class="col s6 l3"><p>Time <span id="timer">00</span></p></div>';
	this.moveCounterElem = '<div class="col s6 l3"><p>Moves <span id="moveCounter">0</span></p></div>';
	this.starRatingElem = '<div id="starRating" class="col s6 l3"><i class="material-icons star valign">star</i><i class="material-icons star valign">star</i><i class="material-icons star valign">star</i></div>';

	this.renderBoard();
	this.renderUtilities();

	this.$cardElem = $('.card-panel');
	
	this.$cardElem.click(function(event) {
		var cardIndex = event.target.id || $(event.target).parent()[0].id;
		self.showCard(cardIndex);
	});
	
	this.$resetButton = $('#reset');
	
	this.$resetButton.click(function() {
		controller.resetGame();
		for (var i = 0; i < self.numberOfCards; i++) {
			self.$cardElem = $('#' + i + " .material-icons:first");
			self.$cardElem.text('add');
		}
	});
};

memoryGame.showCard = function(cardIndex) {
	var self = this;
	var show = controller.getCardStatus(cardIndex);
	var card = controller.getCard(cardIndex);

	if ((show && !controller.isCardSelected()) || (show && card.type === controller.getSelected().type))  {

		this.$cardElem = $('#' + cardIndex + " .material-icons:first");
		this.$cardElem.text(card.type);
		controller.setCardToVisible(cardIndex);
		controller.isCardSelected() ? controller.setSelected(null) : controller.setSelected(card);
		controller.writeMoveCounter();
		controller.writeStarRating();

	} else if (show && card.type != controller.getSelected().type){
		var card2Index = controller.getSelected().id;
		var card2 = controller.getCard(card2Index);
		controller.setCardToHidden(cardIndex);
		controller.setCardToHidden(card2Index);

		self.$cardElem = $('#' + cardIndex + " .material-icons:first");
		self.$card2Elem = $('#' + card2Index + " .material-icons:first");

		self.$cardElem.text(card.type);

		controller.setSelected(null);
		controller.writeMoveCounter();
		controller.writeStarRating();

		setTimeout(function() {
			self.$cardElem.text('add');
			self.$card2Elem.text('add');
		}, 250);
	}

	controller.checkWin();
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

memoryGame.renderBoard = function(){
	for(var i = 0; i < this.size; i++) {
		this.$board.append(this.makeRow(i));
	}
};

memoryGame.renderUtilities = function() {
	this.$board.append(this.utilitiesElem);
	this.$gameUtilities = $('#utilities');
	this.renderButton();
	this.renderTimer();
	this.renderMoveCounter();
	this.renderStarRating();
};

memoryGame.renderButton = function() {
	this.$gameUtilities.append(this.buttonElem);
};

memoryGame.renderTimer = function() {
	this.$gameUtilities.append(this.timerElem);
	this.$timer = $('#timer');
};

memoryGame.renderMoveCounter = function() {
	this.$gameUtilities.append(this.moveCounterElem);
	this.$moveCounter = $('#moveCounter');
};

memoryGame.renderStarRating = function() {
	this.$gameUtilities.append(this.starRatingElem);
	this.$starRating = $('#starRating .star');
};

memoryGame.updateTimer = function(seconds) {
	this.$timer.text(seconds);
};

memoryGame.updateMoveCounter = function(moveCount) {
	this.$moveCounter.text(moveCount);
};

memoryGame.updateStarRating = function(text, index) {
    this.$starRating.get(index).innerHTML = text;
};

memoryGame.showModalWin = function(seconds, stars, maxStars) {

	this.$timeNeeded.text(seconds);
	this.$finalStars.text(stars + "/" + maxStars);

	$('#modalWin').modal({
      dismissible: true, // Modal can be dismissed by clicking outside of the modal
      opacity: .5, // Opacity of modal background
      inDuration: 300, // Transition in duration
      outDuration: 200, // Transition out duration
      startingTop: '4%', // Starting top style attribute
      endingTop: '10%', // Ending top style attribute
      complete: function() { 
      	controller.resetGame();
       }
    }
  ).modal('open');
};

controller.init();