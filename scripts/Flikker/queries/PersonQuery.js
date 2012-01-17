Flikker.queries.PersonQuery = (function ($) {
	var personRestAPI = Flikker._restAPI + 'method=flickr.people.getInfo&format=json&jsoncallback=?';
	function PersonQuery(){}
	
	PersonQuery.prototype = 
	{
		getById: function (userId) {
			return $.getJSON(personRestAPI, { user_id: userId});
		}
	}
	;
	return PersonQuery; 
}(jQuery));