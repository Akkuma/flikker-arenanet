Flikker.queries.PublicPhotosFeedQuery = (function ($) {
	var publicPhotoFeed = Flikker._feeds + 'photos_public.gne?format=json&jsoncallback=?'
	
	function PublicPhotosFeedQuery(){}
	
	PublicPhotosFeedQuery.prototype = 
	{
		getAll: function () {
			return $.getJSON(publicPhotoFeed);
		}
	}
	;
	
	return PublicPhotosFeedQuery;
}(jQuery));