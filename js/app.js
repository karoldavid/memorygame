(function() {
  "use strict";

  // Utility function used to generate random cards
  function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
  }

  // The game model holds the card game data  
  var model = {};

  model.init = function() {
    this.size = 4;
    this.selectedCard = null;
    this.seconds = 0;
    this.moveCount = 0;
    this.starRatingRemove = [10, 14];
    this.stars = 3;
    this.finalStars = model.stars;
    this.win = false;
    this.symboles = ["android", "star", "call", "radio", "vpn_key", "work", "https", "videocam"];
    this.cards = this.makeCards();
  };

  // The makeCards method generates an Array of 16 card objects with symbols in a random order
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

  // The game controller 
  var controller = {};

  controller.init = function(size) {
    model.init(size);
    memoryGame.init(model.size);
  };

  controller.getCardStatus = function(cardIndex) {
    return model.cards[cardIndex].hidden;
  };

  controller.checkPair = function(cardIndex) {
    var type = model.cards[cardIndex].type;
    var pair = model.cards.filter(function(card) {
      return card.type === type;
    });
    return pair[0].hidden || pair[1].hidden ? true : false;
  };

  // The game controller's checkWin method checks if all the hidden
  // properties of the model.cards Array's card objects are set to
  // 'false'. If they are all set to false, the view's showModalWin
  // method is invoked to congratulate and inform the user.
  controller.checkWin = function() {
    var solved = model.cards.filter(function(card) {
      return !card.hidden;
    });

    if (solved.length === model.cards.length) {
      model.win = true;
      memoryGame.showModalWin(model.seconds, model.finalStars, model.stars);
    }
  };

  controller.setCardToVisible = function(cardIndex) {
    model.cards[cardIndex].hidden = false;
  };

  controller.setCardToHidden = function(cardIndex) {
    model.cards[cardIndex].hidden = true;
  };

  controller.getCard = function(cardIndex) {
    return model.cards[cardIndex];
  };

  controller.setSelected = function(card) {
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
    var number = model.starRatingRemove.length - 1;

    if (model.finalStars > 1) {
      model.finalStars--;
    }

    model.starRatingRemove.forEach(function(remove, i) {
      if (model.moveCount >= remove) {
        memoryGame.updateStarRating("", number - i);
      }
    });
  };
  
  // The game controller's resetGame method invokes the
  // model.init method to reset the game data
  // and to reset the view as well
  controller.resetGame = function() {

    model.init();

    memoryGame.hideCards();
    memoryGame.updateTimer(model.seconds);
    memoryGame.updateMoveCounter(model.moveCount);

    for (var i = 0; i < model.stars; i++) {
      memoryGame.updateStarRating("star", i);
    }
  };


  // The game view
  var memoryGame = {};

  // The game view's init method is invoked by the game controller on initial page load,
  // defines the DOM elements, and renders the game board and the features
  memoryGame.init = function(size) {
    var self = this;

    this.size = size;
    this.numberOfCards = size * size;

    this.$board = $('#memoryGame');
    this.$timeNeeded = $('#timeNeeded');
    this.$finalStars = $('#finalStars');

    this.rowElem = '<div class="row">';
    this.tileElem = '<div class="col s3"><div id="#" class="card-panel teal valign-wrapper"><i class="material-icons md-36 blue-text text-lighten-2 valign">add</i></div></div>';
    this.buttonElem = '<div class="col s6 l3"><a id="reset" class="waves-effect waves-light btn"><i class="material-icons left"></i>RESET</a></div>';
    this.utilitiesElem = '<div id="utilities" class="row"></div>';
    this.timerElem = '<div class="col s6 l3"><p>Time <span id="timer">00</span></p></div>';
    this.moveCounterElem = '<div class="col s6 l3"><p>Moves <span id="moveCounter">0</span></p></div>';
    this.starRatingElem = '<div id="starRating" class="col s6 l3"><i class="material-icons star valign">star</i><i class="material-icons star valign">star</i><i class="material-icons star valign">star</i></div>';

    this.renderBoard();
    this.renderUtilities();

    this.$cardElem = $('.card-panel');

    // Attach a click event handler to each card
    // Identify the card
    // Invoke the showCard method with the card id an flip the card
    this.$cardElem.click(function(event) {
      var cardIndex = event.target.id || $(event.target).parent()[0].id;
      self.showCard(cardIndex);
    });

    this.$resetButton = $('#reset');

    this.$resetButton.click(function() {
      controller.resetGame();
    });
  };

  // The showCard method checks if a card can be flipped
  memoryGame.showCard = function(cardIndex) {
    var self = this;
    var show = controller.getCardStatus(cardIndex);
    var card = controller.getCard(cardIndex);

    if ((show && !controller.isCardSelected()) || (show && card.type === controller.getSelected().type)) {

      this.$cardElem = $('#' + cardIndex + " .material-icons:first");
      this.$cardElem.text(card.type);
      controller.setCardToVisible(cardIndex);
      controller.isCardSelected() ? controller.setSelected(null) : controller.setSelected(card);
      controller.writeMoveCounter();
      controller.writeStarRating();
      controller.checkWin();

    } else if (show && card.type != controller.getSelected().type) {
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
  };

  // The hideCards method hides all the cards to reset the game
  memoryGame.hideCards = function() {
    for (var i = 0; i < this.numberOfCards; i++) {
      this.$cardElem = $('#' + i + " .material-icons:first");
      this.$cardElem.text('add');
    }
  };

  // The makeRow method is called by the renderBoard method and renders a row
  // and adds an id to each tile
  memoryGame.makeRow = function(rowIndex) {
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
  
  // The renderBoard method is called on initial page load and renders the game board
  memoryGame.renderBoard = function() {
    for (var i = 0; i < this.size; i++) {
      this.$board.append(this.makeRow(i));
    }
  };

  // The renderUtilities method is called on initial page load
  // and renders the game's extra feautures
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

  // A modal opens to let the user know that he has won the game
  // and when the user clicks the "New Game" button or outside the modal
  // the game controller's resetGame method is invoked to restart the game
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
    }).modal('open');
  };

  controller.init();
})();