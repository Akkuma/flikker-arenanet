Flikker.queries.PersonQuery = (function ($) {
	var method = 'flickr.people.getInfo';
	function PersonQuery(){}
	
	PersonQuery.prototype = 
	{
		getById: function (userId) {
			return $.getJSON(Flikker._restAPI + 'method=' + method + '&user_id=' + userId + '&format=json&jsoncallback=?');
		}
	}
	;
	return PersonQuery; 
}(jQuery));