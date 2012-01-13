(function () {
	var oldImages 			= {}
	,	$images 			= $('#images')
	,	stack				= []
	,	feedItemsCount 		= 0
	,	$newFeedItemsCount 	= $('#new-feed-items-count')
	,	$title 				= $('title')
	,	publicFeedQuery 	= new Flikker.queries.PublicFeedQuery()
	,	personQuery			= new Flikker.queries.PersonQuery()
	,	templates			= {}
	,	$showMore 			= $('#show-more')
	;
	
	function filterItems(items, objToFilterAgainst) {
		objToFilterAgainst = objToFilterAgainst || oldImages;
		
		return $.grep(items, function (val, key) {
				var isNew = false;
				
				if (!objToFilterAgainst[val.link]) {
					objToFilterAgainst[val.link] = 1
					isNew = true;
				}
				
				return isNew;
			});
	}
	
	function addFeedDataToList(data) {
		data.items = filterItems(data.items);
		$images.prepend(templates['feed-items-template'](data));
		$.each(data.items, function (key, val) {
			personQuery.getById(val.author_id).done(function (personData) {
				var $feedItem = $('#'+personData.person.nsid.replace('@',''))
				,	$avatar = $(templates['avatar-template'](personData.person))
				;
				
				$feedItem.find('img.avatar').remove();
				
				$avatar.on('error', function () { $avatar.addClass('invisiblei'); });
				
				$feedItem.prepend($avatar);
			})
		});	
	}
	
	function addDataToStack(data) {
		stack[stack.length] = data;
	}
	
	function updateNewFeedItemsCount(count) {
		feedItemsCount += count;
		$newFeedItemsCount.text(feedItemsCount);
		$title.text(templates['title-template']({count: feedItemsCount}));
	}
	
	function reset() {
		stack = [];
		feedItemsCount = 0;
		$title.text(templates['title-template']({count: feedItemsCount}));
		$showMore.addClass('hiddeni');
	}
	
	function init() {
		$('script[type="text/x-handlebars-template"]').each(function (key, val) {
			templates[val.id] = Handlebars.compile($(val).html());
		});
		
		Handlebars.registerHelper('sanitizeId', function(id) {
		  return id.replace('@','');
		});

		publicFeedQuery.getAll().done(addFeedDataToList);
		setInterval(function () {
			publicFeedQuery.getAll().done(function (data) {
				var filteredItems = filterItems(data.items, $.extend(true, {}, oldImages));
				if (filteredItems.length) {
					updateNewFeedItemsCount(filteredItems.length);
					$showMore.hasClass('hiddeni') && $showMore.hide().removeClass('hiddeni').fadeIn(2000);
					addDataToStack(data)
				}
			});
		}, 10000);
		
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
	
	init()
}());