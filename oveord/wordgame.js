var WordGameModel = function(items) {
	var viewModel = this;
	this.collections = ko.observableArray(items);
	this.words = ko.observableArray();
    this.guessFocus = ko.observable(false);
    this.wordGuessed = ko.observable("");
    this.wordHint = ko.observable("");
    this.answerIsCorrect = ko.observable(false);
    this.answerIsWrong = ko.observable(false);
    this.testCompleted = ko.observable(false);
    this.progress = ko.observable(0);
    var answer;
    this.currentIndex = ko.observable(0);
    this.currentWord = ko.observable();
    this.isForeignWord = ko.computed(function() { 
    	return viewModel.currentWord() && viewModel.currentWord().lang != 'no'; 
    });
    this.norWordAudio = ko.computed(function() {
    	return viewModel.currentWord() && viewModel.currentWord().norwordaudio 
    		? 'audio/' + viewModel.currentWord().norwordaudio
    		: '';
    });
    this.foreignWordAudio = ko.computed(function() {
    	return viewModel.currentWord() && viewModel.currentWord().foreignwordaudio 
    		? 'audio/' + viewModel.currentWord().foreignwordaudio
    		: '';
    });
    this.selectedCollection = ko.observable();

    var shuffle = function (array) {
		var currentIndex = array.length, temporaryValue, randomIndex ;

		while (0 !== currentIndex) {
			randomIndex = Math.floor(Math.random() * currentIndex);
			currentIndex -= 1;

			temporaryValue = array[currentIndex];
			array[currentIndex] = array[randomIndex];
			array[randomIndex] = temporaryValue;
		}
		return array;
	};

	this.setNextQuestion = function(index) {
		viewModel.currentWord(viewModel.words()[index]);
		if (viewModel.selectedCollection().lang == 'no') {
			answer = viewModel.currentWord().norword;
		}
		else {
			answer = viewModel.currentWord().foreignword;
		}

		$('button.audio').on('click', function() { 
			$(this).next('audio').get(0).play(); 
		});	
	}.bind(this);

    this.fetchCollectionWords = function(selected) {
		this.selectedCollection(selected);
    	$.get('api/?a=gw&i='+ selected.collectionid, function (data) { 
			viewModel.words(shuffle(data.words));
			viewModel.reset();
		});
	}.bind(this);

    this.reset = function() {
	    this.guessFocus(false);
	    this.wordGuessed('');
    	this.wordHint('');
	    this.currentIndex(0);
	    this.setNextQuestion(this.currentIndex());
	    this.answerIsCorrect(false);
	    this.answerIsWrong(false);
	    this.testCompleted(false);
    	this.progress(0);
	    setFocus();
    }.bind(this);

    this.showWord = function() {
		this.wordHint(answer);
    	setFocus();
    }.bind(this);

    var setFocus = function() {
    	viewModel.guessFocus(false);
    	viewModel.guessFocus(true);
    };

	this.checkWord = function() {
		this.answerIsCorrect(false);
		this.answerIsWrong(false);
    	if (this.wordGuessed().toLowerCase() == answer.trim().toLowerCase()) {
    		this.answerIsCorrect(true);
    		this.wordGuessed('');
    		this.wordHint('');
    		setFocus();
    		this.currentIndex(this.currentIndex() + 1);
			this.progress(this.currentIndex() / this.words().length * 100);

    		if (this.currentIndex() >= this.words().length)
    			this.testCompleted(true);
    		else {
    			this.setNextQuestion(this.currentIndex());
    		}
		} else {
			this.answerIsWrong(true);
    		this.wordGuessed('');
    		setFocus();
		}
	}.bind(this);

    this.fetchCollectionWords(this.collections()[this.currentIndex()]);
};

$.get('api/?a=gc', function (data) { 
	ko.applyBindings(new WordGameModel(data));
});