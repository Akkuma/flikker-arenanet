(function () {
	var oldImages 			= {}
	,	$images 			= $('#images')
	,	stack				= []
	,	feedItemsCount 		= 0
	,	$newFeedItemsCount 	= $('#new-feed-items-count')
	,	$title 				= $('title')
	,	publicFeedQuery 	= new Flikker.queries.PublicFeedQuery()
	,	personQuery			= new Flikker.queries.PersonQuery();
	;

	function addFeedDataToList(data) {
		$.each(data.items, function (key, val) {
			var link = val.link;
			if (!oldImages[link]) {
				oldImages[link] = 1;
				$images.prepend('<li id="' +val.author_id.replace('@','')+'" class="new"><div>' + val.description + '</div></li>');
				personQuery.getById(val.author_id).done(function (data) {
					var $feedItem = $('#'+data.person.nsid.replace('@',''))
					,	$avatar = $('<img class="avatar" />')
					;

					$avatar[0].src = 'http://farm'+data.person.iconfarm+'.static.flickr.com/'+data.person.iconserver+'/buddyicons/'+data.person.nsid+'.jpg';							
					$avatar.on('error', function () { $avatar.addClass('invisiblei'); });
					
					$feedItem.prepend($avatar);
				})
			}
		});	
	}
	
	function addDataToStack(data) {
		stack[stack.length] = data;
	}
	
	function updateNewFeedItemsCount(count) {
		feedItemsCount += count;
		$newFeedItemsCount.text(feedItemsCount);
		$title.text('(' + feedItemsCount + ') Flikker');
	}
	
	function reset() {
		stack = [];
		feedItemsCount = 0;
		$title.text('Flikker');
		$showMore.addClass('hiddeni');
	}
	
	function init() {
		var $showMore = $('#show-more');
						
		publicFeedQuery.getAll().done(addFeedDataToList);
		setInterval(function () {
			publicFeedQuery.getAll().done(function (data) {
				if (data.items.length) {
					updateNewFeedItemsCount(data.items.length);
					$showMore.hasClass('hiddeni') && $showMore.hide().removeClass('hiddeni').fadeIn(2000);
					addDataToStack(data)
				}
			});
		}, 15000);
		
		$showMore.on('click', function ($event) {
			$event.preventDefault();
								
			$showMore.fadeOut(2500, function () {
				reset();
			});
			
			$images.find('li.new').removeClass('new');
			
			$.each(stack.reverse(), function (key, val) {
				addFeedDataToList(val);
			});					
		});
		
		var $previousSelected;
		$images.on('click', 'li', function () {
			if ($previousSelected && $previousSelected.length) {
				$previousSelected.removeClass('selected');
			}
			
			$previousSelected = $(this);
			$previousSelected.addClass('selected');
		})
	}
	
	init()
}());