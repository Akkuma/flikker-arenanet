Flikker.queries.PublicFeedQuery = (function ($) {
	var feed = 'photos_public.gne?format=json&jsoncallback=?'
	
	function PublicFeedQuery(){}
	
	PublicFeedQuery.prototype = 
	{
		getAll: function () {
			return $.getJSON(Flikker._feeds + feed);
		}
	}
	;
	
	return PublicFeedQuery;
}(jQuery));