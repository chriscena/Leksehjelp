var CollectionModel = function(items) {
		    
	var collections = ko.observableArray(items),
		words = ko.observableArray(),
		newForeignWord = ko.observable(''),
		newWord = ko.observable(''),
		selectedLang = ko.observable('no'),
		selectedCollectionName = ko.observable(''),
		selectedCollection = ko.observable(),
		newCollectionName = ko.observable(''),
		newCollectionLang = ko.observable('no'),
		isCreatingCollection = ko.observable(false),
		isEditingWords = ko.computed(function() { return selectedCollection(); });

    var newCollection = function() {
    	isCreatingCollection(true);
    };

    var cancelCollection = function() {
		newCollectionLang('no');
		newCollectionName('');
    	isCreatingCollection(false);
    };

    var createCollection = function() {
    	$.post('api/', 
    		{ a: 'cc', n: newCollectionName(), l: newCollectionLang() }, 
    		function (data) { 
				collections.push(data);
				cancelCollection();
				fetchCollectionWords(data);
		});
    };

    var fetchCollectionWords = function(selected) {
		selectedCollection(selected);
		selectedLang(selected.lang);
		selectedCollectionName(selected.name + ' - ' + selected.langName);

		$('button.audio').off('click');		

    	$.get('api/?a=gw&i='+ selected.collectionid, function (data) { 
			words(data.words);
			$('button.audio').on('click', function() { 
				$(this).next('audio').get(0).play(); 
			});		
		});
	};

    var createWord = function() {
    	$.post('api/', 
    		{ a: 'cw', cid: selectedCollection().collectionid, 
    			l: selectedLang(), nw: newWord(), fw: newForeignWord() }, 
    		function (data) { 
			words.push(data);
			newWord('');
			newForeignWord('');
		});
	};

    var deleteWord = function(selected) {
    	$.post('api/', 
    		{ a: 'dw', i: selected.wordid }, 
    		function (data) { 
    			words.remove(selected);
		});
	};

	return {
		collections: collections,
		words: words,
		newForeignWord: newForeignWord,
		newWord: newWord,
		selectedLang: selectedLang,
		selectedCollectionName: selectedCollectionName,
		selectedCollection: selectedCollection,
		newCollection: newCollection,
		fetchCollectionWords: fetchCollectionWords,
		createWord: createWord,
		deleteWord: deleteWord,
		newCollectionName: newCollectionName,
		newCollectionLang: newCollectionLang,
		isCreatingCollection: isCreatingCollection,
		cancelCollection: cancelCollection,
		isEditingWords: isEditingWords,
		createCollection: createCollection
	};
};

$.get('api/?a=gc', function (data) { 
	ko.applyBindings(new CollectionModel(data));
});