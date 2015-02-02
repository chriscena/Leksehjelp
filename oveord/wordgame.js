var WordGameModel = function(items) {
	var collections = ko.observableArray(items),
        words = ko.observableArray(),
        guessFocus = ko.observable(false),
        wordGuessed = ko.observable(""),
        wordHint = ko.observable(""),
        answerIsCorrect = ko.observable(false),
        answerIsWrong = ko.observable(false),
        testCompleted = ko.observable(false),
        progress = ko.observable(0),
        answer,
        currentIndex = ko.observable(0),
        currentWord = ko.observable(),
        isForeignWord = ko.computed(function() { 
    	   return currentWord() && currentWord().lang != 'no'; 
        }),
        norWordAudio = ko.computed(function() {
            return currentWord() && currentWord().norwordaudio 
                ? 'audio/' + currentWord().norwordaudio
                : '';
        }),
        foreignWordAudio = ko.computed(function() {
        	return currentWord() && currentWord().foreignwordaudio 
        		? 'audio/' + currentWord().foreignwordaudio
        		: '';
        }),
        selectedCollection = ko.observable();

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

	var setNextQuestion = function(index) {
		currentWord(words()[index]);
		if (selectedCollection().lang == 'no') {
			answer = currentWord().norword;
		}
		else {
			answer = currentWord().foreignword;
		}

        $('button.mainaudio').on('click', function() { 
            answerIsCorrect(false);
            answerIsWrong(false);
            $(this).next('audio').get(0).play(); 
        });

		$('button.audio').on('click', function() { 
			$(this).next('audio').get(0).play(); 
		});	
	};

    var fetchCollectionWords = function(selected) {
	selectedCollection(selected);
    	$.get('api/?a=gw&i='+ selected.collectionid, function (data) { 
			words(shuffle(data.words));
			reset();
		});
	};

    var reset = function() {
	    guessFocus(false);
	    wordGuessed('');
    	wordHint('');
	    currentIndex(0);
	    setNextQuestion(currentIndex());
	    answerIsCorrect(false);
	    answerIsWrong(false);
	    testCompleted(false);
    	progress(0);
	    setFocus();
    };

    var showWord = function() {
		wordHint(answer);
    	setFocus();
    };

    var setFocus = function() {
    	guessFocus(false);
    	guessFocus(true);
    };

	var checkWord = function() {
		answerIsCorrect(false);
		answerIsWrong(false);
    	if (wordGuessed().toLowerCase() == answer.trim().toLowerCase()) {
    		answerIsCorrect(true);
    		wordGuessed('');
    		wordHint('');
    		setFocus();
    		currentIndex(currentIndex() + 1);
			progress(currentIndex() / words().length * 100);

    		if (currentIndex() >= words().length)
    			testCompleted(true);
    		else {
    			setNextQuestion(currentIndex());
    		}
		} else {
			answerIsWrong(true);
    		wordGuessed('');
    		setFocus();
		}
	};

    fetchCollectionWords(collections()[currentIndex()]);

    return {
        collections: collections,
        guessFocus: guessFocus,
        wordGuessed: wordGuessed,
        wordHint: wordHint,
        answerIsCorrect: answerIsCorrect,
        answerIsWrong: answerIsWrong,
        testCompleted: testCompleted,
        progress: progress,
        currentWord: currentWord,
        isForeignWord: isForeignWord,
        foreignWordAudio: foreignWordAudio,
        norWordAudio: norWordAudio,
        selectedCollection: selectedCollection,
        fetchCollectionWords: fetchCollectionWords,
        showWord: showWord,
        checkWord: checkWord,
        reset: reset,
    };
};

$.get('api/?a=gc', function (data) { 
	ko.applyBindings(new WordGameModel(data));
});