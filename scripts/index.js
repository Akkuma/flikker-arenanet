(function () {
	var oldImages = {}											//Maintains a listing of all links on the page, so we don't somehow add it again from the random data
	,	$images = $('#images')
	,	stack = []
	,	feedItemsCount = 0
	,	$newFeedItemsCount = $('#new-feed-items-count')
	,	publicFeedQuery = new Flikker.queries.PublicFeedQuery()
	,	personQuery = new Flikker.queries.PersonQuery()
	,	templates = {}
	,	$showMore = $('#show-more')
	,	basePollInterval = 10000								//We start with a base time of 10s before we poll for data
	,	currentPollInterval = basePollInterval
	,	pollIntervalIncrement = 5000
	;
	
	function filterItems(items, shouldSave) {		
		return $.grep(items, function (val, key) {
				var isNew = false;
				
				if (!oldImages[val.link]) {
					//When adding data to the stack, we only want to compare to get a correct count
					shouldSave && (oldImages[val.link] = 1);
					isNew = true;
				}
				
				return isNew;
			});
	}
	
	function addFeedDataToList(data) {
		data.items = filterItems(data.items, true);
		$images.prepend(templates['feed-items-template'](data));
		//Have to query each person 1 by 1 to get their avatar
		$.each(data.items, function (key, val) {
			personQuery.getById(val.author_id).done(addAvatar);
		});	
	}
	
	function addAvatar(personData) {
		var $feedItem = $('#'+personData.person.nsid.replace('@',''))
		,	$avatar = $(templates['avatar-template'](personData.person))
		;
		
		//Placeholder that keeps the content from shifting around
		$feedItem.find('img.avatar').remove();
		
		$avatar.on('error', function () { $avatar.addClass('invisiblei'); });
		
		$feedItem.prepend($avatar);
	}
	
	function addDataToStack(data) {
		stack[stack.length] = data;
	}
	
	function updateNewFeedItemsCount(count) {
		feedItemsCount += count;
		$newFeedItemsCount.text(feedItemsCount);
		updateTitle();
	}
	
	function updateTitle() {
		document.title = templates['title-template']({count: feedItemsCount});
	}
	
	function reset() {
		stack = [];
		feedItemsCount = 0;
		updateTitle();
		$showMore.addClass('hiddeni');
		currentPollInterval = basePollInterval;
	}
	
	function init() {
		//Pre-compile all templates and maintain the compiled version in a lookup object that uses the id of the template for reference
		$('script[type="text/x-handlebars-template"]').each(function (key, val) {
			templates[val.id] = Handlebars.compile($(val).html());
		});
		
		//@ breaks getElementById
		Handlebars.registerHelper('sanitizeId', function(id) {
		  return id.replace('@','');
		});

		publicFeedQuery.getAll().done(addFeedDataToList);
		(function loop() {
			//Optimally we'd prefer to stream the data rather than poll for it
			setTimeout(function () {
				publicFeedQuery.getAll()
					.done(function (data) {
						var filteredItems = filterItems(data.items, false);
						if (filteredItems.length) {
							//We don't want to overload the user with new data as we'll never run out of new images to see from Flickr
							//so we give the user additional time after each poll
							currentPollInterval += pollIntervalIncrement;
							updateNewFeedItemsCount(filteredItems.length);
							$showMore.hasClass('hiddeni') && $showMore.hide().removeClass('hiddeni').fadeIn(2000);
							addDataToStack(data)
						}
					})
					.always(loop); //Wait until we complete the ajax call before we start asking for more data
				
			}, currentPollInterval );			
		}());
		
		$showMore.on('click', function ($event) {
			$event.preventDefault();
			
			$images.find('li.new').removeClass('new');
			
			$.each(stack.reverse(), function (key, val) {
				addFeedDataToList(val);
			});
											
			$showMore.fadeOut(2500, function () {
				reset();
			});
		});
		
		var $previousSelected;
		$images.on('click', 'li', function () {
			if ($previousSelected && $previousSelected.length) {
				$previousSelected.removeClass('selected');
			}
			
			$previousSelected = $(this).addClass('selected');
		});
	}
	
	init();
}());